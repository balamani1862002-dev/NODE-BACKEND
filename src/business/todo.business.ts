import {
  Todo,
  CreateTodoInput,
  UpdateTodoInput,
  TodoFilter,
  ReorderTodosInput,
  TodoListResponse,
} from '../types/todo.types';
import {
  findTodosByUserId,
  findTodoById,
  insertTodo,
  updateTodo,
  deleteTodo,
  reorderTodos,
} from '../db/todo.db';
import { logger } from '../common/logger';
import { isValidISODate } from '../common/validation';

export const getAllTodos = async (
  userId: string,
  filter: TodoFilter,
  page: number,
  limit: number
): Promise<TodoListResponse> => {
  try {
    logger.info('Getting all todos', { userId, filter, page, limit });

    const { todos, total } = await findTodosByUserId(userId, filter, page, limit);

    return { todos, total, page, limit };
  } catch (error) {
    logger.error('Failed to get all todos', { error, userId });
    throw error;
  }
};

export const createTodo = async (userId: string, input: CreateTodoInput): Promise<Todo> => {
  try {
    logger.info('Creating todo', { userId, title: input.title });

    if (!input.title || !input.description) {
      throw new Error('Title and description are required');
    }

    if (input.reminderDate && !isValidISODate(input.reminderDate)) {
      throw new Error('Invalid reminder date format');
    }

    const todo = await insertTodo(userId, input);

    logger.info('Todo created successfully', { todoId: todo.id });

    return todo;
  } catch (error) {
    logger.error('Failed to create todo', { error, userId });
    throw error;
  }
};

export const updateTodoById = async (
  todoId: string,
  userId: string,
  input: UpdateTodoInput
): Promise<Todo> => {
  try {
    logger.info('Updating todo', { todoId, userId });

    const existingTodo = await findTodoById(todoId, userId);
    if (!existingTodo) {
      throw new Error('Todo not found');
    }

    if (input.reminderDate && !isValidISODate(input.reminderDate)) {
      throw new Error('Invalid reminder date format');
    }

    const todo = await updateTodo(todoId, userId, input);

    logger.info('Todo updated successfully', { todoId });

    return todo;
  } catch (error) {
    logger.error('Failed to update todo', { error, todoId });
    throw error;
  }
};

export const deleteTodoById = async (todoId: string, userId: string): Promise<void> => {
  try {
    logger.info('Deleting todo', { todoId, userId });

    const existingTodo = await findTodoById(todoId, userId);
    if (!existingTodo) {
      throw new Error('Todo not found');
    }

    await deleteTodo(todoId, userId);

    logger.info('Todo deleted successfully', { todoId });
  } catch (error) {
    logger.error('Failed to delete todo', { error, todoId });
    throw error;
  }
};

export const reorderTodosList = async (userId: string, input: ReorderTodosInput): Promise<void> => {
  try {
    logger.info('Reordering todos', { userId, count: input.todos.length });

    if (!input.todos || input.todos.length === 0) {
      throw new Error('Todos array is required');
    }

    await reorderTodos(userId, input.todos);

    logger.info('Todos reordered successfully', { userId });
  } catch (error) {
    logger.error('Failed to reorder todos', { error, userId });
    throw error;
  }
};
