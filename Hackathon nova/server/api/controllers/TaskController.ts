/**
 * API LAYER - Task Controller
 * File: server/api/controllers/TaskController.ts
 *
 * Handles task queries. Specifically supports Agent "My Tasks" view
 * where an agent only accesses tasks assigned to them across all projects.
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { ITaskRepository } from '../../domain/interfaces/ITaskRepository.ts';
import { IProjectRepository } from '../../domain/interfaces/IProjectRepository.ts';
import { IUserRepository } from '../../domain/interfaces/IUserRepository.ts';
import { TaskDto } from '../../../shared/api-contracts.ts';
import { Task } from '../../domain/models/Task.ts';

export class TaskController {
  constructor(
    private taskRepo: ITaskRepository,
    private projectRepo: IProjectRepository,
    private userRepo: IUserRepository
  ) {}

  public getMyTasks = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!;
      let tasks: Task[] = [];

      if (user.role === 'AGENT') {
        tasks = await this.taskRepo.findByAssigneeId(user.id);
      } else if (user.role === 'MANAGER') {
        const managedProjects = await this.projectRepo.findByManagerId(user.id);
        const projectIds = managedProjects.map(p => p.id);
        tasks = await this.taskRepo.findByProjectIds(projectIds);
      } else {
        // ADMIN can see all tasks
        tasks = await this.taskRepo.findAll();
      }

      const allProjects = await this.projectRepo.findAll();
      const projectsById = new Map(allProjects.map(p => [p.id, p]));

      const allUsers = await this.userRepo.findAll();
      const usersById = new Map(allUsers.map(u => [u.id, u]));

      const dtos: TaskDto[] = tasks.map(t => {
        const p = projectsById.get(t.projectId);
        const assignee = usersById.get(t.assigneeId);
        return {
          id: t.id,
          projectId: t.projectId,
          projectName: p ? p.name : undefined,
          title: t.title,
          description: t.description,
          assigneeId: t.assigneeId,
          assigneeName: assignee ? assignee.name : t.assigneeId,
          deadline: t.deadline,
          estimatedHours: t.estimatedHours,
          createdAt: t.createdAt
        };
      });

      return res.json({
        success: true,
        data: dtos
      });
    } catch (err) {
      console.error('[TaskController.getMyTasks] Error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve tasks.'
      });
    }
  };
}
