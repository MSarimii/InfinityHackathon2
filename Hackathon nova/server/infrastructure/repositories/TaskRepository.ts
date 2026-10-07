/**
 * INFRASTRUCTURE LAYER - Task Repository Implementation
 * File: server/infrastructure/repositories/TaskRepository.ts
 *
 * Implements ITaskRepository using DatabaseClient.
 */

import { ITaskRepository } from '../../domain/interfaces/ITaskRepository.ts';
import { Task } from '../../domain/models/Task.ts';
import { DatabaseClient } from '../database/DatabaseClient.ts';

export class TaskRepository implements ITaskRepository {
  constructor(private db: DatabaseClient) {}

  public async create(task: Task): Promise<void> {
    const tasks = this.db.getTasks();
    tasks.push(task);
    this.db.setTasks([...tasks]);
  }

  public async createMany(tasksToCreate: Task[]): Promise<void> {
    const tasks = this.db.getTasks();
    tasks.push(...tasksToCreate);
    this.db.setTasks([...tasks]);
  }

  public async findById(id: string): Promise<Task | null> {
    const tasks = this.db.getTasks();
    return tasks.find(t => t.id === id) || null;
  }

  public async findAll(): Promise<Task[]> {
    return [...this.db.getTasks()];
  }

  public async findByProjectId(projectId: string): Promise<Task[]> {
    const tasks = this.db.getTasks();
    return tasks.filter(t => t.projectId === projectId);
  }

  public async findByProjectIds(projectIds: string[]): Promise<Task[]> {
    const set = new Set(projectIds);
    const tasks = this.db.getTasks();
    return tasks.filter(t => set.has(t.projectId));
  }

  public async findByAssigneeId(assigneeId: string): Promise<Task[]> {
    const tasks = this.db.getTasks();
    return tasks.filter(t => t.assigneeId === assigneeId);
  }

  public async deleteAll(): Promise<void> {
    this.db.setTasks([]);
  }
}
