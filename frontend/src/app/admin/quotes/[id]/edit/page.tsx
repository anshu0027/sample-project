/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { toast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';
import { GuestRange, CoverageLevel, LiabilityOption } from '@/context/QuoteContext';

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

interface FormState {
  step1Complete: boolean;
  step2Complete: boolean;
  step3Complete: boolean;
  residentState: string;
  eventType: string;
  eventDate: string;
  maxGuests: '' | GuestRange;
  coverageLevel: CoverageLevel | null;
  liabilityCoverage: LiabilityOption;
  liquorLiability: boolean;
  covidDisclosure: boolean;
  specialActivities: boolean;
  honoree1FirstName: string;
  honoree1LastName: string;
  honoree2FirstName: string;
  honoree2LastName: string;
  ceremonyLocationType: string;
  indoorOutdoor: string;
  venueName: string;
  venueAddress1: string;
  venueAddress2: string;
  venueCountry: string;
  venueCity: string;
  venueState: string;
  venueZip: string;
  venueAsInsured: boolean;
  receptionLocationType: string;
  receptionIndoorOutdoor: string;
  receptionVenueName: string;
  receptionVenueAddress1: string;
  receptionVenueAddress2: string;
  receptionVenueCountry: string;
  receptionVenueCity: string;
  receptionVenueState: string;
  receptionVenueZip: string;
  receptionVenueAsInsured: boolean;
  brunchLocationType: string;
  brunchIndoorOutdoor: string;
  brunchVenueName: string;
  brunchVenueAddress1: string;
  brunchVenueAddress2: string;
  brunchVenueCountry: string;
  brunchVenueCity: string;
  brunchVenueState: string;
  brunchVenueZip: string;
  brunchVenueAsInsured: boolean;
  rehearsalLocationType: string;
  rehearsalIndoorOutdoor: string;
  rehearsalVenueName: string;
  rehearsalVenueAddress1: string;
  rehearsalVenueAddress2: string;
  rehearsalVenueCountry: string;
  rehearsalVenueCity: string;
  rehearsalVenueState: string;
  rehearsalVenueZip: string;
  rehearsalVenueAsInsured: boolean;
  rehearsalDinnerLocationType: string;
  rehearsalDinnerIndoorOutdoor: string;
  rehearsalDinnerVenueName: string;
  rehearsalDinnerVenueAddress1: string;
  rehearsalDinnerVenueAddress2: string;
  rehearsalDinnerVenueCountry: string;
  rehearsalDinnerVenueCity: string;
  rehearsalDinnerVenueState: string;
  rehearsalDinnerVenueZip: string;
  rehearsalDinnerVenueAsInsured: boolean;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  relationship: string;
  hearAboutUs: string;
  address: string;
  country: string;
  city: string;
  state: string;
  zip: string;
  legalNotices: boolean;
  completingFormName: string;
  quoteNumber: string;
  totalPremium: number;
  basePremium: number;
  liabilityPremium: number;
  liquorLiabilityPremium: number;
  status: string;
}

function flattenQuote(quote: any): FormState | null {
  if (!quote) return null;
  return {
    step1Complete: true,
    step2Complete: true,
    step3Complete: true,
    residentState: quote.residentState || quote.policyHolder?.state || '',
    eventType: quote.event?.eventType || '',
    eventDate: quote.event?.eventDate || '',
    maxGuests: quote.event?.maxGuests || '', // Will be converted to GuestRange
    coverageLevel: quote.coverageLevel ?? null,
    email: quote.email || '',
    liabilityCoverage: quote.liabilityCoverage ?? '',
    liquorLiability: quote.liquorLiability ?? false,
    covidDisclosure: quote.covidDisclosure ?? false,
    specialActivities: quote.specialActivities ?? false,
    honoree1FirstName: quote.event?.honoree1FirstName || '',
    honoree1LastName: quote.event?.honoree1LastName || '',
    honoree2FirstName: quote.event?.honoree2FirstName || '',
    honoree2LastName: quote.event?.honoree2LastName || '',
    ceremonyLocationType: quote.event?.venue?.ceremonyLocationType || '',
    indoorOutdoor: quote.event?.venue?.indoorOutdoor || '',
    venueName: quote.event?.venue?.name || '',
    venueAddress1: quote.event?.venue?.address1 || '',
    venueAddress2: quote.event?.venue?.address2 || '',
    venueCountry: quote.event?.venue?.country || '',
    venueCity: quote.event?.venue?.city || '',
    venueState: quote.event?.venue?.state || '',
    venueZip: quote.event?.venue?.zip || '',
    venueAsInsured: quote.event?.venue?.venueAsInsured || false,
    receptionLocationType: quote.event?.receptionLocationType || '',
    receptionIndoorOutdoor: quote.event?.receptionIndoorOutdoor || '',
    receptionVenueName: quote.event?.receptionVenue?.name || '',
    receptionVenueAddress1: quote.event?.receptionVenue?.address1 || '',
    receptionVenueAddress2: quote.event?.receptionVenue?.address2 || '',
    receptionVenueCountry: quote.event?.receptionVenue?.country || '',
    receptionVenueCity: quote.event?.receptionVenue?.city || '',
    receptionVenueState: quote.event?.receptionVenue?.state || '',
    receptionVenueZip: quote.event?.receptionVenue?.zip || '',
    receptionVenueAsInsured: quote.event?.receptionVenue?.venueAsInsured || false,
    brunchLocationType: quote.event?.brunchLocationType || '',
    brunchIndoorOutdoor: quote.event?.brunchIndoorOutdoor || '',
    brunchVenueName: quote.event?.brunchVenue?.name || '',
    brunchVenueAddress1: quote.event?.brunchVenue?.address1 || '',
    brunchVenueAddress2: quote.event?.brunchVenue?.address2 || '',
    brunchVenueCountry: quote.event?.brunchVenue?.country || '',
    brunchVenueCity: quote.event?.brunchVenue?.city || '',
    brunchVenueState: quote.event?.brunchVenue?.state || '',
    brunchVenueZip: quote.event?.brunchVenue?.zip || '',
    brunchVenueAsInsured: quote.event?.brunchVenue?.venueAsInsured || false,
    rehearsalLocationType: quote.event?.rehearsalLocationType || '',
    rehearsalIndoorOutdoor: quote.event?.rehearsalIndoorOutdoor || '',
    rehearsalVenueName: quote.event?.rehearsalVenue?.name || '',
    rehearsalVenueAddress1: quote.event?.rehearsalVenue?.address1 || '',
    rehearsalVenueAddress2: quote.event?.rehearsalVenue?.address2 || '',
    rehearsalVenueCountry: quote.event?.rehearsalVenue?.country || '',
    rehearsalVenueCity: quote.event?.rehearsalVenue?.city || '',
    rehearsalVenueState: quote.event?.rehearsalVenue?.state || '',
    rehearsalVenueZip: quote.event?.rehearsalVenue?.zip || '',
    rehearsalVenueAsInsured: quote.event?.rehearsalVenue?.venueAsInsured || false,
    rehearsalDinnerLocationType: quote.event?.rehearsalDinnerLocationType || '',
    rehearsalDinnerIndoorOutdoor: quote.event?.rehearsalDinnerIndoorOutdoor || '',
    rehearsalDinnerVenueName: quote.event?.rehearsalDinnerVenue?.name || '',
    rehearsalDinnerVenueAddress1: quote.event?.rehearsalDinnerVenue?.address1 || '',
    rehearsalDinnerVenueAddress2: quote.event?.rehearsalDinnerVenue?.address2 || '',
    rehearsalDinnerVenueCountry: quote.event?.rehearsalDinnerVenue?.country || '',
    rehearsalDinnerVenueCity: quote.event?.rehearsalDinnerVenue?.city || '',
    rehearsalDinnerVenueState: quote.event?.rehearsalDinnerVenue?.state || '',
    rehearsalDinnerVenueZip: quote.event?.rehearsalDinnerVenue?.zip || '',
    rehearsalDinnerVenueAsInsured: quote.event?.rehearsalDinnerVenue?.venueAsInsured || false,
    firstName: quote.policyHolder?.firstName || '',
    lastName: quote.policyHolder?.lastName || '',
    phone: quote.policyHolder?.phone || '',
    relationship: quote.policyHolder?.relationship || '',
    hearAboutUs: quote.policyHolder?.hearAboutUs || '',
    address: quote.policyHolder?.address || '',
    country: quote.policyHolder?.country || '',
    city: quote.policyHolder?.city || '',
    state: quote.policyHolder?.state || '',
    zip: quote.policyHolder?.zip || '',
    legalNotices: quote.policyHolder?.legalNotices || false,
    completingFormName: quote.policyHolder?.completingFormName || '',
    quoteNumber: quote.quoteNumber,
    totalPremium: quote.totalPremium || 0,
    basePremium: quote.basePremium || 0,
    liabilityPremium: quote.liabilityPremium || 0,
    liquorLiabilityPremium: quote.liquorLiabilityPremium || 0,
    status: quote.status,
  };
}

export default function EditQuote() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [step, setStep] = useState(1);
  const [formState, setFormState] = useState<FormState | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailSent, setEmailSent] = useState(false);
  const [showQuoteResults, setShowQuoteResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // For initial data load

  // ==================================================================
  // ===== API CHANGE #1: Fetching the initial quote data ===========
  // ==================================================================
  useEffect(() => {
    async function fetchQuote() {
      setIsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      try {
        const res = await fetch(`${apiUrl}/quotes?quoteNumber=${id}`);
        if (res.ok) {
          const data = await res.json();
          setFormState(flattenQuote(data.quote));
          setShowQuoteResults(true);
        } else {
          throw new Error('Failed to fetch quote data.');
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        toast({ title: 'Error', description: message, variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    }
    if (id) {
      fetchQuote();
    }
  }, [id]);

  // Skeleton Loader Component
  const EditQuoteSkeleton = () => (
    <div className="p-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-6 gap-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div> {/* Title */}
        <div className="h-10 bg-gray-200 rounded-md w-full sm:w-36"></div> {/* Back Button */}
      </div>
      {/* Stepper Skeleton */}
      <div className="mb-8 flex flex-row justify-center max-w-4xl mx-auto items-center gap-2 sm:gap-3 md:gap-10">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-10 bg-gray-200 rounded-full flex-1 min-w-0 md:flex-initial md:w-48"
          ></div>
        ))}
      </div>
      {/* Form Area Skeleton */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div> {/* Form Title */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div> {/* Label */}
              <div className="h-10 bg-gray-200 rounded-md"></div> {/* Input */}
            </div>
          ))}
        </div>
        <div className="mt-8 h-12 bg-gray-200 rounded-md w-1/3 ml-auto"></div>{' '}
        {/* Save/Continue Button */}
      </div>
    </div>
  );
  if (isLoading || !formState) return <EditQuoteSkeleton />;

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormState((prev: FormState | null) => ({ ...prev!, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  // console.log(formState);
  // Validation functions for each step (implement as needed)
  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formState.residentState) newErrors.residentState = 'Required';
    if (!formState.eventType) newErrors.eventType = 'Required';
    if (!formState.maxGuests) newErrors.maxGuests = 'Required';
    if (!formState.eventDate) newErrors.eventDate = 'Required';
    if (!formState.email) newErrors.email = 'Required';
    if (!formState.coverageLevel) newErrors.coverageLevel = 'Required';
    if (!formState.covidDisclosure) newErrors.covidDisclosure = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const validateStep2 = () => {
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    if (!formState.firstName) newErrors.firstName = 'Required';
    if (!formState.lastName) newErrors.lastName = 'Required';
    if (!formState.phone) newErrors.phone = 'Required';
    if (!formState.relationship) newErrors.relationship = 'Required';
    if (!formState.address) newErrors.address = 'Required';
    if (!formState.city) newErrors.city = 'Required';
    if (!formState.state) newErrors.state = 'Required';
    if (!formState.zip) newErrors.zip = 'Required';
    // if (!formState.legalNotices) newErrors.legalNotices = 'Required';
    if (!formState.completingFormName) newErrors.completingFormName = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==================================================================
  // ===== API CHANGE #2: Saving the updated quote ==================
  // ==================================================================
  const handleSave = async () => {
    if (!formState) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      const payload = {
        ...formState,
        source: 'ADMIN', // Ensure source is set correctly
      };
      const response = await fetch(`${apiUrl}/quotes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update quote');
      }
      toast({ title: 'Quote updated successfully!', variant: 'default' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({ title: 'Failed to update quote', description: message, variant: 'destructive' });
    }
  };

  // Stepper UI
  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl text-center sm:text-left font-bold text-gray-900 order-1 sm:order-none">
          Edit Quote
        </h1>
        <Button
          className="w-full sm:w-auto order-2 sm:order-none"
          variant="outline"
          size="sm"
          onClick={() => router.push('/admin/quotes')}
        >
          Back to Quotes
        </Button>
      </div>
      <div className="mb-8 flex flex-row justify-center max-w-4xl mx-auto items-center gap-2 sm:gap-3 md:gap-10">
        {[1, 2, 3, 4].map((s) => (
          <Button
            key={s}
            className="flex-1 min-w-0 text-center rounded-full md:flex-initial md:w-48"
            variant={step === s ? 'default' : 'outline'}
            onClick={() => setStep(s)}
          >{`Step ${s}`}</Button>
        ))}
      </div>
      {step === 1 && (
        <Step1Form
          state={{
            ...formState,
            coverageLevel: formState.coverageLevel === null ? '' : formState.coverageLevel,
          }}
          errors={errors}
          onChange={handleInputChange}
          onValidate={validateStep1}
          onContinue={() => setStep(2)}
          showQuoteResults={showQuoteResults}
          handleCalculateQuote={() => setShowQuoteResults(true)}
          onSave={handleSave}
          isCustomerEdit={false} // Explicitly false for admin
        />
      )}
      {step === 2 && (
        <Step2Form
          state={formState}
          errors={errors}
          onChange={handleInputChange}
          onValidate={validateStep2}
          onContinue={() => setStep(3)}
          onSave={handleSave}
        />
      )}
      {step === 3 && (
        <Step3Form
          state={formState}
          errors={errors}
          onChange={handleInputChange}
          onSave={handleSave}
          onValidate={validateStep3}
        />
      )}
      {step === 4 && (
        <Step4Form
          state={{
            ...formState,
            totalPremium: formState.totalPremium ?? 0,
            basePremium: formState.basePremium ?? 0,
            liabilityPremium: formState.liabilityPremium ?? 0,
            liquorLiabilityPremium: formState.liquorLiabilityPremium ?? undefined,
          }}
          onSave={handleSave}
          onBack={() => setStep(3)}
          emailSent={emailSent}
          onEmail={() => setEmailSent(true)}
          isRetrievedQuote={false}
          isAdmin={true}
        />
      )}
    </div>
  );
}
