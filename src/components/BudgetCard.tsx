import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Check, X } from "lucide-react";

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

interface BudgetCardProps {
  budgetAmount: number | null;
  totalExpense: number;
  onSetBudget: (amount: number) => void;
}

export function BudgetCard({ budgetAmount, totalExpense, onSetBudget }: BudgetCardProps) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const hasBudget = budgetAmount !== null && budgetAmount > 0;
  const percentage = hasBudget ? Math.min((totalExpense / budgetAmount) * 100, 100) : 0;
  const remaining = hasBudget ? budgetAmount - totalExpense : 0;
  const isOver = remaining < 0;

  const handleSave = () => {
    const val = Number(inputValue.replace(/\D/g, ""));
    if (val > 0) {
      onSetBudget(val);
      setEditing(false);
    }
  };

  const startEdit = () => {
    setInputValue(budgetAmount ? String(budgetAmount) : "");
    setEditing(true);
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">Monthly Budget</p>
          {!editing && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={startEdit}>
              <Pencil size={12} />
            </Button>
          )}
        </div>

        {editing ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="e.g. 5000000"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="h-8 text-sm"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleSave}>
              <Check size={14} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setEditing(false)}>
              <X size={14} />
            </Button>
          </div>
        ) : hasBudget ? (
          <>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold">{fmt(totalExpense)}</span>
              <span className="text-xs text-muted-foreground">of {fmt(budgetAmount)}</span>
            </div>
            <Progress
              value={percentage}
              className={`h-2.5 ${percentage >= 90 ? "[&>div]:bg-[hsl(var(--expense))]" : percentage >= 70 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-[hsl(var(--income))]"}`}
            />
            <p className={`text-xs ${isOver ? "text-[hsl(var(--expense))] font-medium" : "text-muted-foreground"}`}>
              {isOver ? `Over budget by ${fmt(Math.abs(remaining))}` : `${fmt(remaining)} remaining`}
            </p>
          </>
        ) : (
          <button onClick={startEdit} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Tap to set a monthly budget →
          </button>
        )}
      </CardContent>
    </Card>
  );
}
