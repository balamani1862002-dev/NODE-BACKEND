import { getSupabaseClient } from './supabase';
import { Transaction, CreateTransactionInput, UpdateTransactionInput, TransactionType } from '../types/transaction.types';
import { logger } from '../common/logger';

export const findTransactionsByUserId = async (
  userId: string,
  page: number,
  limit: number,
  type?: TransactionType,
  startDate?: string,
  endDate?: string
): Promise<{ transactions: Transaction[]; total: number }> => {
  try {
    const client = getSupabaseClient();
    const offset = (page - 1) * limit;

    let countQuery = client.from('transactions').select('*', { count: 'exact', head: true }).eq('user_id', userId);
    let dataQuery = client.from('transactions').select('*').eq('user_id', userId);

    if (type) {
      countQuery = countQuery.eq('type', type);
      dataQuery = dataQuery.eq('type', type);
    }
    if (startDate) {
      countQuery = countQuery.gte('date', startDate);
      dataQuery = dataQuery.gte('date', startDate);
    }
    if (endDate) {
      countQuery = countQuery.lte('date', endDate);
      dataQuery = dataQuery.lte('date', endDate);
    }

    const { count, error: countError } = await countQuery;
    if (countError) {
      throw countError;
    }

    const { data, error: dataError } = await dataQuery
      .order('transaction_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (dataError) {
      throw dataError;
    }

    const transactions = (data || []).map((txn) => ({
      id: txn.id,
      userId: txn.user_id,
      type: txn.type,
      amount: txn.amount,
      category: txn.category,
      description: txn.description,
      date: txn.transaction_date,
      createdAt: txn.created_at,
    })) as Transaction[];

    return {
      transactions,
      total: count || 0,
    };
  } catch (error) {
    logger.error('Failed to find transactions by user ID', { error, userId });
    throw error;
  }
};

export const findTransactionById = async (transactionId: string, userId: string): Promise<Transaction | null> => {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      amount: data.amount,
      category: data.category,
      description: data.description,
      date: data.date,
      createdAt: data.created_at,
    } as Transaction;
  } catch (error) {
    logger.error('Failed to find transaction by ID', { error, transactionId, userId });
    throw error;
  }
};

export const insertTransaction = async (userId: string, input: CreateTransactionInput): Promise<Transaction> => {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('transactions')
      .insert({
        user_id: userId,
        type: input.type,
        amount: input.amount,
        category: input.category,
        description: input.description,
        transaction_date: input.date,
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      amount: data.amount,
      category: data.category,
      description: data.description,
      date: data.date,
      createdAt: data.created_at,
    } as Transaction;
  } catch (error) {
    logger.error('Failed to insert transaction', { error, userId });
    throw error;
  }
};

export const updateTransaction = async (
  transactionId: string,
  userId: string,
  input: UpdateTransactionInput
): Promise<Transaction> => {
  try {
    const client = getSupabaseClient();
    const updates: Record<string, string | number> = {};

    if (input.type) updates.type = input.type;
    if (input.amount) updates.amount = input.amount;
    if (input.category) updates.category = input.category;
    if (input.description) updates.description = input.description;
    if (input.date) updates.date = input.date;

    if (Object.keys(updates).length === 0) {
      throw new Error('No fields to update');
    }

    const { data, error } = await client
      .from('transactions')
      .update(updates)
      .eq('id', transactionId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('Transaction not found');
    }

    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      amount: data.amount,
      category: data.category,
      description: data.description,
      date: data.date,
      createdAt: data.created_at,
    } as Transaction;
  } catch (error) {
    logger.error('Failed to update transaction', { error, transactionId, userId });
    throw error;
  }
};

export const deleteTransaction = async (transactionId: string, userId: string): Promise<void> => {
  try {
    const client = getSupabaseClient();
    const { error } = await client
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }
  } catch (error) {
    logger.error('Failed to delete transaction', { error, transactionId, userId });
    throw error;
  }
};

export const getTransactionSummary = async (
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<{ totalIncome: number; totalExpense: number; currentBalance: number }> => {
  try {
    const client = getSupabaseClient();
    let query = client.from('transactions').select('type, amount').eq('user_id', userId);

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    let totalIncome = 0;
    let totalExpense = 0;

    (data || []).forEach((txn) => {
      if (txn.type === 'income') {
        totalIncome += parseFloat(txn.amount);
      } else if (txn.type === 'expense') {
        totalExpense += parseFloat(txn.amount);
      }
    });

    return {
      totalIncome,
      totalExpense,
      currentBalance: totalIncome - totalExpense,
    };
  } catch (error) {
    logger.error('Failed to get transaction summary', { error, userId });
    throw error;
  }
};
