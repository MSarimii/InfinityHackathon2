/**
 * API LAYER - Project Controller
 * File: server/api/controllers/ProjectController.ts
 *
 * Enforces role-based project querying:
 * - ADMIN: all projects
 * - MANAGER: only projects managed by current user
 * - AGENT: only distinct projects containing tasks assigned to current user
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { IProjectRepository } from '../../domain/interfaces/IProjectRepository.ts';
import { ITaskRepository } from '../../domain/interfaces/ITaskRepository.ts';
import { IUserRepository } from '../../domain/interfaces/IUserRepository.ts';
import { ProjectDto, ProjectDetailDto, TaskDto } from '../../../shared/api-contracts.ts';
import { Project } from '../../domain/models/Project.ts';
import { Task } from '../../domain/models/Task.ts';

export class ProjectController {
  constructor(
    private projectRepo: IProjectRepository,
    private taskRepo: ITaskRepository,
    private userRepo: IUserRepository
  ) {}

  public listProjects = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!;
      let projects: Project[] = [];

      if (user.role === 'ADMIN') {
        projects = await this.projectRepo.findAll();
      } else if (user.role === 'MANAGER') {
        projects = await this.projectRepo.findByManagerId(user.id);
      } else if (user.role === 'AGENT') {
        projects = await this.projectRepo.findProjectsForAgent(user.id);
      }

      const allUsers = await this.userRepo.findAll();
      const usersById = new Map(allUsers.map(u => [u.id, u]));

      // Calculate taskCount and totalEstimatedHours for each project
      const dtos: ProjectDto[] = [];
      for (const p of projects) {
        const tasks = await this.taskRepo.findByProjectId(p.id);
        const manager = usersById.get(p.managerId);
        const totalHours = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);

        dtos.push({
          id: p.id,
          name: p.name,
          clientName: p.clientName,
          description: p.description,
          managerId: p.managerId,
          managerName: manager ? manager.name : p.managerId,
          deadline: p.deadline,
          taskCount: tasks.length,
          totalEstimatedHours: totalHours,
          createdAt: p.createdAt
        });
      }

      return res.json({
        success: true,
        data: dtos
      });
    } catch (err) {
      console.error('[ProjectController.listProjects] Error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve projects.'
      });
    }
  };

  public getProjectById = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!;
      const projectId = req.params.id;

      const project = await this.projectRepo.findById(projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found.'
        });
      }

      // Authorization check according to Section 13 & 18
      const allTasksInProject = await this.taskRepo.findByProjectId(projectId);
      const isManager = user.role === 'MANAGER' && project.managerId === user.id;
      const isAgentWithTask =
        user.role === 'AGENT' && allTasksInProject.some(t => t.assigneeId === user.id);
      const isAdmin = user.role === 'ADMIN';

      if (!isAdmin && !isManager && !isAgentWithTask) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. You are not authorized to view this project.'
        });
      }

      // Filter tasks based on role:
      // ADMIN/MANAGER -> see all tasks in this project
      // AGENT -> see ONLY tasks assigned to them in this project
      let visibleTasks: Task[] = [];
      if (isAdmin || isManager) {
        visibleTasks = allTasksInProject;
      } else {
        visibleTasks = allTasksInProject.filter(t => t.assigneeId === user.id);
      }

      const allUsers = await this.userRepo.findAll();
      const usersById = new Map(allUsers.map(u => [u.id, u]));
      const manager = usersById.get(project.managerId);

      const taskDtos: TaskDto[] = visibleTasks.map(t => {
        const assignee = usersById.get(t.assigneeId);
        return {
          id: t.id,
          projectId: t.projectId,
          projectName: project.name,
          title: t.title,
          description: t.description,
          assigneeId: t.assigneeId,
          assigneeName: assignee ? assignee.name : t.assigneeId,
          deadline: t.deadline,
          estimatedHours: t.estimatedHours,
          createdAt: t.createdAt
        };
      });

      const totalHours = allTasksInProject.reduce((sum, t) => sum + t.estimatedHours, 0);

      const detailDto: ProjectDetailDto = {
        id: project.id,
        name: project.name,
        clientName: project.clientName,
        description: project.description,
        managerId: project.managerId,
        managerName: manager ? manager.name : project.managerId,
        deadline: project.deadline,
        taskCount: allTasksInProject.length,
        totalEstimatedHours: totalHours,
        createdAt: project.createdAt,
        tasks: taskDtos
      };

      return res.json({
        success: true,
        data: detailDto
      });
    } catch (err) {
      console.error('[ProjectController.getProjectById] Error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve project details.'
      });
    }
  };
}
