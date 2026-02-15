import { getSupabaseClient } from './supabase';
import { logger } from '../common/logger';

interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  important: number;
}

interface TransactionStats {
  totalIncome: number;
  totalExpense: number;
}

export const getTodoStats = async (userId: string): Promise<TodoStats> => {
  try {
    const client = getSupabaseClient();

    // Get total todos count
    const { count: totalTodos, error: todosError } = await client
      .from('todos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (todosError) {
      throw todosError;
    }

    // Get completed todos count
    const { count: completedTodos, error: completedError } = await client
      .from('todos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (completedError) {
      throw completedError;
    }

    // Get important todos count
    const { count: importantTodos, error: importantError } = await client
      .from('todos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_important', true);

    if (importantError) {
      throw importantError;
    }

    return {
      total: totalTodos || 0,
      completed: completedTodos || 0,
      pending: (totalTodos || 0) - (completedTodos || 0),
      important: importantTodos || 0,
    };
  } catch (error) {
    logger.error('Failed to get todo stats', { error, userId });
    throw error;
  }
};

export const getTransactionStats = async (userId: string): Promise<TransactionStats> => {
  try {
    const client = getSupabaseClient();

    // Get transactions for financial summary
    const { data: transactions, error: transactionsError } = await client
      .from('transactions')
      .select('type, amount')
      .eq('user_id', userId);

    if (transactionsError) {
      throw transactionsError;
    }

    let totalIncome = 0;
    let totalExpense = 0;

    (transactions || []).forEach((txn) => {
      if (txn.type === 'income') {
        totalIncome += parseFloat(txn.amount);
      } else if (txn.type === 'expense') {
        totalExpense += parseFloat(txn.amount);
      }
    });

    return {
      totalIncome,
      totalExpense,
    };
  } catch (error) {
    logger.error('Failed to get transaction stats', { error, userId });
    throw error;
  }
};
