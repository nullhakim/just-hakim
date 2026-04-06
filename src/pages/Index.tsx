import { useState } from "react";
import { Navigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { SummaryCards } from "@/components/SummaryCards";
import { Charts } from "@/components/Charts";
import { TransactionList } from "@/components/TransactionList";
import { TransactionForm } from "@/components/TransactionForm";
import { AddTransactionSheet } from "@/components/AddTransactionSheet";
import { useTransactions } from "@/hooks/useTransactions";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { LogOut, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Tab = "dashboard" | "history" | "add";

const monthLabel = (ym: string) => {
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const isMobile = useIsMobile();

  const {
    thisMonthTransactions,
    transactionsByMonth,
    addTransaction,
    deleteTransaction,
    summary,
    expenseByCategory,
    monthlyTrend,
    isLoading,
  } = useTransactions();

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

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-4">
          <h1 className="text-lg font-bold tracking-tight">NullHakim</h1>
          <span className="ml-2 rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            Money
          </span>
          <div className="flex-1" />
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
                <Charts expenseByCategory={expenseByCategory} monthlyTrend={monthlyTrend} />
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
                  />
                </div>
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
                    {transactionsByMonth.map(([month, txs], idx) => {
                      const isCurrentMonth = idx === 0;
                      const isExpanded = isCurrentMonth || expandedMonths.has(month);
                      return (
                        <div key={month}>
                          <button
                            onClick={() => !isCurrentMonth && toggleMonth(month)}
                            className="mb-2 flex w-full items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {!isCurrentMonth && (
                              isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                            )}
                            <span>{monthLabel(month)}</span>
                            <span className="text-xs">({txs.length})</span>
                          </button>
                          {isExpanded && (
                            <TransactionList transactions={txs} onDelete={deleteTransaction} />
                          )}
                        </div>
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
