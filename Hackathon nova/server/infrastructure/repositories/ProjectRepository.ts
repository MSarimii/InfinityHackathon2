/**
 * INFRASTRUCTURE LAYER - Project Repository Implementation
 * File: server/infrastructure/repositories/ProjectRepository.ts
 *
 * Implements IProjectRepository using DatabaseClient.
 */

import { IProjectRepository } from '../../domain/interfaces/IProjectRepository.ts';
import { Project } from '../../domain/models/Project.ts';
import { DatabaseClient } from '../database/DatabaseClient.ts';

export class ProjectRepository implements IProjectRepository {
  constructor(private db: DatabaseClient) {}

  public async create(project: Project): Promise<void> {
    const projects = this.db.getProjects();
    projects.push(project);
    this.db.setProjects([...projects]);
  }

  public async createMany(projectsToCreate: Project[]): Promise<void> {
    const projects = this.db.getProjects();
    projects.push(...projectsToCreate);
    this.db.setProjects([...projects]);
  }

  public async findById(id: string): Promise<Project | null> {
    const projects = this.db.getProjects();
    return projects.find(p => p.id === id) || null;
  }

  public async findAll(): Promise<Project[]> {
    return [...this.db.getProjects()];
  }

  public async findByManagerId(managerId: string): Promise<Project[]> {
    const projects = this.db.getProjects();
    return projects.filter(p => p.managerId === managerId);
  }

  public async findProjectsForAgent(agentId: string): Promise<Project[]> {
    // Find all task projects where agent is assignee
    const tasks = this.db.getTasks();
    const projectIds = new Set(
      tasks.filter(t => t.assigneeId === agentId).map(t => t.projectId)
    );
    const projects = this.db.getProjects();
    return projects.filter(p => projectIds.has(p.id));
  }

  public async deleteAll(): Promise<void> {
    this.db.setProjects([]);
  }
}
