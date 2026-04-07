import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Transaction } from "@/types/transaction";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
}

export function TransactionList({ transactions, onDelete, onEdit }: Props) {
  const isMobile = useIsMobile();
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

  if (!transactions.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-sm">No transactions yet</p>
        <p className="text-xs">Tap + to add your first one</p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-2">
        {transactions.map((t) => (
          <Card key={t.id} className="border-0 shadow-sm cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => onEdit(t)}>
            <CardContent className="flex items-center gap-3 p-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{t.category}</span>
                  <span className="text-[10px] text-muted-foreground">{fmtDate(t.transaction_date)}</span>
                </div>
                {t.description && (
                  <p className="text-xs text-muted-foreground truncate">{t.description}</p>
                )}
              </div>
              <span
                className={cn(
                  "text-sm font-semibold whitespace-nowrap",
                  t.type === "income" ? "text-[hsl(var(--income))]" : "text-[hsl(var(--expense))]"
                )}
              >
                {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(t.id); }}
                className="p-2 text-muted-foreground hover:text-destructive transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Delete"
              >
                <Trash2 size={16} />
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Desktop table view
  return (
    <Card className="border-0 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t) => (
            <TableRow key={t.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onEdit(t)}>
              <TableCell className="text-muted-foreground text-sm">{fmtDate(t.transaction_date)}</TableCell>
              <TableCell className="font-medium text-sm">{t.category}</TableCell>
              <TableCell className="text-muted-foreground text-sm">{t.description || "—"}</TableCell>
              <TableCell
                className={cn(
                  "text-right font-semibold text-sm",
                  t.type === "income" ? "text-[hsl(var(--income))]" : "text-[hsl(var(--expense))]"
                )}
              >
                {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
              </TableCell>
              <TableCell>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(t.id); }}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
