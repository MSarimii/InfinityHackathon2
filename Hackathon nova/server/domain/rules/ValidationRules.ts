/**
 * DOMAIN RULES - Validation Engine
 * File: server/domain/rules/ValidationRules.ts
 *
 * Implements Section 9 validation rules of the Challenge Specification:
 * All validations run BEFORE any database transaction is initiated.
 * If any project or task is invalid, no partial records are created.
 */

import { AIProjectDraft, AITaskDraft } from '../models/AITypes.ts';
import { User } from '../models/User.ts';

export interface ValidationContext {
  usersById: Map<string, User>;
  usersByNameLower: Map<string, User>;
}

export function buildValidationContext(users: User[]): ValidationContext {
  const usersById = new Map<string, User>();
  const usersByNameLower = new Map<string, User>();

  for (const user of users) {
    usersById.set(user.id, user);
    usersByNameLower.set(user.name.toLowerCase().trim(), user);
    // Also index common first-name lookups (e.g., "Ayesha", "Ali", "Bilal")
    const firstName = user.name.split(' ')[0].toLowerCase().trim();
    if (!usersByNameLower.has(firstName)) {
      usersByNameLower.set(firstName, user);
    }
  }

  return { usersById, usersByNameLower };
}

/**
 * Validates a standard ISO date string format (YYYY-MM-DD)
 */
export function isValidDateString(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

/**
 * Validates a single project draft against domain rules.
 */
export function validateProjectDraft(
  project: AIProjectDraft,
  projectIndex: number,
  context: ValidationContext
): { errors: string[]; resolvedManagerId: string | null } {
  const errors: string[] = [];
  const prefix = `Project #${projectIndex + 1} ("${project.name || 'Unnamed'}")`;

  if (!project.name || project.name.trim().length === 0) {
    errors.push(`${prefix}: Project name is required.`);
  }

  if (!project.clientName || project.clientName.trim().length === 0) {
    errors.push(`${prefix}: Client name is required.`);
  }

  if (!project.description || project.description.trim().length === 0) {
    errors.push(`${prefix}: Project description is required.`);
  }

  if (!project.deadline || !isValidDateString(project.deadline)) {
    errors.push(`${prefix}: Deadline must be a valid date in YYYY-MM-DD format (got "${project.deadline}").`);
  }

  // Resolve manager
  let resolvedManagerId: string | null = null;
  const rawManager = (project.managerId || '').trim();

  // Look up by exact ID or name
  let manager = context.usersById.get(rawManager);
  if (!manager) {
    manager = context.usersByNameLower.get(rawManager.toLowerCase());
  }

  if (!manager) {
    errors.push(`${prefix}: Manager "${rawManager}" does not exist in company directory.`);
  } else if (manager.role !== 'MANAGER') {
    errors.push(`${prefix}: Assigned manager "${manager.name}" has role ${manager.role}, but must have MANAGER role.`);
  } else {
    resolvedManagerId = manager.id;
  }

  if (!Array.isArray(project.tasks) || project.tasks.length === 0) {
    errors.push(`${prefix}: Must contain at least one task.`);
  }

  return { errors, resolvedManagerId };
}

/**
 * Validates a single task draft against domain rules.
 */
export function validateTaskDraft(
  task: AITaskDraft,
  taskIndex: number,
  project: AIProjectDraft,
  projectIndex: number,
  context: ValidationContext
): { errors: string[]; resolvedAssigneeId: string | null } {
  const errors: string[] = [];
  const prefix = `Project #${projectIndex + 1} ("${project.name || 'Unnamed'}") -> Task #${taskIndex + 1} ("${task.title || 'Unnamed'}")`;

  if (!task.title || task.title.trim().length === 0) {
    errors.push(`${prefix}: Task title is required.`);
  }

  if (!task.deadline || !isValidDateString(task.deadline)) {
    errors.push(`${prefix}: Task deadline must be a valid date in YYYY-MM-DD format (got "${task.deadline}").`);
  } else if (isValidDateString(project.deadline)) {
    // Task deadline must not exceed project deadline
    if (task.deadline > project.deadline) {
      errors.push(
        `${prefix}: Task deadline (${task.deadline}) cannot exceed Project deadline (${project.deadline}).`
      );
    }
  }

  if (typeof task.estimatedHours !== 'number' || task.estimatedHours <= 0 || isNaN(task.estimatedHours)) {
    errors.push(`${prefix}: Estimated hours must be a positive number (got ${task.estimatedHours}).`);
  }

  // Resolve assignee
  let resolvedAssigneeId: string | null = null;
  const rawAssignee = (task.assigneeId || '').trim();

  let assignee = context.usersById.get(rawAssignee);
  if (!assignee) {
    assignee = context.usersByNameLower.get(rawAssignee.toLowerCase());
  }

  if (!assignee) {
    errors.push(`${prefix}: Assignee "${rawAssignee}" does not exist in company directory.`);
  } else if (assignee.role !== 'AGENT') {
    errors.push(`${prefix}: Assignee "${assignee.name}" has role ${assignee.role}, but must have AGENT role.`);
  } else {
    resolvedAssigneeId = assignee.id;
  }

  return { errors, resolvedAssigneeId };
}
