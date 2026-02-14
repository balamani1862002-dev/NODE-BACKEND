import { Response } from 'express';
import { AuthRequest } from '../common/auth-middleware';
import {
  getAllTodos,
  createTodo,
  updateTodoById,
  deleteTodoById,
  reorderTodosList,
} from '../business/todo.business';
import { CreateTodoInput, UpdateTodoInput, ReorderTodosInput, TodoFilter } from '../types/todo.types';
import { logger } from '../common/logger';

export const getTodosController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const filter = (req.query.filter as TodoFilter) || 'all';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await getAllTodos(req.user.userId, filter, page, limit);

    res.status(200).json(result);
  } catch (error) {
    logger.error('Get todos controller error', { error });
    res.status(500).json({
      success: false,
      error: { code: 'GET_TODOS_FAILED', message: 'Failed to get todos' },
    });
  }
};

export const createTodoController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const input = req.body as unknown as CreateTodoInput;

    if (!input.title || !input.description) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Title and description are required' },
      });
      return;
    }

    const todo = await createTodo(req.user.userId, input);

    res.status(201).json(todo);
  } catch (error) {
    logger.error('Create todo controller error', { error });
    const errorMessage = error instanceof Error ? error.message : 'Failed to create todo';
    res.status(400).json({
      success: false,
      error: { code: 'CREATE_TODO_FAILED', message: errorMessage },
    });
  }
};

export const updateTodoController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const todoId = req.params.id;
    const input = req.body as unknown as UpdateTodoInput;

    const todo = await updateTodoById(todoId, req.user.userId, input);

    res.status(200).json(todo);
  } catch (error) {
    logger.error('Update todo controller error', { error });
    const errorMessage = error instanceof Error ? error.message : 'Failed to update todo';
    const statusCode = errorMessage === 'Todo not found' ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      error: { code: 'UPDATE_TODO_FAILED', message: errorMessage },
    });
  }
};

export const deleteTodoController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const todoId = req.params.id;

    await deleteTodoById(todoId, req.user.userId);

    res.status(200).json({ message: 'Todo deleted successfully' });
  } catch (error) {
    logger.error('Delete todo controller error', { error });
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete todo';
    const statusCode = errorMessage === 'Todo not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: { code: 'DELETE_TODO_FAILED', message: errorMessage },
    });
  }
};

export const reorderTodosController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const input = req.body as unknown as ReorderTodosInput;

    if (!input.todos || input.todos.length === 0) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Todos array is required' },
      });
      return;
    }

    await reorderTodosList(req.user.userId, input);

    res.status(200).json({ message: 'Todos reordered successfully' });
  } catch (error) {
    logger.error('Reorder todos controller error', { error });
    res.status(400).json({
      success: false,
      error: { code: 'REORDER_TODOS_FAILED', message: 'Failed to reorder todos' },
    });
  }
};
