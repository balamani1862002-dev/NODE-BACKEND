import jwt from 'jsonwebtoken';
import { UserRole } from '../types/user.types';
import { UserListResponse } from '../types/common.types';
import { getAllUsers, deleteUserById, findUserById } from '../db/user.db';
import { logger } from '../common/logger';

export const getUsers = async (page: number, limit: number, role?: UserRole): Promise<UserListResponse> => {
  try {
    logger.info('Getting all users', { page, limit, role });

    const { users, total } = await getAllUsers(page, limit, role);

    return {
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        role: user.role,
        createdAt: user.createdAt,
      })),
      total,
      page,
      limit,
    };
  } catch (error) {
    logger.error('Failed to get users', { error });
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    logger.info('Deleting user', { userId });

    const user = await findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await deleteUserById(userId);

    logger.info('User deleted successfully', { userId });
  } catch (error) {
    logger.error('Failed to delete user', { error, userId });
    throw error;
  }
};

export const impersonateUser = async (userId: string): Promise<string> => {
  try {
    logger.info('Impersonating user', { userId });

    const user = await findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    logger.info('User impersonation token generated', { userId });

    return token;
  } catch (error) {
    logger.error('Failed to impersonate user', { error, userId });
    throw error;
  }
};
