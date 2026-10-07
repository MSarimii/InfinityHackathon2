/**
 * SHARED API CONTRACTS - Communication Interface Between Frontend & API Layer
 * File: shared/api-contracts.ts
 *
 * Defines request and response types passed across the HTTP boundary.
 * The frontend never communicates directly with the AI service or database.
 * Controllers receive these DTOs and forward them to the Domain services.
 */

export type Role = 'ADMIN' | 'MANAGER' | 'AGENT';

export interface AuthUserDto {
  id: string;
  name: string;
  email: string;
  role: Role;
  specialization: string;
  skills: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUserDto;
}

export interface TeamMemberDto {
  id: string;
  name: string;
  email: string;
  role: Role;
  specialization: string;
  skills: string[];
}

export interface TaskDto {
  id: string;
  projectId: string;
  projectName?: string;
  title: string;
  description: string;
  assigneeId: string;
  assigneeName?: string;
  deadline: string;
  estimatedHours: number;
  createdAt?: string;
}

export interface ProjectDto {
  id: string;
  name: string;
  clientName: string;
  description: string;
  managerId: string;
  managerName?: string;
  deadline: string;
  taskCount: number;
  totalEstimatedHours: number;
  createdAt?: string;
}

export interface ProjectDetailDto extends ProjectDto {
  tasks: TaskDto[];
}

export interface CreateFromTranscriptRequest {
  transcript: string;
  idempotencyKey?: string;
}

export interface CreateFromTranscriptResponse {
  message: string;
  projectsCreated: number;
  tasksCreated: number;
  totalEstimatedHours: number;
  projects: Array<{
    id: string;
    name: string;
    clientName: string;
    managerName: string;
    deadline: string;
    tasks: Array<{
      id: string;
      title: string;
      assigneeName: string;
      estimatedHours: number;
      deadline: string;
    }>;
  }>;
}

/**
 * Standard API Envelope for all responses
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: string[];
}
