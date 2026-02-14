import { Request, Response } from 'express';
import { signup, login, forgotPassword, resetPassword } from '../business/auth.business';
import { SignupInput, LoginInput } from '../types/user.types';
import { logger } from '../common/logger';

export const signupController = async (req: Request, res: Response): Promise<void> => {
  try {
    const input = req.body as unknown as SignupInput;

    if (!input.name || !input.email || !input.password) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Name, email, and password are required',
        },
      });
      return;
    }

    const result = await signup(input);

    res.status(201).json(result);
  } catch (error) {
    logger.error('Signup controller error', { error });
    const errorMessage = error instanceof Error ? error.message : 'Signup failed';
    
    res.status(400).json({
      success: false,
      error: {
        code: 'SIGNUP_FAILED',
        message: errorMessage,
      },
    });
  }
};

export const loginController = async (req: Request, res: Response): Promise<void> => {
  try {
    const input = req.body as unknown as LoginInput;

    if (!input.email || !input.password) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Email and password are required',
        },
      });
      return;
    }

    const result = await login(input);

    res.status(200).json(result);
  } catch (error) {
    logger.error('Login controller error', { error });
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    
    res.status(401).json({
      success: false,
      error: {
        code: 'LOGIN_FAILED',
        message: errorMessage,
      },
    });
  }
};

export const forgotPasswordController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Email is required',
        },
      });
      return;
    }

    await forgotPassword(email);

    res.status(200).json({
      message: 'Password reset email sent successfully',
    });
  } catch (error) {
    logger.error('Forgot password controller error', { error });
    const errorMessage = error instanceof Error ? error.message : 'Failed to process request';
    const statusCode = errorMessage === 'Email not found' ? 404 : 400;
    
    res.status(statusCode).json({
      success: false,
      error: {
        code: 'FORGOT_PASSWORD_FAILED',
        message: errorMessage,
      },
    });
  }
};

export const resetPasswordController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Token and password are required',
        },
      });
      return;
    }

    await resetPassword(token, password);

    res.status(200).json({
      message: 'Password reset successfully',
    });
  } catch (error) {
    logger.error('Reset password controller error', { error });
    
    res.status(400).json({
      success: false,
      error: {
        code: 'RESET_PASSWORD_FAILED',
        message: 'Invalid or expired token',
      },
    });
  }
};
