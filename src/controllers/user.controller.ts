import { Response } from 'express';
import { AuthRequest } from '../common/auth-middleware';
import { getUserProfile, updateUserProfile } from '../business/user.business';
import { UpdateProfileInput } from '../types/user.types';
import { logger } from '../common/logger';

export const getProfileController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    const user = await getUserProfile(req.user.userId);

    res.status(200).json(user);
  } catch (error) {
    logger.error('Get profile controller error', { error });
    const errorMessage = error instanceof Error ? error.message : 'Failed to get profile';
    const statusCode = errorMessage === 'User not found' ? 404 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: {
        code: 'GET_PROFILE_FAILED',
        message: errorMessage,
      },
    });
  }
};

export const updateProfileController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    const input = req.body as unknown as UpdateProfileInput;
    const user = await updateUserProfile(req.user.userId, input);

    res.status(200).json(user);
  } catch (error) {
    logger.error('Update profile controller error', { error });
    const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
    
    res.status(400).json({
      success: false,
      error: {
        code: 'UPDATE_PROFILE_FAILED',
        message: errorMessage,
      },
    });
  }
};
