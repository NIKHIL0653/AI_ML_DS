import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit } from "lucide-react";

interface Budget {
  id: string;
  category: string;
  budgeted: number;
  spent: number;
  remaining: number;
  period?: string;
}

interface EditBudgetModalProps {
  budget: Budget;
  trigger?: React.ReactNode;
  onBudgetUpdated?: (budget: Budget) => void;
}

export default function EditBudgetModal({
  budget,
  trigger,
  onBudgetUpdated,
}: EditBudgetModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: budget.category,
    amount: budget.budgeted.toString(),
    period: budget.period || "monthly",
  });

  // Reset form when budget changes
  useEffect(() => {
    setFormData({
      category: budget.category,
      amount: budget.budgeted.toString(),
      period: budget.period || "monthly",
    });
  }, [budget]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedBudget: Budget = {
      ...budget,
      category: formData.category,
      budgeted: Number(formData.amount),
      remaining: Number(formData.amount) - budget.spent,
      period: formData.period,
    };

    if (onBudgetUpdated) {
      onBudgetUpdated(updatedBudget);
    }

    setOpen(false);
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Edit className="h-4 w-4" />
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Budget</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Food & Dining">Food & Dining</SelectItem>
                <SelectItem value="Transportation">Transportation</SelectItem>
                <SelectItem value="Shopping">Shopping</SelectItem>
                <SelectItem value="Entertainment">Entertainment</SelectItem>
                <SelectItem value="Utilities">Utilities</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Travel">Travel</SelectItem>
                <SelectItem value="Personal Care">Personal Care</SelectItem>
                <SelectItem value="Gifts & Donations">
                  Gifts & Donations
                </SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Budget Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="Enter budget amount"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="period">Budget Period</Label>
            <Select
              value={formData.period}
              onValueChange={(value) =>
                setFormData({ ...formData, period: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Current Spending
            </Label>
            <div className="text-sm text-muted-foreground">
              ${budget.spent.toFixed(2)} spent so far
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Update Budget</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
