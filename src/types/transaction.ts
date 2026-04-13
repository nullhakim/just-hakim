export type TransactionType = "income" | "expense";

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investment",
  "Savings",
  "Others",
] as const;

export const EXPENSE_CATEGORIES = [
  "Food & Drinks",
  "Household",
  "Transport",
  "Internet & Digital",
  "Bills & Obligations",
  "Social & Donation",
  "Personal & Fashion",
  "Entertainment & Lifestyle",
  "Online Shopping",
  "Special Consumption",
  "Investment",
  "Savings",
  "Others",
] as const;

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
  tag: string | null;
  transaction_date: string;
  created_at: string;
}

export interface TransactionFormData {
  amount: number;
  description: string;
  type: TransactionType;
  category: string;
  tag: string | null;
  transaction_date: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}
