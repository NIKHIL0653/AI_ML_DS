import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/components/currency/CurrencyProvider";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  DollarSign,
  TrendingUp,
} from "lucide-react";

interface OverviewCardsProps {
  hasTransactions?: boolean;
}

export default function OverviewCards({
  hasTransactions = false,
}: OverviewCardsProps) {
  const { formatAmount } = useCurrency();

  const emptyOverviewData = [
    {
      title: "Total Balance",
      value: formatAmount(0),
      change: "0%",
      changeType: "neutral" as const,
      icon: DollarSign,
    },
    {
      title: "Monthly Income",
      value: formatAmount(0),
      change: "0%",
      changeType: "neutral" as const,
      icon: ArrowUpCircle,
    },
    {
      title: "Monthly Expenses",
      value: formatAmount(0),
      change: "0%",
      changeType: "neutral" as const,
      icon: ArrowDownCircle,
    },
    {
      title: "Savings Rate",
      value: "0%",
      change: "0%",
      changeType: "neutral" as const,
      icon: TrendingUp,
    },
  ];

  const sampleOverviewData = [
    {
      title: "Total Balance",
      value: formatAmount(24580),
      change: "+12.5%",
      changeType: "positive" as const,
      icon: DollarSign,
    },
    {
      title: "Monthly Income",
      value: formatAmount(8420),
      change: "+8.2%",
      changeType: "positive" as const,
      icon: ArrowUpCircle,
    },
    {
      title: "Monthly Expenses",
      value: formatAmount(5230),
      change: "-3.1%",
      changeType: "positive" as const,
      icon: ArrowDownCircle,
    },
    {
      title: "Savings Rate",
      value: "38%",
      change: "+5.4%",
      changeType: "positive" as const,
      icon: TrendingUp,
    },
  ];

  const overviewData = hasTransactions ? sampleOverviewData : emptyOverviewData;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {overviewData.map((item) => (
        <Card key={item.title} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.title}
            </CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="text-xs text-muted-foreground">
              <span
                className={
                  item.changeType === "positive"
                    ? "text-success"
                    : item.changeType === "neutral"
                      ? "text-muted-foreground"
                      : "text-destructive"
                }
              >
                {item.change}
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
