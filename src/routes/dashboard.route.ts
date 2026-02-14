import { Router } from 'express';
import { getDashboardStatsController } from '../controllers/dashboard.controller';
import { authenticateToken } from '../common/auth-middleware';

const router = Router();

router.get('/stats', authenticateToken, getDashboardStatsController);

export default router;
