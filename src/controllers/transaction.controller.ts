import { Response } from 'express';
import { AuthRequest } from '../common/auth-middleware';
import {
  getAllTransactions,
  getTransactionSummary,
  createTransaction,
  updateTransactionById,
  deleteTransactionById,
  getAnalyticsData,
} from '../business/transaction.business';
import { CreateTransactionInput, UpdateTransactionInput, TransactionType } from '../types/transaction.types';
import { logger } from '../common/logger';
import { sendSuccess, sendError } from '../common/response';

export const getTransactionsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'UNAUTHORIZED', 'Authentication required', 'Unauthorized');
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const type = req.query.type as TransactionType | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const result = await getAllTransactions(req.user.userId, page, limit, type, startDate, endDate);

    sendSuccess(res, 200, result);
  } catch (error) {
    logger.error('Get transactions controller error', { error });
    const errorMessage = error instanceof Error ? error.message : 'Failed to get transactions';
    sendError(res, 500, 'GET_TRANSACTIONS_FAILED', errorMessage, 'Internal Server Error');
  }
};

export const getTransactionSummaryController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'UNAUTHORIZED', 'Authentication required', 'Unauthorized');
      return;
    }

    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const result = await getTransactionSummary(req.user.userId, startDate, endDate);

    sendSuccess(res, 200, result);
  } catch (error) {
    logger.error('Get transaction summary controller error', { error });
    sendError(res, 500, 'GET_SUMMARY_FAILED', 'Failed to get transaction summary', 'Internal Server Error');
  }
};

export const createTransactionController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'UNAUTHORIZED', 'Authentication required', 'Unauthorized');
      return;
    }

    const input = req.body as unknown as CreateTransactionInput;

    if (!input.type || !input.amount || !input.category || !input.description || !input.date) {
      sendError(res, 400, 'INVALID_INPUT', 'All fields are required', 'Bad Request');
      return;
    }

    const transaction = await createTransaction(req.user.userId, input);

    sendSuccess(res, 201, transaction, 'Created');
  } catch (error) {
    logger.error('Create transaction controller error', { error });
    const errorMessage = error instanceof Error ? error.message : 'Failed to create transaction';
    sendError(res, 400, 'CREATE_TRANSACTION_FAILED', errorMessage, 'Bad Request');
  }
};

export const updateTransactionController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'UNAUTHORIZED', 'Authentication required', 'Unauthorized');
      return;
    }

    const transactionId = req.params.id;
    const input = req.body as unknown as UpdateTransactionInput;

    const transaction = await updateTransactionById(transactionId, req.user.userId, input);

    sendSuccess(res, 200, transaction);
  } catch (error) {
    logger.error('Update transaction controller error', { error });
    const errorMessage = error instanceof Error ? error.message : 'Failed to update transaction';
    const statusCode = errorMessage === 'Transaction not found' ? 404 : 400;
    const statusText = statusCode === 404 ? 'Not Found' : 'Bad Request';
    sendError(res, statusCode, 'UPDATE_TRANSACTION_FAILED', errorMessage, statusText);
  }
};

export const deleteTransactionController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'UNAUTHORIZED', 'Authentication required', 'Unauthorized');
      return;
    }

    const transactionId = req.params.id;

    await deleteTransactionById(transactionId, req.user.userId);

    sendSuccess(res, 200, { message: 'Transaction deleted successfully' });
  } catch (error) {
    logger.error('Delete transaction controller error', { error });
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete transaction';
    const statusCode = errorMessage === 'Transaction not found' ? 404 : 500;
    const statusText = statusCode === 404 ? 'Not Found' : 'Internal Server Error';
    sendError(res, statusCode, 'DELETE_TRANSACTION_FAILED', errorMessage, statusText);
  }
};

export const getAnalyticsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'UNAUTHORIZED', 'Authentication required', 'Unauthorized');
      return;
    }

    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const result = await getAnalyticsData(req.user.userId, startDate, endDate);

    sendSuccess(res, 200, result);
  } catch (error) {
    logger.error('Get analytics controller error', { error });
    sendError(res, 500, 'GET_ANALYTICS_FAILED', 'Failed to get analytics data', 'Internal Server Error');
  }
};
