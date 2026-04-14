import { LayoutDashboard, List, Plus, Tag, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

type TabKey = "dashboard" | "history" | "add" | "tags" | "report";

interface BottomNavProps {
  active: TabKey;
  onNavigate: (tab: TabKey) => void;
}

const tabs = [
  { key: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
  { key: "tags" as const, label: "Tags", icon: Tag },
  { key: "add" as const, label: "Add", icon: Plus },
  { key: "report" as const, label: "Report", icon: BarChart3 },
  { key: "history" as const, label: "History", icon: List },
];

export function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-sm safe-area-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {tabs.map(({ key, label, icon: Icon }) => {
          const isAdd = key === "add";
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={cn(
                "flex min-h-[56px] min-w-[48px] flex-col items-center justify-center gap-1 text-[10px] transition-colors",
                isAdd
                  ? "relative -mt-4 rounded-full bg-primary text-primary-foreground shadow-lg w-14 h-14 mx-1"
                  : active === key
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
              )}
              aria-label={label}
            >
              <Icon size={isAdd ? 24 : 20} />
              {!isAdd && <span>{label}</span>}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
