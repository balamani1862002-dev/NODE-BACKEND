import { getSupabaseClient } from './supabase';
import { DashboardStats } from '../types/common.types';
import { logger } from '../common/logger';

export const getDashboardStats = async (userId: string): Promise<DashboardStats> => {
  try {
    const client = getSupabaseClient();

    // Get todos count
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
      totalTodos: totalTodos || 0,
      completedTodos: completedTodos || 0,
      pendingTodos: (totalTodos || 0) - (completedTodos || 0),
      importantTodos: importantTodos || 0,
      totalIncome,
      totalExpense,
      currentBalance: totalIncome - totalExpense,
    };
  } catch (error) {
    logger.error('Failed to get dashboard stats', { error, userId });
    throw error;
  }
};
