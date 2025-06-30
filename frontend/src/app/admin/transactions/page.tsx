'use client';
import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, DollarSign, TrendingUp, Calendar, ChevronDown } from 'lucide-react';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import DatePicker from '@/components/ui/DatePicker';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from '@/hooks/use-toast';

// Helper function for generating transaction IDs, moved outside the component
function generateTransactionIdFromQuoteNumber(quoteNum: string | null | undefined): string {
  if (typeof quoteNum === 'string' && quoteNum.startsWith('Q')) {
    const lastSegment = quoteNum.split('-').pop() || ''; // Ensure lastSegment is a string
    return 'T-' + lastSegment;
  }
  return String(quoteNum || 'N/A');
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
  convertedToPolicy?: boolean;
  policy?: boolean;
}

const Transactions = () => {
  const router = useRouter();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [timeFrame, setTimeFrame] = useState('30days');
  const [currentPage, setCurrentPage] = useState(1);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const ENTRIES_PER_PAGE = 20;

  // ==================================================================
  // ===== API CHANGE #1: Fetching all transactions/quotes ==========
  // ==================================================================
  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      try {
        // Fetch policies directly instead of quotes
        const res = await fetch(`${apiUrl}/policies`, { method: 'GET' });
        if (res.ok) {
          const data = await res.json();

          // Debug: Log the raw data to see what we're getting
          console.log('Raw policies data:', data.policies);

          // Map policies to transactions format
          const mappedTransactions = (data.policies || []).map((p: Record<string, unknown>) => {
            const quote = p.quote as Record<string, unknown>;

            // Get payment method from policy payments first, then fall back to quote payments
            let paymentMethod = '-';
            if (Array.isArray(p.payments) && p.payments.length > 0) {
              // Policy has payments - use the first one
              paymentMethod = String((p.payments[0] as { method?: string }).method || 'online');
            } else if (Array.isArray(quote?.payments) && quote.payments.length > 0) {
              // Fall back to quote payments if policy doesn't have payments
              paymentMethod = String((quote.payments[0] as { method?: string }).method || '-');
            } else if (quote?.source === 'ADMIN') {
              // Admin quotes default to CASH
              paymentMethod = 'CASH';
            }

            const transaction = {
              transactionId: generateTransactionIdFromQuoteNumber(quote?.quoteNumber as string),
              quoteNumber: String(quote?.quoteNumber || 'N/A'),
              policyHolder: quote?.policyHolder as TransactionPolicyHolder,
              createdAt: String(quote?.createdAt || ''),
              totalPremium:
                quote?.totalPremium !== undefined && quote?.totalPremium !== null
                  ? Number(quote.totalPremium)
                  : null,
              status: String(quote?.status || 'N/A'),
              source: quote?.source ? String(quote.source) : null,
              paymentMethod: paymentMethod,
              convertedToPolicy: true, // If we have a policy, it's definitely converted
              policy: true, // If we have a policy, it's definitely true
            };

            // Debug: Log each transaction to see the policy flags
            console.log(`Policy for quote ${transaction.quoteNumber}:`, {
              status: transaction.status,
              convertedToPolicy: transaction.convertedToPolicy,
              policy: transaction.policy,
              policyNumber: p.policyNumber,
              paymentMethod: transaction.paymentMethod,
              hasPolicyPayments: Array.isArray(p.payments) && p.payments.length > 0,
              hasQuotePayments: Array.isArray(quote?.payments) && quote.payments.length > 0,
              source: transaction.source,
            });

            return transaction;
          });

          setTransactions(mappedTransactions);
        } else {
          throw new Error('Failed to fetch policies.');
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        toast({ title: 'Error', description: message, variant: 'destructive' });
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
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportDropdown]);

  // Set default date range based on timeFrame
  useEffect(() => {
    const now = new Date();
    let start: Date, end: Date;

    switch (timeFrame) {
      case '7days':
        end = new Date(now);
        start = new Date(now);
        start.setDate(start.getDate() - 7);
        break;
      case '30days':
        end = new Date(now);
        start = new Date(now);
        start.setDate(start.getDate() - 30);
        break;
      case '90days':
        end = new Date(now);
        start = new Date(now);
        start.setDate(start.getDate() - 90);
        break;
      case 'ytd':
        end = new Date(now);
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        end = new Date(now);
        start = new Date(now);
        start.setDate(start.getDate() - 30);
    }

    setStartDate(start);
    setEndDate(end);
  }, [timeFrame]);

  // Filter transactions based on date range and COMPLETE status only
  const filteredTransactions = transactions.filter((transaction) => {
    // Date filter
    let dateFilter = true;
    if (startDate && endDate) {
      const transactionDate = new Date(transaction.createdAt);
      // Set time to start of day for startDate and end of day for endDate
      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);

      dateFilter = transactionDate >= startOfDay && transactionDate <= endOfDay;
    }

    // Only show COMPLETE transactions (since we're fetching policies directly, all have policies)
    const statusFilter = transaction.status === 'COMPLETE';

    // Debug: Log filtering decisions
    if (transaction.status === 'COMPLETE') {
      console.log(`Filtering policy for quote ${transaction.quoteNumber}:`, {
        statusFilter,
        dateFilter,
        willShow: dateFilter && statusFilter,
      });
    }

    return dateFilter && statusFilter;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / ENTRIES_PER_PAGE);
  const startIndex = (currentPage - 1) * ENTRIES_PER_PAGE;
  const endIndex = startIndex + ENTRIES_PER_PAGE;
  const currentTransactionsOnPage = filteredTransactions.slice(startIndex, endIndex);

  // Calculate summary metrics
  const totalSales = filteredTransactions.reduce(
    (sum, transaction) => sum + (transaction.totalPremium || 0),
    0,
  );
  const successfulTransactions = filteredTransactions.length; // All filtered transactions are COMPLETE
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
    } else {
      // Fallback to default 30 days if no dates are set
      const now = new Date();
      prevEnd = new Date(now);
      prevEnd.setDate(prevEnd.getDate() - 30);
      prevStart = new Date(now);
      prevStart.setDate(prevStart.getDate() - 60);
    }
    return { prevStart, prevEnd };
  }
  const { prevStart, prevEnd } = getPreviousPeriodDates();
  const prevTransactions = transactions.filter((transaction) => {
    if (!prevStart || !prevEnd) return false;
    const transactionDate = new Date(transaction.createdAt);
    // Set time to start of day for prevStart and end of day for prevEnd
    const startOfDay = new Date(prevStart);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(prevEnd);
    endOfDay.setHours(23, 59, 59, 999);

    // Only include COMPLETE transactions in previous period (since we're fetching policies directly)
    const statusFilter = transaction.status === 'COMPLETE';

    return transactionDate >= startOfDay && transactionDate <= endOfDay && statusFilter;
  });
  const prevTotalSales = prevTransactions.reduce((sum, t) => sum + (t.totalPremium || 0), 0);
  const prevSuccessful = prevTransactions.length; // All prevTransactions are COMPLETE
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

  const totalSalesChange = percentChange(totalSales, prevTotalSales);
  const successfulChange = percentChange(successfulTransactions, prevSuccessful);
  // const conversionChange = percentChange(
  //   Number(conversionRate),
  //   Number(prevConversion)
  // );

  const handleExportCSV = () => {
    const headers = [
      'Transaction ID',
      'Quote Number', // Changed from Policy Number
      'Policyholder Name',
      'Date',
      'Amount',
      'Payment Method',
      'Status',
    ];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map((transaction) =>
        [
          String(transaction.transactionId).toUpperCase(),
          String(transaction.quoteNumber || '-').toUpperCase(), // Consistently use quoteNumber
          `${(transaction.policyHolder?.firstName || '').toUpperCase()} ${(transaction.policyHolder?.lastName || '').toUpperCase()}`.trim() ||
            '-',
          transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : '-',
          transaction.totalPremium ?? '-', // Amount
          (transaction.source === 'ADMIN' ? 'Offline' : 'Online').toUpperCase(), // Payment Method
          String(transaction.status).toUpperCase(),
        ].join(','),
      ),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions_export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (filteredTransactions.length === 0) {
      alert('No transactions available to export.'); // Consider using a toast notification like in other pages
      return;
    }

    const doc = new jsPDF();
    const tableHeaders = [
      'Transaction ID',
      'Quote Number',
      'Customer',
      'Date',
      'Amount',
      'Payment Method',
      'Status',
    ];

    const allTableRows = filteredTransactions.map((transaction) => [
      String(transaction.transactionId || 'N/A'),
      String(transaction.quoteNumber || 'N/A'),
      String(
        `${transaction.policyHolder?.firstName || ''} ${transaction.policyHolder?.lastName || ''}`.trim() ||
          'N/A',
      ),
      String(transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : 'N/A'),
      String(
        transaction.totalPremium !== null && transaction.totalPremium !== undefined
          ? `$${transaction.totalPremium.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : 'N/A',
      ),
      String(transaction.source === 'ADMIN' ? 'Offline' : 'Online'),
      String(transaction.status || 'N/A'),
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
        didDrawPage: () => {
          // removed "data" variable
          doc.setFontSize(18);
          doc.setTextColor(40);
          doc.text('Transaction Report', doc.internal.pageSize.getWidth() / 2, 15, {
            align: 'center',
          });
          doc.setFontSize(10);
          doc.text(
            `Page ${currentPageNumForFooter} of ${numChunks}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' },
          );
        },
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 9, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 20 },
      });
    }

    doc.save('transactions_export.pdf');
  };

  const handleBack = () => {
    router.push('/admin');
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
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-12"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="p-4 sm:p-6 animate-pulse">
        <div className="flex flex-col items-start sm:flex-row sm:items-center mb-6 gap-2 sm:gap-0">
          <div className="h-9 w-48 bg-gray-200 rounded-md"></div>{' '}
          {/* Adjusted width for "Back to Dashboard" */}
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
                    <th key={i} className="px-6 py-3 text-left">
                      <div className="h-4 bg-gray-300 rounded w-16 sm:w-20"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...Array(5)].map((_, i) => (
                  <TransactionRowSkeleton key={i} />
                ))}
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
          onMouseEnter={() => router.prefetch('/admin')}
          className="w-full sm:w-auto text-gray-800"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 sm:ml-4 mt-2 sm:mt-0">
          Transaction Summary
        </h1>
      </div>
      {/* Filters and Export Buttons */}
      <div className="flex flex-col lg:flex-row text-gray-800 lg:justify-between lg:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-48">
            <select
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value)}
              className="block w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-8 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[
                { value: '7days', label: 'Last 7 Days' },
                { value: '30days', label: 'Last 30 Days' },
                { value: '90days', label: 'Last 90 Days' },
                { value: 'custom', label: 'Custom Range' },
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

          {timeFrame === 'custom' && (
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
            onClick={() => setShowExportDropdown((prev) => !prev)}
            className="w-full sm:w-auto"
          >
            <Download size={18} className="mr-2" />
            Export
          </Button>
          {showExportDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
              <Button
                variant="ghost"
                onClick={() => {
                  handleExportCSV();
                  setShowExportDropdown(false);
                }}
                className="w-full justify-start px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
              >
                <Download size={16} className="mr-2" />
                Export CSV
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  handleExportPDF();
                  setShowExportDropdown(false);
                }}
                className="w-full justify-start px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
              >
                <Download size={16} className="mr-2" />
                Export PDF
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card title="Total Revenue" className="text-gray-800" icon={<DollarSign size={18} />}>
          <div className="mt-2">
            <div className="text-3xl font-bold text-gray-900">${totalSales.toLocaleString()}</div>
            <div className="text-sm text-green-600 mt-1 flex items-center">
              <TrendingUp size={16} className="mr-1" />
              <span>
                {Number(totalSalesChange) > 0 ? '+' : '-'}
                {totalSalesChange}% from previous period
              </span>
            </div>
          </div>
        </Card>
        <Card
          title="Completed Transactions"
          className="text-gray-800"
          icon={<DollarSign size={18} />}
        >
          <div className="mt-2">
            <div className="text-3xl font-bold text-gray-900">{successfulTransactions}</div>
            <div className="text-sm text-green-600 mt-1 flex items-center">
              <TrendingUp size={16} className="mr-1" />
              <span>
                {Number(successfulChange) > 0 ? '+' : '-'}
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

      <Card title="Completed Transactions" className="text-gray-800" icon={<Calendar size={18} />}>
        <div className="overflow-x-auto">
          <table className="w-full text-gray-800">
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
                <tr key={transaction.quoteNumber + idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{transaction.transactionId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{transaction.quoteNumber || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {`${transaction.policyHolder?.firstName || ''} ${
                      transaction.policyHolder?.lastName || ''
                    }`.trim() || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transaction.createdAt
                      ? new Date(transaction.createdAt).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${transaction.totalPremium ?? '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap uppercase">
                    {transaction.source === 'ADMIN' ? 'Offline' : 'Online'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {transaction.status || '-'}
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
            Showing{' '}
            <span className="font-medium">{Math.min(endIndex, filteredTransactions.length)}</span>{' '}
            of <span className="font-medium">{filteredTransactions.length}</span> completed
            transactions
          </p>

          {totalPages > 0 && (
            <div className="flex items-center justify-center text-gray-600 sm:justify-end gap-2 w-full sm:w-auto">
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
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Next
              </Button>
            </div>
          )}
        </div>
        {filteredTransactions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No completed transactions found for the selected criteria.
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
