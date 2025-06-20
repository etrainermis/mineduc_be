
/**
 * @file
 * @brief services for auth queries
 */
import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { UtilsService } from '../utils/utils.service';

@Injectable()
export class AuthService {
  constructor(private utilsService: UtilsService) {}
  async getProfile(req: Request) {
    try {
      return await this.utilsService.getLoggedInProfile(req);
    } catch (error) {
      return error;
    }
  }

  async verifyProfile(req: Request) {
    const data: { code: number } = req.body;
  }
}
