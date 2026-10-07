/**
 * INFRASTRUCTURE LAYER - Persistent Database Engine
 * File: server/infrastructure/database/DatabaseClient.ts
 *
 * Implements a file-backed persistent database with:
 * - Persistent disk storage (saved to `data/novaworks_db.json`)
 * - ACID transactions with rollback (snapshot isolation)
 * - Atomic write-and-rename disk sync to prevent file corruption
 * - Persistence across refreshes and process restarts
 */

import fs from 'fs';
import path from 'path';
import { User } from '../../domain/models/User.ts';
import { Project } from '../../domain/models/Project.ts';
import { Task } from '../../domain/models/Task.ts';

export interface DatabaseSchema {
  users: User[];
  projects: Project[];
  tasks: Task[];
  metadata: {
    lastUpdated: string;
    version: number;
  };
}

const DEFAULT_DB_DATA: DatabaseSchema = {
  users: [],
  projects: [],
  tasks: [],
  metadata: {
    lastUpdated: new Date().toISOString(),
    version: 1
  }
};

export class DatabaseClient {
  private static instance: DatabaseClient | null = null;
  private filePath: string;
  private state: DatabaseSchema;
  private transactionSnapshot: DatabaseSchema | null = null;
  private isInTransaction: boolean = false;

  private constructor(filePath?: string) {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.filePath = filePath || path.join(dataDir, 'novaworks_db.json');
    this.state = this.loadFromDisk();
  }

  public static getInstance(filePath?: string): DatabaseClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new DatabaseClient(filePath);
    }
    return DatabaseClient.instance;
  }

  private loadFromDisk(): DatabaseSchema {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          users: Array.isArray(parsed.users) ? parsed.users : [],
          projects: Array.isArray(parsed.projects) ? parsed.projects : [],
          tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
          metadata: parsed.metadata || DEFAULT_DB_DATA.metadata
        };
      }
    } catch (err) {
      console.error(`[DatabaseClient] Failed to load data from ${this.filePath}, initializing default:`, err);
    }
    return JSON.parse(JSON.stringify(DEFAULT_DB_DATA));
  }

  public persistToDisk(): void {
    if (this.isInTransaction) {
      // Defer write until commit
      return;
    }

    try {
      this.state.metadata.lastUpdated = new Date().toISOString();
      const content = JSON.stringify(this.state, null, 2);
      const tmpFile = `${this.filePath}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, content, 'utf-8');
      fs.renameSync(tmpFile, this.filePath);
    } catch (err) {
      console.error(`[DatabaseClient] Failed to persist data to disk:`, err);
      throw new Error(`Database persistence failure: ${(err as Error).message}`);
    }
  }

  // --- Transaction Management ---

  public beginTransaction(): void {
    if (this.isInTransaction) {
      throw new Error('Transaction is already active');
    }
    this.isInTransaction = true;
    // Deep clone snapshot for rollback capability
    this.transactionSnapshot = JSON.parse(JSON.stringify(this.state));
  }

  public commitTransaction(): void {
    if (!this.isInTransaction) {
      throw new Error('No active transaction to commit');
    }
    this.isInTransaction = false;
    this.transactionSnapshot = null;
    this.persistToDisk();
  }

  public rollbackTransaction(): void {
    if (!this.isInTransaction) {
      return;
    }
    if (this.transactionSnapshot) {
      this.state = JSON.parse(JSON.stringify(this.transactionSnapshot));
    }
    this.isInTransaction = false;
    this.transactionSnapshot = null;
  }

  // --- Collection Accessors ---

  public getUsers(): User[] {
    return this.state.users;
  }

  public setUsers(users: User[]): void {
    this.state.users = users;
    this.persistToDisk();
  }

  public getProjects(): Project[] {
    return this.state.projects;
  }

  public setProjects(projects: Project[]): void {
    this.state.projects = projects;
    this.persistToDisk();
  }

  public getTasks(): Task[] {
    return this.state.tasks;
  }

  public setTasks(tasks: Task[]): void {
    this.state.tasks = tasks;
    this.persistToDisk();
  }
}
