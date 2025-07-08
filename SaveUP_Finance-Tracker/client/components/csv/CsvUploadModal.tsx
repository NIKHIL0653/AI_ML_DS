import { useState, useRef } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  CheckCircle,
  X,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useCurrency } from "@/components/currency/CurrencyProvider";

interface CsvUploadModalProps {
  trigger?: React.ReactNode;
  onTransactionsImported?: (transactions: any[]) => void;
}

interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  type: "credit" | "debit";
  balance?: number;
}

export default function CsvUploadModal({
  trigger,
  onTransactionsImported,
}: CsvUploadModalProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedTransaction[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { formatAmount } = useCurrency();

  const defaultTrigger = (
    <Button variant="outline">
      <Upload className="h-4 w-4 mr-2" />
      Import CSV
    </Button>
  );

  const parseCSV = (text: string): ParsedTransaction[] => {
    const lines = text.trim().split("\n");
    const transactions: ParsedTransaction[] = [];

    // Skip header row (first line)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Parse CSV line (handling quoted fields and commas within quotes)
      const fields: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          fields.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      fields.push(current.trim()); // Add the last field

      const cleanFields = fields.map((field) =>
        field.replace(/^"|"$/g, "").trim(),
      );

      if (cleanFields.length < 3) continue;

      let date = cleanFields[0];
      let description = cleanFields[1];
      let amount = 0;
      let type: "credit" | "debit" = "debit";
      let balance: number | undefined;

      // Improved amount parsing function
      const parseAmount = (value: string): number => {
        if (!value) return 0;

        // Remove currency symbols, spaces, and common formatting
        let cleanValue = value
          .replace(/[$£€¥₹,\s]/g, "") // Remove currency symbols and commas
          .replace(/[()]/g, "") // Remove parentheses
          .trim();

        // Handle negative indicators
        const isNegative =
          value.includes("(") ||
          value.includes("-") ||
          cleanValue.startsWith("-");
        cleanValue = cleanValue.replace(/^-/, "");

        const parsed = parseFloat(cleanValue);
        return isNaN(parsed) ? 0 : isNegative ? -parsed : parsed;
      };

      // Detect different CSV formats based on column count and content
      if (cleanFields.length >= 7) {
        // Indian bank format: Date, Narration, Chq/Ref No, Value Date, Withdrawal, Deposit, Balance
        const withdrawalAmount = parseAmount(cleanFields[4]); // Column 5 (index 4) - Withdrawal Amt
        const depositAmount = parseAmount(cleanFields[5]); // Column 6 (index 5) - Deposit Amt
        const balanceAmount = parseAmount(cleanFields[6]); // Column 7 (index 6) - Closing Balance

        // Skip if both withdrawal and deposit are zero (likely header or invalid row)
        if (withdrawalAmount === 0 && depositAmount === 0) {
          continue; // Skip this row
        }

        if (withdrawalAmount > 0 && depositAmount === 0) {
          // This is a withdrawal (debit)
          amount = withdrawalAmount;
          type = "debit";
        } else if (depositAmount > 0 && withdrawalAmount === 0) {
          // This is a deposit (credit)
          amount = depositAmount;
          type = "credit";
        } else if (withdrawalAmount > 0 && depositAmount > 0) {
          // Both have values - treat as net transaction
          // Most Indian banks don't have both in same row, but handle just in case
          amount = Math.max(withdrawalAmount, depositAmount);
          type = withdrawalAmount > depositAmount ? "debit" : "credit";
        } else {
          // Neither has a value, skip this row
          continue;
        }

        if (balanceAmount > 0) {
          balance = balanceAmount;
        }
      } else if (cleanFields.length >= 5) {
        // 5+ column format: might be Date, Description, Reference, Debit, Credit, [Balance]
        const field3 = parseAmount(cleanFields[2]);
        const field4 = parseAmount(cleanFields[3]);
        const field5 = parseAmount(cleanFields[4]);

        // Check if field 3 looks like a reference number (very large number, no decimals)
        const field3IsReference =
          !isNaN(field3) && field3 > 1000000 && field3 % 1 === 0;

        if (field3IsReference) {
          // Skip field 3 (reference), use fields 4 and 5 as debit/credit
          if (field4 > 0 && field5 === 0) {
            amount = field4;
            type = "debit";
          } else if (field5 > 0 && field4 === 0) {
            amount = field5;
            type = "credit";
          }
        } else {
          // Standard 5-column: Date, Description, Debit, Credit, Balance
          if (field3 > 0 && field4 === 0) {
            amount = field3;
            type = "debit";
          } else if (field4 > 0 && field3 === 0) {
            amount = field4;
            type = "credit";
          }
        }

        // Try to find balance in the last column
        if (cleanFields.length > 5) {
          balance = parseAmount(cleanFields[cleanFields.length - 1]);
        }
      } else if (cleanFields.length === 4) {
        // 4-column format: Date, Description, Amount, Balance OR Date, Description, Debit, Credit
        const field3 = parseAmount(cleanFields[2]);
        const field4 = parseAmount(cleanFields[3]);

        // Check if field 4 looks like a balance (larger number) vs amount
        if (Math.abs(field4) > Math.abs(field3) * 2) {
          // field 4 is likely balance, field 3 is amount
          amount = Math.abs(field3);
          type = field3 < 0 ? "debit" : "credit";
          balance = field4;
        } else {
          // Both are amounts - debit/credit columns
          if (field3 > 0 && field4 === 0) {
            amount = field3;
            type = "debit";
          } else if (field4 > 0 && field3 === 0) {
            amount = field4;
            type = "credit";
          }
        }
      } else if (cleanFields.length === 3) {
        // Simple 3-column format: Date, Description, Amount
        const amountValue = parseAmount(cleanFields[2]);
        amount = Math.abs(amountValue);
        type = amountValue < 0 ? "debit" : "credit";
      }

      // Improved date parsing
      let finalDate = date;
      const parsedDate = new Date(date);

      if (isNaN(parsedDate.getTime())) {
        // Try different date formats
        const dateParts = date.split(/[-/.]/);
        if (dateParts.length === 3) {
          let year = parseInt(dateParts[2]);
          let month = parseInt(dateParts[1]);
          let day = parseInt(dateParts[0]);

          // Handle 2-digit years
          if (year < 100) {
            year += year < 50 ? 2000 : 1900;
          }

          // Try DD/MM/YYYY format first, then MM/DD/YYYY
          if (month <= 12 && day <= 31) {
            const testDate = new Date(year, month - 1, day);
            if (!isNaN(testDate.getTime())) {
              finalDate = testDate.toISOString().split("T")[0];
            }
          }
        }
      } else {
        finalDate = parsedDate.toISOString().split("T")[0];
      }

      // Only add transaction if it has a valid amount
      if (amount > 0) {
        transactions.push({
          date: finalDate,
          description: description || `Transaction ${i}`,
          amount,
          type,
          balance,
        });
      }
    }

    return transactions;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setError("");
    } else {
      setError("Please select a valid CSV file");
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const text = await file.text();
      const transactions = parseCSV(text);

      if (transactions.length === 0) {
        setError("No valid transactions found in the CSV file");
        return;
      }

      setParsedData(transactions);
    } catch (err) {
      setError("Error parsing CSV file. Please check the format.");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = () => {
    if (parsedData.length === 0) return;

    // Convert to app transaction format
    const appTransactions = parsedData.map((transaction, index) => ({
      id: `imported-${Date.now()}-${index}`,
      date: new Date(transaction.date),
      description: transaction.description,
      amount:
        transaction.type === "debit" ? -transaction.amount : transaction.amount,
      category: guessCategory(transaction.description),
      type: transaction.type === "debit" ? "expense" : "income",
      account: "Imported",
    }));

    if (onTransactionsImported) {
      onTransactionsImported(appTransactions);
    }

    // Show success message
    toast({
      title: "Transactions Imported Successfully!",
      description: `${parsedData.length} transactions have been added to your account.`,
    });

    // Reset state and close modal
    setFile(null);
    setParsedData([]);
    setError("");
    setOpen(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Simple category guessing based on description keywords
  const guessCategory = (description: string): string => {
    const desc = description.toLowerCase();

    if (
      desc.includes("grocery") ||
      desc.includes("supermarket") ||
      desc.includes("food")
    )
      return "Food & Dining";
    if (
      desc.includes("gas") ||
      desc.includes("fuel") ||
      desc.includes("uber") ||
      desc.includes("taxi")
    )
      return "Transportation";
    if (
      desc.includes("netflix") ||
      desc.includes("spotify") ||
      desc.includes("movie")
    )
      return "Entertainment";
    if (
      desc.includes("salary") ||
      desc.includes("payroll") ||
      desc.includes("wage")
    )
      return "Income";
    if (
      desc.includes("electric") ||
      desc.includes("water") ||
      desc.includes("internet")
    )
      return "Utilities";
    if (
      desc.includes("amazon") ||
      desc.includes("shop") ||
      desc.includes("store")
    )
      return "Shopping";
    if (
      desc.includes("hospital") ||
      desc.includes("medical") ||
      desc.includes("pharmacy")
    )
      return "Healthcare";

    return "Other";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Bank Statement CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!parsedData.length && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-3">
                <p>
                  Upload a CSV file from your bank to automatically import and
                  analyze your transactions.
                </p>

                <div>
                  <p className="font-medium mb-2">✅ Supported CSV formats:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>
                      <code>Date, Description, Amount</code>
                    </li>
                    <li>
                      <code>Date, Description, Debit, Credit</code>
                    </li>
                    <li>
                      <code>Date, Description, Amount, Balance</code>
                    </li>
                    <li>
                      <code>
                        Date, Narration, Ref No, Value Date, Withdrawal,
                        Deposit, Balance
                      </code>{" "}
                      (Indian banks)
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="font-medium mb-2">💡 Tips for best results:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Download CSV from your bank's website</li>
                    <li>Include headers in the first row</li>
                    <li>Amounts can include currency symbols ($ £ € ₹)</li>
                    <li>Negative amounts or parentheses indicate debits</li>
                    <li>Dates in DD/MM/YYYY or MM/DD/YYYY format work best</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="csvFile">CSV File</Label>
                <Input
                  ref={fileInputRef}
                  id="csvFile"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={!file || loading}>
                  {loading ? "Parsing..." : "Parse CSV"}
                </Button>
              </div>
            </div>
          )}

          {parsedData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">
                    Found {parsedData.length} transactions
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setParsedData([]);
                    setFile(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="rounded-md border max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.map((transaction, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-sm">
                          {transaction.date}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {transaction.description}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              transaction.type === "credit"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              transaction.type === "credit"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }
                          >
                            {transaction.type === "credit" ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            transaction.type === "credit"
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {formatAmount(transaction.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setParsedData([])}>
                  Back
                </Button>
                <Button onClick={handleImport}>
                  Import {parsedData.length} Transactions
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
