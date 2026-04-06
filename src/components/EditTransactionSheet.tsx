import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  type TransactionType,
  type TransactionFormData,
  type Transaction,
} from "@/types/transaction";
import { formatRupiahInput, parseRupiahInput } from "@/lib/currency";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface Props {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, data: TransactionFormData) => void;
}

export function EditTransactionSheet({ transaction, open, onOpenChange, onSubmit }: Props) {
  const isMobile = useIsMobile();
  const [type, setType] = useState<TransactionType>("expense");
  const [displayAmount, setDisplayAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (transaction) {
      setType(transaction.type as TransactionType);
      setDisplayAmount(formatRupiahInput(String(transaction.amount)));
      setDescription(transaction.description);
      setCategory(transaction.category);
      setDate(transaction.transaction_date);
    }
  }, [transaction]);

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseRupiahInput(e.target.value);
    setDisplayAmount(formatRupiahInput(raw));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction) return;
    const numericAmount = Number(parseRupiahInput(displayAmount));
    if (!numericAmount || !category) return;
    onSubmit(transaction.id, {
      amount: numericAmount,
      description,
      type,
      category,
      transaction_date: date,
    });
    onOpenChange(false);
  };

  const form = (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          <Label htmlFor="edit-amount" className="text-xs text-muted-foreground">Amount (Rp)</Label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">Rp</span>
            <Input
              id="edit-amount"
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={displayAmount}
              onChange={handleAmountChange}
              className="h-12 pl-10 text-xl font-semibold"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="edit-category" className="text-xs text-muted-foreground">Category</Label>
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
          <Label htmlFor="edit-description" className="text-xs text-muted-foreground">Description</Label>
          <Input
            id="edit-description"
            placeholder="e.g. Lunch with team"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 h-12"
          />
        </div>

        <div>
          <Label htmlFor="edit-date" className="text-xs text-muted-foreground">Date</Label>
          <Input
            id="edit-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 h-12"
            required
          />
        </div>
      </div>

      <Button type="submit" className="h-12 w-full text-base font-medium">
        Save Changes
      </Button>
    </form>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8">
          <SheetHeader className="mb-4">
            <SheetTitle>Edit Transaction</SheetTitle>
          </SheetHeader>
          {form}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>
        {form}
      </DialogContent>
    </Dialog>
  );
}
