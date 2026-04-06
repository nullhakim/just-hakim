import { useState, useCallback, useMemo } from "react";
import type { Transaction, TransactionFormData, TransactionSummary } from "@/types/transaction";

// Local-only state for MVP; swap to Supabase queries later
export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const addTransaction = useCallback((data: TransactionFormData) => {
    const newTx: Transaction = {
      id: crypto.randomUUID(),
      user_id: "local",
      amount: data.amount,
      description: data.description,
      type: data.type,
      category: data.category,
      transaction_date: data.transaction_date,
      created_at: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const summary: TransactionSummary = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
  }, [transactions]);

  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const monthlyTrend = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    transactions.forEach((t) => {
      const month = t.transaction_date.slice(0, 7); // YYYY-MM
      if (!map[month]) map[month] = { income: 0, expense: 0 };
      map[month][t.type] += t.amount;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, ...data }));
  }, [transactions]);

  return {
    transactions,
    addTransaction,
    deleteTransaction,
    summary,
    expenseByCategory,
    monthlyTrend,
  };
}
