import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Filter, Plus, Download } from "lucide-react";
import { format } from "date-fns";
import { useCurrency } from "@/components/currency/CurrencyProvider";
import { useTransactions } from "@/components/transactions/TransactionProvider";
import CsvUploadModal from "@/components/csv/CsvUploadModal";

interface Transaction {
  id: string;
  date: Date;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  account: string;
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    date: new Date("2024-01-15"),
    description: "Salary Deposit",
    category: "Income",
    amount: 4500,
    type: "income",
    account: "Checking",
  },
  {
    id: "2",
    date: new Date("2024-01-14"),
    description: "Whole Foods Market",
    category: "Groceries",
    amount: -156.5,
    type: "expense",
    account: "Credit Card",
  },
  {
    id: "3",
    date: new Date("2024-01-13"),
    description: "Netflix Subscription",
    category: "Entertainment",
    amount: -15.99,
    type: "expense",
    account: "Checking",
  },
  {
    id: "4",
    date: new Date("2024-01-12"),
    description: "Freelance Payment - Design Work",
    category: "Income",
    amount: 750,
    type: "income",
    account: "Checking",
  },
  {
    id: "5",
    date: new Date("2024-01-11"),
    description: "Shell Gas Station",
    category: "Transportation",
    amount: -42.8,
    type: "expense",
    account: "Credit Card",
  },
  {
    id: "6",
    date: new Date("2024-01-10"),
    description: "Amazon Purchase",
    category: "Shopping",
    amount: -89.99,
    type: "expense",
    account: "Credit Card",
  },
  {
    id: "7",
    date: new Date("2024-01-09"),
    description: "Electric Bill",
    category: "Utilities",
    amount: -125.33,
    type: "expense",
    account: "Checking",
  },
  {
    id: "8",
    date: new Date("2024-01-08"),
    description: "Stock Dividend",
    category: "Investment",
    amount: 180.5,
    type: "income",
    account: "Investment",
  },
];

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const { transactions, addTransactions } = useTransactions();
  const { formatAmount } = useCurrency();

  const handleTransactionsImported = (importedTransactions: any[]) => {
    addTransactions(importedTransactions);
  };

  // Use mock data if no transactions exist (for demo purposes)
  const displayTransactions =
    transactions.length > 0 ? transactions : mockTransactions;

  const filteredTransactions = displayTransactions.filter((transaction) => {
    const matchesSearch = transaction.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || transaction.category === selectedCategory;
    const matchesType =
      selectedType === "all" || transaction.type === selectedType;

    return matchesSearch && matchesCategory && matchesType;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const handleExport = () => {
    const csvContent = [
      ["Date", "Description", "Category", "Account", "Amount", "Type"],
      ...filteredTransactions.map((t) => [
        format(t.date, "yyyy-MM-dd"),
        t.description,
        t.category,
        t.account,
        Math.abs(t.amount).toFixed(2),
        t.type,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
            <p className="text-muted-foreground">
              Track and manage all your financial transactions with SaveUp.
            </p>
          </div>
          <div className="flex gap-2">
            <CsvUploadModal
              onTransactionsImported={handleTransactionsImported}
            />
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-income">
                +{formatAmount(totalIncome)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-expense">
                -{formatAmount(totalExpenses)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Net Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  totalIncome - totalExpenses >= 0
                    ? "text-income"
                    : "text-expense"
                }`}
              >
                {totalIncome - totalExpenses >= 0 ? "+" : ""}
                {formatAmount(totalIncome - totalExpenses)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Income">Income</SelectItem>
                  <SelectItem value="Groceries">Groceries</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Transportation">Transportation</SelectItem>
                  <SelectItem value="Shopping">Shopping</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Investment">Investment</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {format(transaction.date, "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {transaction.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {transaction.account}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          transaction.type === "income"
                            ? "text-income"
                            : "text-expense"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : ""}
                        {formatAmount(Math.abs(transaction.amount))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
