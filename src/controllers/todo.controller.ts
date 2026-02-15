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
import { sendSuccess, sendError } from '../common/response';

export const getTodosController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'UNAUTHORIZED', 'Authentication required', 'Unauthorized');
      return;
    }

    const filter = (req.query.filter as TodoFilter) || 'all';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await getAllTodos(req.user.userId, filter, page, limit);

    sendSuccess(res, 200, result);
  } catch (error) {
    logger.error('Get todos controller error', { error });
    sendError(res, 500, 'GET_TODOS_FAILED', 'Failed to get todos', 'Internal Server Error');
  }
};

export const createTodoController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'UNAUTHORIZED', 'Authentication required', 'Unauthorized');
      return;
    }

    const input = req.body as unknown as CreateTodoInput;

    if (!input.title || !input.description) {
      sendError(res, 400, 'INVALID_INPUT', 'Title and description are required', 'Bad Request');
      return;
    }

    const todo = await createTodo(req.user.userId, input);

    sendSuccess(res, 201, todo, 'Created');
  } catch (error) {
    logger.error('Create todo controller error', { error });
    const errorMessage = error instanceof Error ? error.message : 'Failed to create todo';
    sendError(res, 400, 'CREATE_TODO_FAILED', errorMessage, 'Bad Request');
  }
};

export const updateTodoController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'UNAUTHORIZED', 'Authentication required', 'Unauthorized');
      return;
    }

    const todoId = req.params.id;
    const input = req.body as unknown as UpdateTodoInput;

    const todo = await updateTodoById(todoId, req.user.userId, input);

    sendSuccess(res, 200, todo);
  } catch (error) {
    logger.error('Update todo controller error', { error });
    const errorMessage = error instanceof Error ? error.message : 'Failed to update todo';
    const statusCode = errorMessage === 'Todo not found' ? 404 : 400;
    const statusText = statusCode === 404 ? 'Not Found' : 'Bad Request';
    sendError(res, statusCode, 'UPDATE_TODO_FAILED', errorMessage, statusText);
  }
};

export const deleteTodoController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'UNAUTHORIZED', 'Authentication required', 'Unauthorized');
      return;
    }

    const todoId = req.params.id;

    await deleteTodoById(todoId, req.user.userId);

    sendSuccess(res, 200, { message: 'Todo deleted successfully' });
  } catch (error) {
    logger.error('Delete todo controller error', { error });
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete todo';
    const statusCode = errorMessage === 'Todo not found' ? 404 : 500;
    const statusText = statusCode === 404 ? 'Not Found' : 'Internal Server Error';
    sendError(res, statusCode, 'DELETE_TODO_FAILED', errorMessage, statusText);
  }
};

export const reorderTodosController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'UNAUTHORIZED', 'Authentication required', 'Unauthorized');
      return;
    }

    const input = req.body as unknown as ReorderTodosInput;

    if (!input.todos || input.todos.length === 0) {
      sendError(res, 400, 'INVALID_INPUT', 'Todos array is required', 'Bad Request');
      return;
    }

    await reorderTodosList(req.user.userId, input);

    sendSuccess(res, 200, { message: 'Todos reordered successfully' });
  } catch (error) {
    logger.error('Reorder todos controller error', { error });
    sendError(res, 400, 'REORDER_TODOS_FAILED', 'Failed to reorder todos', 'Bad Request');
  }
};
