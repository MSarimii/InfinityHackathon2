/**
 * DOMAIN ERRORS
 * File: server/domain/errors/DomainErrors.ts
 *
 * Specific domain error types thrown by the Domain layer.
 * These are caught by the API/Controller layer to produce meaningful HTTP error responses
 * without leaking database internals or raw provider stack traces.
 */

export class DomainValidationError extends Error {
  public readonly errors: string[];

  constructor(errors: string[] | string) {
    const list = Array.isArray(errors) ? errors : [errors];
    super(list.join('; '));
    this.name = 'DomainValidationError';
    this.errors = list;
  }
}

export class UnauthorizedDomainActionError extends Error {
  constructor(message: string = 'User is not authorized to perform this action') {
    super(message);
    this.name = 'UnauthorizedDomainActionError';
  }
}

export class DuplicateSubmissionError extends Error {
  constructor(message: string = 'A transcript processing operation is already in progress or has been processed') {
    super(message);
    this.name = 'DuplicateSubmissionError';
  }
}

export class EntityNotFoundError extends Error {
  constructor(entityName: string, identifier: string) {
    super(`${entityName} with identifier "${identifier}" not found`);
    this.name = 'EntityNotFoundError';
  }
}
