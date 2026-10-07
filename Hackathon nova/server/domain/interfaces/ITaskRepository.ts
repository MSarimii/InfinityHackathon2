/**
 * DOMAIN INTERFACE - Task Repository
 * File: server/domain/interfaces/ITaskRepository.ts
 *
 * Persistence abstraction for Tasks.
 */

import { Task } from '../models/Task.ts';

export interface ITaskRepository {
  /**
   * Persists a single task entity.
   */
  create(task: Task): Promise<void>;

  /**
   * Persists multiple tasks atomically within a transaction context.
   */
  createMany(tasks: Task[]): Promise<void>;

  /**
   * Retrieves a task by primary ID.
   */
  findById(id: string): Promise<Task | null>;

  /**
   * Retrieves all tasks in the system (Admin scope).
   */
  findAll(): Promise<Task[]>;

  /**
   * Retrieves all tasks belonging to a specific project.
   */
  findByProjectId(projectId: string): Promise<Task[]>;

  /**
   * Retrieves all tasks belonging to a list of project IDs.
   */
  findByProjectIds(projectIds: string[]): Promise<Task[]>;

  /**
   * Retrieves tasks assigned to a specific agent (Agent scope).
   */
  findByAssigneeId(assigneeId: string): Promise<Task[]>;

  /**
   * Deletes all tasks (useful for demo resets).
   */
  deleteAll?(): Promise<void>;
}
