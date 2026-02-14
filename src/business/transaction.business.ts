import {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionListResponse,
  TransactionSummary,
  TransactionType,
  AnalyticsData,
  CategoryBreakdown,
  MonthlyTrend,
  YearlyComparison,
} from '../types/transaction.types';
import {
  findTransactionsByUserId,
  findTransactionById,
  insertTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary as getTransactionSummaryFromDb,
} from '../db/transaction.db';
import { logger } from '../common/logger';
import { isPositiveNumber, isValidISODate, formatAmount } from '../common/validation';

export const getAllTransactions = async (
  userId: string,
  page: number,
  limit: number,
  type?: TransactionType,
  startDate?: string,
  endDate?: string
): Promise<TransactionListResponse> => {
  try {
    logger.info('Getting all transactions', { userId, page, limit, type });

    if (startDate && !isValidISODate(startDate)) {
      throw new Error('Invalid start date format');
    }

    if (endDate && !isValidISODate(endDate)) {
      throw new Error('Invalid end date format');
    }

    const { transactions, total } = await findTransactionsByUserId(
      userId,
      page,
      limit,
      type,
      startDate,
      endDate
    );

    return { transactions, total, page, limit };
  } catch (error) {
    logger.error('Failed to get all transactions', { error, userId });
    throw error;
  }
};

export const getTransactionSummary = async (
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<TransactionSummary> => {
  try {
    logger.info('Getting transaction summary', { userId });

    if (startDate && !isValidISODate(startDate)) {
      throw new Error('Invalid start date format');
    }

    if (endDate && !isValidISODate(endDate)) {
      throw new Error('Invalid end date format');
    }

    const { totalIncome, totalExpense } = await getTransactionSummaryFromDb(userId, startDate, endDate);
    const currentBalance = totalIncome - totalExpense;

    return {
      totalIncome: formatAmount(totalIncome),
      totalExpense: formatAmount(totalExpense),
      currentBalance: formatAmount(currentBalance),
    };
  } catch (error) {
    logger.error('Failed to get transaction summary', { error, userId });
    throw error;
  }
};

export const createTransaction = async (userId: string, input: CreateTransactionInput): Promise<Transaction> => {
  try {
    logger.info('Creating transaction', { userId, type: input.type });

    if (!input.type || !input.amount || !input.category || !input.description || !input.date) {
      throw new Error('All fields are required');
    }

    if (!isPositiveNumber(input.amount)) {
      throw new Error('Amount must be a positive number');
    }

    if (!isValidISODate(input.date)) {
      throw new Error('Invalid date format');
    }

    const formattedInput = {
      ...input,
      amount: formatAmount(input.amount),
    };

    const transaction = await insertTransaction(userId, formattedInput);

    logger.info('Transaction created successfully', { transactionId: transaction.id });

    return transaction;
  } catch (error) {
    logger.error('Failed to create transaction', { error, userId });
    throw error;
  }
};

export const updateTransactionById = async (
  transactionId: string,
  userId: string,
  input: UpdateTransactionInput
): Promise<Transaction> => {
  try {
    logger.info('Updating transaction', { transactionId, userId });

    const existingTransaction = await findTransactionById(transactionId, userId);
    if (!existingTransaction) {
      throw new Error('Transaction not found');
    }

    if (input.amount !== undefined && !isPositiveNumber(input.amount)) {
      throw new Error('Amount must be a positive number');
    }

    if (input.date && !isValidISODate(input.date)) {
      throw new Error('Invalid date format');
    }

    const formattedInput = {
      ...input,
      ...(input.amount !== undefined && { amount: formatAmount(input.amount) }),
    };

    const transaction = await updateTransaction(transactionId, userId, formattedInput);

    logger.info('Transaction updated successfully', { transactionId });

    return transaction;
  } catch (error) {
    logger.error('Failed to update transaction', { error, transactionId });
    throw error;
  }
};

export const deleteTransactionById = async (transactionId: string, userId: string): Promise<void> => {
  try {
    logger.info('Deleting transaction', { transactionId, userId });

    const existingTransaction = await findTransactionById(transactionId, userId);
    if (!existingTransaction) {
      throw new Error('Transaction not found');
    }

    await deleteTransaction(transactionId, userId);

    logger.info('Transaction deleted successfully', { transactionId });
  } catch (error) {
    logger.error('Failed to delete transaction', { error, transactionId });
    throw error;
  }
};

export const getAnalyticsData = async (
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<AnalyticsData> => {
  try {
    logger.info('Getting analytics data', { userId });

    const { transactions } = await findTransactionsByUserId(userId, 1, 10000, undefined, startDate, endDate);

    // Category breakdown
    const categoryMap = new Map<string, number>();
    let totalAmount = 0;

    transactions.forEach((transaction) => {
      const current = categoryMap.get(transaction.category) || 0;
      categoryMap.set(transaction.category, current + transaction.amount);
      totalAmount += transaction.amount;
    });

    const categoryBreakdown: CategoryBreakdown[] = Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount: formatAmount(amount),
      percentage: formatAmount((amount / totalAmount) * 100),
    }));

    // Monthly trends
    const monthlyMap = new Map<string, { income: number; expense: number }>();

    transactions.forEach((transaction) => {
      const month = transaction.date.substring(0, 7);
      const current = monthlyMap.get(month) || { income: 0, expense: 0 };

      if (transaction.type === 'income') {
        current.income += transaction.amount;
      } else {
        current.expense += transaction.amount;
      }

      monthlyMap.set(month, current);
    });

    const monthlyTrends: MonthlyTrend[] = Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      income: formatAmount(data.income),
      expense: formatAmount(data.expense),
    }));

    // Yearly comparison
    const yearlyMap = new Map<number, { income: number; expense: number }>();

    transactions.forEach((transaction) => {
      const year = parseInt(transaction.date.substring(0, 4));
      const current = yearlyMap.get(year) || { income: 0, expense: 0 };

      if (transaction.type === 'income') {
        current.income += transaction.amount;
      } else {
        current.expense += transaction.amount;
      }

      yearlyMap.set(year, current);
    });

    const yearlyComparison: YearlyComparison[] = Array.from(yearlyMap.entries())
      .map(([year, data]) => {
        const balance = data.income - data.expense;
        return {
          year,
          income: formatAmount(data.income),
          expense: formatAmount(data.expense),
          balance: formatAmount(balance),
          growth: 0,
        };
      })
      .sort((a, b) => a.year - b.year);

    // Calculate growth
    for (let i = 1; i < yearlyComparison.length; i++) {
      const prevBalance = yearlyComparison[i - 1].balance;
      const currentBalance = yearlyComparison[i].balance;
      if (prevBalance !== 0) {
        yearlyComparison[i].growth = formatAmount(((currentBalance - prevBalance) / prevBalance) * 100);
      }
    }

    return {
      categoryBreakdown,
      monthlyTrends,
      yearlyComparison,
    };
  } catch (error) {
    logger.error('Failed to get analytics data', { error, userId });
    throw error;
  }
};
