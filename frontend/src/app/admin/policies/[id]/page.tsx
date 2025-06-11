"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Mail, Edit, DollarSign, Calendar, Users, Shield, Wine, Activity, AlertTriangle, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import React from "react";
import { toast } from "@/hooks/use-toast";

function flattenPolicy(policy: any) {
    if (!policy) return null;
    console.log('Raw policy data:', JSON.stringify(policy, null, 2));
    
    const flattened = {
        id: policy.id,
        quoteNumber: policy.quoteNumber,
        eventType: policy.event?.eventType || '',
        eventDate: policy.event?.eventDate || '',
        maxGuests: policy.event?.maxGuests || '',
        coverageLevel: policy.coverageLevel || null,
        liabilityCoverage: policy.liabilityCoverage || '',
        liquorLiability: policy.liquorLiability || false,
        covidDisclosure: policy.covidDisclosure || false,
        specialActivities: policy.specialActivities || false,
        totalPremium: policy.totalPremium,
        basePremium: policy.basePremium,
        liabilityPremium: policy.liabilityPremium,
        liquorLiabilityPremium: policy.liquorLiabilityPremium,
        createdAt: policy.createdAt,
        status: policy.status,
        honoree1FirstName: policy.event?.honoree1FirstName || '',
        honoree1LastName: policy.event?.honoree1LastName || '',
        honoree2FirstName: policy.event?.honoree2FirstName || '',
        honoree2LastName: policy.event?.honoree2LastName || '',
        ceremonyLocationType: policy.event?.venue?.ceremonyLocationType || '',
        indoorOutdoor: policy.event?.venue?.indoorOutdoor || '',
        venueName: policy.event?.venue?.name || '',
        venueAddress1: policy.event?.venue?.address1 || '',
        venueAddress2: policy.event?.venue?.address2 || '',
        venueCountry: policy.event?.venue?.country || '',
        venueCity: policy.event?.venue?.city || '',
        venueState: policy.event?.venue?.state || '',
        venueZip: policy.event?.venue?.zip || '',
        venueAsInsured: policy.event?.venue?.venueAsInsured || false,
        firstName: policy.policyHolder?.firstName || '',
        lastName: policy.policyHolder?.lastName || '',
        email: policy.email || policy.policyHolder?.email || '',
        phone: policy.policyHolder?.phone || '',
        relationship: policy.policyHolder?.relationship || '',
        hearAboutUs: policy.policyHolder?.hearAboutUs || '',
        address: policy.policyHolder?.address || '',
        country: policy.policyHolder?.country || '',
        city: policy.policyHolder?.city || '',
        state: policy.policyHolder?.state || '',
        zip: policy.policyHolder?.zip || '',
        legalNotices: policy.policyHolder?.legalNotices || false,
        completingFormName: policy.policyHolder?.completingFormName || '',
        // Additional venues for wedding events
        receptionVenueName: policy.event?.venue?.receptionVenueName || '',
        receptionVenueAddress1: policy.event?.venue?.receptionVenueAddress1 || '',
        receptionVenueAddress2: policy.event?.venue?.receptionVenueAddress2 || '',
        receptionVenueCity: policy.event?.venue?.receptionVenueCity || '',
        receptionVenueState: policy.event?.venue?.receptionVenueState || '',
        receptionVenueZip: policy.event?.venue?.receptionVenueZip || '',
        receptionVenueCountry: policy.event?.venue?.receptionVenueCountry || '',
        receptionVenueAsInsured: policy.event?.venue?.receptionVenueAsInsured || false,
        rehearsalVenueName: policy.event?.venue?.rehearsalVenueName || '',
        rehearsalVenueAddress1: policy.event?.venue?.rehearsalVenueAddress1 || '',
        rehearsalVenueAddress2: policy.event?.venue?.rehearsalVenueAddress2 || '',
        rehearsalVenueCity: policy.event?.venue?.rehearsalVenueCity || '',
        rehearsalVenueState: policy.event?.venue?.rehearsalVenueState || '',
        rehearsalVenueZip: policy.event?.venue?.rehearsalVenueZip || '',
        rehearsalVenueCountry: policy.event?.venue?.rehearsalVenueCountry || '',
        rehearsalVenueAsInsured: policy.event?.venue?.rehearsalVenueAsInsured || false,
        rehearsalDinnerVenueName: policy.event?.venue?.rehearsalDinnerVenueName || '',
        rehearsalDinnerVenueAddress1: policy.event?.venue?.rehearsalDinnerVenueAddress1 || '',
        rehearsalDinnerVenueAddress2: policy.event?.venue?.rehearsalDinnerVenueAddress2 || '',
        rehearsalDinnerVenueCity: policy.event?.venue?.rehearsalDinnerVenueCity || '',
        rehearsalDinnerVenueState: policy.event?.venue?.rehearsalDinnerVenueState || '',
        rehearsalDinnerVenueZip: policy.event?.venue?.rehearsalDinnerVenueZip || '',
        rehearsalDinnerVenueCountry: policy.event?.venue?.rehearsalDinnerVenueCountry || '',
        rehearsalDinnerVenueAsInsured: policy.event?.venue?.rehearsalDinnerVenueAsInsured || false,
        brunchVenueName: policy.event?.venue?.brunchVenueName || '',
        brunchVenueAddress1: policy.event?.venue?.brunchVenueAddress1 || '',
        brunchVenueAddress2: policy.event?.venue?.brunchVenueAddress2 || '',
        brunchVenueCity: policy.event?.venue?.brunchVenueCity || '',
        brunchVenueState: policy.event?.venue?.brunchVenueState || '',
        brunchVenueZip: policy.event?.venue?.brunchVenueZip || '',
        brunchVenueCountry: policy.event?.venue?.brunchVenueCountry || '',
        brunchVenueAsInsured: policy.event?.venue?.brunchVenueAsInsured || false,
    };
    
    console.log('Flattened policy data:', JSON.stringify(flattened, null, 2));
    return flattened;
}

