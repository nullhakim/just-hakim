import { useState } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

const EXPENSE_COLORS = [
  "hsl(350 80% 55%)", "hsl(20 80% 55%)", "hsl(45 80% 50%)",
  "hsl(200 70% 50%)", "hsl(270 60% 55%)", "hsl(150 50% 45%)",
];

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

interface ChartsProps {
  expenseByCategory: { name: string; value: number }[];
  monthlyTrend: { month: string; income: number; expense: number }[];
}

export function Charts({ expenseByCategory, monthlyTrend }: ChartsProps) {
  const isMobile = useIsMobile();
  const [selectedPieIndex, setSelectedPieIndex] = useState<number | null>(null);
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Expense breakdown */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {expenseByCategory.length > 0 ? (
            <>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      onClick={isMobile ? (_, i) => setSelectedPieIndex(selectedPieIndex === i ? null : i) : undefined}
                    >
                      {expenseByCategory.map((_, i) => (
                        <Cell
                          key={i}
                          fill={EXPENSE_COLORS[i % EXPENSE_COLORS.length]}
                          opacity={selectedPieIndex !== null && selectedPieIndex !== i ? 0.4 : 1}
                          stroke={selectedPieIndex === i ? "hsl(var(--foreground))" : "none"}
                          strokeWidth={selectedPieIndex === i ? 2 : 0}
                        />
                      ))}
                    </Pie>
                    {!isMobile && (
                      <Tooltip formatter={(value: number) => fmtCurrency(value)} />
                    )}
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {isMobile && selectedPieIndex !== null && expenseByCategory[selectedPieIndex] && (
                <div className="mt-2 rounded-md bg-muted p-3 text-center">
                  <p className="text-sm font-medium">{expenseByCategory[selectedPieIndex].name}</p>
                  <p className="text-lg font-bold">{fmtCurrency(expenseByCategory[selectedPieIndex].value)}</p>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-[220px] items-center justify-center text-xs text-muted-foreground">
              No expense data
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly trend */}
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
    </div>
  );
}
