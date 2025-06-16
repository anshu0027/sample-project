/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  DollarSign,
  Calendar,
  Users,
  Shield,
  Wine,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import React from 'react';
import { toast } from '@/hooks/use-toast';

// Helper function to flatten policy data, handling both direct policies and quote-based policies
function flattenPolicy(policy: any) {
  if (!policy) return null;

  // Determine the source of event and policy holder data
  // Data can be directly on the policy or nested under the associated quote
  const eventSource = policy.event || policy.quote?.event;
  const policyHolderSource = policy.policyHolder || policy.quote?.policyHolder;
  const venueSource = eventSource?.venue;

  // Determine liabilityCoverage first
  const liabilityCoverageValue = policy.liabilityCoverage || policy.quote?.liabilityCoverage || '';

  // Determine liabilityPremium based on coverage and available data
  let liabilityPremiumValue = policy.liabilityPremium ?? policy.quote?.liabilityPremium ?? null;

  // If liability coverage is 'none', the premium should explicitly be 0.
  if (liabilityCoverageValue === 'none') {
    liabilityPremiumValue = 0;
  }

  return {
    id: policy.id,
    policyNumber: policy.policyNumber, // Use policyNumber from the policy object
    quoteNumber: policy.quote?.quoteNumber || null, // Get quoteNumber from the nested quote

    // Policy Details (can be on policy or quote)
    eventType: eventSource?.eventType || '',
    eventDate: eventSource?.eventDate || '',
    maxGuests: eventSource?.maxGuests || '',
    coverageLevel: policy.coverageLevel ?? policy.quote?.coverageLevel ?? null, // Existing logic for coverageLevel
    liabilityCoverage: liabilityCoverageValue,
    liquorLiability: policy.liquorLiability ?? policy.quote?.liquorLiability ?? false,
    covidDisclosure: policy.covidDisclosure ?? policy.quote?.covidDisclosure ?? false,
    specialActivities: policy.specialActivities ?? policy.quote?.specialActivities ?? false,
    totalPremium: policy.totalPremium ?? policy.quote?.totalPremium ?? null,
    basePremium: policy.basePremium ?? policy.quote?.basePremium ?? null, // Existing logic for basePremium
    liabilityPremium: liabilityPremiumValue,
    liquorLiabilityPremium:
      policy.liquorLiabilityPremium ?? policy.quote?.liquorLiabilityPremium ?? null,

    // Policy Holder Info (can be on policy or quote)
    firstName: policyHolderSource?.firstName || '',
    lastName: policyHolderSource?.lastName || '',
    email: policy.email || policyHolderSource?.email || policy.quote?.email || '', // Check multiple places for email
    phone: policyHolderSource?.phone || '',
    relationship: policyHolderSource?.relationship || '',
    hearAboutUs: policyHolderSource?.hearAboutUs || '',
    address: policyHolderSource?.address || '',
    country: policyHolderSource?.country || '',
    city: policyHolderSource?.city || '',
    state: policyHolderSource?.state || '',
    zip: policyHolderSource?.zip || '',
    legalNotices: policyHolderSource?.legalNotices ?? false,
    completingFormName: policyHolderSource?.completingFormName || '',

    // Venue Info (nested under event, which can be on policy or quote)
    ceremonyLocationType: venueSource?.ceremonyLocationType || '',
    locationType: venueSource?.locationType || '',
    indoorOutdoor: venueSource?.indoorOutdoor || '',
    venueName: venueSource?.name || '',
    venueAddress1: venueSource?.address1 || '',
    venueAddress2: venueSource?.address2 || '',
    venueCountry: venueSource?.country || '',
    venueCity: venueSource?.city || '',
    venueState: venueSource?.state || '',
    venueZip: venueSource?.zip || '',
    venueAsInsured: venueSource?.venueAsInsured ?? false,

    // Additional Venue Fields for Wedding Events (nested under event, which can be on policy or quote)
    receptionLocationType: venueSource?.receptionLocationType || '',
    receptionIndoorOutdoor: venueSource?.receptionIndoorOutdoor || '',
    receptionVenueName: venueSource?.receptionVenueName || '',
    receptionVenueAddress1: venueSource?.receptionVenueAddress1 || '',
    receptionVenueAddress2: venueSource?.receptionVenueAddress2 || '',
    receptionVenueCountry: venueSource?.receptionVenueCountry || '',
    receptionVenueCity: venueSource?.receptionVenueCity || '',
    receptionVenueState: venueSource?.receptionVenueState || '',
    receptionVenueZip: venueSource?.receptionVenueZip || '',
    receptionVenueAsInsured: venueSource?.receptionVenueAsInsured ?? false,

    brunchLocationType: venueSource?.brunchLocationType || '',
    brunchIndoorOutdoor: venueSource?.brunchIndoorOutdoor || '',
    brunchVenueName: venueSource?.brunchVenueName || '',
    brunchVenueAddress1: venueSource?.brunchVenueAddress1 || '',
    brunchVenueAddress2: venueSource?.brunchVenueAddress2 || '',
    brunchVenueCountry: venueSource?.brunchVenueCountry || '',
    brunchVenueCity: venueSource?.brunchVenueCity || '',
    brunchVenueState: venueSource?.brunchVenueState || '',
    brunchVenueZip: venueSource?.brunchVenueZip || '',
    brunchVenueAsInsured: venueSource?.brunchVenueAsInsured ?? false,

    rehearsalLocationType: venueSource?.rehearsalLocationType || '',
    rehearsalIndoorOutdoor: venueSource?.rehearsalIndoorOutdoor || '',
    rehearsalVenueName: venueSource?.rehearsalVenueName || '',
    rehearsalVenueAddress1: venueSource?.rehearsalVenueAddress1 || '',
    rehearsalVenueAddress2: venueSource?.rehearsalVenueAddress2 || '',
    rehearsalVenueCountry: venueSource?.rehearsalVenueCountry || '',
    rehearsalVenueCity: venueSource?.rehearsalVenueCity || '',
    rehearsalVenueState: venueSource?.rehearsalVenueState || '',
    rehearsalVenueZip: venueSource?.rehearsalVenueZip || '',
    rehearsalVenueAsInsured: venueSource?.rehearsalVenueAsInsured ?? false,

    rehearsalDinnerLocationType: venueSource?.rehearsalDinnerLocationType || '',
    rehearsalDinnerIndoorOutdoor: venueSource?.rehearsalDinnerIndoorOutdoor || '',
    rehearsalDinnerVenueName: venueSource?.rehearsalDinnerVenueName || '',
    rehearsalDinnerVenueAddress1: venueSource?.rehearsalDinnerVenueAddress1 || '',
    rehearsalDinnerVenueAddress2: venueSource?.rehearsalDinnerVenueAddress2 || '',
    rehearsalDinnerVenueCountry: venueSource?.rehearsalDinnerVenueCountry || '',
    rehearsalDinnerVenueCity: venueSource?.rehearsalDinnerVenueCity || '',
    rehearsalDinnerVenueState: venueSource?.rehearsalDinnerVenueState || '',
    rehearsalDinnerVenueZip: venueSource?.rehearsalDinnerVenueZip || '',
    rehearsalDinnerVenueAsInsured: venueSource?.rehearsalDinnerVenueAsInsured ?? false,

    // Metadata
    createdAt: policy.createdAt,
    status: policy.status,
    // Include honoree names from eventSource
    honoree1FirstName: eventSource?.honoree1FirstName || '',
    honoree1LastName: eventSource?.honoree1LastName || '',
    honoree2FirstName: eventSource?.honoree2FirstName || '',
    honoree2LastName: eventSource?.honoree2LastName || '',
  };
}

