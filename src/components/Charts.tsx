import { useState, useMemo } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronDown } from "lucide-react";
import type { Transaction } from "@/types/transaction";

const EXPENSE_COLORS = [
  "hsl(350 80% 55%)", "hsl(20 80% 55%)", "hsl(45 80% 50%)",
  "hsl(200 70% 50%)", "hsl(270 60% 55%)", "hsl(150 50% 45%)",
  "hsl(330 65% 50%)", "hsl(180 55% 45%)", "hsl(60 70% 45%)",
  "hsl(240 50% 55%)", "hsl(10 65% 50%)", "hsl(300 45% 50%)",
  "hsl(120 40% 45%)",
];

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

interface ChartsProps {
  expenseByCategory: { name: string; value: number }[];
  monthlyTrend: { month: string; income: number; expense: number }[];
  hideBreakdown?: boolean;
  hideTrend?: boolean;
}

const TOP_N = 5;

export function Charts({ expenseByCategory, monthlyTrend, hideBreakdown, hideTrend }: ChartsProps) {
  const isMobile = useIsMobile();
  const [selectedPieIndex, setSelectedPieIndex] = useState<number | null>(null);
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);

  // Group small categories into "Others"
  const chartData = useMemo(() => {
    if (expenseByCategory.length <= TOP_N + 1) return expenseByCategory;
    const sorted = [...expenseByCategory].sort((a, b) => b.value - a.value);
    const top = sorted.slice(0, TOP_N);
    const othersValue = sorted.slice(TOP_N).reduce((s, c) => s + c.value, 0);
    if (othersValue > 0) top.push({ name: "Others", value: othersValue });
    return top;
  }, [expenseByCategory]);

  const total = useMemo(() => chartData.reduce((s, c) => s + c.value, 0), [chartData]);

  return (
    <div className={hideBreakdown || hideTrend ? "" : "grid gap-4 md:grid-cols-2"}>
      {/* Expense breakdown */}
      {!hideBreakdown && (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <div className="flex flex-col items-center gap-3">
              <div className="h-[180px] w-full max-w-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                      onClick={isMobile ? (_, i) => setSelectedPieIndex(selectedPieIndex === i ? null : i) : undefined}
                    >
                      {chartData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={EXPENSE_COLORS[i % EXPENSE_COLORS.length]}
                          opacity={selectedPieIndex !== null && selectedPieIndex !== i ? 0.4 : 1}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    {!isMobile && (
                      <Tooltip formatter={(value: number) => fmtCurrency(value)} />
                    )}
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Custom legend list */}
              <div className="w-full space-y-1.5">
                {chartData.map((item, i) => {
                  const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";
                  const isSelected = selectedPieIndex === i;
                  return (
                    <button
                      key={item.name}
                      onClick={() => setSelectedPieIndex(isSelected ? null : i)}
                      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-muted/50 ${isSelected ? "bg-muted" : ""}`}
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: EXPENSE_COLORS[i % EXPENSE_COLORS.length] }}
                      />
                      <span className="flex-1 truncate text-xs">{item.name}</span>
                      <span className="text-xs text-muted-foreground">{pct}%</span>
                      <span className="text-xs font-medium tabular-nums">{fmtCurrency(item.value)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex h-[180px] items-center justify-center text-xs text-muted-foreground">
              No expense data
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {/* Monthly trend */}
      {!hideTrend && (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyTrend.length > 0 ? (
            <>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrend} onClick={isMobile ? (state) => {
                    if (state?.activeTooltipIndex !== undefined) {
                      setSelectedBarIndex(selectedBarIndex === state.activeTooltipIndex ? null : state.activeTooltipIndex);
                    }
                  } : undefined}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    {!isMobile && (
                      <Tooltip formatter={(value: number) => fmtCurrency(value)} />
                    )}
                    <Legend />
                    <Bar dataKey="income" fill="hsl(152 60% 42%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" fill="hsl(350 80% 55%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {isMobile && selectedBarIndex !== null && monthlyTrend[selectedBarIndex] && (
                <div className="mt-2 rounded-md bg-muted p-3 text-center">
                  <p className="text-sm font-medium">{monthlyTrend[selectedBarIndex].month}</p>
                  <div className="flex justify-center gap-4 mt-1">
                    <span className="text-sm">Income: <strong className="text-[hsl(152,60%,42%)]">{fmtCurrency(monthlyTrend[selectedBarIndex].income)}</strong></span>
                    <span className="text-sm">Expense: <strong className="text-[hsl(350,80%,55%)]">{fmtCurrency(monthlyTrend[selectedBarIndex].expense)}</strong></span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-[220px] items-center justify-center text-xs text-muted-foreground">
              No trend data
            </div>
          )}
        </CardContent>
      </Card>
      )}
    </div>
  );
}
