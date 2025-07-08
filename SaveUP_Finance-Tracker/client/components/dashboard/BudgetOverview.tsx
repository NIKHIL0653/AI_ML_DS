import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useCurrency } from "@/components/currency/CurrencyProvider";

interface BudgetItem {
  category: string;
  spent: number;
  budget: number;
  color: string;
}

const budgetData: BudgetItem[] = [
  { category: "Food & Dining", spent: 450, budget: 600, color: "bg-blue-500" },
  {
    category: "Transportation",
    spent: 320,
    budget: 400,
    color: "bg-green-500",
  },
  {
    category: "Entertainment",
    spent: 180,
    budget: 200,
    color: "bg-purple-500",
  },
  { category: "Shopping", spent: 280, budget: 350, color: "bg-orange-500" },
  { category: "Utilities", spent: 150, budget: 250, color: "bg-red-500" },
];

export default function BudgetOverview() {
  const { formatAmount } = useCurrency();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Budget Overview</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link to="/budgets">Manage Budgets</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {budgetData.map((item) => {
            const percentage = (item.spent / item.budget) * 100;
            const isOverBudget = percentage > 100;

            return (
              <div key={item.category} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.category}</span>
                  <span className="text-muted-foreground">
                    {formatAmount(item.spent)} / {formatAmount(item.budget)}
                  </span>
                </div>
                <Progress
                  value={Math.min(percentage, 100)}
                  className="h-2"
                  style={
                    {
                      "--progress-background": isOverBudget
                        ? "hsl(var(--destructive))"
                        : "hsl(var(--primary))",
                    } as React.CSSProperties
                  }
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{percentage.toFixed(1)}% used</span>
                  {isOverBudget && (
                    <span className="text-destructive font-medium">
                      Over budget
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
