import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import AddGoalModal from "@/components/modals/AddGoalModal";
import EditGoalModal from "@/components/modals/EditGoalModal";
import EmptyState from "@/components/ui/empty-state";
import { useCurrency } from "@/components/currency/CurrencyProvider";
import { Plus, Target, Calendar, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

// For demo purposes - in a real app, this would be fetched from database based on user
const sampleGoals = [
  {
    id: "1",
    name: "Emergency Fund",
    currentAmount: 3500,
    targetAmount: 10000,
    targetDate: new Date("2024-12-31"),
    progress: 0.35,
  },
  {
    id: "2",
    name: "Vacation Fund",
    currentAmount: 1200,
    targetAmount: 3000,
    targetDate: new Date("2024-06-30"),
    progress: 0.4,
  },
  {
    id: "3",
    name: "House Down Payment",
    currentAmount: 15000,
    targetAmount: 50000,
    targetDate: new Date("2025-12-31"),
    progress: 0.3,
  },
  {
    id: "4",
    name: "New Car Fund",
    currentAmount: 8500,
    targetAmount: 25000,
    targetDate: new Date("2025-03-31"),
    progress: 0.34,
  },
];

export default function Goals() {
  // Start with empty array for new users - change to sampleGoals to see demo data
  const [goals, setGoals] = useState<any[]>([]);
  const { formatAmount } = useCurrency();

  const handleGoalAdded = (newGoal: any) => {
    setGoals([...goals, newGoal]);
  };

  const handleGoalDeleted = (goalId: string) => {
    setGoals(goals.filter((goal) => goal.id !== goalId));
  };

  const handleGoalUpdated = (updatedGoal: any) => {
    setGoals(
      goals.map((goal) => (goal.id === updatedGoal.id ? updatedGoal : goal)),
    );
  };
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Financial Goals
            </h1>
            <p className="text-muted-foreground">
              Set and track your financial goals and milestones.
            </p>
          </div>
          <AddGoalModal onGoalAdded={handleGoalAdded} />
        </div>

        {goals.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {goals.map((goal) => (
              <Card key={goal.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {goal.name}
                  </CardTitle>
                  <div className="flex gap-2">
                    <EditGoalModal
                      goal={goal}
                      onGoalUpdated={handleGoalUpdated}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGoalDeleted(goal.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Current: {formatAmount(goal.currentAmount)}</span>
                    <span>Target: {formatAmount(goal.targetAmount)}</span>
                  </div>
                  <Progress value={goal.progress * 100} className="h-3" />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Target:{" "}
                      {goal.targetDate
                        ? format(goal.targetDate, "MMM yyyy")
                        : "No date set"}
                    </span>
                    <span>{Math.round(goal.progress * 100)}% complete</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Target}
            title="No financial goals yet"
            description="Create your first financial goal to start working towards your dreams. Set targets for savings, purchases, or any financial milestone."
          >
            <AddGoalModal onGoalAdded={handleGoalAdded} />
          </EmptyState>
        )}
      </div>
    </MainLayout>
  );
}
