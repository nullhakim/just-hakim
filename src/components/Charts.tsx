import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EXPENSE_COLORS = [
  "hsl(350 80% 55%)", "hsl(20 80% 55%)", "hsl(45 80% 50%)",
  "hsl(200 70% 50%)", "hsl(270 60% 55%)", "hsl(150 50% 45%)",
];

interface ChartsProps {
  expenseByCategory: { name: string; value: number }[];
  monthlyTrend: { month: string; income: number; expense: number }[];
}

export function Charts({ expenseByCategory, monthlyTrend }: ChartsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Expense breakdown */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="h-[220px]">
          {expenseByCategory.length > 0 ? (
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
                >
                  {expenseByCategory.map((_, i) => (
                    <Cell key={i} fill={EXPENSE_COLORS[i % EXPENSE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) =>
                    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value)
                  }
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
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
        <CardContent className="h-[220px]">
          {monthlyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number) =>
                    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value)
                  }
                />
                <Legend />
                <Bar dataKey="income" fill="hsl(152 60% 42%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="hsl(350 80% 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              No trend data
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