export default function PolicyDetail() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [policy, setPolicy] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ==================================================================
    // ===== API CHANGE #1: Fetching the policy/quote data ============
    // ==================================================================
    useEffect(() => {
        async function fetchPolicy() {
            setLoading(true);
            setError("");
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            try {
                console.log('Fetching policy with ID:', id);
                const res = await fetch(`${apiUrl}/policies/${id}`);
                if (!res.ok) {
                    const errData = await res.json();
                    console.error('Error response:', errData);
                    throw new Error(errData.error || "Failed to fetch policy");
                }
                const data = await res.json();
                console.log('API response:', data);
                setPolicy(flattenPolicy(data.policy || null));
            } catch (err: unknown) {
                console.error('Fetch error:', err);
                setError(err instanceof Error ? err.message : "Unknown error");
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchPolicy();
    }, [id]);

    const handleBack = () => router.push("/admin/policies");
    const handleEdit = () => router.push(`/admin/policies/${id}/edit`);

    // ==================================================================
    // ===== API CHANGE #2: Sending the policy email ==================
    // ==================================================================
    const handleEmailPolicy = async () => {
        const recipientEmail = policy?.email;
        if (!recipientEmail) {
            toast.error("No email found for this policy.");
            return;
        }
        setIsEmailSent(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        try {
            // Use the new backend endpoint to send the email
            const res = await fetch(`${apiUrl}/email/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    to: recipientEmail,
                    type: 'policy',
                    data: policy // Send the entire flattened policy object
                })
            });
            if (res.ok) {
                toast.success("Policy emailed successfully!");
            } else {
                const data = await res.json();
                throw new Error(data.error || "Failed to send email");
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "An unknown error occurred.";
            toast.error(message);
        } finally {
            setIsEmailSent(false);
        }
    };

    const handleVersionClick = async (versionId: number) => {
        try {
            const response = await fetch(`/api/v1/policies/${id}/versions/${versionId}`, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch version');
            }

            // Get the blob from the response
            const blob = await response.blob();
            
            // Create a URL for the blob
            const url = window.URL.createObjectURL(blob);
            
            // Create a temporary link element
            const link = document.createElement('a');
            link.href = url;
            link.download = `policy_version_${versionId}.pdf`;
            
            // Append to body, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up the URL
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error fetching version:', error);
            toast.error('Failed to download version');
        }
    };

    // Skeleton Component
    const PolicyDetailSkeleton = () => (
        <div className="bg-gray-50 min-h-screen animate-pulse">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Skeleton */}
                <div className="bg-white shadow-sm rounded-xl p-6 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center">
                            <div className="mr-4 p-2 rounded-full bg-gray-200 h-10 w-10"></div>
                            <div>
                                <div className="h-7 bg-gray-200 rounded w-48 mb-2"></div> {/* "Policy #..." */}
                                <div className="flex items-center mt-1">
                                    <div className="h-4 bg-gray-200 rounded w-32"></div> {/* "Issued..." */}
                                    <div className="mx-2 text-gray-300">•</div>
                                    <div className="h-5 bg-gray-200 rounded-full w-20"></div> {/* Status */}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="h-10 bg-gray-200 rounded-md w-32"></div> {/* Email Policy */}
                            <div className="h-10 bg-gray-200 rounded-md w-32"></div> {/* Edit Policy */}
                        </div>
                    </div>
                </div>

                {/* Policy Summary Skeleton */}
                <div className="bg-white shadow-sm rounded-xl p-6 mb-6">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div> {/* Title "Policy Summary" */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-gray-100 rounded-lg p-4">
                                <div className="flex items-center">
                                    <div className="bg-gray-200 rounded-full h-8 w-8 mr-3"></div> {/* Icon */}
                                    <div>
                                        <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div> {/* Label */}
                                        <div className="h-5 bg-gray-200 rounded w-24"></div> {/* Value */}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Details Section Skeleton (covers Policy Details, Event Info, Additional Info) */}
                    {[...Array(2)].map((_, sectionIndex) => ( // For main details and contact info
                        <div key={sectionIndex} className={`bg-white shadow-sm rounded-xl p-6 ${sectionIndex === 0 ? 'lg:col-span-2' : ''}`}>
                            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div> {/* Section Title */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[...Array(sectionIndex === 0 ? 6 : 4)].map((_, i) => ( // Number of items per section
                                    <div key={i}>
                                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div> {/* Label */}
                                        <div className="h-5 bg-gray-200 rounded w-3/4"></div> {/* Value */}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                     {/* Event/Additional Info Section Skeleton */}
                    <div className="bg-white shadow-sm rounded-xl p-6 mt-6 lg:col-span-3">
                        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div> {/* Section Title */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(5)].map((_, i) => ( // Number of items
                                <div key={i}><div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div><div className="h-5 bg-gray-200 rounded w-3/4"></div></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) return <PolicyDetailSkeleton />;
    if (error) return <div className="p-8 max-w-7xl mx-auto"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div></div>;
    if (!policy) return <div className="p-8 max-w-7xl mx-auto"><div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">No policy found with ID #{id}.</div></div>;

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="bg-white shadow-sm rounded-xl p-6 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center">
                            <button onClick={handleBack} className="mr-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Policy #{policy.quoteNumber}</h1>
                                <div className="flex items-center mt-1">
                                    <span className="text-sm text-gray-500">Issued {policy.createdAt ? new Date(policy.createdAt).toLocaleDateString() : "-"}</span>
                                    <span className="mx-2 text-gray-300">•</span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${policy.status === "COMPLETE" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                                        {policy.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={handleEmailPolicy} disabled={isEmailSent}>
                                <Mail size={18} /> {isEmailSent ? "Sending..." : "Email Policy"}
                            </Button>
                            <Button variant="outline" onClick={handleEdit}>
                                <Edit size={18} /> Edit Policy
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Policy Summary */}
                <div className="bg-white shadow-sm rounded-xl p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">Policy Summary</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center">
                                <Calendar className="text-blue-500 mr-3" size={20} />
                                <div>
                                    <p className="text-xs font-medium text-blue-500">Event Date</p>
                                    <p className="font-semibold">{policy.eventDate ? new Date(policy.eventDate).toLocaleDateString() : "-"}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                            <div className="flex items-center">
                                <Users className="text-purple-500 mr-3" size={20} />
                                <div>
                                    <p className="text-xs font-medium text-purple-500">Guest Count</p>
                                    <p className="font-semibold">{policy.maxGuests || "-"}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                            <div className="flex items-center">
                                <Shield className="text-green-500 mr-3" size={20} />
                                <div>
                                    <p className="text-xs font-medium text-green-500">Coverage Level</p>
                                    <p className="font-semibold">{policy.coverageLevel !== null && policy.coverageLevel !== undefined ? `Level ${policy.coverageLevel}` : "-"}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-indigo-50 rounded-lg p-4">
                            <div className="flex items-center">
                                <DollarSign className="text-indigo-500 mr-3" size={20} />
                                <div>
                                    <p className="text-xs font-medium text-indigo-500">Total Premium</p>
                                    <p className="font-semibold">${policy.totalPremium !== null && policy.totalPremium !== undefined ? policy.totalPremium : "-"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Step 1: Policy Details */}
                    <div className="bg-white shadow-sm rounded-xl p-6 lg:col-span-2">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">1</span>
                            Policy Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Event Type</h3>
                                <p className="mt-1 font-medium">{policy.eventType || "-"}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Liability Coverage</h3>
                                <p className="mt-1 font-medium">{policy.liabilityCoverage || "-"}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Host Liquor Liability</h3>
                                <div className="mt-1 flex items-center">
                                    {policy.liquorLiability ?
                                        <><Wine size={16} className="text-green-500 mr-1" /> <span className="font-medium">Included</span></> :
                                        <span className="font-medium">Not Included</span>
                                    }
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Special Activities</h3>
                                <div className="mt-1 flex items-center">
                                    {policy.specialActivities ?
                                        <><Activity size={16} className="text-amber-500 mr-1" /> <span className="font-medium">Yes</span></> :
                                        <span className="font-medium">No</span>
                                    }
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Covid Disclosure</h3>
                                <div className="mt-1 flex items-center">
                                    {policy.covidDisclosure ?
                                        <><AlertTriangle size={16} className="text-amber-500 mr-1" /> <span className="font-medium">Yes</span></> :
                                        <span className="font-medium">No</span>
                                    }
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Base Premium</h3>
                                <p className="mt-1 font-medium">${policy.basePremium !== null && policy.basePremium !== undefined ? policy.basePremium : "-"}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Liability Premium</h3>
                                <p className="mt-1 font-medium">${policy.liabilityPremium !== null && policy.liabilityPremium !== undefined ? policy.liabilityPremium : "-"}</p>
                            </div>
                            {policy.liquorLiability && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Host Liquor Liability Premium</h3>
                                    <p className="mt-1 font-medium">${policy.liquorLiabilityPremium !== null && policy.liquorLiabilityPremium !== undefined ? policy.liquorLiabilityPremium : "-"}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-white shadow-sm rounded-xl p-6">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">Contact Information</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Policy Holder</h3>
                                <p className="mt-1 font-medium">{policy.firstName || "-"} {policy.lastName || "-"}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                                <p className="mt-1 font-medium">{policy.email || "-"}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                                <p className="mt-1 font-medium">{policy.phone || "-"}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Relationship</h3>
                                <p className="mt-1 font-medium">{policy.relationship || "-"}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Address</h3>
                                <p className="mt-1 font-medium">{policy.address || "-"}</p>
                                <p className="font-medium">{policy.city || "-"}, {policy.state || "-"} {policy.zip || "-"}</p>
                                <p className="font-medium">{policy.country || "-"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Step 2: Event Information */}
                <div className="bg-white shadow-sm rounded-xl p-4 sm:p-6 mt-4 sm:mt-6">
                    <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-900 border-b pb-2">
                        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">2</span>
                        Event Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Honoree 1 Name</h3>
                            <p className="mt-1 text-sm sm:text-base font-medium">{policy.honoree1FirstName && policy.honoree1LastName ? `${policy.honoree1FirstName} ${policy.honoree1LastName}` : "-"}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Honoree 2 Name</h3>
                            <p className="mt-1 text-sm sm:text-base font-medium">{policy.honoree2FirstName && policy.honoree2LastName ? `${policy.honoree2FirstName} ${policy.honoree2LastName}` : "-"}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Ceremony Location Type</h3>
                            <p className="mt-1 text-sm sm:text-base font-medium">{policy.ceremonyLocationType || "-"}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Indoor/Outdoor</h3>
                            <p className="mt-1 text-sm sm:text-base font-medium">{policy.indoorOutdoor || "-"}</p>
                        </div>
                        <div className="md:col-span-2">
                            <h3 className="text-sm font-medium text-gray-500">Venue</h3>
                            <p className="mt-1 text-sm sm:text-base font-medium">{policy.venueName || "-"}</p>
                            <p className="text-sm sm:text-base font-medium">{policy.venueAddress1 || "-"} {policy.venueAddress2 ? `, ${policy.venueAddress2}` : ""}</p>
                            <p className="text-sm sm:text-base font-medium">{policy.venueCity || "-"}, {policy.venueState || "-"} {policy.venueZip || "-"}</p>
                            <p className="text-sm sm:text-base font-medium">{policy.venueCountry || "-"}</p>
                            <div className="mt-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${policy.venueAsInsured ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                                    {policy.venueAsInsured ? "Venue As Additional Insured" : "Venue Not Additional Insured"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Additional Venue Information for Weddings */}
                    {policy.eventType?.toLowerCase() === 'wedding' && (
                        <div className="mt-6">
                            <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-900 border-b pb-2">Additional Venue Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {/* Reception Venue */}
                                <div className="md:col-span-2">
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">Reception Venue</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm sm:text-base font-medium">{policy.receptionVenueName || "-"}</p>
                                        <p className="text-sm sm:text-base font-medium">{policy.receptionVenueAddress1 || "-"} {policy.receptionVenueAddress2 ? `, ${policy.receptionVenueAddress2}` : ""}</p>
                                        <p className="text-sm sm:text-base font-medium">{policy.receptionVenueCity || "-"}, {policy.receptionVenueState || "-"} {policy.receptionVenueZip || "-"}</p>
                                        <p className="text-sm sm:text-base font-medium">{policy.receptionVenueCountry || "-"}</p>
                                        <div className="mt-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${policy.receptionVenueAsInsured ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                                                {policy.receptionVenueAsInsured ? "Venue As Additional Insured" : "Venue Not Additional Insured"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Rehearsal Venue */}
                                <div className="md:col-span-2">
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">Rehearsal Venue</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm sm:text-base font-medium">{policy.rehearsalVenueName || "-"}</p>
                                        <p className="text-sm sm:text-base font-medium">{policy.rehearsalVenueAddress1 || "-"} {policy.rehearsalVenueAddress2 ? `, ${policy.rehearsalVenueAddress2}` : ""}</p>
                                        <p className="text-sm sm:text-base font-medium">{policy.rehearsalVenueCity || "-"}, {policy.rehearsalVenueState || "-"} {policy.rehearsalVenueZip || "-"}</p>
                                        <p className="text-sm sm:text-base font-medium">{policy.rehearsalVenueCountry || "-"}</p>
                                        <div className="mt-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${policy.rehearsalVenueAsInsured ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                                                {policy.rehearsalVenueAsInsured ? "Venue As Additional Insured" : "Venue Not Additional Insured"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Rehearsal Dinner Venue */}
                                <div className="md:col-span-2">
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">Rehearsal Dinner Venue</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm sm:text-base font-medium">{policy.rehearsalDinnerVenueName || "-"}</p>
                                        <p className="text-sm sm:text-base font-medium">{policy.rehearsalDinnerVenueAddress1 || "-"} {policy.rehearsalDinnerVenueAddress2 ? `, ${policy.rehearsalDinnerVenueAddress2}` : ""}</p>
                                        <p className="text-sm sm:text-base font-medium">{policy.rehearsalDinnerVenueCity || "-"}, {policy.rehearsalDinnerVenueState || "-"} {policy.rehearsalDinnerVenueZip || "-"}</p>
                                        <p className="text-sm sm:text-base font-medium">{policy.rehearsalDinnerVenueCountry || "-"}</p>
                                        <div className="mt-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${policy.rehearsalDinnerVenueAsInsured ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                                                {policy.rehearsalDinnerVenueAsInsured ? "Venue As Additional Insured" : "Venue Not Additional Insured"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Brunch Venue */}
                                <div className="md:col-span-2">
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">Brunch Venue</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm sm:text-base font-medium">{policy.brunchVenueName || "-"}</p>
                                        <p className="text-sm sm:text-base font-medium">{policy.brunchVenueAddress1 || "-"} {policy.brunchVenueAddress2 ? `, ${policy.brunchVenueAddress2}` : ""}</p>
                                        <p className="text-sm sm:text-base font-medium">{policy.brunchVenueCity || "-"}, {policy.brunchVenueState || "-"} {policy.brunchVenueZip || "-"}</p>
                                        <p className="text-sm sm:text-base font-medium">{policy.brunchVenueCountry || "-"}</p>
                                        <div className="mt-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${policy.brunchVenueAsInsured ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                                                {policy.brunchVenueAsInsured ? "Venue As Additional Insured" : "Venue Not Additional Insured"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Additional Information */}
                <div className="bg-white shadow-sm rounded-xl p-6 mt-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">Additional Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Additional Email</h3>
                            <p className="mt-1 font-medium">{policy.additionalEmail || "-"}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Hear About Us</h3>
                            <p className="mt-1 font-medium">{policy.hearAboutUs || "-"}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Legal Notices</h3>
                            <p className="mt-1 font-medium">{policy.legalNotices ? "Yes" : "No"}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Completing Form Name</h3>
                            <p className="mt-1 font-medium">{policy.completingFormName || "-"}</p>
                        </div>
                    </div>
                </div>

                {policy.versions && policy.versions.length > 0 && (
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-2">Version History</h3>
                        <div className="space-y-2">
                            {policy.versions.map((version) => (
                                <div
                                    key={version.id}
                                    className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleVersionClick(version.id)}
                                >
                                    <div className="flex items-center space-x-2">
                                        <FileText className="h-4 w-4 text-blue-600" />
                                        <span>Version from {new Date(version.createdAt).toLocaleString()}</span>
                                    </div>
                                    <Download className="h-4 w-4 text-gray-500" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}