/**
 * DOMAIN LAYER - Entity Model
 * File: server/domain/models/Project.ts
 *
 * Defines the Project domain entity.
 * Relationship: 1 Manager (User with role 'MANAGER') -> Many Projects.
 */

export interface Project {
  id: string;
  name: string;
  clientName: string;
  description: string;
  managerId: string;
  deadline: string; // ISO format (e.g. 'YYYY-MM-DD')
  createdAt?: string;
}
