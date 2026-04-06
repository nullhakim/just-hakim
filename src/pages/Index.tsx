import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { SummaryCards } from "@/components/SummaryCards";
import { Charts } from "@/components/Charts";
import { TransactionList } from "@/components/TransactionList";
import { TransactionForm } from "@/components/TransactionForm";
import { AddTransactionSheet } from "@/components/AddTransactionSheet";
import { useTransactions } from "@/hooks/useTransactions";
import { useIsMobile } from "@/hooks/use-mobile";

type Tab = "dashboard" | "history" | "add";

const Index = () => {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sheetOpen, setSheetOpen] = useState(false);
  const isMobile = useIsMobile();

  const {
    transactions,
    addTransaction,
    deleteTransaction,
    summary,
    expenseByCategory,
    monthlyTrend,
  } = useTransactions();

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

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-4">
          <h1 className="text-lg font-bold tracking-tight">NullHakim</h1>
          <span className="ml-2 rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            Money
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 p-4">
        {tab === "dashboard" && (
          <>
            <SummaryCards summary={summary} />
            <Charts expenseByCategory={expenseByCategory} monthlyTrend={monthlyTrend} />
            {/* Recent transactions */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-medium text-muted-foreground">Recent</h2>
                {transactions.length > 3 && (
                  <button
                    onClick={() => setTab("history")}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    View all
                  </button>
                )}
              </div>
              <TransactionList
                transactions={transactions.slice(0, 5)}
                onDelete={deleteTransaction}
              />
            </div>
          </>
        )}

        {tab === "history" && (
          <>
            <h2 className="text-lg font-semibold">Transaction History</h2>
            <TransactionList transactions={transactions} onDelete={deleteTransaction} />
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
      </main>

      {/* Bottom Sheet for mobile */}
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
