export type TodoStatus = 'pending' | 'completed';
export type TodoFilter = 'all' | 'completed' | 'important';

export interface Todo {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: TodoStatus;
  isImportant: boolean;
  hasReminder: boolean;
  reminderDate: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoInput {
  title: string;
  description: string;
  isImportant?: boolean;
  hasReminder?: boolean;
  reminderDate?: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  status?: TodoStatus;
  isImportant?: boolean;
  hasReminder?: boolean;
  reminderDate?: string;
  order?: number;
}

export interface ReorderTodoItem {
  id: string;
  order: number;
}

export interface ReorderTodosInput {
  todos: ReorderTodoItem[];
}

export interface TodoListResponse {
  todos: Todo[];
  total: number;
  page: number;
  limit: number;
}
