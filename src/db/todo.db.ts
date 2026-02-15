import { getSupabaseClient } from './supabase';
import { Todo, CreateTodoInput, UpdateTodoInput, TodoFilter, ReorderTodoItem } from '../types/todo.types';
import { logger } from '../common/logger';

export const findTodosByUserId = async (
  userId: string,
  filter: TodoFilter,
  page: number,
  limit: number
): Promise<{ todos: Todo[]; total: number }> => {
  try {
    const client = getSupabaseClient();
    const offset = (page - 1) * limit;

    let countQuery = client.from('todos').select('*', { count: 'exact', head: true }).eq('user_id', userId);
    let dataQuery = client.from('todos').select('*').eq('user_id', userId);

    if (filter === 'completed') {
      countQuery = countQuery.eq('status', 'completed');
      dataQuery = dataQuery.eq('status', 'completed');
    } else if (filter === 'important') {
      countQuery = countQuery.eq('is_important', true);
      dataQuery = dataQuery.eq('is_important', true);
    }

    const { count, error: countError } = await countQuery;
    if (countError) {
      throw countError;
    }

    const { data, error: dataError } = await dataQuery
      .order('order', { ascending: true })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (dataError) {
      throw dataError;
    }

    const todos = (data || []).map((todo) => ({
      id: todo.id,
      userId: todo.user_id,
      title: todo.title,
      description: todo.description,
      status: todo.status,
      isImportant: todo.is_important,
      hasReminder: todo.has_reminder,
      reminderDate: todo.reminder_date,
      order: todo.order,
      createdAt: todo.created_at,
      updatedAt: todo.updated_at,
    })) as Todo[];

    return {
      todos,
      total: count || 0,
    };
  } catch (error) {
    logger.error('Failed to find todos by user ID', { error, userId });
    throw error;
  }
};

export const findTodoById = async (todoId: string, userId: string): Promise<Todo | null> => {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('todos')
      .select('*')
      .eq('id', todoId)
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
      title: data.title,
      description: data.description,
      status: data.status,
      isImportant: data.is_important,
      hasReminder: data.has_reminder,
      reminderDate: data.reminder_date,
      order: data.order,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    } as Todo;
  } catch (error) {
    logger.error('Failed to find todo by ID', { error, todoId, userId });
    throw error;
  }
};

export const insertTodo = async (userId: string, input: CreateTodoInput): Promise<Todo> => {
  try {
    const client = getSupabaseClient();

    // Get max order
    const { data: maxOrderData } = await client
      .from('todos')
      .select('order')
      .eq('user_id', userId)
      .order('order', { ascending: false })
      .limit(1)
      .single();

    const order = maxOrderData ? maxOrderData.order + 1 : 0;

    const { data, error } = await client
      .from('todos')
      .insert({
        user_id: userId,
        title: input.title,
        description: input.description,
        status: 'pending',
        is_important: input.isImportant || false,
        has_reminder: input.hasReminder || false,
        reminder_date: input.reminderDate || null,
        order,
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      status: data.status,
      isImportant: data.isImportant,
      hasReminder: data.has_reminder,
      reminderDate: data.reminder_date,
      order: data.order,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    } as Todo;
  } catch (error) {
    logger.error('Failed to insert todo', { error, userId });
    throw error;
  }
};

export const updateTodo = async (todoId: string, userId: string, input: UpdateTodoInput): Promise<Todo> => {
  try {
    const client = getSupabaseClient();
    const updates: Record<string, string | boolean | null> = {};

    if (input.title) updates.title = input.title;
    if (input.description) updates.description = input.description;
    if (input.status) updates.status = input.status;
    if (input.isImportant !== undefined) updates.is_important = input.isImportant;
    if (input.hasReminder !== undefined) updates.has_reminder = input.hasReminder;
    if (input.reminderDate !== undefined) updates.reminder_date = input.reminderDate;

    if (Object.keys(updates).length === 0) {
      throw new Error('No fields to update');
    }

    const { data, error } = await client
      .from('todos')
      .update(updates)
      .eq('id', todoId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('Todo not found');
    }

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      status: data.status,
      isImportant: data.is_important,
      hasReminder: data.has_reminder,
      reminderDate: data.reminder_date,
      order: data.order,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    } as Todo;
  } catch (error) {
    logger.error('Failed to update todo', { error, todoId, userId });
    throw error;
  }
};

export const deleteTodo = async (todoId: string, userId: string): Promise<void> => {
  try {
    const client = getSupabaseClient();
    const { error } = await client
      .from('todos')
      .delete()
      .eq('id', todoId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }
  } catch (error) {
    logger.error('Failed to delete todo', { error, todoId, userId });
    throw error;
  }
};

export const reorderTodos = async (userId: string, items: ReorderTodoItem[]): Promise<void> => {
  try {
    const client = getSupabaseClient();

    // Update each todo's order
    for (const item of items) {
      const { error } = await client
        .from('todos')
        .update({ order: item.order })
        .eq('id', item.id)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }
    }
  } catch (error) {
    logger.error('Failed to reorder todos', { error, userId });
    throw error;
  }
};
