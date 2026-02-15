import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types/user.types';
import { logger } from './logger';
import { sendError } from './response';

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers['authorization'] as string | undefined;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      sendError(res, 401, 'UNAUTHORIZED', 'Access token is missing', 'Unauthorized');
      return;
    }

    const jwtSecret = process.env.JWT_SECRET as string;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Token authentication failed', { error });
    sendError(res, 401, 'UNAUTHORIZED', 'Invalid or expired token', 'Unauthorized');
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.user) {
      sendError(res, 401, 'UNAUTHORIZED', 'Authentication required', 'Unauthorized');
      return;
    }

    if (req.user.role !== 'admin') {
      sendError(res, 403, 'FORBIDDEN', 'Admin access required', 'Forbidden');
      return;
    }

    next();
  } catch (error) {
    logger.error('Admin authorization failed', { error });
    sendError(res, 500, 'INTERNAL_ERROR', 'Authorization check failed', 'Internal Server Error');
  }
};
