"use client";
import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  DollarSign,
  TrendingUp,
  Calendar,
  ChevronDown,
} from "lucide-react";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import DatePicker from "@/components/ui/DatePicker";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from "@/hooks/use-toast";

const Transactions = () => {
  const router = useRouter();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [timeFrame, setTimeFrame] = useState("30days");
  const [currentPage, setCurrentPage] = useState(1);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const [transactions, setTransactions] = useState<
    Array<{
      id?: string;
      transactionId: string;
      quoteNumber: string;
      policyHolder?: {
        firstName: string | null;
        lastName: string | null;
      } | null;
      createdAt: string;
      totalPremium: number | null;
      status: string;
      source?: string | null;
      paymentMethod?: string | null;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  const ENTRIES_PER_PAGE = 20;

  // ==================================================================
  // ===== API CHANGE #1: Fetching all transactions/quotes ==========
  // ==================================================================
  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      function generateTransactionId(quoteNum: string): string {
        if (quoteNum && quoteNum.startsWith("Q")) {
          return "T" + quoteNum.substring(1);
        }
        return quoteNum || "N/A";
      }

      try {
        const res = await fetch(`${apiUrl}/quotes?allQuotes=true`, { method: "GET" });
        if (res.ok) {
          const data = await res.json();
          setTransactions(
            (data.quotes || []).map((q: any) => ({
              transactionId: generateTransactionId(q.quoteNumber),
              quoteNumber: q.quoteNumber,
              policyHolder: q.policyHolder,
              createdAt: q.createdAt,
              totalPremium: q.totalPremium,
              status: q.status,
              source: q.source || null,
              paymentMethod:
                q.source === "ADMIN"
                  ? "CASH"
                  : q.Payment && q.Payment.length > 0
                    ? q.Payment[0].method || "-"
                    : "-",
            }))
          );
        } else {
          throw new Error("Failed to fetch transactions.");
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ title: "Error", description: message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
        if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
            setShowExportDropdown(false);
        }
    }
    if (showExportDropdown) {
        document.addEventListener("mousedown", handleClickOutside);
    } else {
        document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
}, [showExportDropdown]);

  // Filter transactions based on date range
  const filteredTransactions = transactions.filter((transaction) => {
    if (!startDate && !endDate) return true;
    const transactionDate = new Date(transaction.createdAt);
    if (startDate && endDate) {
      return transactionDate >= startDate && transactionDate <= endDate;
    }
    if (startDate) {
      return transactionDate >= startDate;
    }
    if (endDate) {
      return transactionDate <= endDate;
    }
    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / ENTRIES_PER_PAGE);
  const startIndex = (currentPage - 1) * ENTRIES_PER_PAGE;
  const endIndex = startIndex + ENTRIES_PER_PAGE;
  const currentTransactionsOnPage = filteredTransactions.slice(
    startIndex,
    endIndex
  );

  // Calculate summary metrics
  const totalSales = filteredTransactions.reduce(
    (sum, transaction) => sum + (transaction.totalPremium || 0),
    0
  );
  const successfulTransactions = filteredTransactions.filter(
    (t) => t.status === "COMPLETE"
  ).length;
  // const failedTransactions = filteredTransactions.filter(
  //   (t) => t.status === "FAILED"
  // ).length;
  // const conversionRate = (
  //   (successfulTransactions /
  //     (successfulTransactions + failedTransactions || 1)) *
  //   100
  // ).toFixed(1);

  // Calculate previous period for dynamic percentage change
  function getPreviousPeriodDates() {
    let prevStart, prevEnd;
    if (startDate && endDate) {
      const diff = endDate.getTime() - startDate.getTime();
      prevEnd = new Date(startDate.getTime() - 1);
      prevStart = new Date(prevEnd.getTime() - diff);
    } else if (timeFrame === "7days") {
      prevEnd = new Date();
      prevEnd.setDate(prevEnd.getDate() - 7);
      prevStart = new Date();
      prevStart.setDate(prevStart.getDate() - 14);
    } else if (timeFrame === "30days") {
      prevEnd = new Date();
      prevEnd.setDate(prevEnd.getDate() - 30);
      prevStart = new Date();
      prevStart.setDate(prevStart.getDate() - 60);
    } else if (timeFrame === "90days") {
      prevEnd = new Date();
      prevEnd.setDate(prevEnd.getDate() - 90);
      prevStart = new Date();
      prevStart.setDate(prevStart.getDate() - 180);
    } else if (timeFrame === "ytd") {
      prevEnd = new Date(new Date().getFullYear(), 0, 1);
      prevStart = new Date(new Date().getFullYear() - 1, 0, 1);
    } else {
      prevEnd = null;
      prevStart = null;
    }
    return { prevStart, prevEnd };
  }
  const { prevStart, prevEnd } = getPreviousPeriodDates();
  const prevTransactions = transactions.filter((transaction) => {
    if (!prevStart || !prevEnd) return false;
    const transactionDate = new Date(transaction.createdAt);
    return transactionDate >= prevStart && transactionDate <= prevEnd;
  });
  const prevTotalSales = prevTransactions
    .filter((t) => t.status === "Completed")
    .reduce((sum, t) => sum + (t.totalPremium || 0), 0);
  const prevSuccessful = prevTransactions.filter(
    (t) => t.status === "Completed"
  ).length;
  // const prevFailed = prevTransactions.filter(
  //   (t) => t.status === "Failed"
  // ).length;
  // const prevConversion = (
  //   (prevSuccessful / (prevSuccessful + prevFailed || 1)) *
  //   100
  // ).toFixed(1);


  // Calculate percentage changes
  function percentChange(current: number, prev: number): string | number {
    if (prev === 0) return current === 0 ? 0 : 100;
    return (((current - prev) / Math.abs(prev)) * 100).toFixed(1);
  }

  interface TransactionPolicyHolder {
    firstName: string | null;
    lastName: string | null;
  }

  interface Transaction {
    id?: string;
    transactionId: string;
    quoteNumber: string;
    policyHolder?: TransactionPolicyHolder | null;
    createdAt: string;
    totalPremium: number | null;
    status: string;
    source?: string | null;
    paymentMethod?: string | null;
  }
  const totalSalesChange = percentChange(totalSales, prevTotalSales);
  const successfulChange = percentChange(
    successfulTransactions,
    prevSuccessful
  );
  // const conversionChange = percentChange(
  //   Number(conversionRate),
  //   Number(prevConversion)
  // );

  const handleExportCSV = () => {
    const headers = [
      "Transaction ID",
      "Quote Number", // Changed from Policy Number
      "Policyholder Name",
      "Date",
      "Amount",
      "Payment Method",
      "Status",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map((transaction) =>
      [
        String(transaction.transactionId).toUpperCase(),
        String(transaction.quoteNumber || "-").toUpperCase(), // Consistently use quoteNumber
        `${(transaction.policyHolder?.firstName || "").toUpperCase()} ${(transaction.policyHolder?.lastName || "").toUpperCase()}`.trim() || "-",
        transaction.createdAt
        ? new Date(transaction.createdAt).toLocaleDateString()
        : "-",
        transaction.totalPremium ?? "-", // Amount
        (transaction.source === "ADMIN" ? "CASH" : transaction.paymentMethod || "-").toUpperCase(), // Payment Method
        String(transaction.status).toUpperCase(),
      ].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions_export.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (filteredTransactions.length === 0) {
      alert("No transactions available to export."); // Consider using a toast notification like in other pages
      return;
    }

    const doc = new jsPDF();
    const tableHeaders = [
      "Transaction ID",
      "Quote Number",
      "Customer",
      "Date",
      "Amount",
      "Payment Method",
      "Status",
    ];

    const allTableRows = filteredTransactions.map((transaction) => [
      String(transaction.transactionId || 'N/A'),
      String(transaction.quoteNumber || 'N/A'),
      String(`${transaction.policyHolder?.firstName || ""} ${transaction.policyHolder?.lastName || ""}`.trim() || "N/A"),
      String(transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : 'N/A'),
      String(transaction.totalPremium !== null && transaction.totalPremium !== undefined ? `$${transaction.totalPremium.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "N/A"),
      String(transaction.source === "ADMIN" ? "CASH" : transaction.paymentMethod || 'N/A'),
      String(transaction.status || 'N/A')
    ]);

    const rowsPerPage = 25;
    const numChunks = Math.ceil(allTableRows.length / rowsPerPage);
    let currentPageNumForFooter = 0;

    for (let i = 0; i < numChunks; i++) {
      currentPageNumForFooter++;
      const startRow = i * rowsPerPage;
      const endRow = startRow + rowsPerPage;
      const chunk = allTableRows.slice(startRow, endRow);

      if (i > 0) {
        doc.addPage();
      }

      autoTable(doc, {
        head: [tableHeaders],
        body: chunk,
        startY: 25,
        didDrawPage: (data) => {
          doc.setFontSize(18);
          doc.setTextColor(40);
          doc.text("Transaction Report", doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
          doc.setFontSize(10);
          doc.text(`Page ${currentPageNumForFooter} of ${numChunks}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
        },
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 9, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 20 }
      });
    }

    doc.save("transactions_export.pdf");
  };

  const handleBack = () => {
    router.push("/admin");
  };

  // Sample chart data for visual representation
  // const chartData = {
  //   labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  //   values: [4200, 5300, 6200, 7800, 9500, 11000],
  // };

  // const renderBarChart = () => {
  //   const maxValue = Math.max(...chartData.values);
  //   return (
  //     <div className="mt-4">
  //       <div className="flex items-end h-40 gap-2">
  //         {chartData.values.map((value, index) => (
  //           <div key={index} className="flex flex-col items-center flex-1">
  //             <div
  //               className="w-full bg-blue-500 rounded-t-sm"
  //               style={{ height: `${(value / maxValue) * 100}%` }}
  //             ></div>
  //             <div className="text-xs mt-2 text-gray-600">
  //               {chartData.labels[index]}
  //             </div>
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   );
  // };

  // Skeleton Components
  const StatCardSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-gray-200 rounded-lg h-10 w-10"></div>
      </div>
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );

  const TransactionRowSkeleton = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
      <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
      <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
      <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
      <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-12"></div></td>
      <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
      <td className="px-6 py-4 whitespace-nowrap"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
    </tr>
  );

  if (loading) {
    return (
      <div className="p-4 sm:p-6 animate-pulse">
        <div className="flex flex-col items-start sm:flex-row sm:items-center mb-6 gap-2 sm:gap-0">
          <div className="h-9 w-48 bg-gray-200 rounded-md"></div> {/* Adjusted width for "Back to Dashboard" */}
          <div className="h-8 w-56 bg-gray-200 rounded-md sm:ml-4"></div>
        </div>
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
          <div className="h-10 w-full sm:w-48 bg-gray-200 rounded-md"></div> {/* Filter select */}
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <div className="h-9 w-full sm:w-32 bg-gray-200 rounded-md"></div> {/* Export button */}
            <div className="h-9 w-full sm:w-32 bg-gray-200 rounded-md"></div> {/* Export button */}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <Card title="" icon={<div className="h-5 w-5 bg-gray-200 rounded-full"></div>}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  {[...Array(7)].map((_, i) => (
                    <th key={i} className="px-6 py-3 text-left"><div className="h-4 bg-gray-300 rounded w-16 sm:w-20"></div></th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...Array(5)].map((_, i) => <TransactionRowSkeleton key={i} />)}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col items-start sm:flex-row sm:items-center mb-6 gap-2 sm:gap-0">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          className="w-full sm:w-auto"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 sm:ml-4 mt-2 sm:mt-0">
          Transaction Summary
        </h1>
      </div>
      {/* Filters and Export Buttons */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-48">
            <select
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value)}
              className="block w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-8 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[
                { value: "7days", label: "Last 7 Days" },
                { value: "30days", label: "Last 30 Days" },
                { value: "90days", label: "Last 90 Days" },
                { value: "custom", label: "Custom Range" },
              ].map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
          </div>

          {timeFrame === "custom" && (
            <div className="mt-2 sm:mt-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <DatePicker
                selected={startDate}
                onChange={setStartDate}
                placeholderText="Start date"
                className="w-full sm:w-36"
              />
              <span className="text-gray-500 px-1 text-center sm:px-0">to</span>
              <DatePicker
                selected={endDate}
                onChange={setEndDate}
                placeholderText="End date"
                className="w-full sm:w-36"
              />
            </div>
          )}
        </div>
        <div className="relative w-full lg:w-auto" ref={exportDropdownRef}>
            <Button
                variant="outline"
                onClick={() => setShowExportDropdown(prev => !prev)}
                className="w-full sm:w-auto"
            >
                <Download size={18} className="mr-2" />
                Export
            </Button>
            {showExportDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                    <Button variant="ghost" onClick={() => { handleExportCSV(); setShowExportDropdown(false); }} className="w-full justify-start px-4 py-2 text-left text-gray-700 hover:bg-gray-100">
                        <Download size={16} className="mr-2" />
                        Export CSV
                    </Button>
                    <Button variant="ghost" onClick={() => { handleExportPDF(); setShowExportDropdown(false); }} className="w-full justify-start px-4 py-2 text-left text-gray-700 hover:bg-gray-100">
                        <Download size={16} className="mr-2" />
                        Export PDF
                    </Button>
                </div>
            )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card title="Total Revenue" icon={<DollarSign size={18} />}>
          <div className="mt-2">
            <div className="text-3xl font-bold text-gray-900">
              ${totalSales.toLocaleString()}
            </div>
            <div className="text-sm text-green-600 mt-1 flex items-center">
              <TrendingUp size={16} className="mr-1" />
              <span>
                {Number(totalSalesChange) > 0 ? "+" : "-"}
                {totalSalesChange}% from previous period
              </span>
            </div>
          </div>
        </Card>
        <Card title="Completed Transactions" icon={<DollarSign size={18}/>}>
          <div className="mt-2">
            <div className="text-3xl font-bold text-gray-900">
              {successfulTransactions}
            </div>
            <div className="text-sm text-green-600 mt-1 flex items-center">
              <TrendingUp size={16} className="mr-1" />
              <span>
                {Number(successfulChange) > 0 ? "+" : "-"}
                {successfulChange}% from previous period
              </span>
            </div>
          </div>
        </Card>
        {/* <Card title="Conversion Rate" icon={<TrendingUp size={18} sm:size={20} />}>
          <div className="mt-2">
            <div className="text-3xl font-bold text-gray-900">
              {conversionRate}%
            </div>
            <div className="text-sm text-green-600 mt-1 flex items-center">
              <TrendingUp size={16} className="mr-1" />
              <span>
                {conversionChange > 0 ? "+" : ""}
                {conversionChange}% from previous period
              </span>
            </div>
          </div>
        </Card> */}
      </div>

      <Card title="Recent Transactions" icon={<Calendar size={18}/>}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quote Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentTransactionsOnPage.map((transaction, idx) => (
                <tr
                  key={transaction.quoteNumber + idx}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transaction.transactionId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transaction.quoteNumber || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {`${transaction.policyHolder?.firstName || ""} ${transaction.policyHolder?.lastName || ""
                      }`.trim() || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transaction.createdAt
                      ? new Date(transaction.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${transaction.totalPremium ?? "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap uppercase">
                    {transaction.source === "ADMIN" ? "CASH" : transaction.paymentMethod || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${transaction.status === "COMPLETE"
                        ? "bg-green-100 text-green-800"
                        : transaction.status === "FAILED"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                        }`}
                    >
                      {transaction.status || "-"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination Info and Controls */}
        <div className="mt-6 flex flex-col items-center sm:flex-row sm:justify-between gap-4 border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-700 text-center sm:text-left">
            Showing <span className="font-medium">{Math.min(endIndex, filteredTransactions.length)}</span> of <span className="font-medium">{filteredTransactions.length}</span> transactions
          </p>
          
          {totalPages > 0 && (
            <div className="flex items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-3 py-1 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Next
              </Button>
            </div>
          )}
        </div>
        {filteredTransactions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No transactions found for the selected criteria.
          </div>
        )}
      </Card>
    </div>
  );
};

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Transactions />
    </Suspense>
  );
}
