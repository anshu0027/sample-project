/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Download, Eye, PlusCircle, Edit, Mail } from 'lucide-react';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@clerk/nextjs';
// import Link from "next/link";

interface PolicyList {
  email: string;
  policyId: number;
  policyNumber: number;
  id: number;
  quoteNumber: string;
  policyHolder?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  };
  event?: {
    eventType?: string | null;
    eventDate?: string | null;
    honoree1FirstName?: string | null;
    honoree1LastName?: string | null;
    honoree2FirstName?: string | null;
    honoree2LastName?: string | null;
    maxGuests?: string | null;
  };
  totalPremium?: number | null;
  status?: string | null;
  coverageLevel?: number | null;
  createdAt?: string | null;
  customer?: string;
  eventType?: string;
  eventDate?: string;
  payments?: { amount: number; status: string }[];
}

// Helper hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function Policies() {
  const router = useRouter();
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [policies, setPolicies] = useState<PolicyList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [totalPolicies, setTotalPolicies] = useState(0);
  const [emailSendingQuoteNumber, setEmailSendingQuoteNumber] = useState<string | null>(null);
  const [exportType, setExportType] = useState('all');
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // ==================================================================
  // ===== HYBRID API APPROACH: Server-side pagination + Client-side filtering
  // ==================================================================
  const fetchPolicies = useCallback(
    async (page: number = 1, pageSize: number = 15, allPolicies: boolean = false) => {
      setLoading(true);
      setError('');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      try {
        const token = await getToken();

        // If searching/filtering, fetch all policies for client-side filtering
        // Otherwise, use server-side pagination
        const queryParams = allPolicies
          ? '?page=1&pageSize=1000'
          : `?page=${page}&pageSize=${pageSize}`;

        const res = await fetch(`${apiUrl}/policy-list${queryParams}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch policies');

        const data = await res.json();

        if (allPolicies) {
          // When fetching all policies for filtering, use the full dataset
          setPolicies(data.policies || []);
          setTotalPolicies(data.policies?.length || 0);
        } else {
          // When using server-side pagination, only show current page
          setPolicies(data.policies || []);
          setTotalPolicies(data.total || 0);
        }
      } catch (err: unknown) {
        console.error('Error fetching policies:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    },
    [getToken],
  );

  // Debounced search term for API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    // Check authentication first
    if (isLoaded && !isSignedIn) {
      router.replace('/admin/login');
      return;
    }

    // If there's a search term, fetch all policies for client-side filtering
    // Otherwise, use server-side pagination
    if (debouncedSearchTerm.trim()) {
      fetchPolicies(1, 15, true); // Fetch all policies
    } else {
      fetchPolicies(currentPage, itemsPerPage, false); // Use server-side pagination
    }
  }, [fetchPolicies, isLoaded, isSignedIn, router, debouncedSearchTerm, currentPage, itemsPerPage]);

  // ==================================================================
  // ===== CLIENT-SIDE SEARCH: Filter policies locally when searching
  // ==================================================================
  const filteredPolicies = useMemo(() => {
    if (!searchTerm.trim()) {
      return policies;
    }

    const searchLower = searchTerm.toLowerCase();
    return policies.filter((policy) => {
      // Search across multiple fields
      const policyNumber = String(policy.policyNumber || '').toLowerCase();
      const quoteNumber = (policy.quoteNumber || '').toLowerCase();
      const firstName = (policy.policyHolder?.firstName || '').toLowerCase();
      const lastName = (policy.policyHolder?.lastName || '').toLowerCase();
      const fullName = `${firstName} ${lastName}`.trim().toLowerCase();
      const eventType = (policy.eventType || policy.event?.eventType || '').toLowerCase();

      return (
        policyNumber.includes(searchLower) ||
        quoteNumber.includes(searchLower) ||
        fullName.includes(searchLower) ||
        eventType.includes(searchLower)
      );
    });
  }, [policies, searchTerm]);

  // ==================================================================
  // ===== HYBRID PAGINATION: Server-side for normal view, client-side for filtered results
  // ==================================================================
  const isFiltering = searchTerm.trim() !== '';
  const totalFilteredPolicies = filteredPolicies.length;
  const totalPages = isFiltering
    ? Math.ceil(totalFilteredPolicies / itemsPerPage)
    : Math.ceil(totalPolicies / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // When filtering, use client-side pagination on filtered results
  // When not filtering, use server-side pagination (policies already contains current page)
  const currentPolicies = isFiltering ? filteredPolicies.slice(startIndex, endIndex) : policies;

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Adjust current page if it's out of bounds after filtering
  useEffect(() => {
    if (isFiltering) {
      const newTotalPages = Math.ceil(totalFilteredPolicies / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      } else if (newTotalPages === 0 && totalFilteredPolicies === 0 && currentPage !== 1) {
        setCurrentPage(1);
      }
    }
  }, [totalFilteredPolicies, itemsPerPage, currentPage, isFiltering]);

  // Memoize export functions
  const handleExportCSV = useCallback(async () => {
    let exportData = filteredPolicies;

    // If no search is applied, fetch all policies for export
    if (!searchTerm.trim()) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const token = await getToken();
        const res = await fetch(`${apiUrl}/policy-list?page=1&pageSize=1000`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          exportData = data.policies || [];
        } else {
          throw new Error('Failed to fetch policies for export.');
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
        description: 'No policies available to export.',
        variant: 'destructive',
      });
      return;
    }
    const headers = [
      'Policy Number',
      'Policy Holder Name',
      'Policy Holder Email',
      'Event Type',
      'Event Date',
      'Total Premium',
      'Payment Status',
      'Quote Number',
      'Created At',
    ];
    const csvContent = [
      headers.join(','),
      ...exportData.map((policy) =>
        [
          policy.policyNumber || '',
          `"${policy.customer || `${policy.policyHolder?.firstName || ''} ${policy.policyHolder?.lastName || ''}`.trim() || 'N/A'}"`,
          policy.email || policy.policyHolder?.email || '',
          policy.eventType || policy.event?.eventType || '',
          policy.eventDate || policy.event?.eventDate
            ? new Date(policy.eventDate || policy.event!.eventDate!).toLocaleDateString()
            : '',
          policy.totalPremium?.toFixed(2) || '0.00',
          policy.status || policy.payments?.[0]?.status || 'N/A',
          policy.quoteNumber || '',
          policy.createdAt ? new Date(policy.createdAt).toLocaleDateString() : '',
        ].join(','),
      ),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `policies_export_${exportType}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Policies exported to CSV successfully!');
  }, [filteredPolicies, exportType, searchTerm, getToken]);

  const handleExportPDF = useCallback(async () => {
    let exportData = filteredPolicies;

    // If no search is applied, fetch all policies for export
    if (!searchTerm.trim()) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const token = await getToken();
        const res = await fetch(`${apiUrl}/policy-list?page=1&pageSize=1000`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          exportData = data.policies || [];
        } else {
          throw new Error('Failed to fetch policies for export.');
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
        description: 'No policies available to export.',
        variant: 'destructive',
      });
      return;
    }

    const doc = new jsPDF();
    const tableHeaders = [
      'Policy',
      'Holder Name',
      'Email',
      'Event Type',
      'Event Date',
      'Premium',
      'Status',
    ];
    const allTableRows = exportData.map((policy) => [
      String(policy.policyNumber || 'N/A'),
      String(
        policy.customer ||
          `${policy.policyHolder?.firstName || ''} ${policy.policyHolder?.lastName || ''}`.trim() ||
          'N/A',
      ),
      String(policy.email || policy.policyHolder?.email || 'N/A'),
      String(policy.eventType || policy.event?.eventType || 'N/A'),
      String(
        policy.eventDate || policy.event?.eventDate
          ? new Date(policy.eventDate || policy.event!.eventDate!).toLocaleDateString()
          : 'N/A',
      ),
      String(
        policy.totalPremium !== null && policy.totalPremium !== undefined
          ? `$${policy.totalPremium.toFixed(2)}`
          : 'N/A',
      ),
      String(policy.status || policy.payments?.[0]?.status || 'N/A'),
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
        startY: 25, // Start table after the title
        didDrawPage: (data) => {
          // Page Header
          doc.setFontSize(18);
          doc.setTextColor(40);
          doc.text('Insurance Policies Report', doc.internal.pageSize.getWidth() / 2, 15, {
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
        margin: { top: 20 },
      });
    }
    doc.save(`policies_export_${exportType}.pdf`);
    toast.success('Policies exported to PDF successfully!');
  }, [filteredPolicies, exportType, searchTerm, getToken]);

  // Memoize navigation handlers
  const handleView = useCallback(
    (policyId: number) => router.push(`/admin/policies/${policyId}`),
    [router],
  );
  const handleEdit = useCallback(
    (policyId: number) => router.push(`/admin/policies/${policyId}/edit`),
    [router],
  );

  // ==================================================================
  // ===== API CHANGE #2: Deleting a policy =========================
  // ==================================================================
  // const handleDeletePolicy = useCallback(
  //   async (policyId: number) => {
  //     const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  //     try {
  //       const token = await getToken();
  //       const res = await fetch(`${apiUrl}/policies/${policyId}`, {
  //         method: 'DELETE',
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });
  //       if (res.ok) {
  //         toast.success('Policy deleted successfully!');
  //         setPolicies((prev) => {
  //           const updated = prev.filter((p) => p.policyId !== policyId);
  //           if (updated.length === 0 && currentPage > 1) {
  //             setCurrentPage(currentPage - 1);
  //           }
  //           return updated;
  //         });
  //         setTotalPolicies((prev) => prev - 1);
  //       } else {
  //         const data = await res.json();
  //         throw new Error(data.error || 'Failed to delete policy.');
  //       }
  //     } catch (error) {
  //       const message = error instanceof Error ? error.message : 'An unknown error occurred.';
  //       toast.error(message);
  //     }
  //   },
  //   [currentPage, getToken],
  // );

  // ==================================================================
  // ===== API CHANGE #3: Sending policy email ======================
  // ==================================================================
  const handleEmail = useCallback(
    async (quoteNumber: string) => {
      setEmailSendingQuoteNumber(quoteNumber);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      try {
        const token = await getToken();
        // First, get the full details for the specific quote/policy
        const policyRes = await fetch(`${apiUrl}/quotes?quoteNumber=${quoteNumber}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!policyRes.ok) throw new Error('Failed to fetch policy details.');
        const policyData = await policyRes.json();

        if (!policyData.quote || !policyData.quote.email) {
          throw new Error('No email address found for this policy.');
        }

        // Now, send the email with the full data object
        const emailRes = await fetch(`${apiUrl}/email/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            to: policyData.quote.email,
            type: 'policy',
            data: policyData.quote, // Send the full quote object
          }),
        });

        if (!emailRes.ok) {
          const errData = await emailRes.json();
          throw new Error(errData.error || 'Failed to send email.');
        }
        toast.success('Policy emailed successfully!');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred.';
        toast.error(message);
      } finally {
        setEmailSendingQuoteNumber(null);
      }
    },
    [getToken],
  );

  // Memoize pagination handlers
  const handlePreviousPage = useCallback(() => setCurrentPage(currentPage - 1), [currentPage]);
  const handleNextPage = useCallback(() => setCurrentPage(currentPage + 1), [currentPage]);

  // Memoize export dropdown handlers
  const handleExportDropdownToggle = useCallback(() => setShowExportDropdown((prev) => !prev), []);
  const handleExportDropdownClose = useCallback(() => setShowExportDropdown(false), []);

  // Memoize search handler
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  // Memoize export type change handler
  const handleExportTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setExportType(e.target.value);
  }, []);

  // Memoize create new policy handler
  const handleCreateNewPolicy = useCallback(() => {
    router.push('/admin/create-quote/step1');
  }, [router]);

  // Memoize prefetch handlers
  const handleCreateNewPolicyPrefetch = useCallback(() => {
    router.prefetch('/admin/create-quote/step1');
  }, [router]);

  const handleViewPrefetch = useCallback(
    (policyId: number) => {
      router.prefetch(`/admin/policies/${policyId}`);
    },
    [router],
  );

  const handleEditPrefetch = useCallback(
    (policyId: number) => {
      router.prefetch(`/admin/policies/${policyId}/edit`);
    },
    [router],
  );

  const PolicyRowSkeleton = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-40"></div>
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
          <div className="h-8 w-20 bg-gray-200 rounded-md"></div>
          <div className="h-8 w-20 bg-gray-200 rounded-md"></div>
          <div className="h-8 w-20 bg-gray-200 rounded-md"></div>
        </div>
      </td>
    </tr>
  );

  if (loading && policies.length === 0) {
    // Show skeleton only on initial load or when policies are empty
    return (
      <div className="p-6 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 px-2 sm:px-0">
          <div>
            <div className="h-7 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
          <div className="mt-2 sm:mt-0 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="h-10 bg-gray-200 rounded-md w-full sm:w-48"></div>{' '}
            {/* Generate New Policy */}
            <div className="h-10 bg-gray-200 rounded-3xl w-full sm:w-36"></div>{' '}
            {/* Export Type Select */}
            <div className="h-10 bg-gray-200 rounded-md w-full sm:w-32"></div> {/* Export CSV */}
            <div className="h-10 bg-gray-200 rounded-md w-full sm:w-32"></div> {/* Export PDF */}
          </div>
        </div>
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="h-10 bg-gray-200 rounded-md flex-1 max-w-md"></div> {/* Search Input */}
            <div className="h-10 bg-gray-200 rounded-md w-32"></div> {/* Filter Button */}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Skeleton Table Header can be omitted for simplicity or added if desired */}
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <PolicyRowSkeleton key={i} />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-8 px-2 sm:px-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Insurance Policies</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage and view all insurance policies
          </p>
        </div>
        <div className="mt-2 sm:mt-0 flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            variant="default"
            onClick={handleCreateNewPolicy}
            onMouseEnter={handleCreateNewPolicyPrefetch}
          >
            <PlusCircle size={18} className="mr-2" /> Generate New Policy
          </Button>
          {/* ... Other buttons remain identical ... */}
          <select
            value={exportType}
            onChange={handleExportTypeChange}
            className="w-full sm:w-[150px] rounded-3xl border border-blue-500 py-1 px-4 text-center appearance-none focus:outline-none flex items-center justify-center [&>div]:rounded-2xl"
          >
            <option value="all">All</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="weekly">Weekly</option>
          </select>
          <div className="relative w-full sm:w-auto" ref={exportDropdownRef}>
            <Button
              variant="outline"
              onClick={handleExportDropdownToggle}
              className="w-full sm:w-auto"
            >
              <Download size={18} className="mr-2" />
              Export
            </Button>
            {showExportDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                <Button
                  variant="ghost"
                  onClick={async () => {
                    try {
                      await handleExportCSV();
                    } catch (error) {
                      console.error('CSV export failed:', error);
                    }
                  }}
                  className="w-full justify-start px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                >
                  <Download size={16} className="mr-2" />
                  Export CSV
                </Button>
                <Button
                  variant="ghost"
                  onClick={async () => {
                    try {
                      await handleExportPDF();
                    } catch (error) {
                      console.error('PDF export failed:', error);
                    }
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
      </div>
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search policies..."
              value={searchTerm}
              onChange={handleSearchChange}
              icon={<Search size={18} />}
            />
          </div>
          {/* ... Filter button remains identical ... */}
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Policy Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Policy Holder
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Premium
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading &&
                policies.length > 0 && ( // Show skeleton rows when loading more pages but policies exist
                  <>
                    {[...Array(3)].map((_, i) => (
                      <PolicyRowSkeleton key={`loading-${i}`} />
                    ))}
                  </>
                )}
              {!loading && currentPolicies.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500">
                    {searchTerm.trim()
                      ? `No policies found matching "${searchTerm}".`
                      : 'No policies found.'}
                  </td>
                </tr>
              )}
              {currentPolicies.map((policy) => {
                // console.log('Rendering policy:', policy); // Removed for performance
                return (
                  <tr key={policy.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {policy.policyNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {policy.customer ||
                        `${policy.policyHolder?.firstName || ''} ${policy.policyHolder?.lastName || ''}`.trim() ||
                        'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {policy.eventType || policy.event?.eventType || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {policy.eventDate || policy.event?.eventDate
                        ? new Date(
                            policy.eventDate || policy.event?.eventDate || '',
                          ).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${(policy.totalPremium || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          policy.status === 'COMPLETE' || policy.status === 'SUCCESS'
                            ? 'bg-green-100 text-green-800'
                            : policy.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {policy.status || policy.payments?.[0]?.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(policy.policyId)}
                          onMouseEnter={() => handleViewPrefetch(policy.policyId)}
                        >
                          <Eye size={16} className="mr-1" /> View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(policy.policyId)}
                          onMouseEnter={() => handleEditPrefetch(policy.policyId)}
                        >
                          <Edit size={16} className="mr-1" /> Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEmail(policy.quoteNumber)}
                          disabled={emailSendingQuoteNumber === policy.quoteNumber}
                        >
                          {emailSendingQuoteNumber === policy.quoteNumber ? (
                            'Sending...'
                          ) : (
                            <>
                              <Mail className="h-4 w-4 mr-2" /> Email
                            </>
                          )}
                        </Button>
                        {/* <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeletePolicy(policy.policyId)}
                        >
                          Delete
                        </Button> */}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex flex-col items-center sm:flex-row sm:justify-between gap-4 border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-700 text-center sm:text-left">
            {isFiltering ? (
              <>
                Showing{' '}
                <span className="font-medium">{Math.min(endIndex, totalFilteredPolicies)}</span> of{' '}
                <span className="font-medium">{totalFilteredPolicies}</span> policies
              </>
            ) : (
              <>
                Showing <span className="font-medium">{currentPolicies.length}</span> of{' '}
                <span className="font-medium">{totalPolicies}</span> policies
              </>
            )}
          </p>
          <div className="flex items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={handlePreviousPage}
            >
              Previous
            </Button>
            <span className="flex items-center px-3 py-1 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={handleNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
