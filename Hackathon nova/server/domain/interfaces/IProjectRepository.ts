/**
 * DOMAIN INTERFACE - Project Repository
 * File: server/domain/interfaces/IProjectRepository.ts
 *
 * Persistence abstraction for Projects.
 * Keeps ORM/database implementation details hidden from Domain logic.
 */

import { Project } from '../models/Project.ts';

export interface IProjectRepository {
  /**
   * Persists a single project domain entity.
   */
  create(project: Project): Promise<void>;

  /**
   * Persists multiple projects atomically within a transaction context.
   */
  createMany(projects: Project[]): Promise<void>;

  /**
   * Retrieves a project by primary ID.
   */
  findById(id: string): Promise<Project | null>;

  /**
   * Retrieves all projects (Admin scope).
   */
  findAll(): Promise<Project[]>;

  /**
   * Retrieves projects managed by a specific manager (Manager scope).
   */
  findByManagerId(managerId: string): Promise<Project[]>;

  /**
   * Retrieves projects that contain any tasks assigned to a specific agent (Agent scope).
   */
  findProjectsForAgent(agentId: string): Promise<Project[]>;

  /**
   * Deletes all projects (useful for demo resets/tests).
   */
  deleteAll?(): Promise<void>;
}
