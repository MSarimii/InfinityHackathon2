/**
 * API LAYER - Team Directory Controller
 * File: server/api/controllers/TeamController.ts
 *
 * Exposes the read-only team directory for NovaWorks Technologies.
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { IUserRepository } from '../../domain/interfaces/IUserRepository.ts';
import { TeamMemberDto } from '../../../shared/api-contracts.ts';

export class TeamController {
  constructor(private userRepo: IUserRepository) {}

  public getTeam = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const users = await this.userRepo.findAll();
      const dtos: TeamMemberDto[] = users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        specialization: u.specialization,
        skills: [...u.skills]
      }));

      return res.json({
        success: true,
        data: dtos
      });
    } catch (err) {
      console.error('[TeamController.getTeam] Error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve team directory.'
      });
    }
  };
}
