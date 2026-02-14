import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../common/logger';

let supabaseClient: SupabaseClient | null = null;

export const initializeSupabase = (): SupabaseClient => {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      const error = new Error('SUPABASE_URL environment variable is not set');
      logger.error('Failed to initialize Supabase client', { 
        error: error.message,
        reason: 'Missing SUPABASE_URL'
      });
      throw error;
    }

    if (!supabaseKey) {
      const error = new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
      logger.error('Failed to initialize Supabase client', { 
        error: error.message,
        reason: 'Missing SUPABASE_SERVICE_ROLE_KEY'
      });
      throw error;
    }

    // Validate URL format
    if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
      const error = new Error(`Invalid SUPABASE_URL format: ${supabaseUrl}. Must start with http:// or https://`);
      logger.error('Failed to initialize Supabase client', { 
        error: error.message,
        url: supabaseUrl,
        reason: 'Invalid URL format'
      });
      throw error;
    }

    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    logger.info('Supabase client initialized successfully', { url: supabaseUrl });
    
    return supabaseClient;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    logger.error('Failed to initialize Supabase client', { 
      error: errorMessage,
      stack: errorStack
    });
    throw error;
  }
};

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseClient) {
    return initializeSupabase();
  }
  return supabaseClient;
};

interface QueryResult<T> {
  data: T[] | null;
  error: Error | null;
}

export const executeQuery = async <T>(query: string): Promise<T[]> => {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.rpc('exec_sql', { sql: query }) as QueryResult<T>;

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    logger.error('Query execution failed', { error, query });
    throw error;
  }
};

export const executeQuerySingle = async <T>(query: string): Promise<T | null> => {
  try {
    const results = await executeQuery<T>(query);
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    logger.error('Single query execution failed', { error, query });
    throw error;
  }
};

