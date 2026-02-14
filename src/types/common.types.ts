export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ErrorDetails {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ErrorResponse {
  success: false;
  error: ErrorDetails;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface DashboardStats {
  totalTodos: number;
  completedTodos: number;
  pendingTodos: number;
  importantTodos: number;
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
}

export interface UserListResponse {
  users: Array<{
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    createdAt: string;
  }>;
  total: number;
  page: number;
  limit: number;
}
