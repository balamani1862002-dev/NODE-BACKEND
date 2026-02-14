export type TransactionType = 'income' | 'expense';
export type TransactionView = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface CreateTransactionInput {
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface UpdateTransactionInput {
  type?: TransactionType;
  amount?: number;
  category?: string;
  description?: string;
  date?: string;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
}

export interface YearlyComparison {
  year: number;
  income: number;
  expense: number;
  balance: number;
  growth: number;
}

export interface AnalyticsData {
  categoryBreakdown: CategoryBreakdown[];
  monthlyTrends: MonthlyTrend[];
  yearlyComparison: YearlyComparison[];
}
