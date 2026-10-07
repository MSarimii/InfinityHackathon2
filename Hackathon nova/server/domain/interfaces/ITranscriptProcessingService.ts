/**
 * DOMAIN INTERFACE - Transcript Processing Service
 * File: server/domain/interfaces/ITranscriptProcessingService.ts
 *
 * Defines the contract for the core domain orchestration:
 * Transcript -> AI Parsing -> Validation & User Resolution -> Atomic Persistence.
 */

import { Project } from '../models/Project.ts';
import { Task } from '../models/Task.ts';

export interface ProcessTranscriptCommand {
  transcript: string;
  authenticatedUserId: string;
}

export interface CreatedProjectWithTasks {
  project: Project;
  tasks: Task[];
}

export interface ProcessTranscriptResult {
  success: boolean;
  projectsCreated: number;
  tasksCreated: number;
  totalEstimatedHours: number;
  projects: CreatedProjectWithTasks[];
}

export interface ITranscriptProcessingService {
  /**
   * Orchestrates the complete end-to-end domain pipeline:
   * verifies permissions, loads team directory, parses transcript via IAIParser,
   * validates all domain rules, resolves roles & deadlines, executes in transaction,
   * and returns domain entities.
   */
  processMeetingTranscript(command: ProcessTranscriptCommand): Promise<ProcessTranscriptResult>;
}
