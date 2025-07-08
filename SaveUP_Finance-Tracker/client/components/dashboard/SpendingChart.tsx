import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/components/currency/CurrencyProvider";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const spendingData = [
  { month: "Jul", income: 4500, expenses: 3200 },
  { month: "Aug", income: 4800, expenses: 3400 },
  { month: "Sep", income: 4200, expenses: 3100 },
  { month: "Oct", income: 5100, expenses: 3800 },
  { month: "Nov", income: 4700, expenses: 3300 },
  { month: "Dec", income: 5200, expenses: 3900 },
  { month: "Jan", income: 4900, expenses: 3500 },
];

export default function SpendingChart() {
  const { formatAmount } = useCurrency();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income vs Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={spendingData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="month"
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis className="text-xs" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "hsl(var(--popover-foreground))",
                }}
                formatter={(value: number, name: string) => [
                  formatAmount(value),
                  name === "income" ? "Income" : "Expenses",
                ]}
              />
              <Bar
                dataKey="income"
                fill="hsl(var(--income))"
                radius={[4, 4, 0, 0]}
                name="income"
              />
              <Bar
                dataKey="expenses"
                fill="hsl(var(--expense))"
                radius={[4, 4, 0, 0]}
                name="expenses"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
