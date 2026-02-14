import { Response } from 'express';
import { AuthRequest } from '../common/auth-middleware';
import { getDashboardStats } from '../business/dashboard.business';
import { logger } from '../common/logger';

export const getDashboardStatsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const stats = await getDashboardStats(req.user.userId);

    res.status(200).json(stats);
  } catch (error) {
    logger.error('Get dashboard stats controller error', { error });
    res.status(500).json({
      success: false,
      error: { code: 'GET_STATS_FAILED', message: 'Failed to get dashboard stats' },
    });
  }
};
