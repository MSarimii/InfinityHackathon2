/**
 * DOMAIN INTERFACE - Transaction Manager
 * File: server/domain/interfaces/ITransactionManager.ts
 *
 * Provides an atomic execution boundary.
 * If any error or validation issue occurs during transaction execution,
 * all pending changes are rolled back completely.
 */

export interface ITransactionManager {
  /**
   * Executes an asynchronous work unit inside an atomic transaction.
   * Commits if the callback resolves successfully.
   * Rolls back completely if the callback throws an error.
   */
  executeInTransaction<T>(work: () => Promise<T>): Promise<T>;
}
