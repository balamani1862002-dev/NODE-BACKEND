import { Response } from 'express';
import { AuthRequest } from '../common/auth-middleware';
import { getUserProfile, updateUserProfile } from '../business/user.business';
import { UpdateProfileInput } from '../types/user.types';
import { logger } from '../common/logger';
import { sendSuccess, sendError } from '../common/response';

export const getProfileController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'UNAUTHORIZED', 'Authentication required', 'Unauthorized');
      return;
    }

    const user = await getUserProfile(req.user.userId);

    sendSuccess(res, 200, user);
  } catch (error) {
    logger.error('Get profile controller error', { error });
    const errorMessage = error instanceof Error ? error.message : 'Failed to get profile';
    const statusCode = errorMessage === 'User not found' ? 404 : 500;
    const statusText = statusCode === 404 ? 'Not Found' : 'Internal Server Error';

    sendError(res, statusCode, 'GET_PROFILE_FAILED', errorMessage, statusText);
  }
};

export const updateProfileController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'UNAUTHORIZED', 'Authentication required', 'Unauthorized');
      return;
    }

    const input = req.body as unknown as UpdateProfileInput;
    const user = await updateUserProfile(req.user.userId, input);

    sendSuccess(res, 200, user);
  } catch (error) {
    logger.error('Update profile controller error', { error });
    const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';

    sendError(res, 400, 'UPDATE_PROFILE_FAILED', errorMessage, 'Bad Request');
  }
};
