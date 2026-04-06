import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { TransactionForm } from "./TransactionForm";
import type { TransactionFormData } from "@/types/transaction";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TransactionFormData) => void;
}

export function AddTransactionSheet({ open, onOpenChange, onSubmit }: Props) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="pb-2">
          <DrawerTitle>New Transaction</DrawerTitle>
          <DrawerDescription>Log your income or expense</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-8">
          <TransactionForm onSubmit={onSubmit} onClose={() => onOpenChange(false)} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
