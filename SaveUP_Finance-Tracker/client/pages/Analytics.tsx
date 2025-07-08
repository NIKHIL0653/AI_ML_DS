import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/components/currency/CurrencyProvider";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const expenseData = [
  { name: "Food & Dining", value: 1200, color: "#8b5cf6" },
  { name: "Transportation", value: 800, color: "#06b6d4" },
  { name: "Entertainment", value: 400, color: "#84cc16" },
  { name: "Shopping", value: 600, color: "#f59e0b" },
  { name: "Utilities", value: 500, color: "#ef4444" },
];

const trendData = [
  { month: "Jul", spending: 3200, income: 4500 },
  { month: "Aug", spending: 3400, income: 4800 },
  { month: "Sep", spending: 3100, income: 4200 },
  { month: "Oct", spending: 3800, income: 5100 },
  { month: "Nov", spending: 3300, income: 4700 },
  { month: "Dec", spending: 3900, income: 5200 },
  { month: "Jan", spending: 3500, income: 4900 },
];

export default function Analytics() {
  const { formatAmount } = useCurrency();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Analyze your spending patterns and financial trends.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Spending Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-30"
                    />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="spending"
                      stroke="hsl(var(--expense))"
                      strokeWidth={2}
                      name="Spending"
                    />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="hsl(var(--income))"
                      strokeWidth={2}
                      name="Income"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Monthly Spending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatAmount(3357)}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-destructive">+2.1%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Highest Spending Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Food & Dining</div>
              <p className="text-xs text-muted-foreground">
                {formatAmount(1200)} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Savings Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">28.6%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-success">+1.2%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
