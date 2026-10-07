/**
 * DOMAIN SERVICE - Transcript Processing Orchestrator
 * File: server/domain/services/TranscriptProcessingService.ts
 *
 * This is the central business orchestrator of the application.
 * It enforces the complete workflow:
 * Transcript -> AI Parsing -> Domain Validation -> Domain Entity Creation -> Atomic Persistence.
 *
 * Notice:
 * - NO direct dependency on OpenAI, Gemini, Claude SDKs.
 * - NO direct dependency on MongoDB, SQLite, Postgres drivers.
 * - Uses pure domain abstractions and dependency injection.
 */

import { randomUUID } from 'crypto';
import {
  ITranscriptProcessingService,
  ProcessTranscriptCommand,
  ProcessTranscriptResult,
  CreatedProjectWithTasks,
  IUserRepository,
  IProjectRepository,
  ITaskRepository,
  IAIParser,
  ITransactionManager
} from '../interfaces/index.ts';
import { Project } from '../models/Project.ts';
import { Task } from '../models/Task.ts';
import {
  DomainValidationError,
  UnauthorizedDomainActionError,
  DuplicateSubmissionError
} from '../errors/DomainErrors.ts';
import {
  buildValidationContext,
  validateProjectDraft,
  validateTaskDraft
} from '../rules/ValidationRules.ts';

export class TranscriptProcessingService implements ITranscriptProcessingService {
  private inProgressLocks: Set<string> = new Set();

  constructor(
    private userRepository: IUserRepository,
    private projectRepository: IProjectRepository,
    private taskRepository: ITaskRepository,
    private aiParser: IAIParser,
    private transactionManager: ITransactionManager
  ) {}

  public async processMeetingTranscript(
    command: ProcessTranscriptCommand
  ): Promise<ProcessTranscriptResult> {
    const { transcript, authenticatedUserId } = command;

    // 1. Authenticate user & check ADMIN permission
    const currentUser = await this.userRepository.findById(authenticatedUserId);
    if (!currentUser) {
      throw new UnauthorizedDomainActionError('Authenticated user not found in directory');
    }

    if (currentUser.role !== 'ADMIN') {
      throw new UnauthorizedDomainActionError(
        `Access denied. Only users with ADMIN role can create projects from transcripts (current role: ${currentUser.role})`
      );
    }

    // 2. Validate transcript content
    if (!transcript || transcript.trim().length === 0) {
      throw new DomainValidationError('Meeting transcript cannot be empty.');
    }

    if (transcript.trim().length < 40) {
      throw new DomainValidationError(
        'Meeting transcript is too short to extract project and task deliverables.'
      );
    }

    // 3. Concurrency / Duplicate submission guard
    const lockKey = `${authenticatedUserId}:${transcript.trim().slice(0, 80)}`;
    if (this.inProgressLocks.has(lockKey)) {
      throw new DuplicateSubmissionError(
        'A transcript processing request for this content is currently in progress. Please wait.'
      );
    }

    this.inProgressLocks.add(lockKey);

    try {
      // 4. Load sanitized team directory (passwords are excluded)
      const teamDirectory = await this.userRepository.getTeamDirectory();
      const allUsers = await this.userRepository.findAll();
      const validationContext = buildValidationContext(allUsers);

      // 5. Call abstract AI Parser
      const aiDraft = await this.aiParser.parseTranscript(transcript, teamDirectory);

      if (!aiDraft || !Array.isArray(aiDraft.projects) || aiDraft.projects.length === 0) {
        throw new DomainValidationError('AI parser could not extract any valid projects from the transcript.');
      }

      // 6. Complete Domain Validation BEFORE touching database
      const validationErrors: string[] = [];
      const resolvedProjects: Array<{
        projectDraft: typeof aiDraft.projects[0];
        resolvedManagerId: string;
        resolvedTasks: Array<{
          taskDraft: typeof aiDraft.projects[0]['tasks'][0];
          resolvedAssigneeId: string;
        }>;
      }> = [];

      for (let pIndex = 0; pIndex < aiDraft.projects.length; pIndex++) {
        const pDraft = aiDraft.projects[pIndex];
        const pVal = validateProjectDraft(pDraft, pIndex, validationContext);

        if (pVal.errors.length > 0) {
          validationErrors.push(...pVal.errors);
        }

        const projectResolvedTasks: Array<{
          taskDraft: typeof pDraft.tasks[0];
          resolvedAssigneeId: string;
        }> = [];

        if (Array.isArray(pDraft.tasks)) {
          for (let tIndex = 0; tIndex < pDraft.tasks.length; tIndex++) {
            const tDraft = pDraft.tasks[tIndex];
            const tVal = validateTaskDraft(tDraft, tIndex, pDraft, pIndex, validationContext);

            if (tVal.errors.length > 0) {
              validationErrors.push(...tVal.errors);
            }

            if (tVal.resolvedAssigneeId) {
              projectResolvedTasks.push({
                taskDraft: tDraft,
                resolvedAssigneeId: tVal.resolvedAssigneeId
              });
            }
          }
        }

        if (pVal.resolvedManagerId) {
          resolvedProjects.push({
            projectDraft: pDraft,
            resolvedManagerId: pVal.resolvedManagerId,
            resolvedTasks: projectResolvedTasks
          });
        }
      }

      // All-or-Nothing check: if ANY validation failed, ABORT before database interaction
      if (validationErrors.length > 0) {
        throw new DomainValidationError(validationErrors);
      }

      // 7. Create Domain Project and Task objects with UUIDs
      const domainProjects: Project[] = [];
      const domainTasks: Task[] = [];
      const resultsAccumulator: CreatedProjectWithTasks[] = [];
      let totalHours = 0;

      for (const item of resolvedProjects) {
        const projectId = randomUUID();
        const projectEntity: Project = {
          id: projectId,
          name: item.projectDraft.name.trim(),
          clientName: item.projectDraft.clientName.trim(),
          description: item.projectDraft.description.trim(),
          managerId: item.resolvedManagerId,
          deadline: item.projectDraft.deadline.trim(),
          createdAt: new Date().toISOString()
        };

        const projectTasks: Task[] = [];

        for (const tItem of item.resolvedTasks) {
          const taskId = randomUUID();
          const taskEntity: Task = {
            id: taskId,
            projectId: projectId,
            title: tItem.taskDraft.title.trim(),
            description: tItem.taskDraft.description.trim(),
            assigneeId: tItem.resolvedAssigneeId,
            deadline: tItem.taskDraft.deadline.trim(),
            estimatedHours: Number(tItem.taskDraft.estimatedHours),
            createdAt: new Date().toISOString()
          };

          totalHours += taskEntity.estimatedHours;
          domainTasks.push(taskEntity);
          projectTasks.push(taskEntity);
        }

        domainProjects.push(projectEntity);
        resultsAccumulator.push({
          project: projectEntity,
          tasks: projectTasks
        });
      }

      // 8. Atomic Persistence inside TransactionManager
      await this.transactionManager.executeInTransaction(async () => {
        // Save all projects
        await this.projectRepository.createMany(domainProjects);
        // Save all tasks
        await this.taskRepository.createMany(domainTasks);
      });

      // 9. Return structured domain results
      return {
        success: true,
        projectsCreated: domainProjects.length,
        tasksCreated: domainTasks.length,
        totalEstimatedHours: totalHours,
        projects: resultsAccumulator
      };
    } finally {
      this.inProgressLocks.delete(lockKey);
    }
  }
}
