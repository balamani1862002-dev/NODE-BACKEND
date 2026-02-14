import { Router } from 'express';
import {
  signupController,
  loginController,
  forgotPasswordController,
  resetPasswordController,
} from '../controllers/auth.controller';

const router = Router();

router.post('/signup', signupController);
router.post('/login', loginController);
router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password', resetPasswordController);

export default router;
