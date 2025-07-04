/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { toast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';
import { PolicyVersion, PolicyVersionData } from '@/types/policy';
import { EditPolicySkeleton } from '@/components/ui/EditPolicySkeleton';
import { ChevronDown, History, Download } from 'lucide-react';
import {
  CORE_COVERAGE_PREMIUMS,
  LIABILITY_COVERAGE_PREMIUMS,
  LIABILITY_OPTIONS,
  LIQUOR_LIABILITY_PREMIUMS,
  LIQUOR_LIABILITY_PREMIUMS_NEW,
} from '@/utils/constants';

const StepFormLoading = () => <div className="p-8 text-center text-gray-500">Loading form...</div>;
const Step1Form = dynamic(() => import('@/components/quote/Step1Form'), {
  ssr: false,
  loading: StepFormLoading,
});
const Step2Form = dynamic(() => import('@/components/quote/Step2Form'), {
  ssr: false,
  loading: StepFormLoading,
});
const Step3Form = dynamic(() => import('@/components/quote/Step3Form'), {
  ssr: false,
  loading: StepFormLoading,
});
const Step4Form = dynamic(() => import('@/components/quote/Step4Form'), {
  ssr: false,
  loading: StepFormLoading,
});

type GuestRange =
  | '1-50'
  | '51-100'
  | '101-150'
  | '151-200'
  | '201-250'
  | '251-300'
  | '301-350'
  | '351-400'
  | '';
type CoverageLevel = number;
type LiabilityOption = string;

function flattenPolicy(policy: any): PolicyVersionData | null {
  if (!policy) return null;

  // Get the data from either the policy directly or from its quote
  const data = policy.quote || policy;
  const event = data.event || policy.event;
  const venue = event?.venue || policy.event?.venue;
  const eventSource = data.event || policy.event;
  const venueSource = eventSource?.venue;

  return {
    residentState: data.residentState || data.policyHolder?.state || '',
    eventType: event?.eventType || '',
    eventDate: event?.eventDate || '',
    maxGuests: event?.maxGuests?.toString() || '',
    email: data.email || '',
    coverageLevel: data.coverageLevel ?? null,
    liabilityCoverage: data.liabilityCoverage ?? '',
    liquorLiability: data.liquorLiability ?? false,
    covidDisclosure: data.covidDisclosure ?? false,
    specialActivities: data.specialActivities ?? false,
    honoree1FirstName: event?.honoree1FirstName || '',
    honoree1LastName: event?.honoree1LastName || '',
    honoree2FirstName: event?.honoree2FirstName || '',
    honoree2LastName: event?.honoree2LastName || '',
    // Main venue fields
    ceremonyLocationType: venueSource?.ceremonyLocationType || '',
    locationType: venue?.locationType || '',
    indoorOutdoor: venue?.indoorOutdoor || '',
    venueName: venue?.name || '',
    venueAddress1: venue?.address1 || '',
    venueAddress2: venue?.address2 || '',
    venueCountry: venue?.country || '',
    venueCity: venue?.city || '',
    venueState: venue?.state || '',
    venueZip: venue?.zip || '',
    venueAsInsured: venue?.venueAsInsured || false,
    // Additional venue fields
    receptionLocationType: venue?.receptionLocationType || '',
    receptionIndoorOutdoor: venue?.receptionIndoorOutdoor || '',
    receptionVenueName: venue?.receptionVenueName || '',
    receptionVenueAddress1: venue?.receptionVenueAddress1 || '',
    receptionVenueAddress2: venue?.receptionVenueAddress2 || '',
    receptionVenueCountry: venue?.receptionVenueCountry || '',
    receptionVenueCity: venue?.receptionVenueCity || '',
    receptionVenueState: venue?.receptionVenueState || '',
    receptionVenueZip: venue?.receptionVenueZip || '',
    receptionVenueAsInsured: venue?.receptionVenueAsInsured || false,
    brunchLocationType: venue?.brunchLocationType || '',
    brunchIndoorOutdoor: venue?.brunchIndoorOutdoor || '',
    brunchVenueName: venue?.brunchVenueName || '',
    brunchVenueAddress1: venue?.brunchVenueAddress1 || '',
    brunchVenueAddress2: venue?.brunchVenueAddress2 || '',
    brunchVenueCountry: venue?.brunchVenueCountry || '',
    brunchVenueCity: venue?.brunchVenueCity || '',
    brunchVenueState: venue?.brunchVenueState || '',
    brunchVenueZip: venue?.brunchVenueZip || '',
    brunchVenueAsInsured: venue?.brunchVenueAsInsured || false,
    rehearsalLocationType: venue?.rehearsalLocationType || '',
    rehearsalIndoorOutdoor: venue?.rehearsalIndoorOutdoor || '',
    rehearsalVenueName: venue?.rehearsalVenueName || '',
    rehearsalVenueAddress1: venue?.rehearsalVenueAddress1 || '',
    rehearsalVenueAddress2: venue?.rehearsalVenueAddress2 || '',
    rehearsalVenueCountry: venue?.rehearsalVenueCountry || '',
    rehearsalVenueCity: venue?.rehearsalVenueCity || '',
    rehearsalVenueState: venue?.rehearsalVenueState || '',
    rehearsalVenueZip: venue?.rehearsalVenueZip || '',
    rehearsalVenueAsInsured: venue?.rehearsalVenueAsInsured || false,
    rehearsalDinnerLocationType: venue?.rehearsalDinnerLocationType || '',
    rehearsalDinnerIndoorOutdoor: venue?.rehearsalDinnerIndoorOutdoor || '',
    rehearsalDinnerVenueName: venue?.rehearsalDinnerVenueName || '',
    rehearsalDinnerVenueAddress1: venue?.rehearsalDinnerVenueAddress1 || '',
    rehearsalDinnerVenueAddress2: venue?.rehearsalDinnerVenueAddress2 || '',
    rehearsalDinnerVenueCountry: venue?.rehearsalDinnerVenueCountry || '',
    rehearsalDinnerVenueCity: venue?.rehearsalDinnerVenueCity || '',
    rehearsalDinnerVenueState: venue?.rehearsalDinnerVenueState || '',
    rehearsalDinnerVenueZip: venue?.rehearsalDinnerVenueZip || '',
    rehearsalDinnerVenueAsInsured: venue?.rehearsalDinnerVenueAsInsured || false,
    // Policy holder fields
    firstName: data.policyHolder?.firstName || '',
    lastName: data.policyHolder?.lastName || '',
    phone: data.policyHolder?.phone || '',
    relationship: data.policyHolder?.relationship || '',
    hearAboutUs: data.policyHolder?.hearAboutUs || '',
    address: data.policyHolder?.address || '',
    country: data.policyHolder?.country || '',
    city: data.policyHolder?.city || '',
    state: data.policyHolder?.state || '',
    zip: data.policyHolder?.zip || '',
    legalNotices: data.policyHolder?.legalNotices || false,
    completingFormName: data.policyHolder?.completingFormName || '',
    // Quote fields
    quoteNumber: data.quoteNumber || policy.quote?.quoteNumber || '',
    totalPremium: data.totalPremium || policy.quote?.totalPremium || 0,
    basePremium: data.basePremium || policy.quote?.basePremium || 0,
    liabilityPremium: data.liabilityPremium || policy.quote?.liabilityPremium || 0,
    liquorLiabilityPremium:
      data.liquorLiabilityPremium || policy.quote?.liquorLiabilityPremium || 0,
    status: data.status || policy.quote?.status || '',
    policyId: policy.id,
    policyNumber: policy.policyNumber,
    pdfUrl: policy.pdfUrl,
  };
}

const calculateBasePremium = (level: CoverageLevel | null, guestRange: GuestRange | ''): number => {
  if (!level || !guestRange) return 0;
  const premiums = CORE_COVERAGE_PREMIUMS[guestRange as keyof typeof CORE_COVERAGE_PREMIUMS];
  return (premiums as any)?.[level] ?? 0;
};

const calculateLiabilityPremium = (
  option: LiabilityOption | null,
  guestRange: GuestRange | '',
): number => {
  if (!option || !guestRange || option === 'none') return 0;
  const premiums =
    LIABILITY_COVERAGE_PREMIUMS[guestRange as keyof typeof LIABILITY_COVERAGE_PREMIUMS];
  return premiums?.[option as keyof typeof premiums] ?? 0;
};

const calculateLiquorLiabilityPremium = (
  hasLiquorLiability: boolean,
  guestRange: GuestRange,
  liabilityOption: LiabilityOption | null,
): number => {
  if (!hasLiquorLiability || !guestRange || !liabilityOption) return 0;

  const selectedLiability = LIABILITY_OPTIONS.find((opt) => opt.value === liabilityOption);

  if (selectedLiability?.isNew) {
    const premiums = LIQUOR_LIABILITY_PREMIUMS_NEW;
    return premiums[guestRange as keyof typeof premiums] || 0;
  }
  const premiums = LIQUOR_LIABILITY_PREMIUMS;
  return premiums[guestRange as keyof typeof premiums] || 0;
};

// Validation functions
const validateStep1 = (formState: PolicyVersionData) => {
  const newErrors: Record<string, string> = {};
  if (!formState.residentState) newErrors.residentState = 'Required';
  if (!formState.eventType) newErrors.eventType = 'Required';
  if (!formState.maxGuests) newErrors.maxGuests = 'Required';
  if (!formState.eventDate) newErrors.eventDate = 'Required';
  if (!formState.coverageLevel) newErrors.coverageLevel = 'Required';
  if (!formState.covidDisclosure) newErrors.covidDisclosure = 'Required';
  return newErrors;
};

const validateStep2 = (formState: PolicyVersionData) => {
  const newErrors: Record<string, string> = {};
  if (!formState.honoree1FirstName) newErrors.honoree1FirstName = 'Required';
  if (!formState.honoree1LastName) newErrors.honoree1LastName = 'Required';
  if (!formState.ceremonyLocationType) newErrors.ceremonyLocationType = 'Required';
  if (!formState.indoorOutdoor) newErrors.indoorOutdoor = 'Required';
  if (!formState.venueName) newErrors.venueName = 'Required';
  if (!formState.venueAddress1) newErrors.venueAddress1 = 'Required';
  if (!formState.venueCountry) newErrors.venueCountry = 'Required';
  if (!formState.venueCity) newErrors.venueCity = 'Required';
  if (!formState.venueState) newErrors.venueState = 'Required';
  if (!formState.venueZip) newErrors.venueZip = 'Required';

  // For weddings, all additional venue sections are required
  if (formState.eventType === 'wedding') {
    // Reception Venue - Required for weddings
    if (!formState.receptionLocationType) newErrors.receptionLocationType = 'Required';
    if (!formState.receptionIndoorOutdoor) newErrors.receptionIndoorOutdoor = 'Required';
    if (!formState.receptionVenueName) newErrors.receptionVenueName = 'Required';
    if (!formState.receptionVenueAddress1) newErrors.receptionVenueAddress1 = 'Required';
    if (!formState.receptionVenueCountry) newErrors.receptionVenueCountry = 'Required';
    if (!formState.receptionVenueCity) newErrors.receptionVenueCity = 'Required';
    if (!formState.receptionVenueState) newErrors.receptionVenueState = 'Required';
    if (!formState.receptionVenueZip) newErrors.receptionVenueZip = 'Required';

    // Brunch Venue - Required for weddings
    if (!formState.brunchLocationType) newErrors.brunchLocationType = 'Required';
    if (!formState.brunchIndoorOutdoor) newErrors.brunchIndoorOutdoor = 'Required';
    if (!formState.brunchVenueName) newErrors.brunchVenueName = 'Required';
    if (!formState.brunchVenueAddress1) newErrors.brunchVenueAddress1 = 'Required';
    if (!formState.brunchVenueCountry) newErrors.brunchVenueCountry = 'Required';
    if (!formState.brunchVenueCity) newErrors.brunchVenueCity = 'Required';
    if (!formState.brunchVenueState) newErrors.brunchVenueState = 'Required';
    if (!formState.brunchVenueZip) newErrors.brunchVenueZip = 'Required';

    // Rehearsal Venue - Required for weddings
    if (!formState.rehearsalLocationType) newErrors.rehearsalLocationType = 'Required';
    if (!formState.rehearsalIndoorOutdoor) newErrors.rehearsalIndoorOutdoor = 'Required';
    if (!formState.rehearsalVenueName) newErrors.rehearsalVenueName = 'Required';
    if (!formState.rehearsalVenueAddress1) newErrors.rehearsalVenueAddress1 = 'Required';
    if (!formState.rehearsalVenueCountry) newErrors.rehearsalVenueCountry = 'Required';
    if (!formState.rehearsalVenueCity) newErrors.rehearsalVenueCity = 'Required';
    if (!formState.rehearsalVenueState) newErrors.rehearsalVenueState = 'Required';
    if (!formState.rehearsalVenueZip) newErrors.rehearsalVenueZip = 'Required';

    // Rehearsal Dinner Venue - Required for weddings
    if (!formState.rehearsalDinnerLocationType) newErrors.rehearsalDinnerLocationType = 'Required';
    if (!formState.rehearsalDinnerIndoorOutdoor)
      newErrors.rehearsalDinnerIndoorOutdoor = 'Required';
    if (!formState.rehearsalDinnerVenueName) newErrors.rehearsalDinnerVenueName = 'Required';
    if (!formState.rehearsalDinnerVenueAddress1)
      newErrors.rehearsalDinnerVenueAddress1 = 'Required';
    if (!formState.rehearsalDinnerVenueCountry) newErrors.rehearsalDinnerVenueCountry = 'Required';
    if (!formState.rehearsalDinnerVenueCity) newErrors.rehearsalDinnerVenueCity = 'Required';
    if (!formState.rehearsalDinnerVenueState) newErrors.rehearsalDinnerVenueState = 'Required';
    if (!formState.rehearsalDinnerVenueZip) newErrors.rehearsalDinnerVenueZip = 'Required';
  }

  return newErrors;
};

const validateStep3 = (formState: PolicyVersionData) => {
  const newErrors: Record<string, string> = {};
  if (!formState.firstName) newErrors.firstName = 'Required';
  if (!formState.lastName) newErrors.lastName = 'Required';
  if (!formState.email) newErrors.email = 'Required';
  if (!formState.phone) newErrors.phone = 'Required';
  if (!formState.relationship) newErrors.relationship = 'Required';
  if (!formState.address) newErrors.address = 'Required';
  if (!formState.city) newErrors.city = 'Required';
  if (!formState.state) newErrors.state = 'Required';
  if (!formState.zip) newErrors.zip = 'Required';
  if (!formState.legalNotices) newErrors.legalNotices = 'Required';
  if (!formState.completingFormName) newErrors.completingFormName = 'Required';
  return newErrors;
};

export default function EditPolicy() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string; // This can be a quoteNumber or policyId
  const [step, setStep] = useState(1);
  const [formState, setFormState] = useState<PolicyVersionData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showQuoteResults, setShowQuoteResults] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [policyVersions, setPolicyVersions] = useState<PolicyVersion[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<PolicyVersion | null>(null);
  const versionDropdownRef = useRef<HTMLDivElement>(null);

  // ==================================================================
  // ===== API CHANGE #1: Fetching the initial policy data ==========
  // ==================================================================
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      try {
        // Phase 1: Fetch policy (fast render)
        const res = await fetch(`${apiUrl}/policies/${id}`, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) throw new Error('Policy not found');
        const data = await res.json();

        // ================================================================================
        // console.log('=== Raw API Response ===');
        // console.log('Full API response:', data);
        // console.log('Policy data:', data.policy);
        // console.log('Event data:', data.policy?.event);
        // console.log('Venue data:', data.policy?.event?.venue);
        // console.log('Quote data:', data.policy?.quote);
        // console.log('Quote event data:', data.policy?.quote?.event);
        // console.log('Quote venue data:', data.policy?.quote?.event?.venue);
        // ================================================================================

        if (!data.policy) {
          throw new Error('Policy data is missing');
        }

        // Ensure we have all the necessary relations
        if (!data.policy.event) {
          console.warn('Event data is missing');
        }
        if (!data.policy.event?.venue) {
          console.warn('Venue data is missing');
        }

        const flattenedData = flattenPolicy(data.policy);

        // Debug logs for flattened data
        // console.log('=== Flattened Data ===');
        // console.log('Full flattened data:', flattenedData);
        // console.log('Max guests:', flattenedData.maxGuests);
        // console.log('Venue name:', flattenedData.venueName);
        // console.log('Venue address:', flattenedData.venueAddress1);
        // console.log('Reception venue:', flattenedData.receptionVenueName);
        // console.log('Brunch venue:', flattenedData.brunchVenueName);
        // console.log('Rehearsal venue:', flattenedData.rehearsalVenueName);
        // console.log('Rehearsal dinner venue:', flattenedData.rehearsalDinnerVenueName);

        setFormState(flattenedData);

        // Phase 2: Fetch versions (background)
        fetch(`${apiUrl}/policies/${id}/versions`)
          .then((vRes) => vRes.json())
          .then((vData) => setPolicyVersions(vData.versions || []))
          .catch((err) => console.warn('Versions fetch failed:', err));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error fetching policy:', error);
        toast({
          title: 'Failed to fetch policy data',
          description: message,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleInputChange = (field: string, value: any) => {
    setFormState((prev) => ({ ...(prev as PolicyVersionData), [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // ==================================================================
  // ===== API CHANGE #2: Saving the updated policy =================
  // ==================================================================
  const handleDownloadVersionPdf = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/policies/${id}/version-pdf`, {
        method: 'GET',
        headers: {
          Accept: 'application/pdf',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `policy-version-${formState?.policyNumber}.pdf`;

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: 'Failed to download PDF',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    if (!formState) return;
    const currentPolicyId = formState.policyId;
    if (!currentPolicyId) {
      toast({
        title: 'Cannot save.',
        description: 'Policy ID is missing.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // First, generate and download the PDF of the current version
      await handleDownloadVersionPdf();

      // Recalculate premiums before saving
      const basePremium = calculateBasePremium(
        formState.coverageLevel,
        formState.maxGuests as GuestRange,
      );
      const liabilityPremium = calculateLiabilityPremium(
        formState.liabilityCoverage,
        formState.maxGuests as GuestRange,
      );
      const liquorLiabilityPremium = calculateLiquorLiabilityPremium(
        formState.liquorLiability,
        formState.maxGuests as GuestRange,
        formState.liabilityCoverage,
      );
      const totalPremium = basePremium + liabilityPremium + liquorLiabilityPremium;

      // Then proceed with saving the updated policy
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      // Structure the data according to the backend's expectations
      const payload = {
        policyNumber: formState.policyNumber,
        pdfUrl: formState.pdfUrl,
        // Event fields
        eventType: formState.eventType,
        eventDate: formState.eventDate,
        maxGuests: formState.maxGuests,
        honoree1FirstName: formState.honoree1FirstName,
        honoree1LastName: formState.honoree1LastName,
        honoree2FirstName: formState.honoree2FirstName,
        honoree2LastName: formState.honoree2LastName,
        // Venue fields
        venueName: formState.venueName,
        venueAddress1: formState.venueAddress1,
        venueAddress2: formState.venueAddress2,
        venueCountry: formState.venueCountry,
        venueCity: formState.venueCity,
        venueState: formState.venueState,
        venueZip: formState.venueZip,
        ceremonyLocationType: formState.ceremonyLocationType,
        locationType: formState.locationType,
        indoorOutdoor: formState.indoorOutdoor,
        venueAsInsured: formState.venueAsInsured,
        // Additional venue fields
        // Reception venue fields
        receptionVenueName: formState.receptionVenueName,
        receptionVenueAddress1: formState.receptionVenueAddress1,
        receptionVenueAddress2: formState.receptionVenueAddress2,
        receptionVenueCountry: formState.receptionVenueCountry,
        receptionVenueCity: formState.receptionVenueCity,
        receptionVenueState: formState.receptionVenueState,
        receptionVenueZip: formState.receptionVenueZip,
        receptionLocationType: formState.receptionLocationType,
        receptionIndoorOutdoor: formState.receptionIndoorOutdoor,
        receptionVenueAsInsured: formState.receptionVenueAsInsured,
        // Brunch venue fields
        brunchVenueName: formState.brunchVenueName,
        brunchVenueAddress1: formState.brunchVenueAddress1,
        brunchVenueAddress2: formState.brunchVenueAddress2,
        brunchVenueCountry: formState.brunchVenueCountry,
        brunchVenueCity: formState.brunchVenueCity,
        brunchVenueState: formState.brunchVenueState,
        brunchVenueZip: formState.brunchVenueZip,
        brunchLocationType: formState.brunchLocationType,
        brunchIndoorOutdoor: formState.brunchIndoorOutdoor,
        brunchVenueAsInsured: formState.brunchVenueAsInsured,
        // Rehearsal venue fields
        rehearsalVenueName: formState.rehearsalVenueName,
        rehearsalVenueAddress1: formState.rehearsalVenueAddress1,
        rehearsalVenueAddress2: formState.rehearsalVenueAddress2,
        rehearsalVenueCountry: formState.rehearsalVenueCountry,
        rehearsalVenueCity: formState.rehearsalVenueCity,
        rehearsalVenueState: formState.rehearsalVenueState,
        rehearsalVenueZip: formState.rehearsalVenueZip,
        rehearsalLocationType: formState.rehearsalLocationType,
        rehearsalIndoorOutdoor: formState.rehearsalIndoorOutdoor,
        rehearsalVenueAsInsured: formState.rehearsalVenueAsInsured,
        // Rehearsal dinner venue fields
        rehearsalDinnerVenueName: formState.rehearsalDinnerVenueName,
        rehearsalDinnerVenueAddress1: formState.rehearsalDinnerVenueAddress1,
        rehearsalDinnerVenueAddress2: formState.rehearsalDinnerVenueAddress2,
        rehearsalDinnerVenueCountry: formState.rehearsalDinnerVenueCountry,
        rehearsalDinnerVenueCity: formState.rehearsalDinnerVenueCity,
        rehearsalDinnerVenueState: formState.rehearsalDinnerVenueState,
        rehearsalDinnerVenueZip: formState.rehearsalDinnerVenueZip,
        rehearsalDinnerLocationType: formState.rehearsalDinnerLocationType,
        rehearsalDinnerIndoorOutdoor: formState.rehearsalDinnerIndoorOutdoor,
        rehearsalDinnerVenueAsInsured: formState.rehearsalDinnerVenueAsInsured,
        // Policy holder fields
        firstName: formState.firstName,
        lastName: formState.lastName,
        phone: formState.phone,
        relationship: formState.relationship,
        hearAboutUs: formState.hearAboutUs,
        address: formState.address,
        country: formState.country,
        city: formState.city,
        state: formState.state,
        zip: formState.zip,
        legalNotices: formState.legalNotices,
        completingFormName: formState.completingFormName,
        // Quote fields
        email: formState.email,
        coverageLevel: formState.coverageLevel,
        liabilityCoverage: formState.liabilityCoverage,
        liquorLiability: formState.liquorLiability,
        covidDisclosure: formState.covidDisclosure,
        specialActivities: formState.specialActivities,
        residentState: formState.residentState,
        totalPremium,
        basePremium,
        liabilityPremium,
        liquorLiabilityPremium,
        status: formState.status,
        // Version metadata
        // versionMetadata: restoredFromVersion
        //   ? {
        //       restoredFromVersionId: restoredFromVersion.id,
        //       restoredFromVersionDate: restoredFromVersion.createdAt,
        //       isRestored: true,
        //     }
        //   : undefined,
      };

      const response = await fetch(`${apiUrl}/policies/${currentPolicyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update policy');
      }

      const responseData = await response.json();
      toast({ title: 'Policy updated successfully!', variant: 'default' });
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast({ title: 'Failed to update policy', description: message, variant: 'destructive' });
    }
  };

  const handleValidateStep1 = () => {
    if (!formState) return false;
    const newErrors = validateStep1(formState);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleValidateStep2 = () => {
    if (!formState) return false;
    const newErrors = validateStep2(formState);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleValidateStep3 = () => {
    if (!formState) return false;
    const newErrors = validateStep3(formState);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDownloadVersionPdfById = async (versionId: number, fileName: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/policies/${id}/versions/${versionId}/download`);
      if (!response.ok) throw new Error('Failed to download PDF');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: 'Failed to download PDF',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) return <EditPolicySkeleton />;

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl text-center sm:text-left font-bold text-gray-900 order-1 sm:order-none w-full sm:w-auto">
          Edit Policy
        </h1>
        <div className="flex flex-col-reverse items-center w-full sm:flex-row sm:items-center sm:w-auto gap-2 order-2 sm:order-none">
          {policyVersions.length > 0 && (
            <div
              className="relative inline-block w-full sm:w-auto"
              ref={versionDropdownRef}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <Button
                variant="outline"
                onClick={() => setIsDropdownOpen((v) => !v)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 w-full justify-center sm:w-auto"
              >
                <History size={16} />
                <span className="hidden sm:inline">Version History</span>
                <ChevronDown
                  size={16}
                  className={`transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </Button>
              {isDropdownOpen && (
                <div className="absolute mt-2 w-72 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto left-1/2 -translate-x-1/2">
                  <div className="p-2">
                    <h3 className="text-sm font-medium text-gray-500 px-3 py-2">Version History</h3>
                    <div className="space-y-1">
                      {policyVersions.map((version) => {
                        const versionData =
                          typeof version.data === 'string'
                            ? JSON.parse(version.data)
                            : version.data;
                        const pdfFile = versionData?.pdfFile || `policy-version-${version.id}.pdf`;
                        return (
                          <div
                            key={version.id}
                            className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-50"
                          >
                            <div>
                              <span className="font-medium">
                                {new Date(version.createdAt).toLocaleDateString()}{' '}
                                {new Date(version.createdAt).toLocaleTimeString([], {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true,
                                })}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownloadVersionPdfById(version.id, pdfFile)}
                              title="Download PDF"
                            >
                              <Download size={16} />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-center sm:w-auto"
            onMouseEnter={() => router.prefetch('/admin/policies')}
            onClick={() => router.push('/admin/policies')}
          >
            Back to Policies
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadVersionPdf}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 w-full justify-center sm:w-auto"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Current Version</span>
          </Button>
        </div>
      </div>

      {/* Form Steps */}
      <div className="mb-8 flex flex-row max-w-4xl justify-center mx-auto items-center gap-2 sm:gap-3 md:gap-10">
        {[1, 2, 3, 4].map((s) => (
          <Button
            key={s}
            className="flex-1 min-w-0 text-center rounded-full md:flex-initial md:w-48"
            variant={step === s ? 'primary' : 'outline'}
            onClick={() => setStep(s)}
          >
            {`Step ${s}`}
          </Button>
        ))}
      </div>

      {/* Form Steps Content */}
      {formState && (
        <>
          {step === 1 && (
            <Step1Form
              state={formState as any}
              errors={errors}
              onChange={handleInputChange}
              onValidate={handleValidateStep1}
              onContinue={() => setStep(2)}
              showQuoteResults={showQuoteResults}
              handleCalculateQuote={() => setShowQuoteResults(true)}
            />
          )}
          {step === 2 && (
            <Step2Form
              state={formState as any}
              errors={errors}
              onChange={handleInputChange}
              onValidate={handleValidateStep2}
              onContinue={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <Step3Form state={formState as any} errors={errors} onChange={handleInputChange} />
          )}
          {step === 4 && (
            <Step4Form
              state={formState as any}
              onSave={handleSave}
              onBack={() => setStep(3)}
              emailSent={emailSent}
              onEmail={() => setEmailSent(true)}
              isRetrievedQuote={!!formState?.quoteNumber}
              isAdmin={true}
              onValidateStep1={handleValidateStep1}
              onValidateStep2={handleValidateStep2}
              onValidateStep3={handleValidateStep3}
              onSetStep={setStep}
            />
          )}
        </>
      )}
    </div>
  );
}
