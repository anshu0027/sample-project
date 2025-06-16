/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  // Mail,
  // Edit,
  DollarSign,
  Calendar,
  Users,
  Shield,
  Wine,
  Activity,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import React from 'react';
import { toast } from '@/hooks/use-toast';

interface Quote {
  id: number;
  quoteNumber: string;
  eventType?: string | null;
  eventDate?: string | null;
  maxGuests?: string | null;
  coverageLevel?: number | null;
  liabilityCoverage?: string | null;
  liquorLiability?: boolean | null;
  covidDisclosure?: boolean | null;
  specialActivities?: boolean | null;
  totalPremium?: number | null;
  basePremium?: number | null;
  liabilityPremium?: number | null;
  liquorLiabilityPremium?: number | null;
  createdAt?: string | null;
  status?: string | null;
  honoree1FirstName?: string | null;
  honoree1LastName?: string | null;
  honoree2FirstName?: string | null;
  honoree2LastName?: string | null;
  ceremonyLocationType?: string | null;
  locationType?: string | null;
  indoorOutdoor?: string | null;
  venueName?: string | null;
  venueAddress1?: string | null;
  venueAddress2?: string | null;
  venueCountry?: string | null;
  venueCity?: string | null;
  venueState?: string | null;
  venueZip?: string | null;
  venueAsInsured?: boolean | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  relationship?: string | null;
  hearAboutUs?: string | null;
  address?: string | null;
  country?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  legalNotices?: boolean | null;
  completingFormName?: string | null;
  receptionVenueName?: string | null;
  receptionVenueAddress1?: string | null;
  receptionVenueAddress2?: string | null;
  receptionVenueCity?: string | null;
  receptionVenueState?: string | null;
  receptionVenueZip?: string | null;
  receptionVenueCountry?: string | null;
  receptionVenueAsInsured?: boolean | null;
  rehearsalVenueName?: string | null;
  rehearsalVenueAddress1?: string | null;
  rehearsalVenueAddress2?: string | null;
  rehearsalVenueCity?: string | null;
  rehearsalVenueState?: string | null;
  rehearsalVenueZip?: string | null;
  rehearsalVenueCountry?: string | null;
  rehearsalVenueAsInsured?: boolean | null;
  rehearsalDinnerVenueName?: string | null;
  rehearsalDinnerVenueAddress1?: string | null;
  rehearsalDinnerVenueAddress2?: string | null;
  rehearsalDinnerVenueCity?: string | null;
  rehearsalDinnerVenueState?: string | null;
  rehearsalDinnerVenueZip?: string | null;
  rehearsalDinnerVenueCountry?: string | null;
  rehearsalDinnerVenueAsInsured?: boolean | null;
  brunchVenueName?: string | null;
  brunchVenueAddress1?: string | null;
  brunchVenueAddress2?: string | null;
  brunchVenueCity?: string | null;
  brunchVenueState?: string | null;
  brunchVenueZip?: string | null;
  brunchVenueCountry?: string | null;
  brunchVenueAsInsured?: boolean | null;
}

