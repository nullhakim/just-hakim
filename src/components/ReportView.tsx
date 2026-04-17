import { useMemo, useState } from "react";
import { Charts } from "@/components/Charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Transaction } from "@/types/transaction";

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const monthLabel = (ym: string) => {
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

interface ReportViewProps {
  transactions: Transaction[];
}

export function ReportView({ transactions }: ReportViewProps) {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentYear = String(now.getFullYear());

  // Available months & years
  const { availableMonths, availableYears } = useMemo(() => {
    const monthsSet = new Set<string>();
    const yearsSet = new Set<string>();
    transactions.forEach((t) => {
      monthsSet.add(t.transaction_date.slice(0, 7));
      yearsSet.add(t.transaction_date.slice(0, 4));
    });
    if (!monthsSet.has(currentMonth)) monthsSet.add(currentMonth);
    if (!yearsSet.has(currentYear)) yearsSet.add(currentYear);
    return {
      availableMonths: Array.from(monthsSet).sort((a, b) => b.localeCompare(a)),
      availableYears: Array.from(yearsSet).sort((a, b) => b.localeCompare(a)),
    };
  }, [transactions, currentMonth, currentYear]);

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<string>(currentYear);

  // Filtered for donut (month)
  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "expense" && t.transaction_date.startsWith(selectedMonth))
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [transactions, selectedMonth]);

  // Monthly trend across selected year
  const monthlyTrend = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    transactions
      .filter((t) => t.transaction_date.startsWith(selectedYear))
      .forEach((t) => {
        const month = t.transaction_date.slice(0, 7);
        if (!map[month]) map[month] = { income: 0, expense: 0 };
        map[month][t.type as "income" | "expense"] += t.amount;
      });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month: month.slice(5), ...data }));
  }, [transactions, selectedYear]);

  // Yearly average expense (per month with activity)
  const yearStats = useMemo(() => {
    const monthsWithExpense: Record<string, number> = {};
    let totalExpense = 0;
    let totalIncome = 0;
    transactions
      .filter((t) => t.transaction_date.startsWith(selectedYear))
      .forEach((t) => {
        const month = t.transaction_date.slice(0, 7);
        if (t.type === "expense") {
          monthsWithExpense[month] = (monthsWithExpense[month] || 0) + t.amount;
          totalExpense += t.amount;
        } else {
          totalIncome += t.amount;
        }
      });
    const monthsCount = Object.keys(monthsWithExpense).length || 1;
    return {
      totalExpense,
      totalIncome,
      avgExpense: totalExpense / monthsCount,
      monthsCount: Object.keys(monthsWithExpense).length,
    };
  }, [transactions, selectedYear]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Report</h2>
      </div>

      {/* Month filter for donut */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">Filter Month</CardTitle>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="h-8 w-[180px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map((m) => (
                <SelectItem key={m} value={m} className="text-xs">
                  {monthLabel(m)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
      </Card>

      <Charts expenseByCategory={expenseByCategory} monthlyTrend={[]} hideTrend />

      {/* Year filter & average */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">Yearly Overview</CardTitle>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="h-8 w-[100px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((y) => (
                <SelectItem key={y} value={y} className="text-xs">
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-md bg-muted/50 p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Total Expense</p>
              <p className="mt-1 text-sm font-semibold tabular-nums text-[hsl(350,80%,55%)]">
                {fmtCurrency(yearStats.totalExpense)}
              </p>
            </div>
            <div className="rounded-md bg-muted/50 p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Total Income</p>
              <p className="mt-1 text-sm font-semibold tabular-nums text-[hsl(152,60%,42%)]">
                {fmtCurrency(yearStats.totalIncome)}
              </p>
            </div>
            <div className="rounded-md bg-primary/10 p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Avg / Month</p>
              <p className="mt-1 text-sm font-semibold tabular-nums">
                {fmtCurrency(yearStats.avgExpense)}
              </p>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Average based on {yearStats.monthsCount} {yearStats.monthsCount === 1 ? "month" : "months"} with expenses in {selectedYear}.
          </p>
        </CardContent>
      </Card>

      <Charts expenseByCategory={[]} monthlyTrend={monthlyTrend} hideBreakdown />
    </div>
  );
}
