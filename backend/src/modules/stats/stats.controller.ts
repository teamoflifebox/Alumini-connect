import { Request, Response, NextFunction } from 'express';
import { statsService } from './stats.service';

export class StatsController {
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await statsService.getLandingStats();
      res.status(200).json({
        status: 'success',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const statsController = new StatsController();
