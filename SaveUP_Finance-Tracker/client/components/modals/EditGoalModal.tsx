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
import { Textarea } from "@/components/ui/textarea";
import { Edit } from "lucide-react";

interface Goal {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: Date;
  progress: number;
}

interface EditGoalModalProps {
  goal: Goal;
  trigger?: React.ReactNode;
  onGoalUpdated?: (goal: Goal) => void;
}

export default function EditGoalModal({
  goal,
  trigger,
  onGoalUpdated,
}: EditGoalModalProps) {
  const [open, setOpen] = useState(false);
  const [targetDate, setTargetDate] = useState<Date | undefined>(
    goal.targetDate,
  );
  const [formData, setFormData] = useState({
    name: goal.name,
    description: goal.description || "",
    targetAmount: goal.targetAmount.toString(),
    currentAmount: goal.currentAmount.toString(),
  });

  // Reset form when goal changes
  useEffect(() => {
    setFormData({
      name: goal.name,
      description: goal.description || "",
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
    });
    setTargetDate(goal.targetDate);
  }, [goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedGoal: Goal = {
      ...goal,
      name: formData.name,
      description: formData.description,
      targetAmount: Number(formData.targetAmount),
      currentAmount: Number(formData.currentAmount),
      targetDate: targetDate,
      progress: Number(formData.currentAmount) / Number(formData.targetAmount),
    };

    if (onGoalUpdated) {
      onGoalUpdated(updatedGoal);
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
          <DialogTitle>Edit Financial Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Goal Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Emergency Fund, Vacation, New Car"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe your financial goal"
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetAmount">Target Amount</Label>
              <Input
                id="targetAmount"
                type="number"
                step="0.01"
                value={formData.targetAmount}
                onChange={(e) =>
                  setFormData({ ...formData, targetAmount: e.target.value })
                }
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentAmount">Current Amount</Label>
              <Input
                id="currentAmount"
                type="number"
                step="0.01"
                value={formData.currentAmount}
                onChange={(e) =>
                  setFormData({ ...formData, currentAmount: e.target.value })
                }
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDate">Target Date</Label>
            <Input
              id="targetDate"
              type="date"
              value={targetDate ? targetDate.toISOString().split("T")[0] : ""}
              onChange={(e) => {
                if (e.target.value) {
                  setTargetDate(new Date(e.target.value));
                } else {
                  setTargetDate(undefined);
                }
              }}
              min={new Date().toISOString().split("T")[0]}
              className="w-full"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Update Goal</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
