/**
 * API CLIENT SERVICE
 * File: src/services/api.ts
 *
 * Central HTTP client communicating with backend /api routes.
 * Strictly adheres to shared/api-contracts.ts.
 */

import {
  AuthUserDto,
  LoginRequest,
  LoginResponse,
  ProjectDto,
  ProjectDetailDto,
  TaskDto,
  TeamMemberDto,
  CreateFromTranscriptRequest,
  CreateFromTranscriptResponse,
  ApiResponse
} from '../../shared/api-contracts.ts';

const TOKEN_KEY = 'novaworks_auth_token';

export const api = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(endpoint, {
        ...options,
        headers
      });

      const data = await response.json();
      return data as ApiResponse<T>;
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network request failed'
      };
    }
  },

  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const res = await this.request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    if (res.success && res.data?.token) {
      this.setToken(res.data.token);
    }
    return res;
  },

  async getCurrentUser(): Promise<ApiResponse<AuthUserDto>> {
    return this.request<AuthUserDto>('/api/auth/me');
  },

  async logout(): Promise<ApiResponse<{ message: string }>> {
    const res = await this.request<{ message: string }>('/api/auth/logout', {
      method: 'POST'
    });
    this.clearToken();
    return res;
  },

  async getProjects(): Promise<ApiResponse<ProjectDto[]>> {
    return this.request<ProjectDto[]>('/api/projects');
  },

  async getProjectById(id: string): Promise<ApiResponse<ProjectDetailDto>> {
    return this.request<ProjectDetailDto>(`/api/projects/${id}`);
  },

  async getMyTasks(): Promise<ApiResponse<TaskDto[]>> {
    return this.request<TaskDto[]>('/api/tasks/my-tasks');
  },

  async getTeam(): Promise<ApiResponse<TeamMemberDto[]>> {
    return this.request<TeamMemberDto[]>('/api/team');
  },

  async createFromTranscript(
    data: CreateFromTranscriptRequest
  ): Promise<ApiResponse<CreateFromTranscriptResponse>> {
    return this.request<CreateFromTranscriptResponse>('/api/projects/from-transcript', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async resetDemoData(): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/api/admin/reset-demo', {
      method: 'POST'
    });
  }
};
