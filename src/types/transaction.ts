export type TransactionType = "income" | "expense";

export const INCOME_CATEGORIES = ["Salary", "Freelance", "Investment", "Others"] as const;
export const EXPENSE_CATEGORIES = ["Food", "Transport", "Rent", "Entertainment", "Bills", "Others"] as const;

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type Category = IncomeCategory | ExpenseCategory;

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  type: TransactionType;
  category: string;
  transaction_date: string;
  created_at: string;
}

export interface TransactionFormData {
  amount: number;
  description: string;
  type: TransactionType;
  category: string;
  transaction_date: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}
