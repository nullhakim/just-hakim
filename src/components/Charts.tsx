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
  expenseTransactions?: Transaction[];
}

const TOP_N = 5;

export function Charts({ expenseByCategory, monthlyTrend, hideBreakdown, hideTrend, expenseTransactions = [] }: ChartsProps) {
  const isMobile = useIsMobile();
  const [selectedPieIndex, setSelectedPieIndex] = useState<number | null>(null);
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

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

  // Determine which underlying categories belong to the expanded group
  const expandedTransactions = useMemo(() => {
    if (!expandedCategory) return [];
    if (expandedCategory === "Others") {
      const topNames = new Set(chartData.filter((c) => c.name !== "Others").map((c) => c.name));
      return expenseTransactions
        .filter((t) => !topNames.has(t.category))
        .sort((a, b) => b.amount - a.amount);
    }
    return expenseTransactions
      .filter((t) => t.category === expandedCategory)
      .sort((a, b) => b.amount - a.amount);
  }, [expandedCategory, expenseTransactions, chartData]);

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
                  const isExpanded = expandedCategory === item.name;
                  const txs = isExpanded ? expandedTransactions : [];
                  return (
                    <div key={item.name}>
                      <button
                        onClick={() => {
                          setSelectedPieIndex(isSelected ? null : i);
                          setExpandedCategory(isExpanded ? null : item.name);
                        }}
                        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-muted/50 ${isSelected ? "bg-muted" : ""}`}
                      >
                        <ChevronDown
                          size={12}
                          className={`shrink-0 text-muted-foreground transition-transform ${isExpanded ? "" : "-rotate-90"}`}
                        />
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: EXPENSE_COLORS[i % EXPENSE_COLORS.length] }}
                        />
                        <span className="flex-1 truncate text-xs">{item.name}</span>
                        <span className="text-xs text-muted-foreground">{pct}%</span>
                        <span className="text-xs font-medium tabular-nums">{fmtCurrency(item.value)}</span>
                      </button>
                      {isExpanded && (
                        <div className="ml-5 mt-1 space-y-1 border-l pl-2">
                          {txs.length === 0 ? (
                            <p className="py-1 text-[11px] text-muted-foreground">No transactions</p>
                          ) : (
                            txs.map((t) => {
                              const share = item.value > 0 ? (t.amount / item.value) * 100 : 0;
                              return (
                                <div key={t.id} className="py-1 text-[11px]">
                                  <div className="flex items-start gap-2">
                                    <span className="w-14 shrink-0 tabular-nums text-muted-foreground">
                                      {t.transaction_date.slice(5)}
                                    </span>
                                    <span className="flex-1 truncate">
                                      {t.description || <span className="italic text-muted-foreground">No description</span>}
                                      {t.tag && (
                                        <span className="ml-1 rounded bg-muted px-1 py-0.5 text-[9px] text-muted-foreground">
                                          {t.tag}
                                        </span>
                                      )}
                                    </span>
                                    <span className="shrink-0 font-medium tabular-nums">
                                      {fmtCurrency(t.amount)}
                                    </span>
                                  </div>
                                  <div className="mt-1 flex items-center gap-2 pl-14">
                                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                                      <div
                                        className="h-full rounded-full transition-all"
                                        style={{
                                          width: `${share}%`,
                                          backgroundColor: EXPENSE_COLORS[i % EXPENSE_COLORS.length],
                                        }}
                                      />
                                    </div>
                                    <span className="w-9 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground">
                                      {share.toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
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
