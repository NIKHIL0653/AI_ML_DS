import MainLayout from "@/components/layout/MainLayout";
import OverviewCards from "@/components/dashboard/OverviewCards";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import SpendingChart from "@/components/dashboard/SpendingChart";
import BudgetOverview from "@/components/dashboard/BudgetOverview";
import EmptyState from "@/components/ui/empty-state";
import AddTransactionModal from "@/components/modals/AddTransactionModal";
import CsvUploadModal from "@/components/csv/CsvUploadModal";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { useTransactions } from "@/components/transactions/TransactionProvider";

export default function Index() {
  const { hasTransactions, addTransactions } = useTransactions();

  const handleTransactionsImported = (importedTransactions: any[]) => {
    addTransactions(importedTransactions);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back to SaveUp! Here's an overview of your finances.
          </p>
        </div>

        <OverviewCards hasTransactions={hasTransactions} />

        {hasTransactions ? (
          <>
            <div className="grid gap-6 lg:grid-cols-2">
              <SpendingChart />
              <BudgetOverview />
            </div>
            <RecentTransactions hasTransactions={hasTransactions} />
          </>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardContent className="p-0">
                <EmptyState
                  icon={BarChart3}
                  title="Start tracking your spending"
                  description="Add transactions manually or import from your bank statement to see insights about your spending patterns and financial trends."
                >
                  <div className="flex gap-2">
                    <AddTransactionModal />
                    <CsvUploadModal
                      onTransactionsImported={handleTransactionsImported}
                    />
                  </div>
                </EmptyState>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-0">
                <EmptyState
                  icon={BarChart3}
                  title="Create your first budget"
                  description="Set spending limits for different categories to better manage your finances."
                />
              </CardContent>
            </Card>
          </div>
        )}

        <RecentTransactions hasTransactions={hasTransactions} />
      </div>
    </MainLayout>
  );
}
