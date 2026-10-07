/**
 * DOMAIN LAYER - Entity Model
 * File: server/domain/models/User.ts
 *
 * Defines the core User domain entity and roles for NovaWorks Technologies.
 * Notice: Password hashes and credentials belong strictly to persistence/auth,
 * and are NEVER exposed to the AI parser or external layers.
 */

export type UserRole = 'ADMIN' | 'MANAGER' | 'AGENT';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  specialization: string;
  skills: string[];
}

/**
 * Safe DTO representation of a user without sensitive fields.
 * Used for team directory inspection and AI assignment context.
 */
export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  specialization: string;
  skills: string[];
}
