import { Response } from 'express';
import { AuthRequest } from '../common/auth-middleware';
import { getUsers, deleteUser, impersonateUser } from '../business/admin.business';
import { UserRole } from '../types/user.types';
import { logger } from '../common/logger';
import { sendSuccess, sendError } from '../common/response';

export const getUsersController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'UNAUTHORIZED', 'Authentication required', 'Unauthorized');
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const role = req.query.role as UserRole | undefined;

    const result = await getUsers(page, limit, role);

    sendSuccess(res, 200, result, 'OK');
  } catch (error) {
    logger.error('Get users controller error', { error });
    sendError(res, 500, 'GET_USERS_FAILED', 'Failed to get users', 'Internal Server Error');
  }
};

export const deleteUserController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'UNAUTHORIZED', 'Authentication required', 'Unauthorized');
      return;
    }

    const userId = req.params.userId;

    await deleteUser(userId);

    sendSuccess(res, 200, { message: 'User deleted successfully' }, 'OK');
  } catch (error) {
    logger.error('Delete user controller error', { error });
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
    const statusCode = errorMessage === 'User not found' ? 404 : 500;
    const statusText = statusCode === 404 ? 'Not Found' : 'Internal Server Error';
    sendError(res, statusCode, 'DELETE_USER_FAILED', errorMessage, statusText);
  }
};

export const impersonateUserController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'UNAUTHORIZED', 'Authentication required', 'Unauthorized');
      return;
    }

    const userId = req.params.userId;

    const token = await impersonateUser(userId);

    sendSuccess(res, 200, { token }, 'OK');
  } catch (error) {
    logger.error('Impersonate user controller error', { error });
    const errorMessage = error instanceof Error ? error.message : 'Failed to impersonate user';
    const statusCode = errorMessage === 'User not found' ? 404 : 500;
    const statusText = statusCode === 404 ? 'Not Found' : 'Internal Server Error';
    sendError(res, statusCode, 'IMPERSONATE_FAILED', errorMessage, statusText);
  }
};
