/**
 * INFRASTRUCTURE LAYER - Transaction Manager Implementation
 * File: server/infrastructure/repositories/TransactionManager.ts
 *
 * Implements ITransactionManager using DatabaseClient's snapshot isolation.
 * Guarantees All-or-Nothing execution for transcript domain operations.
 */

import { ITransactionManager } from '../../domain/interfaces/ITransactionManager.ts';
import { DatabaseClient } from '../database/DatabaseClient.ts';

export class TransactionManager implements ITransactionManager {
  constructor(private db: DatabaseClient) {}

  public async executeInTransaction<T>(work: () => Promise<T>): Promise<T> {
    this.db.beginTransaction();
    try {
      const result = await work();
      this.db.commitTransaction();
      return result;
    } catch (error) {
      this.db.rollbackTransaction();
      console.warn('[TransactionManager] Transaction rolled back due to error:', error);
      throw error;
    }
  }
}
