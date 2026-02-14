import { Router } from 'express';
import { getProfileController, updateProfileController } from '../controllers/user.controller';
import { authenticateToken } from '../common/auth-middleware';

const router = Router();

router.get('/profile', authenticateToken, getProfileController);
router.put('/profile', authenticateToken, updateProfileController);

export default router;
