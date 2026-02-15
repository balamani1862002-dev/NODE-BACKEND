import { Response } from 'express';
import { AuthRequest } from '../common/auth-middleware';
import { getDashboardStats } from '../business/dashboard.business';
import { logger } from '../common/logger';
import { sendSuccess, sendError } from '../common/response';

export const getDashboardStatsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'UNAUTHORIZED', 'Authentication required', 'Unauthorized');
      return;
    }

    const stats = await getDashboardStats(req.user.userId);

    sendSuccess(res, 200, stats);
  } catch (error) {
    logger.error('Get dashboard stats controller error', { error });
    sendError(res, 500, 'GET_STATS_FAILED', 'Failed to get dashboard stats', 'Internal Server Error');
  }
};
