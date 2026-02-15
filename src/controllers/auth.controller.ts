import { Request, Response } from 'express';
import { signup, login, forgotPassword, resetPassword } from '../business/auth.business';
import { SignupInput, LoginInput } from '../types/user.types';
import { logger } from '../common/logger';
import { sendSuccess, sendError } from '../common/response';

export const signupController = async (req: Request, res: Response): Promise<void> => {
  try {
    const input = req.body as unknown as SignupInput;

    if (!input.name || !input.email || !input.password) {
      sendError(res, 400, 'INVALID_INPUT', 'Name, email, and password are required', 'Bad Request');
      return;
    }

    const result = await signup(input);

    sendSuccess(res, 201, result, 'Created');
  } catch (error) {
    logger.error('Signup controller error', { error });
    const errorMessage = error instanceof Error ? error.message : 'Signup failed';
    
    sendError(res, 400, 'SIGNUP_FAILED', errorMessage, 'Bad Request');
  }
};

export const loginController = async (req: Request, res: Response): Promise<void> => {
  try {
    const input = req.body as unknown as LoginInput;

    if (!input.email || !input.password) {
      sendError(res, 400, 'INVALID_INPUT', 'Email and password are required', 'Bad Request');
      return;
    }

    const result = await login(input);

    sendSuccess(res, 200, result);
  } catch (error) {
    logger.error('Login controller error', { error });
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    
    sendError(res, 401, 'LOGIN_FAILED', errorMessage, 'Unauthorized');
  }
};

export const forgotPasswordController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      sendError(res, 400, 'INVALID_INPUT', 'Email is required', 'Bad Request');
      return;
    }

    await forgotPassword(email);

    sendSuccess(res, 200, { message: 'Password reset email sent successfully' });
  } catch (error) {
    logger.error('Forgot password controller error', { error });
    const errorMessage = error instanceof Error ? error.message : 'Failed to process request';
    const statusCode = errorMessage === 'Email not found' ? 404 : 400;
    const statusText = errorMessage === 'Email not found' ? 'Not Found' : 'Bad Request';
    
    sendError(res, statusCode, 'FORGOT_PASSWORD_FAILED', errorMessage, statusText);
  }
};

export const resetPasswordController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      sendError(res, 400, 'INVALID_INPUT', 'Token and password are required', 'Bad Request');
      return;
    }

    await resetPassword(token, password);

    sendSuccess(res, 200, { message: 'Password reset successfully' });
  } catch (error) {
    logger.error('Reset password controller error', { error });
    
    sendError(res, 400, 'RESET_PASSWORD_FAILED', 'Invalid or expired token', 'Bad Request');
  }
};
