/**
 * DOMAIN LAYER - Entity Model
 * File: server/domain/models/Task.ts
 *
 * Defines the Task domain entity.
 * Relationships:
 * - 1 Project -> Many Tasks
 * - 1 Agent (User with role 'AGENT') -> Many Tasks
 */

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assigneeId: string;
  deadline: string; // ISO format (e.g. 'YYYY-MM-DD')
  estimatedHours: number; // strictly positive integer/float
  createdAt?: string;
}
