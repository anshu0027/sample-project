"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, Download, Eye, PlusCircle, Edit, Mail } from "lucide-react";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from "@/hooks/use-toast";

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
    };
    totalPremium?: number | null;
    status?: string | null;
    coverageLevel?: number | null;
    createdAt?: string | null;
    customer?: string;
    eventType?: string;
    eventDate?: string;
}

export default function Policies() {
    const [searchTerm, setSearchTerm] = useState("");
    const [policies, setPolicies] = useState<PolicyList[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [totalPolicies, setTotalPolicies] = useState(0);
    const [emailSendingQuoteNumber, setEmailSendingQuoteNumber] = useState<string | null>(null);
    const [exportType, setExportType] = useState("all");
    const [showExportDropdown, setShowExportDropdown] = useState(false);
    const exportDropdownRef = useRef<HTMLDivElement>(null);

    // ==================================================================
    // ===== API CHANGE #1: Fetching paginated policies ==============
    // ==================================================================
    const fetchPolicies = async () => {
        setLoading(true);
        setError("");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        try {
            // Use the dedicated policy-list endpoint with pagination
            const res = await fetch(`${apiUrl}/policy-list?page=${currentPage}&pageSize=${itemsPerPage}`);
            if (!res.ok) throw new Error("Failed to fetch policies");

            const data = await res.json();

            // The backend now sends pre-formatted data, so mapping is simpler
            setPolicies(data.policies || []);
            setTotalPolicies(data.total || 0);

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPolicies();
    }, [currentPage, itemsPerPage]); // Refetch when page or page size changes

    // Client-side filtering will now operate on the current page's data
    const filteredPolicies = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return policies;
        return policies.filter((policy) => {
            const fullName = policy.customer || `${policy.policyHolder?.firstName ?? ""} ${policy.policyHolder?.lastName ?? ""}`;
            const email = policy.email?.toLowerCase() ?? "";
            const eventType = policy.eventType?.toLowerCase() ?? "";
            const quoteNumber = policy.quoteNumber?.toLowerCase() ?? "";
            return (
                fullName.toLowerCase().includes(term) ||
                email.includes(term) ||
                eventType.includes(term) ||
                quoteNumber.includes(term)
            );
        });
    }, [searchTerm, policies]);

    const totalPages = Math.ceil(totalPolicies / itemsPerPage);

    // Export and other UI functions remain largely the same
    const handleExportCSV = () => { /* ... No changes needed ... */ };
    const handleExportPDF = () => { /* ... No changes needed ... */ };
    const handleView = (quoteNumber: string) => router.push(`/admin/policies/${quoteNumber}`);
    const handleEdit = (quoteNumber: string) => router.push(`/admin/policies/${quoteNumber}/edit`);

    // ==================================================================
    // ===== API CHANGE #2: Deleting a policy =========================
    // ==================================================================
    const handleDeletePolicy = async (policyId: number) => {
        if (!window.confirm('Are you sure you want to delete this policy?')) return;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        try {
            const res = await fetch(`${apiUrl}/policies/${policyId}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Policy deleted successfully!');
                // Refetch the current page of policies to reflect the deletion
                fetchPolicies();
            } else {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete policy.');
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            toast.error(message);
        }
    };

    // ==================================================================
    // ===== API CHANGE #3: Sending policy email ======================
    // ==================================================================
    const handleEmail = async (quoteNumber: string) => {
        setEmailSendingQuoteNumber(quoteNumber);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        try {
            // First, get the full details for the specific quote/policy
            const policyRes = await fetch(`${apiUrl}/quotes?quoteNumber=${quoteNumber}`);
            if (!policyRes.ok) throw new Error('Failed to fetch policy details.');
            const policyData = await policyRes.json();

            if (!policyData.quote || !policyData.quote.email) {
                throw new Error('No email address found for this policy.');
            }

            // Now, send the email with the full data object
            const emailRes = await fetch(`${apiUrl}/email/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: policyData.quote.email,
                    type: 'policy',
                    data: policyData.quote, // Send the full quote object
                })
            });

            if (!emailRes.ok) {
                const errData = await emailRes.json();
                throw new Error(errData.error || 'Failed to send email.');
            }
            toast.success('Policy emailed successfully!');
        } catch (err) {
            const message = err instanceof Error ? err.message : "An unknown error occurred.";
            toast.error(message);
        } finally {
            setEmailSendingQuoteNumber(null);
        }
    };

    const PolicyRowSkeleton = () => (
        <tr className="animate-pulse">
            <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-40"></div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
            <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
            <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-12"></div></td>
            <td className="px-6 py-4 whitespace-nowrap"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
            <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex justify-end gap-2">
                    <div className="h-8 w-20 bg-gray-200 rounded-md"></div>
                    <div className="h-8 w-20 bg-gray-200 rounded-md"></div>
                    <div className="h-8 w-20 bg-gray-200 rounded-md"></div>
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
                        <div className="h-10 bg-gray-200 rounded-md w-full sm:w-48"></div> {/* Generate New Policy */}
                        <div className="h-10 bg-gray-200 rounded-3xl w-full sm:w-36"></div> {/* Export Type Select */}
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
                                {[...Array(5)].map((_, i) => <PolicyRowSkeleton key={i} />)}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        );
    }
    if (error) {
        return <div className="p-8 max-w-7xl mx-auto"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div></div>;
    }

    return (
        <div className="p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-8 px-2 sm:px-0">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Insurance Policies</h1>
                    <p className="text-gray-600 text-sm sm:text-base">Manage and view all insurance policies</p>
                </div>
                <div className="mt-2 sm:mt-0 flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                    <Button variant="default" onClick={() => router.push("/admin/create-quote/step1")}>
                        <PlusCircle size={18} className="mr-2" /> Generate New Policy
                    </Button>
                    {/* ... Other buttons remain identical ... */}
                    <select value={exportType} onChange={e => setExportType(e.target.value)} className="w-full sm:w-[150px] rounded-3xl border border-blue-500 py-1 px-4 text-center appearance-none focus:outline-none flex items-center justify-center [&>div]:rounded-2xl">
                    <option value="all">All</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="weekly">Weekly</option>
                </select>
                <div className="relative w-full sm:w-auto" ref={exportDropdownRef}>
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
            </div>
            <Card>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex-1 max-w-md">
                        <Input
                            placeholder="Search policies..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            icon={<Search size={18} />}
                        />
                    </div>
                    {/* ... Filter button remains identical ... */}
                </div>

                <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
                    <table className="w-full">
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-gray-50">
                                {/* ... Table headers remain identical ... */}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPolicies.map((policy) => (
                                <tr key={policy.quoteNumber} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-medium text-gray-900">{policy.policyNumber}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{policy.customer}</div>
                                        <div className="text-sm text-gray-500">{policy?.email || "-"}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{policy.eventType}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{policy.createdAt ? new Date(policy.createdAt).toLocaleDateString() : "-"}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">${policy.totalPremium?.toFixed(2) ?? "-"}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${policy.status === 'COMPLETE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {policy.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleView(policy.quoteNumber)}>
                                                <Eye size={16} className="mr-1" /> View
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(policy.quoteNumber)}>
                                                <Edit size={16} className="mr-1" /> Edit
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => handleEmail(policy.quoteNumber)} disabled={emailSendingQuoteNumber === policy.quoteNumber}>
                                                {emailSendingQuoteNumber === policy.quoteNumber ? 'Sending...' : <><Mail className="h-4 w-4 mr-2" /> Email</>}
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDeletePolicy(policy.policyId)}>
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-6 flex flex-col items-center sm:flex-row sm:justify-between gap-4 border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-700 text-center sm:text-left">
                        Showing <span className="font-medium">{filteredPolicies.length}</span> of <span className="font-medium">{totalPolicies}</span> policies
                    </p>
                    <div className="flex items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
                        <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                            Previous
                        </Button>
                        <span className="flex items-center px-3 py-1 text-sm text-gray-700">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                            Next
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}