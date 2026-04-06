import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  type TransactionType,
  type TransactionFormData,
} from "@/types/transaction";
import { cn } from "@/lib/utils";

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => void;
  onClose?: () => void;
}

export function TransactionForm({ onSubmit, onClose }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;
    onSubmit({
      amount: parseFloat(amount),
      description,
      type,
      category,
      transaction_date: date,
    });
    setAmount("");
    setDescription("");
    setCategory("");
    onClose?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type toggle */}
      <div className="flex gap-2 rounded-xl bg-muted p-1">
        {(["expense", "income"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setType(t); setCategory(""); }}
            className={cn(
              "flex-1 rounded-lg py-2.5 text-sm font-medium capitalize transition-all",
              type === t
                ? t === "income"
                  ? "bg-[hsl(var(--income))] text-[hsl(var(--income-foreground))] shadow-sm"
                  : "bg-[hsl(var(--expense))] text-[hsl(var(--expense-foreground))] shadow-sm"
                : "text-muted-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="amount" className="text-xs text-muted-foreground">Amount</Label>
          <Input
            id="amount"
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 h-12 text-xl font-semibold"
            required
            min="0"
            step="any"
          />
        </div>

        <div>
          <Label htmlFor="category" className="text-xs text-muted-foreground">Category</Label>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger className="mt-1 h-12">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="description" className="text-xs text-muted-foreground">Description</Label>
          <Input
            id="description"
            placeholder="e.g. Lunch with team"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 h-12"
          />
        </div>

        <div>
          <Label htmlFor="date" className="text-xs text-muted-foreground">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 h-12"
            required
          />
        </div>
      </div>

      <Button type="submit" className="h-12 w-full text-base font-medium">
        Add Transaction
      </Button>
    </form>
  );
}
