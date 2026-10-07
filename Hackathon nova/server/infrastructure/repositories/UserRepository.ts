/**
 * INFRASTRUCTURE LAYER - User Repository Implementation
 * File: server/infrastructure/repositories/UserRepository.ts
 *
 * Implements IUserRepository using DatabaseClient.
 */

import { IUserRepository } from '../../domain/interfaces/IUserRepository.ts';
import { User } from '../../domain/models/User.ts';
import { TeamMemberDirectoryItem } from '../../domain/models/AITypes.ts';
import { DatabaseClient } from '../database/DatabaseClient.ts';

export class UserRepository implements IUserRepository {
  constructor(private db: DatabaseClient) {}

  public async findById(id: string): Promise<User | null> {
    const users = this.db.getUsers();
    return users.find(u => u.id === id) || null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const users = this.db.getUsers();
    const cleanEmail = email.trim().toLowerCase();
    return users.find(u => u.email.toLowerCase() === cleanEmail) || null;
  }

  public async getTeamDirectory(): Promise<TeamMemberDirectoryItem[]> {
    const users = this.db.getUsers();
    // Exclude passwordHash and any sensitive fields
    return users.map(u => ({
      id: u.id,
      name: u.name,
      role: u.role,
      specialization: u.specialization,
      skills: [...u.skills]
    }));
  }

  public async save(user: User): Promise<void> {
    const users = this.db.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    this.db.setUsers([...users]);
  }

  public async findAll(): Promise<User[]> {
    return [...this.db.getUsers()];
  }

  public async seedUsers(seedUsersList: User[]): Promise<void> {
    const current = this.db.getUsers();
    const currentIds = new Set(current.map(u => u.id));
    const toAdd = seedUsersList.filter(u => !currentIds.has(u.id));
    if (toAdd.length > 0) {
      this.db.setUsers([...current, ...toAdd]);
    }
  }
}
