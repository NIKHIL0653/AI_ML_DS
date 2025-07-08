import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import EmptyState from "@/components/ui/empty-state";
import AddTransactionModal from "@/components/modals/AddTransactionModal";
import { useCurrency } from "@/components/currency/CurrencyProvider";
import { useTransactions } from "@/components/transactions/TransactionProvider";
import { Receipt } from "lucide-react";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: Date;
  type: "income" | "expense";
}

interface RecentTransactionsProps {
  hasTransactions?: boolean;
}

const sampleRecentTransactions: Transaction[] = [
  {
    id: "1",
    description: "Salary Deposit",
    amount: 4500,
    category: "Income",
    date: new Date("2024-01-15"),
    type: "income",
  },
  {
    id: "2",
    description: "Grocery Shopping",
    amount: -156.5,
    category: "Food",
    date: new Date("2024-01-14"),
    type: "expense",
  },
  {
    id: "3",
    description: "Netflix Subscription",
    amount: -15.99,
    category: "Entertainment",
    date: new Date("2024-01-13"),
    type: "expense",
  },
  {
    id: "4",
    description: "Freelance Payment",
    amount: 750,
    category: "Income",
    date: new Date("2024-01-12"),
    type: "income",
  },
  {
    id: "5",
    description: "Gas Station",
    amount: -42.8,
    category: "Transportation",
    date: new Date("2024-01-11"),
    type: "expense",
  },
];

export default function RecentTransactions({
  hasTransactions = false,
}: RecentTransactionsProps) {
  const { formatAmount } = useCurrency();
  const { transactions } = useTransactions();

  // Use real transactions if they exist, otherwise use sample data if hasTransactions is true
  const recentTransactions =
    transactions.length > 0
      ? transactions.slice(0, 5) // Show latest 5 transactions
      : hasTransactions
        ? sampleRecentTransactions
        : [];
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Transactions</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link to="/transactions">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {recentTransactions.length > 0 ? (
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between space-x-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {transaction.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {transaction.category}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(transaction.date, {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-medium ${
                      transaction.type === "income"
                        ? "text-income"
                        : "text-expense"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : ""}
                    {formatAmount(transaction.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Receipt}
            title="No transactions yet"
            description="Add your first transaction to start tracking your finances and see your spending patterns."
          >
            <AddTransactionModal />
          </EmptyState>
        )}
      </CardContent>
    </Card>
  );
}
