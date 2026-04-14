import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useBudget(month: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: budget, isLoading } = useQuery({
    queryKey: ["budget", month],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budgets" as any)
        .select("*")
        .eq("month", month)
        .maybeSingle();
      if (error) throw error;
      return data as { id: string; amount: number; month: string; user_id: string } | null;
    },
    enabled: !!user,
  });

  const upsertMutation = useMutation({
    mutationFn: async (amount: number) => {
      if (budget) {
        const { error } = await supabase
          .from("budgets" as any)
          .update({ amount } as any)
          .eq("id", budget.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("budgets" as any)
          .insert({ user_id: user!.id, month, amount } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budget", month] }),
  });

  const setBudget = useCallback(
    (amount: number) => upsertMutation.mutate(amount),
    [upsertMutation]
  );

  return { budget, isLoading, setBudget };
}
