/**
 * API LAYER - Authentication Controller
 * File: server/api/controllers/AuthController.ts
 *
 * Handles login, session retrieval, and logout using IUserRepository.
 */

import { Response } from 'express';
import { IUserRepository } from '../../domain/interfaces/IUserRepository.ts';
import { verifyPassword } from '../../infrastructure/database/DatabaseSeeder.ts';
import { AuthenticatedRequest, createSessionToken, revokeSessionToken } from '../middleware/auth.ts';
import { LoginRequest, AuthUserDto } from '../../../shared/api-contracts.ts';

export class AuthController {
  constructor(private userRepo: IUserRepository) {}

  public login = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { email, password }: LoginRequest = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required.'
        });
      }

      const user = await this.userRepo.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials. Please verify your email and password.'
        });
      }

      const isValid = verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials. Please verify your email and password.'
        });
      }

      const token = createSessionToken(user.id);
      const userDto: AuthUserDto = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        specialization: user.specialization,
        skills: [...user.skills]
      };

      return res.json({
        success: true,
        data: {
          token,
          user: userDto
        }
      });
    } catch (err) {
      console.error('[AuthController.login] Error:', err);
      return res.status(500).json({
        success: false,
        error: 'An unexpected authentication error occurred.'
      });
    }
  };

  public getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const userDto: AuthUserDto = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      specialization: req.user.specialization,
      skills: [...req.user.skills]
    };

    return res.json({
      success: true,
      data: userDto
    });
  };

  public logout = async (req: AuthenticatedRequest, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      revokeSessionToken(authHeader.substring(7).trim());
    }
    return res.json({ success: true, message: 'Logged out successfully.' });
  };
}