export default function PolicyDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [policy, setPolicy] = useState<any | null>(null);
  const [quote, setQuote] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ==================================================================
  // ===== API CHANGE #1: Fetching the policy/quote data ============
  // ==================================================================
  useEffect(() => {
    async function fetchPolicy() {
      setLoading(true);
      setError('');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      try {
        const res = await fetch(`${apiUrl}/policies/${id}`, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) throw new Error('Policy not found');
        const data = await res.json();

        // console.log('=== Raw Policy Data ===');
        // console.log('Full API response:', data);
        // console.log('Policy data:', data.policy);
        // console.log('Event data:', data.policy?.event);
        // console.log('Venue data:', data.policy?.event?.venue);

        if (!data.policy) {
          throw new Error('Policy data is missing');
        }

        // Flatten the policy data using the updated function
        const flattenedPolicy = flattenPolicy(data.policy);
        setPolicy(flattenedPolicy);
        setQuote(data.policy.quote || null); // Keep quote state if needed elsewhere, but not used in rendering now
      } catch (error) {
        console.error('Error fetching policy:', error);
        toast({
          title: 'Failed to fetch policy data',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchPolicy();
  }, [id]);

  const handleBack = () => router.push('/admin/policies');
  const handleEdit = () => router.push(`/admin/policies/${id}/edit`);
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
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div> {/* Label */}
                        <div className="h-5 bg-gray-200 rounded w-3/4"></div> {/* Value */}
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
              {[...Array(5)].map(
                (
                  _,
                  i, // Number of items
                ) => (
                  <div key={i}>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return <PolicyDetailSkeleton />;
  if (error)
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  if (!policy)
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
          No policy found with ID #{id}.
        </div>
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                onMouseEnter={() => router.prefetch('/admin/policies')}
                className="mr-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Policy Details - {policy.policyNumber}
                </h1>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-500">
                    Issued{' '}
                    {policy.createdAt ? new Date(policy.createdAt).toLocaleDateString() : '-'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleEdit}
                onMouseEnter={() => router.prefetch(`/admin/policies/${id}/edit`)}
              >
                <Edit size={18} className="mr-2" /> Edit Policy
              </Button>
            </div>
          </div>
        </div>

        {/* Policy Summary */}
        <div className="bg-white shadow-sm rounded-xl p-6 mb-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-900 border-b pb-2">
            Policy Summary
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <Calendar className="text-blue-500 mr-3" size={20} />
                <div>
                  <p className="text-xs font-medium text-blue-500">Event Date</p>
                  <p className="font-semibold">
                    {policy.eventDate ? new Date(policy.eventDate).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <Users className="text-purple-500 mr-3" size={20} />
                <div>
                  <p className="text-xs font-medium text-purple-500">Guest Count</p>
                  <p className="font-semibold">{policy.maxGuests || '-'}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <Shield className="text-green-500 mr-3" size={20} />
                <div>
                  <p className="text-xs font-medium text-green-500">Coverage Level</p>
                  <p className="font-semibold">
                    {policy.coverageLevel !== null && policy.coverageLevel !== undefined
                      ? `Level ${policy.coverageLevel}`
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
                  <p className="font-semibold">
                    $
                    {policy.totalPremium !== null && policy.totalPremium !== undefined
                      ? policy.totalPremium
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Step 1: Policy Details */}
          <div className="bg-white shadow-sm rounded-xl p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full mr-2">
                1
              </span>
              Policy Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Event Type</h3>
                <p className="mt-1 font-medium">{policy.eventType || '-'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Liability Coverage</h3>
                <p className="mt-1 font-medium">{policy.liabilityCoverage || '-'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Host Liquor Liability</h3>
                <div className="mt-1 flex items-center">
                  {policy.liquorLiability ? (
                    <>
                      <Wine size={16} className="text-green-500 mr-1" />{' '}
                      <span className="font-medium">Included</span>
                    </>
                  ) : (
                    <span className="font-medium">Not Included</span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Special Activities</h3>
                <div className="mt-1 flex items-center">
                  {policy.specialActivities ? (
                    <>
                      <Activity size={16} className="text-amber-500 mr-1" />{' '}
                      <span className="font-medium">Yes</span>
                    </>
                  ) : (
                    <span className="font-medium">No</span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Covid Disclosure</h3>
                <div className="mt-1 flex items-center">
                  {policy.covidDisclosure ? (
                    <>
                      <AlertTriangle size={16} className="text-amber-500 mr-1" />{' '}
                      <span className="font-medium">Yes</span>
                    </>
                  ) : (
                    <span className="font-medium">No</span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Base Premium</h3>
                <p className="mt-1 font-medium">
                  $
                  {policy.basePremium !== null && policy.basePremium !== undefined
                    ? policy.basePremium
                    : '-'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Liability Premium</h3>
                <p className="mt-1 font-medium">
                  $
                  {policy.liabilityPremium !== null && policy.liabilityPremium !== undefined
                    ? policy.liabilityPremium
                    : '-'}
                </p>
              </div>
              {policy.liquorLiability && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Host Liquor Liability Premium
                  </h3>
                  <p className="mt-1 font-medium">
                    $
                    {policy.liquorLiabilityPremium !== null &&
                    policy.liquorLiabilityPremium !== undefined
                      ? policy.liquorLiabilityPremium
                      : '-'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white shadow-sm rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full mr-2">
                3
              </span>
              Contact Information
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Policy Holder</h3>
                <p className="mt-1 font-medium">
                  {policy.firstName || '-'} {policy.lastName || '-'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1 font-medium">{policy.email || '-'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                <p className="mt-1 font-medium">{policy.phone || '-'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Relationship</h3>
                <p className="mt-1 font-medium">{policy.relationship || '-'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Address</h3>
                <p className="mt-1 font-medium">{policy.address || '-'}</p>
                <p className="font-medium">
                  {policy.city || '-'}, {policy.state || '-'} {policy.zip || '-'}
                </p>
                <p className="font-medium">{policy.country || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Event Information */}
        <div className="bg-white shadow-sm rounded-xl p-4 sm:p-6 mt-4 sm:mt-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-900 border-b pb-2">
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded-full mr-2">
              2
            </span>
            Event Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Honoree 1 Name</h3>
              <p className="mt-1 text-sm sm:text-base font-medium">
                {policy.honoree1FirstName && policy.honoree1LastName
                  ? `${policy.honoree1FirstName} ${policy.honoree1LastName}`
                  : '-'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Honoree 2 Name</h3>
              <p className="mt-1 text-sm sm:text-base font-medium">
                {policy.honoree2FirstName && policy.honoree2LastName
                  ? `${policy.honoree2FirstName} ${policy.honoree2LastName}`
                  : '-'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Ceremony Location Type</h3>
              <p className="mt-1 text-sm sm:text-base font-medium">
                {policy.ceremonyLocationType || '-'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Indoor/Outdoor</h3>
              <p className="mt-1 text-sm sm:text-base font-medium">{policy.indoorOutdoor || '-'}</p>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500">Venue</h3>
              <p className="mt-1 text-sm sm:text-base font-medium">{policy.venueName || '-'}</p>
              <p className="text-sm sm:text-base font-medium">
                {policy.venueAddress1 || '-'}{' '}
                {policy.venueAddress2 ? `, ${policy.venueAddress2}` : ''}
              </p>
              <p className="text-sm sm:text-base font-medium">
                {policy.venueCity || '-'}, {policy.venueState || '-'} {policy.venueZip || '-'}
              </p>
              <p className="text-sm sm:text-base font-medium">{policy.venueCountry || '-'}</p>
              <div className="mt-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${policy.venueAsInsured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                >
                  {policy.venueAsInsured
                    ? 'Venue As Additional Insured'
                    : 'Venue Not Additional Insured'}
                </span>
              </div>
            </div>
          </div>

          {/* Additional Venue Information for Weddings */}
          {policy.eventType === 'wedding' && (
            <>
              <h2 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full mr-2">
                  2.1
                </span>
                Additional Venue Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Reception Venue */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Reception Venue</h3>
                  <p className="mt-1 font-medium">{policy.receptionLocationType || '-'}</p>
                  <p className="mt-1 font-medium">{policy.receptionIndoorOutdoor || '-'}</p>
                  <p className="mt-1 font-medium">{policy.receptionVenueName || '-'}</p>
                  <p className="text-sm text-gray-600">{policy.receptionVenueAddress1 || '-'}</p>
                  <p className="text-sm text-gray-600">
                    {policy.receptionVenueCity || '-'}, {policy.receptionVenueState || '-'}{' '}
                    {policy.receptionVenueZip || '-'}
                  </p>
                  <p className="text-sm text-gray-600">{policy.receptionVenueCountry || '-'}</p>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${policy.receptionVenueAsInsured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                    >
                      {policy.receptionVenueAsInsured
                        ? 'Venue As Additional Insured'
                        : 'Venue Not Additional Insured'}
                    </span>
                  </div>
                </div>

                {/* Brunch Venue */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Brunch Venue</h3>
                  <p className="mt-1 font-medium">{policy.brunchLocationType || '-'}</p>
                  <p className="mt-1 font-medium">{policy.brunchIndoorOutdoor || '-'}</p>
                  <p className="mt-1 font-medium">{policy.brunchVenueName || '-'}</p>
                  <p className="text-sm text-gray-600">{policy.brunchVenueAddress1 || '-'}</p>
                  <p className="text-sm text-gray-600">
                    {policy.brunchVenueCity || '-'}, {policy.brunchVenueState || '-'}{' '}
                    {policy.brunchVenueZip || '-'}
                  </p>
                  <p className="text-sm text-gray-600">{policy.brunchVenueCountry || '-'}</p>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${policy.brunchVenueAsInsured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                    >
                      {policy.brunchVenueAsInsured
                        ? 'Venue As Additional Insured'
                        : 'Venue Not Additional Insured'}
                    </span>
                  </div>
                </div>

                {/* Rehearsal Venue */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Rehearsal Venue</h3>
                  <p className="mt-1 font-medium">{policy.rehearsalLocationType || '-'}</p>
                  <p className="mt-1 font-medium">{policy.rehearsalIndoorOutdoor || '-'}</p>
                  <p className="mt-1 font-medium">{policy.rehearsalVenueName || '-'}</p>
                  <p className="text-sm text-gray-600">{policy.rehearsalVenueAddress1 || '-'}</p>
                  <p className="text-sm text-gray-600">
                    {policy.rehearsalVenueCity || '-'}, {policy.rehearsalVenueState || '-'}{' '}
                    {policy.rehearsalVenueZip || '-'}
                  </p>
                  <p className="text-sm text-gray-600">{policy.rehearsalVenueCountry || '-'}</p>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${policy.rehearsalVenueAsInsured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                    >
                      {policy.rehearsalVenueAsInsured
                        ? 'Venue As Additional Insured'
                        : 'Venue Not Additional Insured'}
                    </span>
                  </div>
                </div>

                {/* Rehearsal Dinner Venue */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Rehearsal Dinner Venue</h3>
                  <p className="mt-1 font-medium">{policy.rehearsalDinnerLocationType || '-'}</p>
                  <p className="mt-1 font-medium">{policy.rehearsalDinnerIndoorOutdoor || '-'}</p>
                  <p className="mt-1 font-medium">{policy.rehearsalDinnerVenueName || '-'}</p>
                  <p className="text-sm text-gray-600">
                    {policy.rehearsalDinnerVenueAddress1 || '-'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {policy.rehearsalDinnerVenueCity || '-'},{' '}
                    {policy.rehearsalDinnerVenueState || '-'}{' '}
                    {policy.rehearsalDinnerVenueZip || '-'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {policy.rehearsalDinnerVenueCountry || '-'}
                  </p>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${policy.rehearsalDinnerVenueAsInsured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                    >
                      {policy.rehearsalDinnerVenueAsInsured
                        ? 'Venue As Additional Insured'
                        : 'Venue Not Additional Insured'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Additional Information */}
        <div className="bg-white shadow-sm rounded-xl p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">
            Additional Information
          </h2>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Hear About Us</h3>
            <p className="mt-1 font-medium">{policy.hearAboutUs || '-'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Legal Notices</h3>
            <p className="mt-1 font-medium">{policy.legalNotices ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Completing Form Name</h3>
            <p className="mt-1 font-medium">{policy.completingFormName || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