function flattenQuote(quote: any): Quote | null {
  if (!quote) return null;
  // console.log('Raw quote data:', JSON.stringify(quote, null, 2));

  const flattened = {
    id: quote.id,
    quoteNumber: quote.quoteNumber,
    eventType: quote.event?.eventType || quote.eventType || '',
    eventDate: quote.event?.eventDate || quote.eventDate || '',
    maxGuests: quote.event?.maxGuests || quote.maxGuests || '',
    coverageLevel: quote.coverageLevel || null,
    liabilityCoverage: quote.liabilityCoverage || '',
    liquorLiability: quote.liquorLiability || false,
    covidDisclosure: quote.covidDisclosure || false,
    specialActivities: quote.specialActivities || false,
    totalPremium: quote.totalPremium,
    basePremium: quote.basePremium,
    liabilityPremium: quote.liabilityPremium,
    liquorLiabilityPremium: quote.liquorLiabilityPremium,
    createdAt: quote.createdAt,
    status: quote.status,
    honoree1FirstName: quote.event?.honoree1FirstName || '',
    honoree1LastName: quote.event?.honoree1LastName || '',
    honoree2FirstName: quote.event?.honoree2FirstName || '',
    honoree2LastName: quote.event?.honoree2LastName || '',
    ceremonyLocationType: quote.event?.venue?.ceremonyLocationType || '',
    locationType: quote.event?.venue?.locationType || quote.locationType || '',
    indoorOutdoor: quote.event?.venue?.indoorOutdoor || quote.indoorOutdoor || '',
    venueName: quote.event?.venue?.name || '',
    venueAddress1: quote.event?.venue?.address1 || '',
    venueAddress2: quote.event?.venue?.address2 || '',
    venueCountry: quote.event?.venue?.country || '',
    venueCity: quote.event?.venue?.city || '',
    venueState: quote.event?.venue?.state || '',
    venueZip: quote.event?.venue?.zip || '',
    venueAsInsured: quote.event?.venue?.venueAsInsured || false,
    firstName: quote.policyHolder?.firstName || '',
    lastName: quote.policyHolder?.lastName || '',
    email: quote.email || quote.policyHolder?.email || '',
    phone: quote.policyHolder?.phone || '',
    relationship: quote.policyHolder?.relationship || quote.relationship || '',
    hearAboutUs: quote.policyHolder?.hearAboutUs || '',
    address: quote.policyHolder?.address || '',
    country: quote.policyHolder?.country || '',
    city: quote.policyHolder?.city || '',
    state: quote.policyHolder?.state || '',
    zip: quote.policyHolder?.zip || '',
    legalNotices: quote.policyHolder?.legalNotices || false,
    completingFormName: quote.policyHolder?.completingFormName || quote.completingFormName || '',
    // Additional venues for wedding events
    receptionVenueName: quote.event?.venue?.receptionVenueName || '',
    receptionVenueAddress1: quote.event?.venue?.receptionVenueAddress1 || '',
    receptionVenueAddress2: quote.event?.venue?.receptionVenueAddress2 || '',
    receptionVenueCity: quote.event?.venue?.receptionVenueCity || '',
    receptionVenueState: quote.event?.venue?.receptionVenueState || '',
    receptionVenueZip: quote.event?.venue?.receptionVenueZip || '',
    receptionVenueCountry: quote.event?.venue?.receptionVenueCountry || '',
    receptionVenueAsInsured: quote.event?.venue?.receptionVenueAsInsured || false,
    rehearsalVenueName: quote.event?.venue?.rehearsalVenueName || '',
    rehearsalVenueAddress1: quote.event?.venue?.rehearsalVenueAddress1 || '',
    rehearsalVenueAddress2: quote.event?.venue?.rehearsalVenueAddress2 || '',
    rehearsalVenueCity: quote.event?.venue?.rehearsalVenueCity || '',
    rehearsalVenueState: quote.event?.venue?.rehearsalVenueState || '',
    rehearsalVenueZip: quote.event?.venue?.rehearsalVenueZip || '',
    rehearsalVenueCountry: quote.event?.venue?.rehearsalVenueCountry || '',
    rehearsalVenueAsInsured: quote.event?.venue?.rehearsalVenueAsInsured || false,
    rehearsalDinnerVenueName: quote.event?.venue?.rehearsalDinnerVenueName || '',
    rehearsalDinnerVenueAddress1: quote.event?.venue?.rehearsalDinnerVenueAddress1 || '',
    rehearsalDinnerVenueAddress2: quote.event?.venue?.rehearsalDinnerVenueAddress2 || '',
    rehearsalDinnerVenueCity: quote.event?.venue?.rehearsalDinnerVenueCity || '',
    rehearsalDinnerVenueState: quote.event?.venue?.rehearsalDinnerVenueState || '',
    rehearsalDinnerVenueZip: quote.event?.venue?.rehearsalDinnerVenueZip || '',
    rehearsalDinnerVenueCountry: quote.event?.venue?.rehearsalDinnerVenueCountry || '',
    rehearsalDinnerVenueAsInsured: quote.event?.venue?.rehearsalDinnerVenueAsInsured || false,
    brunchVenueName: quote.event?.venue?.brunchVenueName || '',
    brunchVenueAddress1: quote.event?.venue?.brunchVenueAddress1 || '',
    brunchVenueAddress2: quote.event?.venue?.brunchVenueAddress2 || '',
    brunchVenueCity: quote.event?.venue?.brunchVenueCity || '',
    brunchVenueState: quote.event?.venue?.brunchVenueState || '',
    brunchVenueZip: quote.event?.venue?.brunchVenueZip || '',
    brunchVenueCountry: quote.event?.venue?.brunchVenueCountry || '',
    brunchVenueAsInsured: quote.event?.venue?.brunchVenueAsInsured || false,
  };

  // console.log('Flattened quote data:', JSON.stringify(flattened, null, 2));
  return flattened;
}

