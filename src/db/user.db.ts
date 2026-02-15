import { getSupabaseClient } from './supabase';
import { User, UserWithPassword, SignupInput, UpdateProfileInput, UserRole } from '../types/user.types';
import { logger } from '../common/logger';

export const findUserByEmail = async (email: string): Promise<UserWithPassword | null> => {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data as UserWithPassword;
  } catch (error) {
    logger.error('Failed to find user by email', { error, email });
    throw error;
  }
};

export const findUserById = async (userId: string): Promise<User | null> => {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('users')
      .select('id, name, email, phone, address, profile_image, role, created_at')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      profileImage: data.profile_image,
      role: data.role,
      createdAt: data.created_at,
    } as User;
  } catch (error) {
    logger.error('Failed to find user by ID', { error, userId });
    throw error;
  }
};

export const insertUser = async (input: SignupInput & { hashedPassword: string }): Promise<User> => {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('users')
      .insert({
        name: input.name,
        email: input.email,
        password_hash: input.hashedPassword,
        phone: input.phone || null,
        role: 'user',
      })
      .select('id, name, email, phone, address, profile_image, role, created_at')
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      profileImage: data.profile_image,
      role: data.role,
      createdAt: data.created_at,
    } as User;
  } catch (error) {
    logger.error('Failed to insert user', { error, email: input.email });
    throw error;
  }
};

export const updateUser = async (userId: string, input: UpdateProfileInput): Promise<User> => {
  try {
    const client = getSupabaseClient();
    const updates: Record<string, string | null> = {};

    if (input.name) updates.name = input.name;
    if (input.email) updates.email = input.email;
    if (input.phone !== undefined) updates.phone = input.phone;
    if (input.address !== undefined) updates.address = input.address;
    if (input.profile_image  !== undefined) updates.profile_image = input.profile_image;

    if (Object.keys(updates).length === 0) {
      throw new Error('No fields to update');
    }

    const { data, error } = await client
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select('id, name, email, phone, address, profile_image, role, created_at')
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('User not found');
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      profileImage: data.profile_image,
      role: data.role,
      createdAt: data.created_at,
    } as User;
  } catch (error) {
    logger.error('Failed to update user', { error, userId });
    throw error;
  }
};

export const updateUserPassword = async (userId: string, hashedPassword: string): Promise<void> => {
  try {
    const client = getSupabaseClient();
    const { error } = await client
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('id', userId);

    if (error) {
      throw error;
    }
  } catch (error) {
    logger.error('Failed to update user password', { error, userId });
    throw error;
  }
};

export const getAllUsers = async (page: number, limit: number, role?: UserRole): Promise<{ users: User[]; total: number }> => {
  try {
    const client = getSupabaseClient();
    const offset = (page - 1) * limit;

    let countQuery = client.from('users').select('*', { count: 'exact', head: true });
    let dataQuery = client.from('users').select('id, name, email, phone, role, created_at');

    if (role) {
      countQuery = countQuery.eq('role', role);
      dataQuery = dataQuery.eq('role', role);
    }

    const { count, error: countError } = await countQuery;
    if (countError) {
      throw countError;
    }

    const { data, error: dataError } = await dataQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (dataError) {
      throw dataError;
    }

    const users = (data || []).map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.created_at,
    })) as User[];

    return {
      users,
      total: count || 0,
    };
  } catch (error) {
    logger.error('Failed to get all users', { error });
    throw error;
  }
};

export const deleteUserById = async (userId: string): Promise<void> => {
  try {
    const client = getSupabaseClient();
    const { error } = await client
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      throw error;
    }
  } catch (error) {
    logger.error('Failed to delete user', { error, userId });
    throw error;
  }
};

export const getUserBalance = async (userId: string): Promise<number> => {
  try {
    const client = getSupabaseClient();
    
    const { data, error } = await client
      .from('transactions')
      .select('type, amount')
      .eq('user_id', userId);

    if (error) {
      logger.error('Supabase error getting user balance', { error: error.message, code: error.code, userId });
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return 0;
    }

    const balance = data.reduce((acc, transaction) => {
      if (transaction.type === 'income') {
        return acc + transaction.amount;
      } else {
        return acc - transaction.amount;
      }
    }, 0);

    return balance;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to get user balance', { error: errorMessage, userId });
    throw error;
  }
};

export const getUserRemainingTodos = async (userId: string): Promise<number> => {
  try {
    const client = getSupabaseClient();
    
    const { count, error } = await client
      .from('todos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'pending');

    if (error) {
      logger.error('Supabase error getting user remaining todos', { error: error.message, code: error.code, userId });
      throw new Error(`Failed to fetch todos: ${error.message}`);
    }

    return count || 0;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to get user remaining todos', { error: errorMessage, userId });
    throw error;
  }
};
