/**
 * API LAYER - Transcript Controller
 * File: server/api/controllers/TranscriptController.ts
 *
 * Thin controller! Contains NO business logic, NO AI prompts, NO SQL.
 * Simply forwards the transcript to the Domain Service and translates
 * Domain errors into appropriate HTTP responses.
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { ITranscriptProcessingService } from '../../domain/interfaces/ITranscriptProcessingService.ts';
import { IUserRepository } from '../../domain/interfaces/IUserRepository.ts';
import { DatabaseClient } from '../../infrastructure/database/DatabaseClient.ts';
import { DatabaseSeeder } from '../../infrastructure/database/DatabaseSeeder.ts';
import {
  DomainValidationError,
  UnauthorizedDomainActionError,
  DuplicateSubmissionError
} from '../../domain/errors/DomainErrors.ts';
import {
  CreateFromTranscriptRequest,
  CreateFromTranscriptResponse
} from '../../../shared/api-contracts.ts';

export class TranscriptController {
  constructor(
    private transcriptService: ITranscriptProcessingService,
    private userRepo: IUserRepository,
    private dbClient: DatabaseClient
  ) {}

  public createFromTranscript = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!;

      // Controller authorization pre-check (also enforced inside Domain Service)
      if (user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Forbidden. Only administrators can process transcripts into projects.'
        });
      }

      const body: CreateFromTranscriptRequest = req.body;
      const transcript = body?.transcript;

      if (!transcript || typeof transcript !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Missing required "transcript" text field in request body.'
        });
      }

      // Delegate completely to the Domain Service
      const result = await this.transcriptService.processMeetingTranscript({
        transcript,
        authenticatedUserId: user.id
      });

      const allUsers = await this.userRepo.findAll();
      const usersById = new Map(allUsers.map(u => [u.id, u]));

      // Format response DTO
      const responseDto: CreateFromTranscriptResponse = {
        message: 'Projects and tasks successfully created from meeting transcript.',
        projectsCreated: result.projectsCreated,
        tasksCreated: result.tasksCreated,
        totalEstimatedHours: result.totalEstimatedHours,
        projects: result.projects.map(p => {
          const manager = usersById.get(p.project.managerId);
          return {
            id: p.project.id,
            name: p.project.name,
            clientName: p.project.clientName,
            managerName: manager ? manager.name : p.project.managerId,
            deadline: p.project.deadline,
            tasks: p.tasks.map(t => {
              const assignee = usersById.get(t.assigneeId);
              return {
                id: t.id,
                title: t.title,
                assigneeName: assignee ? assignee.name : t.assigneeId,
                estimatedHours: t.estimatedHours,
                deadline: t.deadline
              };
            })
          };
        })
      };

      return res.status(201).json({
        success: true,
        data: responseDto
      });
    } catch (err: any) {
      console.error('[TranscriptController.createFromTranscript] Caught error:', err);

      if (err instanceof DomainValidationError) {
        return res.status(400).json({
          success: false,
          error: err.message,
          validationErrors: err.errors
        });
      }

      if (err instanceof UnauthorizedDomainActionError) {
        return res.status(403).json({
          success: false,
          error: err.message
        });
      }

      if (err instanceof DuplicateSubmissionError) {
        return res.status(409).json({
          success: false,
          error: err.message
        });
      }

      // Hide internal stack traces and raw database/provider errors
      return res.status(500).json({
        success: false,
        error: 'An internal error occurred while processing the meeting transcript.'
      });
    }
  };

  public resetDemoData = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Only admins can reset demo data.'
        });
      }

      DatabaseSeeder.resetToSeed(this.dbClient);

      return res.json({
        success: true,
        message: 'Database reset to initial clean demo state (10 users, 0 projects, 0 tasks).'
      });
    } catch (err) {
      console.error('[TranscriptController.resetDemoData] Error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to reset demo data.'
      });
    }
  };
}