export default function QuoteDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  // const [isEmailSent, setIsEmailSent] = useState(false);

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ==================================================================
  // ===== API CHANGE #1: Fetching the quote data ===================
  // ==================================================================
  useEffect(() => {
    async function fetchQuote() {
      setLoading(true);
      setError('');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      try {
        // console.log('Fetching quote with ID:', id);
        const res = await fetch(`${apiUrl}/quotes?quoteNumber=${id}`);
        if (!res.ok) {
          const errData = await res.json();
          console.error('Error response:', errData);
          throw new Error(errData.error || 'Failed to fetch quote');
        }
        const data = await res.json();
        // console.log('API response:', data);
        setQuote(flattenQuote(data.quote || null));
      } catch (err: unknown) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchQuote();
  }, [id]);

  const handleBack = () => {
    router.push('/admin/quotes');
  };

  // const handleEdit = () => {
  //     router.push(`/admin/quotes/${id}/edit`);
  // };

  // ==================================================================
  // ===== API CHANGE #2: Converting the quote to a policy ==========
  // ==================================================================
  const handleConvertToPolicy = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      const res = await fetch(`${apiUrl}/policies/from-quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteNumber: id,
          forceConvert: true,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to convert quote to policy');
      }
      const data = await res.json();
      toast.success(`Quote converted to policy successfully! Policy Number: ${data.policyNumber}`);
      router.push(`/admin/policies/${data.policyNumber}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to convert quote to policy.';
      toast.error(message);
      setError(message);
    }
  };

  // ==================================================================
  // ===== API CHANGE #3: Sending the quote email ===================
  // ==================================================================
  // const handleEmailQuote = async () => {
  //     const recipientEmail = quote?.email;
  //     if (!recipientEmail) {
  //         toast.error("No email found for this quote.");
  //         return;
  //     }
  //     setIsEmailSent(true);
  //     const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  //     try {
  //         const res = await fetch(`${apiUrl}/email/send`, {
  //             method: "POST",
  //             headers: { "Content-Type": "application/json" },
  //             body: JSON.stringify({
  //                 to: recipientEmail,
  //                 type: 'quote',
  //                 data: quote // Send the entire quote object
  //             })
  //         });
  //         if (res.ok) {
  //             toast.success("Quote emailed successfully!");
  //         } else {
  //             const data = await res.json();
  //             throw new Error(data.error || "Failed to send email");
  //         }
  //     } catch (err) {
  //         const message = err instanceof Error ? err.message : "An unknown error occurred.";
  //         toast.error(message);
  //     } finally {
  //         setIsEmailSent(false);
  //     }
  // };

  // ==================================================================
  // ===== API CHANGE #4: Deleting the quote ========================
  // ==================================================================
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this quote?')) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      const res = await fetch(`${apiUrl}/quotes/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete quote');
      }
      toast.success('Quote deleted successfully.');
      router.push('/admin/quotes');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      toast.error(message);
      setError(message);
    }
  };

  // Skeleton Component
  const QuoteDetailSkeleton = () => (
    <div className="bg-gray-50 min-h-screen animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="bg-white shadow-sm rounded-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <div className="mr-4 p-2 rounded-full bg-gray-200 h-10 w-10"></div>
              <div>
                <div className="h-7 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="flex items-center mt-1">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="mx-2 text-gray-300">•</div>
                  <div className="h-5 bg-gray-200 rounded-full w-20"></div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="h-10 bg-gray-200 rounded-md w-32"></div>
              <div className="h-10 bg-gray-200 rounded-md w-32"></div>
              <div className="h-10 bg-gray-200 rounded-md w-40"></div>
              <div className="h-10 bg-gray-200 rounded-md w-28"></div>
            </div>
          </div>
        </div>

        {/* Quote Summary Skeleton */}
        <div className="bg-white shadow-sm rounded-xl p-6 mb-6">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div> {/* Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="bg-gray-200 rounded-full h-8 w-8 mr-3"></div>
                  <div>
                    <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
                    <div className="h-5 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Details Section Skeleton (covers Step 1, Event Info, Additional Info) */}
          {[...Array(2)].map(
            (
              _,
              sectionIndex, // For main details and contact info
            ) => (
              <div
                key={sectionIndex}
                className={`bg-white shadow-sm rounded-xl p-6 ${sectionIndex === 0 ? 'lg:col-span-2' : ''}`}
              >
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div> {/* Section Title */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(sectionIndex === 0 ? 6 : 4)].map(
                    (
                      _,
                      i, // Number of items per section
                    ) => (
                      <div key={i}>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            ),
          )}
          {/* Event/Additional Info Section Skeleton */}
          <div className="bg-white shadow-sm rounded-xl p-6 mt-6 lg:col-span-3">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div> {/* Section Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <QuoteDetailSkeleton />;
  }
  if (error) {
    return (
      <div className="p-4 sm:p-8 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }
  if (!quote) {
    return (
      <div className="p-4 sm:p-8 max-w-7xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
          No quote found with ID #{id}.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                onMouseEnter={() => router.prefetch(`/admin/quotes`)}
                className="mr-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Quote #{id}</h1>
                <div className="flex items-center mt-1">
                  <span className="text-xs sm:text-sm text-gray-500">
                    Created {quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : '-'}
                  </span>
                  <span className="mx-2 text-gray-300">•</span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      quote.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : quote.status === 'Emailed'
                          ? 'bg-blue-100 text-blue-800'
                          : quote.status === 'Converted'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {quote.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {/* <Button
                                variant="outline"
                                onClick={handleEmailQuote}
                                disabled={isEmailSent}
                                className="text-sm"
                            >
                                <Mail size={16} className="mr-2" />
                                {isEmailSent ? "Sending..." : "Email Quote"}
                            </Button> */}
              {/* <Button
                                variant="outline"
                                onClick={handleEdit}
                                className="text-sm"
                            >
                                <Edit size={16} className="mr-2" />
                                Edit Quote
                            </Button> */}
              <Button variant="default" onClick={handleConvertToPolicy} className="text-sm">
                <DollarSign size={16} className="mr-2" />
                Convert to Policy
              </Button>
              <Button
                variant="outline"
                className="text-sm text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleDelete}
              >
                <Trash2 size={16} className="mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Quote Summary */}
        <div className="bg-white shadow-sm rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-900 border-b pb-2">
            Quote Summary
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <Calendar className="text-blue-500 mr-3" size={20} />
                <div>
                  <p className="text-xs font-medium text-blue-500">Event Date</p>
                  <p className="text-sm sm:text-base font-semibold">
                    {quote.eventDate ? new Date(quote.eventDate).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <Users className="text-purple-500 mr-3" size={20} />
                <div>
                  <p className="text-xs font-medium text-purple-500">Guest Count</p>
                  <p className="text-sm sm:text-base font-semibold">{quote.maxGuests || '-'}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <Shield className="text-green-500 mr-3" size={20} />
                <div>
                  <p className="text-xs font-medium text-green-500">Coverage Level</p>
                  <p className="text-sm sm:text-base font-semibold">
                    {quote.coverageLevel !== null && quote.coverageLevel !== undefined
                      ? `Level ${quote.coverageLevel}`
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4">
              <div className="flex items-center">
                <DollarSign className="text-indigo-500 mr-3" size={20} />
                <div>
                  <p className="text-xs font-medium text-indigo-500">Total Premium</p>
                  <p className="text-sm sm:text-base font-semibold">
                    $
                    {quote.totalPremium !== null && quote.totalPremium !== undefined
                      ? quote.totalPremium
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Step 1: Quote Details */}
          <div className="bg-white shadow-sm rounded-xl p-4 sm:p-6 lg:col-span-2">
            <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-900 border-b pb-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">
                1
              </span>
              Quote Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Event Type</h3>
                <p className="mt-1 text-sm sm:text-base font-medium">{quote.eventType || '-'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Liability Coverage</h3>
                <p className="mt-1 text-sm sm:text-base font-medium">
                  {quote.liabilityCoverage || '-'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Host Liquor Liability</h3>
                <div className="mt-1 flex items-center">
                  {quote.liquorLiability ? (
                    <>
                      <Wine size={16} className="text-green-500 mr-1" />{' '}
                      <span className="text-sm sm:text-base font-medium">Included</span>
                    </>
                  ) : (
                    <span className="text-sm sm:text-base font-medium">Not Included</span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Special Activities</h3>
                <div className="mt-1 flex items-center">
                  {quote.specialActivities ? (
                    <>
                      <Activity size={16} className="text-amber-500 mr-1" />{' '}
                      <span className="text-sm sm:text-base font-medium">Yes</span>
                    </>
                  ) : (
                    <span className="text-sm sm:text-base font-medium">No</span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Covid Disclosure</h3>
                <div className="mt-1 flex items-center">
                  {quote.covidDisclosure ? (
                    <>
                      <AlertTriangle size={16} className="text-amber-500 mr-1" />{' '}
                      <span className="text-sm sm:text-base font-medium">Yes</span>
                    </>
                  ) : (
                    <span className="text-sm sm:text-base font-medium">No</span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Base Premium</h3>
                <p className="mt-1 text-sm sm:text-base font-medium">
                  $
                  {quote.basePremium !== null && quote.basePremium !== undefined
                    ? quote.basePremium
                    : '-'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Liability Premium</h3>
                <p className="mt-1 text-sm sm:text-base font-medium">
                  $
                  {quote.liabilityPremium !== null && quote.liabilityPremium !== undefined
                    ? quote.liabilityPremium
                    : '-'}
                </p>
              </div>
              {quote.liquorLiability && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Host Liquor Liability Premium
                  </h3>
                  <p className="mt-1 text-sm sm:text-base font-medium">
                    $
                    {quote.liquorLiabilityPremium !== null &&
                    quote.liquorLiabilityPremium !== undefined
                      ? quote.liquorLiabilityPremium
                      : '-'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white shadow-sm rounded-xl p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-900 border-b pb-2">
              Contact Information
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Policy Holder</h3>
                <p className="mt-1 text-sm sm:text-base font-medium">
                  {quote.firstName || '-'} {quote.lastName || '-'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1 text-sm sm:text-base font-medium break-words">
                  {quote.email || '-'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                <p className="mt-1 text-sm sm:text-base font-medium">{quote.phone || '-'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Relationship</h3>
                <p className="mt-1 text-sm sm:text-base font-medium">{quote.relationship || '-'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Address</h3>
                <p className="mt-1 text-sm sm:text-base font-medium">{quote.address || '-'}</p>
                <p className="text-sm sm:text-base font-medium">
                  {quote.city || '-'}, {quote.state || '-'} {quote.zip || '-'}
                </p>
                <p className="text-sm sm:text-base font-medium">{quote.country || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Event Information */}
        <div className="bg-white shadow-sm rounded-xl p-4 sm:p-6 mt-4 sm:mt-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-900 border-b pb-2">
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">
              2
            </span>
            Event Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Honoree 1 Name</h3>
              <p className="mt-1 text-sm sm:text-base font-medium">
                {quote.honoree1FirstName && quote.honoree1LastName
                  ? `${quote.honoree1FirstName} ${quote.honoree1LastName}`
                  : '-'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Honoree 2 Name</h3>
              <p className="mt-1 text-sm sm:text-base font-medium">
                {quote.honoree2FirstName && quote.honoree2LastName
                  ? `${quote.honoree2FirstName} ${quote.honoree2LastName}`
                  : '-'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Ceremony Location Type</h3>
              <p className="mt-1 text-sm sm:text-base font-medium">
                {quote.ceremonyLocationType || '-'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Indoor/Outdoor</h3>
              <p className="mt-1 text-sm sm:text-base font-medium">{quote.indoorOutdoor || '-'}</p>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500">Venue</h3>
              <p className="mt-1 text-sm sm:text-base font-medium">{quote.venueName || '-'}</p>
              <p className="text-sm sm:text-base font-medium">
                {quote.venueAddress1 || '-'} {quote.venueAddress2 ? `, ${quote.venueAddress2}` : ''}
              </p>
              <p className="text-sm sm:text-base font-medium">
                {quote.venueCity || '-'}, {quote.venueState || '-'} {quote.venueZip || '-'}
              </p>
              <p className="text-sm sm:text-base font-medium">{quote.venueCountry || '-'}</p>
              <div className="mt-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${quote.venueAsInsured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                >
                  {quote.venueAsInsured
                    ? 'Venue As Additional Insured'
                    : 'Venue Not Additional Insured'}
                </span>
              </div>
            </div>
          </div>

          {/* Additional Venue Information for Weddings */}
          {quote?.eventType?.toLowerCase() === 'wedding' && (
            <div className="mt-6">
              <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-900 border-b pb-2">
                Additional Venue Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Reception Venue */}
                {(quote.receptionVenueName || quote.receptionVenueAddress1) && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Reception Venue</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm sm:text-base font-medium">
                        {quote.receptionVenueName || '-'}
                      </p>
                      <p className="text-sm sm:text-base font-medium">
                        {quote.receptionVenueAddress1 || '-'}{' '}
                        {quote.receptionVenueAddress2 ? `, ${quote.receptionVenueAddress2}` : ''}
                      </p>
                      <p className="text-sm sm:text-base font-medium">
                        {quote.receptionVenueCity || '-'}, {quote.receptionVenueState || '-'}{' '}
                        {quote.receptionVenueZip || '-'}
                      </p>
                      <p className="text-sm sm:text-base font-medium">
                        {quote.receptionVenueCountry || '-'}
                      </p>
                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${quote.receptionVenueAsInsured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                        >
                          {quote.receptionVenueAsInsured
                            ? 'Venue As Additional Insured'
                            : 'Venue Not Additional Insured'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rehearsal Venue */}
                {(quote.rehearsalVenueName || quote.rehearsalVenueAddress1) && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Rehearsal Venue</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm sm:text-base font-medium">
                        {quote.rehearsalVenueName || '-'}
                      </p>
                      <p className="text-sm sm:text-base font-medium">
                        {quote.rehearsalVenueAddress1 || '-'}{' '}
                        {quote.rehearsalVenueAddress2 ? `, ${quote.rehearsalVenueAddress2}` : ''}
                      </p>
                      <p className="text-sm sm:text-base font-medium">
                        {quote.rehearsalVenueCity || '-'}, {quote.rehearsalVenueState || '-'}{' '}
                        {quote.rehearsalVenueZip || '-'}
                      </p>
                      <p className="text-sm sm:text-base font-medium">
                        {quote.rehearsalVenueCountry || '-'}
                      </p>
                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${quote.rehearsalVenueAsInsured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                        >
                          {quote.rehearsalVenueAsInsured
                            ? 'Venue As Additional Insured'
                            : 'Venue Not Additional Insured'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rehearsal Dinner Venue */}
                {(quote.rehearsalDinnerVenueName || quote.rehearsalDinnerVenueAddress1) && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Rehearsal Dinner Venue
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm sm:text-base font-medium">
                        {quote.rehearsalDinnerVenueName || '-'}
                      </p>
                      <p className="text-sm sm:text-base font-medium">
                        {quote.rehearsalDinnerVenueAddress1 || '-'}{' '}
                        {quote.rehearsalDinnerVenueAddress2
                          ? `, ${quote.rehearsalDinnerVenueAddress2}`
                          : ''}
                      </p>
                      <p className="text-sm sm:text-base font-medium">
                        {quote.rehearsalDinnerVenueCity || '-'},{' '}
                        {quote.rehearsalDinnerVenueState || '-'}{' '}
                        {quote.rehearsalDinnerVenueZip || '-'}
                      </p>
                      <p className="text-sm sm:text-base font-medium">
                        {quote.rehearsalDinnerVenueCountry || '-'}
                      </p>
                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${quote.rehearsalDinnerVenueAsInsured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                        >
                          {quote.rehearsalDinnerVenueAsInsured
                            ? 'Venue As Additional Insured'
                            : 'Venue Not Additional Insured'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Brunch Venue */}
                {(quote.brunchVenueName || quote.brunchVenueAddress1) && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Brunch Venue</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm sm:text-base font-medium">
                        {quote.brunchVenueName || '-'}
                      </p>
                      <p className="text-sm sm:text-base font-medium">
                        {quote.brunchVenueAddress1 || '-'}{' '}
                        {quote.brunchVenueAddress2 ? `, ${quote.brunchVenueAddress2}` : ''}
                      </p>
                      <p className="text-sm sm:text-base font-medium">
                        {quote.brunchVenueCity || '-'}, {quote.brunchVenueState || '-'}{' '}
                        {quote.brunchVenueZip || '-'}
                      </p>
                      <p className="text-sm sm:text-base font-medium">
                        {quote.brunchVenueCountry || '-'}
                      </p>
                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${quote.brunchVenueAsInsured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                        >
                          {quote.brunchVenueAsInsured
                            ? 'Venue As Additional Insured'
                            : 'Venue Not Additional Insured'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className="bg-white shadow-sm rounded-xl p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">
            Additional Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Hear About Us</h3>
              <p className="mt-1 font-medium">{quote.hearAboutUs || '-'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Legal Notices</h3>
              <p className="mt-1 font-medium">{quote.legalNotices ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Completing Form Name</h3>
              <p className="mt-1 font-medium">{quote.completingFormName || '-'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
