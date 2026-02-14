import { Router } from 'express';
import {
  getUsersController,
  deleteUserController,
  impersonateUserController,
} from '../controllers/admin.controller';
import { authenticateToken, requireAdmin } from '../common/auth-middleware';

const router = Router();

router.get('/users', authenticateToken, requireAdmin, getUsersController);
router.delete('/users/:userId', authenticateToken, requireAdmin, deleteUserController);
router.post('/impersonate/:userId', authenticateToken, requireAdmin, impersonateUserController);

export default router;
