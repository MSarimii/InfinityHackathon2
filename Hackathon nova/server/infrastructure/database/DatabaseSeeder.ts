/**
 * INFRASTRUCTURE LAYER - Demo Accounts Seeder
 * File: server/infrastructure/database/DatabaseSeeder.ts
 *
 * Implements Section 3 & 15 of the Challenge Specification:
 * Pre-seeds the 10 demo accounts for NovaWorks Technologies:
 * - 1 Admin
 * - 3 Managers (Ayesha, Bilal, Hina)
 * - 6 Agents (Ali, Hamza, Sara, Usman, Zain, Maryam)
 *
 * Standard Demo Password for all accounts: Demo123!
 * Passwords are fully hashed with salt before storage.
 * Idempotent: safe to run multiple times without duplicating or corrupting records.
 */

import crypto from 'crypto';
import { User } from '../../domain/models/User.ts';
import { DatabaseClient } from './DatabaseClient.ts';

export function hashPassword(password: string): string {
  const salt = 'novaworks_hackathon_salt_2026';
  return crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha256').toString('hex');
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const hash = hashPassword(password);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash));
}

export const DEMO_USERS_SEED_DATA: User[] = [
  {
    id: 'ADMIN',
    name: 'Admin',
    email: 'admin@novaworks.example',
    passwordHash: hashPassword('Demo123!'),
    role: 'ADMIN',
    specialization: 'Administrator',
    skills: ['Company overview', 'transcript creation']
  },
  {
    id: 'PM01',
    name: 'Ayesha Khan',
    email: 'ayesha@novaworks.example',
    passwordHash: hashPassword('Demo123!'),
    role: 'MANAGER',
    specialization: 'Manager / Web PM',
    skills: ['Web projects', 'client coordination']
  },
  {
    id: 'PM02',
    name: 'Bilal Ahmed',
    email: 'bilal@novaworks.example',
    passwordHash: hashPassword('Demo123!'),
    role: 'MANAGER',
    specialization: 'Manager / Mobile PM',
    skills: ['Mobile projects', 'delivery planning']
  },
  {
    id: 'PM03',
    name: 'Hina Malik',
    email: 'hina@novaworks.example',
    passwordHash: hashPassword('Demo123!'),
    role: 'MANAGER',
    specialization: 'Manager / AI PM',
    skills: ['AI projects', 'requirement review']
  },
  {
    id: 'DEV01',
    name: 'Ali Raza',
    email: 'ali@novaworks.example',
    passwordHash: hashPassword('Demo123!'),
    role: 'AGENT',
    specialization: 'Agent / Full-Stack',
    skills: ['React', 'frontend integration']
  },
  {
    id: 'DEV02',
    name: 'Hamza Shah',
    email: 'hamza@novaworks.example',
    passwordHash: hashPassword('Demo123!'),
    role: 'AGENT',
    specialization: 'Agent / Full-Stack',
    skills: ['Node.js', 'databases', 'APIs']
  },
  {
    id: 'DEV03',
    name: 'Sara Noor',
    email: 'sara@novaworks.example',
    passwordHash: hashPassword('Demo123!'),
    role: 'AGENT',
    specialization: 'Agent / App Developer',
    skills: ['Flutter', 'mobile UI']
  },
  {
    id: 'DEV04',
    name: 'Usman Tariq',
    email: 'usman@novaworks.example',
    passwordHash: hashPassword('Demo123!'),
    role: 'AGENT',
    specialization: 'Agent / App Developer',
    skills: ['Flutter', 'integration', 'testing']
  },
  {
    id: 'DEV05',
    name: 'Zain Abbas',
    email: 'zain@novaworks.example',
    passwordHash: hashPassword('Demo123!'),
    role: 'AGENT',
    specialization: 'Agent / AI Developer',
    skills: ['LLMs', 'extraction', 'prompts']
  },
  {
    id: 'DEV06',
    name: 'Maryam Asif',
    email: 'maryam@novaworks.example',
    passwordHash: hashPassword('Demo123!'),
    role: 'AGENT',
    specialization: 'Agent / AI Developer',
    skills: ['Retrieval', 'document processing']
  }
];

export class DatabaseSeeder {
  public static seed(db: DatabaseClient): void {
    const existingUsers = db.getUsers();
    const existingEmails = new Set(existingUsers.map(u => u.email.toLowerCase()));

    let addedCount = 0;
    const mergedUsers = [...existingUsers];

    for (const demoUser of DEMO_USERS_SEED_DATA) {
      if (!existingEmails.has(demoUser.email.toLowerCase())) {
        mergedUsers.push(demoUser);
        existingEmails.add(demoUser.email.toLowerCase());
        addedCount++;
      }
    }

    if (addedCount > 0 || existingUsers.length === 0) {
      db.setUsers(mergedUsers);
      console.log(`[DatabaseSeeder] Seeded ${DEMO_USERS_SEED_DATA.length} demo accounts for NovaWorks Technologies.`);
    }
  }

  public static resetToSeed(db: DatabaseClient): void {
    db.setUsers([...DEMO_USERS_SEED_DATA]);
    db.setProjects([]);
    db.setTasks([]);
    console.log('[DatabaseSeeder] Database reset to initial demo seed state.');
  }
}
