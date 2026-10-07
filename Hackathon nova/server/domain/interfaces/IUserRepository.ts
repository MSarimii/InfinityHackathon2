/**
 * DOMAIN INTERFACE - User Repository
 * File: server/domain/interfaces/IUserRepository.ts
 *
 * Provides persistence operations for Users without exposing database specifics.
 * Implemented by infrastructure repositories (e.g. SQLite / Mongo / File DB).
 */

import { User } from '../models/User.ts';
import { TeamMemberDirectoryItem } from '../models/AITypes.ts';

export interface IUserRepository {
  /**
   * Retrieves a user by primary ID.
   */
  findById(id: string): Promise<User | null>;

  /**
   * Retrieves a user by unique email address (for authentication).
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Loads the sanitized team directory (id, name, role, specialization, skills)
   * used by the Domain layer and safe to send to the AI Parser.
   */
  getTeamDirectory(): Promise<TeamMemberDirectoryItem[]>;

  /**
   * Persists or updates a user entity.
   */
  save(user: User): Promise<void>;

  /**
   * Retrieves all users (for administrative inspection).
   */
  findAll(): Promise<User[]>;

  /**
   * Bulk inserts or seeds initial users if not present.
   */
  seedUsers(users: User[]): Promise<void>;
}
