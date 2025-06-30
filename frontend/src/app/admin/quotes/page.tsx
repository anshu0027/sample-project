/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Download,
  Clock,
  Eye,
  PlusCircle,
  Trash2,
  FileCheck,
  ChevronDown,
  Copy,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import DatePicker from '@/components/ui/DatePicker';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '@clerk/nextjs';
import { toast } from '@/hooks/use-toast';

interface QuoteList {
  isCustomerGenerated: boolean | undefined;
  id: number;
  quoteNumber: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  eventType?: string | null;
  eventDate?: string | null;
  totalPremium?: number | null;
  status?: string | null;
  coverageLevel?: number | null;
  policyHolderName?: string | null;
  customer?: string;
  source?: string;
  convertedToPolicy?: boolean;
  policy?: boolean;
}

export default function Quotes() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSignedIn, isLoaded, getToken } = useAuth();

  // Initialize search term from URL
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [quotes, setQuotes] = useState<QuoteList[]>([]);
  const [exportType, setExportType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 15;
  const [totalQuotes, setTotalQuotes] = useState(0);
  const isFilteredRef = useRef(false);
  const [isSearchPerformed, setIsSearchPerformed] = useState(false);

  interface RawQuote {
    id: number;
    quoteNumber: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    event?: {
      eventType?: string | null;
      eventDate?: string | null;
    };
    totalPremium?: number | null;
    status?: string | null;
    coverageLevel?: number | null;
    policyHolder?: {
      firstName?: string | null;
      lastName?: string | null;
    };
    customer?: string;
    source?: string;
    convertedToPolicy?: boolean;
    policy?: boolean;
    [key: string]: unknown;
  }

  const processQuotesData = useCallback((rawData: RawQuote[]): QuoteList[] => {
    return (rawData || []).map((q: RawQuote) => {
      const { event, policyHolder, ...baseQuote } = q;

      return {
        ...baseQuote,
        customer: policyHolder
          ? `${policyHolder.firstName || ''} ${policyHolder.lastName || ''}`.trim()
          : '',
        eventType: event?.eventType || '',
        eventDate: event?.eventDate || '',
        isCustomerGenerated: q.source === 'CUSTOMER',
        policy: q.policy || false,
      };
    });
  }, []);

  // ==================================================================
  // ===== API CHANGE #1: Fetching quotes with smart pagination ======
  // ==================================================================
  const fetchQuotes = useCallback(
    async (page: number = 1, pageSize: number = 15, allQuotes: boolean = false) => {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      try {
        const token = await getToken();
        const queryParams = allQuotes ? '?allQuotes=true' : `?page=${page}&pageSize=${pageSize}`;
        const res = await fetch(`${apiUrl}/quotes${queryParams}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (allQuotes) {
            setQuotes(processQuotesData(data.quotes || []));
            setTotalQuotes(data.quotes?.length || 0);
          } else {
            setQuotes(processQuotesData(data.quotes || []));
            setTotalQuotes(data.total || 0);
          }
        } else {
          throw new Error('Failed to fetch quotes.');
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        toast({ title: 'Error', description: message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    },
    [getToken, processQuotesData],
  );

  // Search handler to ensure smooth typing experience
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  // Search button handler
  const handleSearch = useCallback(() => {
    if (!isLoaded || !isSignedIn) return;

    const hasFilters = searchTerm.trim() || statusFilter || startDate || endDate;

    if (hasFilters && !isFilteredRef.current) {
      // Switching to filtered mode - fetch all quotes
      isFilteredRef.current = true;
      setIsSearchPerformed(true);
      fetchQuotes(1, 15, true); // Fetch all quotes for client-side filtering
    } else if (!hasFilters && isFilteredRef.current) {
      // Switching back to unfiltered mode - fetch current page
      isFilteredRef.current = false;
      setIsSearchPerformed(false);
      fetchQuotes(currentPage, itemsPerPage, false); // Use server-side pagination
    }
  }, [
    searchTerm,
    statusFilter,
    startDate,
    endDate,
    fetchQuotes,
    isLoaded,
    isSignedIn,
    currentPage,
    itemsPerPage,
  ]);

  // Handle Enter key press
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch();
      }
    },
    [handleSearch],
  );

  // Update URL when search term changes (but don't trigger API call)
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [searchTerm, searchParams]);

  // Auto-fetch all quotes when filters are applied
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const hasFilters = searchTerm.trim() || statusFilter || startDate || endDate;

    if (hasFilters && !isFilteredRef.current) {
      // Switching to filtered mode - fetch all quotes
      isFilteredRef.current = true;
      setIsSearchPerformed(true);
      fetchQuotes(1, 15, true); // Fetch all quotes for client-side filtering
    } else if (!hasFilters && isFilteredRef.current) {
      // Switching back to unfiltered mode - fetch current page
      isFilteredRef.current = false;
      setIsSearchPerformed(false);
      fetchQuotes(currentPage, itemsPerPage, false); // Use server-side pagination
    }
  }, [
    searchTerm,
    statusFilter,
    startDate,
    endDate,
    fetchQuotes,
    isLoaded,
    isSignedIn,
    currentPage,
    itemsPerPage,
  ]);

  useEffect(() => {
    // Check authentication first
    if (isLoaded && !isSignedIn) {
      router.replace('/admin/login');
      return;
    }

    // Initial load or pagination change - use server-side pagination
    fetchQuotes(currentPage, itemsPerPage, false);
  }, [fetchQuotes, isLoaded, isSignedIn, router, currentPage, itemsPerPage]);

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

  // ==================================================================
  // ===== CLIENT-SIDE FILTERING: For filtered results ===============
  // ==================================================================
  const filteredQuotes = useMemo(() => {
    // Check if we have any active filters
    const hasFilters = searchTerm.trim() || statusFilter || startDate || endDate;

    if (!hasFilters) {
      // No filters active, return quotes as-is (they're already paginated from server)
      return quotes;
    }

    // Apply client-side filtering when filters are active
    const lowerSearchTerm = searchTerm.toLowerCase();
    return quotes.filter((quote) => {
      const quoteId = (quote.quoteNumber || String(quote.id) || '').toLowerCase();
      const customerName = (
        quote.customer || `${quote.firstName || ''} ${quote.lastName || ''}`
      ).toLowerCase();
      const email = (quote.email || '').toLowerCase();

      const matchesSearch =
        quoteId.includes(lowerSearchTerm) ||
        customerName.includes(lowerSearchTerm) ||
        email.includes(lowerSearchTerm);

      const matchesStatus = (() => {
        if (!statusFilter) return true;
        if (statusFilter === 'Pending') {
          return ['Pending', 'STEP1', 'STEP2', 'STEP3'].includes(quote.status || '');
        }
        if (statusFilter === 'Converted') {
          return quote.convertedToPolicy === true || quote.status === 'Converted' || quote.policy;
        }
        return quote.status === statusFilter;
      })();

      const matchesDateRange = (() => {
        if (!startDate && !endDate) return true;
        if (!quote.eventDate) return false;
        const eventDate = new Date(quote.eventDate);
        if (startDate && endDate) return eventDate >= startDate && eventDate <= endDate;
        if (startDate) return eventDate >= startDate;
        return endDate ? eventDate <= endDate : true;
      })();
      return matchesSearch && matchesStatus && matchesDateRange;
    });
  }, [quotes, searchTerm, statusFilter, startDate, endDate]);

  // ==================================================================
  // ===== PAGINATION: Handle both server and client pagination ======
  // ==================================================================
  const hasFilters = searchTerm.trim() || statusFilter || startDate || endDate;
  const totalPages = hasFilters
    ? Math.ceil(filteredQuotes.length / itemsPerPage)
    : Math.ceil(totalQuotes / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentQuotes = hasFilters ? filteredQuotes.slice(startIndex, endIndex) : quotes; // For server pagination, quotes are already the current page

  // Reset to page 1 when filters change
  useEffect(() => {
    if (hasFilters) {
      setCurrentPage(1);
    }
  }, [searchTerm, statusFilter, startDate, endDate, hasFilters]);

  const now = useMemo(() => new Date(), []);

  const filteredForExport = useMemo(() => {
    if (exportType === 'all') return filteredQuotes;
    if (exportType === 'monthly') {
      return filteredQuotes.filter((q) => {
        if (!q.eventDate) return false;
        const d = new Date(q.eventDate);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      });
    }
    if (exportType === 'yearly') {
      return filteredQuotes.filter((q) => {
        if (!q.eventDate) return false;
        const d = new Date(q.eventDate);
        return d.getFullYear() === now.getFullYear();
      });
    }
    if (exportType === 'weekly') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return filteredQuotes.filter((q) => {
        if (!q.eventDate) return false;
        const d = new Date(q.eventDate);
        return d >= startOfWeek && d <= endOfWeek;
      });
    }
    return filteredQuotes;
  }, [filteredQuotes, exportType, now]);

  // Handle quote actions
  const handleViewQuote = (quoteNumber: string) => router.push(`/admin/quotes/${quoteNumber}`);
  const handleCreateNewQuote = () => router.push('/admin/create-quote/step1');

  const handleConvertToPolicy = async (quoteNumber: string) => {
    if (!window.confirm('Are you sure you want to convert this quote to a policy?')) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      // console.log('Converting quote to policy:', quoteNumber);
      const requestBody = {
        quoteNumber,
        forceConvert: true,
      };
      // console.log('Request body:', requestBody);

      const token = await getToken();
      const res = await fetch(`${apiUrl}/policies/from-quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await res.json();
      // console.log('Response status:', res.status);
      // console.log('Response data:', responseData);

      if (res.ok) {
        toast({
          title: 'Success',
          description: `Quote converted to policy! Policy Number: ${responseData.policyNumber}`,
          variant: 'default',
        });
        fetchQuotes(currentPage, itemsPerPage, false); // Refresh current page
      } else {
        throw new Error(responseData.error || 'Failed to convert quote.');
      }
    } catch (error) {
      console.error('Error converting quote to policy:', error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const handleExportCSV = async () => {
    setExportLoading(true);
    try {
      // Fetch all quotes for export if we don't have filters applied
      const hasFilters = searchTerm.trim() || statusFilter || startDate || endDate;
      let exportData = filteredForExport;

      if (!hasFilters) {
        // If no filters, fetch all quotes for export
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          const token = await getToken();
          const res = await fetch(`${apiUrl}/quotes?allQuotes=true`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            const allQuotes = processQuotesData(data.quotes || []);

            // Apply export type filtering to all quotes
            if (exportType === 'all') {
              exportData = allQuotes;
            } else if (exportType === 'monthly') {
              exportData = allQuotes.filter((q) => {
                if (!q.eventDate) return false;
                const d = new Date(q.eventDate);
                return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
              });
            } else if (exportType === 'yearly') {
              exportData = allQuotes.filter((q) => {
                if (!q.eventDate) return false;
                const d = new Date(q.eventDate);
                return d.getFullYear() === now.getFullYear();
              });
            } else if (exportType === 'weekly') {
              const startOfWeek = new Date(now);
              startOfWeek.setDate(now.getDate() - now.getDay());
              const endOfWeek = new Date(startOfWeek);
              endOfWeek.setDate(startOfWeek.getDate() + 6);
              exportData = allQuotes.filter((q) => {
                if (!q.eventDate) return false;
                const d = new Date(q.eventDate);
                return d >= startOfWeek && d <= endOfWeek;
              });
            }
          } else {
            throw new Error('Failed to fetch quotes for export.');
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'An unknown error occurred.';
          toast({ title: 'Export Error', description: message, variant: 'destructive' });
          return;
        }
      }

      const headers = [
        'Quote ID',
        'Customer',
        'Email',
        'Event Type',
        'Event Date',
        'Premium',
        'Status',
        'Coverage',
      ];
      const csvContent = [
        headers.join(','),
        ...exportData.map((quote) =>
          [
            quote.quoteNumber || quote.id || '',
            `"${quote.customer || quote.policyHolderName || `${quote.firstName || ''} ${quote.lastName || ''}`}"`,
            quote.email || '',
            quote.eventType || '',
            quote.eventDate || '',
            quote.totalPremium,
            quote.status,
            quote.coverageLevel,
          ].join(','),
        ),
      ].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quotes_export_${exportType}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: `CSV exported with ${exportData.length} quotes`,
        variant: 'default',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({ title: 'Export Error', description: message, variant: 'destructive' });
    } finally {
      setExportLoading(false);
    }
  };

  // ==================================================================
  // ===== API CHANGE #3: Deleting a quote ==========================
  // ==================================================================
  const handleDeleteQuote = async (quoteNumber: string) => {
    if (!window.confirm('Are you sure you want to delete this quote?')) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      const token = await getToken();
      const res = await fetch(`${apiUrl}/quotes/${quoteNumber}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        toast({ title: 'Quote deleted successfully!', variant: 'default' });
        // Refresh the current page instead of updating local state
        fetchQuotes(currentPage, itemsPerPage, false);
      } else {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete quote.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const handleExportPDF = async () => {
    setExportLoading(true);
    try {
      // Fetch all quotes for export if we don't have filters applied
      const hasFilters = searchTerm.trim() || statusFilter || startDate || endDate;
      let exportData = filteredForExport;

      if (!hasFilters) {
        // If no filters, fetch all quotes for export
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          const token = await getToken();
          const res = await fetch(`${apiUrl}/quotes?allQuotes=true`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            const allQuotes = processQuotesData(data.quotes || []);

            // Apply export type filtering to all quotes
            if (exportType === 'all') {
              exportData = allQuotes;
            } else if (exportType === 'monthly') {
              exportData = allQuotes.filter((q) => {
                if (!q.eventDate) return false;
                const d = new Date(q.eventDate);
                return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
              });
            } else if (exportType === 'yearly') {
              exportData = allQuotes.filter((q) => {
                if (!q.eventDate) return false;
                const d = new Date(q.eventDate);
                return d.getFullYear() === now.getFullYear();
              });
            } else if (exportType === 'weekly') {
              const startOfWeek = new Date(now);
              startOfWeek.setDate(now.getDate() - now.getDay());
              const endOfWeek = new Date(startOfWeek);
              endOfWeek.setDate(startOfWeek.getDate() + 6);
              exportData = allQuotes.filter((q) => {
                if (!q.eventDate) return false;
                const d = new Date(q.eventDate);
                return d >= startOfWeek && d <= endOfWeek;
              });
            }
          } else {
            throw new Error('Failed to fetch quotes for export.');
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'An unknown error occurred.';
          toast({ title: 'Export Error', description: message, variant: 'destructive' });
          return;
        }
      }

      if (exportData.length === 0) {
        toast({
          title: 'No Data',
          description: 'No quotes available to export.',
          variant: 'destructive',
        });
        return;
      }

      const doc = new jsPDF();
      const tableHeaders = [
        'Quote ID',
        'Customer',
        'Event Type',
        'Event Date',
        'Premium',
        'Status',
        'Coverage',
      ];

      const allTableRows = exportData.map((quote) => [
        String(quote.quoteNumber || quote.id || 'N/A'),
        String(
          quote.customer ||
            quote.policyHolderName ||
            `${quote.firstName || ''} ${quote.lastName || ''}` ||
            'N/A',
        ),
        String(quote.eventType || 'N/A'),
        String(quote.eventDate ? new Date(quote.eventDate).toLocaleDateString() : 'N/A'),
        String(
          quote.totalPremium !== null && quote.totalPremium !== undefined
            ? `$${quote.totalPremium.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : 'N/A',
        ),
        String(quote.status || 'N/A'),
        String(quote.coverageLevel || 'N/A'),
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
          // Add a new page for chunks after the first one
          doc.addPage();
        }

        autoTable(doc, {
          head: [tableHeaders], // Ensure headers are repeated on each page
          body: chunk,
          startY: 25, // Start table after the title
          didDrawPage: () => {
            // removed variable "data"
            // Page Header
            doc.setFontSize(18);
            doc.setTextColor(40);
            doc.text('Insurance Quotes Report', doc.internal.pageSize.getWidth() / 2, 15, {
              align: 'center',
            });

            // Page Footer
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
          margin: { top: 20 }, // Margin for the table content itself
        });
      }

      doc.save(`quotes_export_${exportType}.pdf`);
      toast({
        title: 'Export Successful',
        description: `PDF exported with ${exportData.length} quotes`,
        variant: 'default',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({ title: 'Export Error', description: message, variant: 'destructive' });
    } finally {
      setExportLoading(false);
    }
  };

  // Skeleton Components
  const QuoteRowSkeleton = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-32"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-12"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex justify-end gap-2">
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
        </div>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 px-2 sm:px-0">
          <div>
            <div className="h-7 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
          <div className="mt-2 sm:mt-0 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="h-10 bg-gray-200 rounded-md w-full sm:w-40"></div>
            <div className="h-10 bg-gray-200 rounded-3xl w-full sm:w-36"></div>
            <div className="h-10 bg-gray-200 rounded-md w-full sm:w-32"></div>
            <div className="h-10 bg-gray-200 rounded-md w-full sm:w-32"></div>
          </div>
        </div>
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="h-10 bg-gray-200 rounded-md flex-1 max-w-md"></div>
            <div className="h-10 bg-gray-200 rounded-md w-32"></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Skeleton Table Header can be added if desired, or omit for simplicity */}
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <QuoteRowSkeleton key={i} />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
        <div className="text-center sm:text-left">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
            Insurance Quotes
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
            Manage and track all insurance quotes
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
          <Button
            variant="default"
            onClick={handleCreateNewQuote}
            onMouseEnter={() => router.prefetch('/admin/create-quote/step1')}
            className="w-full sm:w-auto text-sm sm:text-base"
          >
            <PlusCircle size={16} className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Create New Quote</span>
            <span className="sm:hidden">New Quote</span>
          </Button>
          <select
            value={exportType}
            onChange={(e) => setExportType(e.target.value)}
            className="w-full sm:w-[120px] md:w-[150px] rounded-3xl border border-blue-500 py-2 px-3 text-center appearance-none focus:outline-none flex items-center justify-center font-bold text-blue-700 text-sm"
          >
            <option value="all">All</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="weekly">Weekly</option>
          </select>
          <div className="relative w-full sm:w-auto ml-auto" ref={exportDropdownRef}>
            <Button
              variant="outline"
              disabled={exportLoading}
              onClick={() => setShowExportDropdown((prev) => !prev)}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              <Download size={16} className="mr-1 sm:mr-2" />
              {exportLoading ? 'Exporting...' : 'Export'}
            </Button>
            {showExportDropdown && (
              <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                <Button
                  variant="ghost"
                  disabled={exportLoading}
                  onClick={async () => {
                    setShowExportDropdown(false);
                    try {
                      await handleExportCSV();
                    } catch (error) {
                      console.error('CSV export failed:', error);
                    }
                  }}
                  className="w-full justify-start px-3 py-2 text-left text-gray-700 hover:bg-gray-100 text-sm"
                >
                  <Download size={14} className="mr-2" />
                  {exportLoading ? 'Exporting...' : 'Export CSV'}
                </Button>
                <Button
                  variant="ghost"
                  disabled={exportLoading}
                  onClick={async () => {
                    setShowExportDropdown(false);
                    try {
                      await handleExportPDF();
                    } catch (error) {
                      console.error('PDF export failed:', error);
                    }
                  }}
                  className="w-full justify-start px-3 py-2 text-left text-gray-700 hover:bg-gray-100 text-sm"
                >
                  <Download size={14} className="mr-2" />
                  {exportLoading ? 'Exporting...' : 'Export PDF'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row gap-2 w-full max-w-xs sm:max-w-sm mx-auto sm:mx-0"
          >
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search quotes..."
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyPress}
                className="pl-9 pr-3 py-2 h-10 w-full rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
            <Button
              onClick={handleSearch}
              type="button"
              className="text-sm font-medium h-10 px-4 py-2 rounded-xl w-full sm:w-auto"
            >
              Search
            </Button>
          </form>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full sm:w-auto text-sm"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
        {showFilters && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-end gap-3 sm:gap-4">
              <div className="flex-grow min-w-full sm:min-w-[250px] md:min-w-[300px]">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Event Date Range
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <DatePicker
                    selected={startDate}
                    onChange={setStartDate}
                    placeholderText="Start date"
                    className="w-full text-sm"
                  />
                  <span className="text-gray-500 text-sm hidden sm:inline">to</span>
                  <DatePicker
                    selected={endDate}
                    onChange={setEndDate}
                    placeholderText="End date"
                    className="w-full text-sm"
                  />
                </div>
              </div>
              <div className="flex-grow min-w-full sm:min-w-[150px]">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full appearance-none rounded-xl shadow-md border border-gray-200 bg-gray-100 py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="STEP1">Step 1 Complete</option>
                    <option value="STEP2">Step 2 Complete</option>
                    <option value="STEP3">Step 3 Complete</option>
                    <option value="COMPLETE">Quote Complete</option>
                    <option value="Converted">Converted to Policy</option>
                    <option value="EXPIRED">Expired</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setStartDate(null);
                    setEndDate(null);
                    setStatusFilter('');
                  }}
                  className="w-full sm:w-auto text-sm"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </div>
        )}
        <div className="overflow-x-auto overflow-y-auto max-h-[500px] sm:max-h-[600px]">
          <table className="w-full min-w-[800px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50">
                <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quote ID
                </th>
                <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event Type
                </th>
                <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event Date
                </th>
                <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Premium
                </th>
                <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentQuotes.map((quote) => (
                <tr key={quote.quoteNumber} className="hover:bg-gray-50">
                  <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock size={14} className="text-blue-600 mr-1 sm:mr-2" />
                      <span className="font-medium text-gray-900 text-xs sm:text-sm">
                        {quote.quoteNumber}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-gray-900">
                        {quote.customer}
                      </div>
                      <div className="text-xs text-gray-500">{quote.email || ''}</div>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-gray-500 text-xs sm:text-sm">
                    {quote.eventType}
                  </td>
                  <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-gray-500 text-xs sm:text-sm">
                    {quote.eventDate ? new Date(quote.eventDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-gray-900 text-xs sm:text-sm">
                    ${quote.totalPremium}
                  </td>
                  <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span
                      className={`px-1 sm:px-2 py-1 inline-flex text-xs leading-4 sm:leading-5 font-semibold rounded-full ${
                        quote.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : quote.status === 'Emailed'
                            ? 'bg-blue-100 text-blue-800'
                            : quote.status === 'COMPLETE'
                              ? 'bg-purple-100 text-purple-800'
                              : quote.status === 'Converted'
                                ? 'bg-green-100 text-green-800'
                                : quote.status === 'EXPIRED'
                                  ? 'bg-red-100 text-red-800'
                                  : ''
                      }`}
                    >
                      {quote.status}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                    <div className="flex justify-end gap-1 sm:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewQuote(quote.quoteNumber)}
                        onMouseEnter={() => router.prefetch(`/admin/quotes/${quote.quoteNumber}`)}
                        className="p-1 sm:p-2"
                      >
                        <Eye size={14} className="sm:w-4 sm:h-4" />
                      </Button>
                      {quote.status !== 'Converted' && (
                        <>
                          {quote.status === 'PENDING_PAYMENT' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50 p-1 sm:p-2"
                              onClick={async () => {
                                const link = `${window.location.origin}/checkout?quoteNumber=${quote.quoteNumber}`;
                                try {
                                  if (navigator.clipboard && window.isSecureContext) {
                                    await navigator.clipboard.writeText(link);
                                  } else {
                                    // Fallback for environments where clipboard API is not available
                                    const textArea = document.createElement('textarea');
                                    textArea.value = link;
                                    textArea.style.position = 'fixed';
                                    textArea.style.left = '-999999px';
                                    textArea.style.top = '-999999px';
                                    document.body.appendChild(textArea);
                                    textArea.focus();
                                    textArea.select();
                                    document.execCommand('copy');
                                    textArea.remove();
                                  }
                                  toast({
                                    title: 'Payment Link Copied',
                                    description:
                                      'The payment link has been copied to your clipboard.',
                                    variant: 'default',
                                  });
                                } catch (error) {
                                  console.error('Failed to copy to clipboard:', error);
                                  toast({
                                    title: 'Copy Failed',
                                    description: `Payment link: ${link}`,
                                    variant: 'default',
                                  });
                                }
                              }}
                            >
                              <Copy size={14} className="sm:w-4 sm:h-4" />
                            </Button>
                          ) : quote.status === 'COMPLETE' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-200 hover:bg-green-50 p-1 sm:p-2"
                              onClick={() => handleConvertToPolicy(quote.quoteNumber)}
                              disabled={quote.convertedToPolicy || quote.isCustomerGenerated}
                            >
                              <FileCheck size={16} className="sm:w-5 sm:h-5" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="invisible p-1 sm:p-2"
                              aria-hidden="true"
                              tabIndex={-1}
                              disabled
                            >
                              <FileCheck size={16} className="sm:w-5 sm:h-5" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50 p-1 sm:p-2"
                            onClick={() => handleDeleteQuote(quote.quoteNumber)}
                          >
                            <Trash2 size={14} className="sm:w-4 sm:h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 sm:mt-6 flex flex-col items-center sm:flex-row sm:justify-between gap-3 sm:gap-4 border-t border-gray-200 pt-3 sm:pt-4">
          <p className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
            {hasFilters ? (
              <>
                Showing{' '}
                <span className="font-medium">{Math.min(endIndex, filteredQuotes.length)}</span> of{' '}
                <span className="font-medium">{filteredQuotes.length}</span> filtered quotes
              </>
            ) : (
              <>
                Showing <span className="font-medium">{Math.min(endIndex, totalQuotes)}</span> of{' '}
                <span className="font-medium">{totalQuotes}</span> quotes
              </>
            )}
          </p>
          <div className="flex items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            >
              Previous
            </Button>
            {totalPages > 0 && (
              <span className="flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
