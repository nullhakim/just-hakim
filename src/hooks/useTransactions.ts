import { useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Transaction, TransactionFormData, TransactionSummary } from "@/types/transaction";

export function useTransactions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id, display_name");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const profileMap = useMemo(() => {
    const map: Record<string, string> = {};
    profiles.forEach((p) => { map[p.id] = p.display_name || "Unknown"; });
    return map;
  }, [profiles]);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: async (formData: TransactionFormData) => {
      const { error } = await supabase.from("transactions").insert({
        user_id: user!.id,
        amount: formData.amount,
        description: formData.description,
        type: formData.type,
        category: formData.category,
        transaction_date: formData.transaction_date,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TransactionFormData }) => {
      const { error } = await supabase
        .from("transactions")
        .update({
          amount: data.amount,
          description: data.description,
          type: data.type,
          category: data.category,
          transaction_date: data.transaction_date,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });

  const addTransaction = useCallback(
    (data: TransactionFormData) => addMutation.mutate(data),
    [addMutation]
  );

  const deleteTransaction = useCallback(
    (id: string) => deleteMutation.mutate(id),
    [deleteMutation]
  );

  const updateTransaction = useCallback(
    (id: string, data: TransactionFormData) => updateMutation.mutate({ id, data }),
    [updateMutation]
  );

  // Current month transactions
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const thisMonthTransactions = useMemo(
    () => transactions.filter((t) => t.transaction_date.startsWith(currentMonth)),
    [transactions, currentMonth]
  );

  // Group by month for history
  const transactionsByMonth = useMemo(() => {
    const map: Record<string, Transaction[]> = {};
    transactions.forEach((t) => {
      const month = t.transaction_date.slice(0, 7);
      if (!map[month]) map[month] = [];
      map[month].push(t);
    });
    return Object.entries(map)
      .sort(([a], [b]) => b.localeCompare(a));
  }, [transactions]);

  const summary: TransactionSummary = useMemo(() => {
    const totalIncome = thisMonthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = thisMonthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
  }, [thisMonthTransactions]);

  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    thisMonthTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [thisMonthTransactions]);

  const monthlyTrend = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    transactions.forEach((t) => {
      const month = t.transaction_date.slice(0, 7);
      if (!map[month]) map[month] = { income: 0, expense: 0 };
      map[month][t.type as "income" | "expense"] += t.amount;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, ...data }));
  }, [transactions]);

  return {
    transactions,
    thisMonthTransactions,
    transactionsByMonth,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    summary,
    expenseByCategory,
    monthlyTrend,
    isLoading,
  };
}
