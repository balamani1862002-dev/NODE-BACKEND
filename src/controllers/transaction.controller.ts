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

export const getTransactionsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const type = req.query.type as TransactionType | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const result = await getAllTransactions(req.user.userId, page, limit, type, startDate, endDate);

    res.status(200).json(result);
  } catch (error) {
    logger.error('Get transactions controller error', { error });
    const errorMessage = error instanceof Error ? error.message : 'Failed to get transactions';
    res.status(500).json({
      success: false,
      error: { code: 'GET_TRANSACTIONS_FAILED', message: errorMessage },
    });
  }
};

export const getTransactionSummaryController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const result = await getTransactionSummary(req.user.userId, startDate, endDate);

    res.status(200).json(result);
  } catch (error) {
    logger.error('Get transaction summary controller error', { error });
    res.status(500).json({
      success: false,
      error: { code: 'GET_SUMMARY_FAILED', message: 'Failed to get transaction summary' },
    });
  }
};

export const createTransactionController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const input = req.body as unknown as CreateTransactionInput;

    if (!input.type || !input.amount || !input.category || !input.description || !input.date) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'All fields are required' },
      });
      return;
    }

    const transaction = await createTransaction(req.user.userId, input);

    res.status(201).json(transaction);
  } catch (error) {
    logger.error('Create transaction controller error', { error });
    const errorMessage = error instanceof Error ? error.message : 'Failed to create transaction';
    res.status(400).json({
      success: false,
      error: { code: 'CREATE_TRANSACTION_FAILED', message: errorMessage },
    });
  }
};

export const updateTransactionController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const transactionId = req.params.id;
    const input = req.body as unknown as UpdateTransactionInput;

    const transaction = await updateTransactionById(transactionId, req.user.userId, input);

    res.status(200).json(transaction);
  } catch (error) {
    logger.error('Update transaction controller error', { error });
    const errorMessage = error instanceof Error ? error.message : 'Failed to update transaction';
    const statusCode = errorMessage === 'Transaction not found' ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      error: { code: 'UPDATE_TRANSACTION_FAILED', message: errorMessage },
    });
  }
};

export const deleteTransactionController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const transactionId = req.params.id;

    await deleteTransactionById(transactionId, req.user.userId);

    res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    logger.error('Delete transaction controller error', { error });
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete transaction';
    const statusCode = errorMessage === 'Transaction not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: { code: 'DELETE_TRANSACTION_FAILED', message: errorMessage },
    });
  }
};

export const getAnalyticsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const result = await getAnalyticsData(req.user.userId, startDate, endDate);

    res.status(200).json(result);
  } catch (error) {
    logger.error('Get analytics controller error', { error });
    res.status(500).json({
      success: false,
      error: { code: 'GET_ANALYTICS_FAILED', message: 'Failed to get analytics data' },
    });
  }
};
