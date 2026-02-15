import jwt from 'jsonwebtoken';
import { UserRole } from '../types/user.types';
import { UserListResponse } from '../types/common.types';
import { getAllUsers, deleteUserById, findUserById, getUserBalance, getUserRemainingTodos } from '../db/user.db';
import { logger } from '../common/logger';

export const getUsers = async (page: number, limit: number, role?: UserRole): Promise<UserListResponse> => {
  try {
    logger.info('Getting all users', { page, limit, role });

    const { users, total } = await getAllUsers(page, limit, role);

    // Fetch balance and remaining todos for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        try {
          const [currentBalance, remainingTodos] = await Promise.all([
            getUserBalance(user.id),
            getUserRemainingTodos(user.id),
          ]);

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || null,
            role: user.role,
            createdAt: user.createdAt,
            currentBalance,
            remainingTodos,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const errorStack = error instanceof Error ? error.stack : '';
          logger.error('Failed to get stats for user', { 
            error: errorMessage, 
            stack: errorStack,
            userId: user.id 
          });
          // Return user with default values if stats fetch fails
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || null,
            role: user.role,
            createdAt: user.createdAt,
            currentBalance: 0,
            remainingTodos: 0,
          };
        }
      })
    );

    return {
      users: usersWithStats,
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
