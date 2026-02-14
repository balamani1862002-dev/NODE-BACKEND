import { DashboardStats } from '../types/common.types';
import { getTodoStats, getTransactionStats } from '../db/dashboard.db';
import { logger } from '../common/logger';
import { formatAmount } from '../common/validation';

export const getDashboardStats = async (userId: string): Promise<DashboardStats> => {
  try {
    logger.info('Getting dashboard stats', { userId });

    const [todoStats, transactionStats] = await Promise.all([
      getTodoStats(userId),
      getTransactionStats(userId),
    ]);

    const currentBalance = transactionStats.totalIncome - transactionStats.totalExpense;

    return {
      totalIncome: formatAmount(transactionStats.totalIncome),
      totalExpense: formatAmount(transactionStats.totalExpense),
      currentBalance: formatAmount(currentBalance),
      totalTodos: todoStats.total,
      completedTodos: todoStats.completed,
      pendingTodos: todoStats.pending,
    };
  } catch (error) {
    logger.error('Failed to get dashboard stats', { error, userId });
    throw error;
  }
};
