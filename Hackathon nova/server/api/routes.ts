/**
 * API LAYER - Routes & Dependency Injection Container
 * File: server/api/routes.ts
 *
 * Assembles and wires together:
 * - Infrastructure: DatabaseClient, DatabaseSeeder, Repositories, GeminiAIParser
 * - Domain: TranscriptProcessingService
 * - Controllers: AuthController, ProjectController, TaskController, TeamController, TranscriptController
 */

import { Router } from 'express';
import { DatabaseClient, DatabaseSeeder } from '../infrastructure/database/index.ts';
import {
  UserRepository,
  ProjectRepository,
  TaskRepository,
  TransactionManager
} from '../infrastructure/repositories/index.ts';
import { GeminiAIParser } from '../infrastructure/ai/GeminiAIParser.ts';
import { OpenRouterAIParser } from '../infrastructure/ai/OpenRouterAIParser.ts';
import { CompositeAIParser } from '../infrastructure/ai/CompositeAIParser.ts';
import { TranscriptProcessingService } from '../domain/services/TranscriptProcessingService.ts';
import { authMiddleware, requireRole } from './middleware/auth.ts';
import { AuthController } from './controllers/AuthController.ts';
import { ProjectController } from './controllers/ProjectController.ts';
import { TaskController } from './controllers/TaskController.ts';
import { TeamController } from './controllers/TeamController.ts';
import { TranscriptController } from './controllers/TranscriptController.ts';

export function createApiRouter(): Router {
  const router = Router();

  // 1. Initialize Database & Run Idempotent Seed
  const dbClient = DatabaseClient.getInstance();
  DatabaseSeeder.seed(dbClient);

  // 2. Initialize Repositories
  const userRepo = new UserRepository(dbClient);
  const projectRepo = new ProjectRepository(dbClient);
  const taskRepo = new TaskRepository(dbClient);
  const transactionManager = new TransactionManager(dbClient);

  // 3. Initialize AI Parser (Supports OpenRouter and Gemini via Composite)
  const aiParser = new CompositeAIParser();

  // 4. Initialize Domain Service (Inversion of Control)
  const transcriptService = new TranscriptProcessingService(
    userRepo,
    projectRepo,
    taskRepo,
    aiParser,
    transactionManager
  );

  // 5. Initialize Controllers
  const authController = new AuthController(userRepo);
  const projectController = new ProjectController(projectRepo, taskRepo, userRepo);
  const taskController = new TaskController(taskRepo, projectRepo, userRepo);
  const teamController = new TeamController(userRepo);
  const transcriptController = new TranscriptController(transcriptService, userRepo, dbClient);

  const auth = authMiddleware(userRepo);

  // --- Public Auth Routes ---
  router.post('/auth/login', authController.login);

  // --- Protected Auth Routes ---
  router.get('/auth/me', auth, authController.getCurrentUser);
  router.post('/auth/logout', auth, authController.logout);

  // --- Project Routes (Role-Scoped in Controller) ---
  router.get('/projects', auth, projectController.listProjects);
  router.get('/projects/:id', auth, projectController.getProjectById);

  // --- Task Routes (Role-Scoped in Controller) ---
  router.get('/tasks/my-tasks', auth, taskController.getMyTasks);

  // --- Team Directory ---
  router.get('/team', auth, teamController.getTeam);

  // --- Admin Transcript Automation ---
  router.post('/projects/from-transcript', auth, requireRole('ADMIN'), transcriptController.createFromTranscript);
  router.post('/admin/reset-demo', auth, requireRole('ADMIN'), transcriptController.resetDemoData);

  return router;
}
