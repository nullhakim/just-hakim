import { useState, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { SummaryCards } from "@/components/SummaryCards";
import { BudgetCard } from "@/components/BudgetCard";
import { Charts } from "@/components/Charts";
import { TransactionList } from "@/components/TransactionList";
import { TransactionForm } from "@/components/TransactionForm";
import { AddTransactionSheet } from "@/components/AddTransactionSheet";
import { EditTransactionSheet } from "@/components/EditTransactionSheet";
import { useTransactions } from "@/hooks/useTransactions";
import { useBudget } from "@/hooks/useBudget";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { LogOut, Loader2, ChevronDown, ChevronRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Transaction } from "@/types/transaction";

type Tab = "dashboard" | "history" | "add" | "tags" | "report";

const monthLabel = (ym: string) => {
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sheetOpen, setSheetOpen] = useState(false);
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set([currentMonth]));
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const isMobile = useIsMobile();

  const {
    transactions,
    thisMonthTransactions,
    transactionsByMonth,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    summary,
    expenseByCategory,
    monthlyTrend,
    profileMap,
    isLoading,
  } = useTransactions();

  const { budget, setBudget } = useBudget(currentMonth);

  const fmt = (n: number) => fmtCurrency(n);

  // Tag summary
  const tagSummary = useMemo(() => {
    const map: Record<string, { total: number; count: number; transactions: Transaction[] }> = {};
    transactions.filter((t) => t.tag).forEach((t) => {
      const tag = t.tag!;
      if (!map[tag]) map[tag] = { total: 0, count: 0, transactions: [] };
      map[tag].total += t.type === "expense" ? t.amount : -t.amount;
      map[tag].count += 1;
      map[tag].transactions.push(t);
    });
    return Object.entries(map).sort(([, a], [, b]) => b.total - a.total);
  }, [transactions]);

  // Monthly summaries for history
  const monthlySummaries = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    transactions.forEach((t) => {
      const month = t.transaction_date.slice(0, 7);
      if (!map[month]) map[month] = { income: 0, expense: 0 };
      if (t.type === "income") map[month].income += t.amount;
      else map[month].expense += t.amount;
    });
    return map;
  }, [transactions]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const handleNavigate = (t: Tab) => {
    if (t === "add") {
      if (isMobile) {
        setSheetOpen(true);
      } else {
        setTab("add");
      }
    } else {
      setTab(t);
    }
  };

  const toggleMonth = (month: string) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(month)) next.delete(month);
      else next.add(month);
      return next;
    });
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditSheetOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-4">
          <h1 className="text-lg font-bold tracking-tight">NullHakim</h1>
          <span className="ml-2 rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            Money
          </span>
          <div className="flex-1" />
          <span className="mr-2 text-sm text-muted-foreground">
            {user?.email === "husband@nullisa.com" ? "👨 Husband" : "👩 Wife"}
          </span>
          <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
            <LogOut size={18} />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 p-4">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {tab === "dashboard" && (
              <>
                <SummaryCards summary={summary} />
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-sm font-medium text-muted-foreground">This Month</h2>
                    {thisMonthTransactions.length > 5 && (
                      <button
                        onClick={() => setTab("history")}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        View all
                      </button>
                    )}
                  </div>
                  <TransactionList
                    transactions={thisMonthTransactions.slice(0, 5)}
                    onDelete={deleteTransaction}
                    onEdit={handleEdit}
                    profileMap={profileMap}
                  />
                </div>
              </>
            )}

            {tab === "report" && (
              <>
                <h2 className="text-lg font-semibold">Report</h2>
                <Charts expenseByCategory={expenseByCategory} monthlyTrend={monthlyTrend} />
              </>
            )}

            {tab === "history" && (
              <>
                <h2 className="text-lg font-semibold">Transaction History</h2>
                {transactionsByMonth.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <p className="text-sm">No transactions yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactionsByMonth.map(([month, txs]) => {
                      const isExpanded = expandedMonths.has(month);
                      const ms = monthlySummaries[month];
                      return (
                        <div key={month}>
                          <button
                            onClick={() => toggleMonth(month)}
                            className="mb-2 flex w-full items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            <span>{monthLabel(month)}</span>
                            <span className="text-xs">({txs.length})</span>
                            <div className="flex-1" />
                            {ms && (
                              <div className="flex gap-2 text-[10px] tabular-nums">
                                <span className="text-[hsl(152,60%,42%)]">+{fmtCurrency(ms.income)}</span>
                                <span className="text-[hsl(350,80%,55%)]">-{fmtCurrency(ms.expense)}</span>
                              </div>
                            )}
                          </button>
                          {isExpanded && (
                            <TransactionList transactions={txs} onDelete={deleteTransaction} onEdit={handleEdit} profileMap={profileMap} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {tab === "tags" && (
              <>
                <h2 className="text-lg font-semibold">Tag Summary</h2>
                {tagSummary.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Tag size={32} className="mb-2 opacity-40" />
                    <p className="text-sm">No tagged transactions</p>
                    <p className="text-xs">Add a tag like "Vacation Bali" when creating transactions</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tagSummary.map(([tag, data]) => {
                      const isExpanded = expandedMonths.has(`tag-${tag}`);
                      return (
                        <Card key={tag} className="border-0 shadow-sm">
                          <CardContent className="p-0">
                            <button
                              onClick={() => toggleMonth(`tag-${tag}`)}
                              className="flex w-full items-center gap-3 p-4"
                            >
                              <span className="text-lg">🏷️</span>
                              <div className="flex-1 text-left">
                                <p className="text-sm font-medium">{tag}</p>
                                <p className="text-xs text-muted-foreground">{data.count} transactions</p>
                              </div>
                              <span className="text-sm font-semibold text-[hsl(350,80%,55%)]">
                                {fmt(data.total)}
                              </span>
                              {isExpanded ? <ChevronDown size={16} className="text-muted-foreground" /> : <ChevronRight size={16} className="text-muted-foreground" />}
                            </button>
                            {isExpanded && (
                              <div className="border-t px-2 pb-2">
                                <TransactionList
                                  transactions={data.transactions}
                                  onDelete={deleteTransaction}
                                  onEdit={handleEdit}
                                  profileMap={profileMap}
                                />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {tab === "add" && !isMobile && (
              <>
                <h2 className="text-lg font-semibold">Add Transaction</h2>
                <div className="mx-auto max-w-md">
                  <TransactionForm
                    onSubmit={(data) => {
                      addTransaction(data);
                      setTab("dashboard");
                    }}
                  />
                </div>
              </>
            )}
          </>
        )}
      </main>

      <EditTransactionSheet
        transaction={editingTransaction}
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        onSubmit={updateTransaction}
      />

      <AddTransactionSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSubmit={addTransaction}
      />

      <BottomNav active={tab === "add" ? "dashboard" : tab} onNavigate={handleNavigate} />
    </div>
  );
};

export default Index;
