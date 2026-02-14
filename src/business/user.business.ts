import { User, UpdateProfileInput } from '../types/user.types';
import { findUserById, updateUser } from '../db/user.db';
import { logger } from '../common/logger';
import { isValidEmail } from '../common/validation';

export const getUserProfile = async (userId: string): Promise<User> => {
  try {
    logger.info('Getting user profile', { userId });

    const user = await findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    logger.error('Failed to get user profile', { error, userId });
    throw error;
  }
};

export const updateUserProfile = async (userId: string, input: UpdateProfileInput): Promise<User> => {
  try {
    logger.info('Updating user profile', { userId });

    if (input.email && !isValidEmail(input.email)) {
      throw new Error('Invalid email format');
    }

    const user = await updateUser(userId, input);

    logger.info('User profile updated successfully', { userId });

    return user;
  } catch (error) {
    logger.error('Failed to update user profile', { error, userId });
    throw error;
  }
};
