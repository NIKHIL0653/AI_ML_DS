import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import CreateBudgetModal from "@/components/modals/CreateBudgetModal";
import EditBudgetModal from "@/components/modals/EditBudgetModal";
import EmptyState from "@/components/ui/empty-state";
import { useCurrency } from "@/components/currency/CurrencyProvider";
import { Plus, Edit, Trash2, PiggyBank } from "lucide-react";

const initialBudgetData = [
  {
    id: "1",
    category: "Food & Dining",
    budgeted: 600,
    spent: 450,
    remaining: 150,
  },
  {
    id: "2",
    category: "Transportation",
    budgeted: 400,
    spent: 320,
    remaining: 80,
  },
  {
    id: "3",
    category: "Entertainment",
    budgeted: 200,
    spent: 180,
    remaining: 20,
  },
  {
    id: "4",
    category: "Shopping",
    budgeted: 350,
    spent: 280,
    remaining: 70,
  },
  {
    id: "5",
    category: "Utilities",
    budgeted: 250,
    spent: 150,
    remaining: 100,
  },
];

export default function Budgets() {
  // Start with empty array for new users - change to initialBudgetData to see demo data
  const [budgets, setBudgets] = useState<any[]>([]);
  const { formatAmount } = useCurrency();

  const handleBudgetCreated = (newBudget: any) => {
    setBudgets([...budgets, newBudget]);
  };

  const handleBudgetUpdated = (updatedBudget: any) => {
    setBudgets(
      budgets.map((budget) =>
        budget.id === updatedBudget.id ? updatedBudget : budget,
      ),
    );
  };

  const handleDeleteBudget = (budgetId: string) => {
    setBudgets(budgets.filter((budget) => budget.id !== budgetId));
  };
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
            <p className="text-muted-foreground">
              Manage your spending budgets and track your progress.
            </p>
          </div>
          <CreateBudgetModal onBudgetCreated={handleBudgetCreated} />
        </div>

        {budgets.length > 0 ? (
          <div className="grid gap-6">
            {budgets.map((budget) => {
              const percentageUsed = (budget.spent / budget.budgeted) * 100;
              const isOverBudget = percentageUsed > 100;

              return (
                <Card key={budget.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-lg">{budget.category}</CardTitle>
                    <div className="flex gap-2">
                      <EditBudgetModal
                        budget={budget}
                        onBudgetUpdated={handleBudgetUpdated}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteBudget(budget.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>
                        Spent:{" "}
                        <span className="font-semibold">
                          {formatAmount(budget.spent)}
                        </span>
                      </span>
                      <span>
                        Budget:{" "}
                        <span className="font-semibold">
                          {formatAmount(budget.budgeted)}
                        </span>
                      </span>
                    </div>
                    <Progress
                      value={Math.min(percentageUsed, 100)}
                      className="h-3"
                    />
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        {percentageUsed.toFixed(1)}% used
                      </span>
                      {isOverBudget ? (
                        <span className="text-destructive font-medium">
                          Over budget by{" "}
                          {formatAmount(budget.spent - budget.budgeted)}
                        </span>
                      ) : (
                        <span className="text-success font-medium">
                          {formatAmount(budget.remaining)} remaining
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={PiggyBank}
            title="No budgets created yet"
            description="Create your first budget to start tracking your spending and stay on top of your financial goals."
          >
            <CreateBudgetModal onBudgetCreated={handleBudgetCreated} />
          </EmptyState>
        )}
      </div>
    </MainLayout>
  );
}
