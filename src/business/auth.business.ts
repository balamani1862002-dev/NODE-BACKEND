import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { SignupInput, LoginInput, AuthResponse, JWTPayload } from '../types/user.types';
import { findUserByEmail, insertUser, updateUserPassword } from '../db/user.db';
import { logger } from '../common/logger';
import { isValidEmail, isValidPassword } from '../common/validation';

const SALT_ROUNDS = 10;

const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(payload, jwtSecret, { expiresIn: '24h' });
};

export const signup = async (input: SignupInput): Promise<AuthResponse> => {
  try {
    logger.info('Processing signup', { email: input.email });

    if (!isValidEmail(input.email)) {
      throw new Error('Invalid email format');
    }

    if (!isValidPassword(input.password)) {
      throw new Error('Password must be at least 6 characters');
    }

    const existingUser = await findUserByEmail(input.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user = await insertUser({
      ...input,
      hashedPassword,
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    logger.info('User signup successful', { userId: user.id });

    return { token, user };
  } catch (error) {
    logger.error('Signup failed', { error, email: input.email });
    throw error;
  }
};

export const login = async (input: LoginInput): Promise<AuthResponse> => {
  try {
    logger.info('Processing login', { email: input.email });

    if (!isValidEmail(input.email)) {
      throw new Error('Invalid email format');
    }

    if (!isValidPassword(input.password)) {
      throw new Error('Invalid password format');
    }

    const user = await findUserByEmail(input.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password_hash );
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { password_hash: _, ...userWithoutPassword } = user;

    logger.info('User login successful', { userId: user.id });

    return { token, user: userWithoutPassword };
  } catch (error) {
    logger.error('Login failed', { error, email: input.email });
    throw error;
  }
};

export const forgotPassword = async (email: string): Promise<string> => {
  try {
    logger.info('Processing forgot password', { email });

    if (!isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    const user = await findUserByEmail(email);
    if (!user) {
      throw new Error('Email not found');
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { userId: user.id, email: user.email, type: 'reset' },
      jwtSecret,
      { expiresIn: '1h' }
    );

    // In production, send email with reset link
    logger.info('Password reset token generated', { userId: user.id });

    return resetToken;
  } catch (error) {
    logger.error('Forgot password failed', { error, email });
    throw error;
  }
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  try {
    logger.info('Processing password reset');

    if (!isValidPassword(newPassword)) {
      throw new Error('Password must be at least 6 characters');
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload & { type: string };

    if (decoded.type !== 'reset') {
      throw new Error('Invalid reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await updateUserPassword(decoded.userId, hashedPassword);

    logger.info('Password reset successful', { userId: decoded.userId });
  } catch (error) {
    logger.error('Password reset failed', { error });
    throw error;
  }
};
