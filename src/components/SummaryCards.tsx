import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { TransactionSummary } from "@/types/transaction";

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export function SummaryCards({ summary }: { summary: TransactionSummary }) {
  const cards = [
    { label: "Balance", value: summary.balance, icon: Wallet, color: "text-foreground" },
    { label: "Income", value: summary.totalIncome, icon: TrendingUp, color: "text-[hsl(var(--income))]" },
    { label: "Expense", value: summary.totalExpense, icon: TrendingDown, color: "text-[hsl(var(--expense))]" },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {cards.map((c) => (
        <Card key={c.label} className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className={`rounded-xl bg-muted p-2.5 ${c.color}`}>
              <c.icon size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className={`truncate text-lg font-semibold tracking-tight ${c.color}`}>
                {fmt(c.value)}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
