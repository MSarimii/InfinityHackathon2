/**
 * API LAYER - Authentication & Role Authorization Middleware
 * File: server/api/middleware/auth.ts
 *
 * Enforces Section 13: Role-Based Access Control.
 * Identity is derived exclusively from the authenticated session token,
 * never from caller-supplied query parameters or body fields.
 */

import { Request, Response, NextFunction } from 'express';
import { User, UserRole } from '../../domain/models/User.ts';
import { IUserRepository } from '../../domain/interfaces/IUserRepository.ts';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

// In-memory session store mapping token -> userId
const tokenToUserId = new Map<string, string>();

export function createSessionToken(userId: string): string {
  const token = `sess_${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  tokenToUserId.set(token, userId);
  return token;
}

export function revokeSessionToken(token: string): void {
  tokenToUserId.delete(token);
}

export function authMiddleware(userRepo: IUserRepository) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Missing Bearer token.'
      });
    }

    const token = authHeader.substring(7).trim();
    const userId = tokenToUserId.get(token);

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session token.'
      });
    }

    const user = await userRepo.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User account not found.'
      });
    }

    req.user = user;
    next();
  };
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Requires one of [${allowedRoles.join(', ')}] role (current: ${req.user.role}).`
      });
    }

    next();
  };
}
