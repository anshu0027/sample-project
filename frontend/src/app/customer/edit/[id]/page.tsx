/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { toast } from '@/hooks/use-toast';
import { useQuote, QuoteState } from '@/context/QuoteContext';
import dynamic from 'next/dynamic';

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

interface QuoteFormState {
  residentState: string;
  eventType: string;
  eventDate: string;
  maxGuests: string;
  email: string;
  coverageLevel: string | number;
  liabilityCoverage: string;
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
  // Reception venue fields
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
  // Brunch venue fields
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
  // Rehearsal venue fields
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
  // Rehearsal dinner venue fields
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
  quoteNumber?: string;
  totalPremium?: number | null;
  basePremium?: number | null;
  liabilityPremium?: number | null;
  liquorLiabilityPremium?: number | null;
  status?: string;
}

function flattenQuote(quote: any): QuoteFormState {
  return {
    residentState: quote.residentState || quote.policyHolder?.state || '',
    eventType: quote.event?.eventType || '',
    eventDate: quote.event?.eventDate || '',
    maxGuests: quote.event?.maxGuests || '',
    email: quote?.email || '',
    coverageLevel: quote.coverageLevel ?? '',
    liabilityCoverage: quote.liabilityCoverage ?? '',
    liquorLiability: quote.liquorLiability ?? false,
    covidDisclosure: quote.covidDisclosure ?? false,
    specialActivities: quote.specialActivities ?? false,
    honoree1FirstName: quote.event?.honoree1FirstName || '',
    honoree1LastName: quote.event?.honoree1LastName || '',
    honoree2FirstName: quote.event?.honoree2FirstName || '',
    honoree2LastName: quote.event?.honoree2LastName || '',
    // Main venue fields
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
    // Reception venue fields
    receptionLocationType: quote.event?.venue?.receptionLocationType || '',
    receptionIndoorOutdoor: quote.event?.venue?.receptionIndoorOutdoor || '',
    receptionVenueName: quote.event?.venue?.receptionVenueName || '',
    receptionVenueAddress1: quote.event?.venue?.receptionVenueAddress1 || '',
    receptionVenueAddress2: quote.event?.venue?.receptionVenueAddress2 || '',
    receptionVenueCountry: quote.event?.venue?.receptionVenueCountry || '',
    receptionVenueCity: quote.event?.venue?.receptionVenueCity || '',
    receptionVenueState: quote.event?.venue?.receptionVenueState || '',
    receptionVenueZip: quote.event?.venue?.receptionVenueZip || '',
    receptionVenueAsInsured: quote.event?.venue?.receptionVenueAsInsured || false,
    // Brunch venue fields
    brunchLocationType: quote.event?.venue?.brunchLocationType || '',
    brunchIndoorOutdoor: quote.event?.venue?.brunchIndoorOutdoor || '',
    brunchVenueName: quote.event?.venue?.brunchVenueName || '',
    brunchVenueAddress1: quote.event?.venue?.brunchVenueAddress1 || '',
    brunchVenueAddress2: quote.event?.venue?.brunchVenueAddress2 || '',
    brunchVenueCountry: quote.event?.venue?.brunchVenueCountry || '',
    brunchVenueCity: quote.event?.venue?.brunchVenueCity || '',
    brunchVenueState: quote.event?.venue?.brunchVenueState || '',
    brunchVenueZip: quote.event?.venue?.brunchVenueZip || '',
    brunchVenueAsInsured: quote.event?.venue?.brunchVenueAsInsured || false,
    // Rehearsal venue fields
    rehearsalLocationType: quote.event?.venue?.rehearsalLocationType || '',
    rehearsalIndoorOutdoor: quote.event?.venue?.rehearsalIndoorOutdoor || '',
    rehearsalVenueName: quote.event?.venue?.rehearsalVenueName || '',
    rehearsalVenueAddress1: quote.event?.venue?.rehearsalVenueAddress1 || '',
    rehearsalVenueAddress2: quote.event?.venue?.rehearsalVenueAddress2 || '',
    rehearsalVenueCountry: quote.event?.venue?.rehearsalVenueCountry || '',
    rehearsalVenueCity: quote.event?.venue?.rehearsalVenueCity || '',
    rehearsalVenueState: quote.event?.venue?.rehearsalVenueState || '',
    rehearsalVenueZip: quote.event?.venue?.rehearsalVenueZip || '',
    rehearsalVenueAsInsured: quote.event?.venue?.rehearsalVenueAsInsured || false,
    // Rehearsal dinner venue fields
    rehearsalDinnerLocationType: quote.event?.venue?.rehearsalDinnerLocationType || '',
    rehearsalDinnerIndoorOutdoor: quote.event?.venue?.rehearsalDinnerIndoorOutdoor || '',
    rehearsalDinnerVenueName: quote.event?.venue?.rehearsalDinnerVenueName || '',
    rehearsalDinnerVenueAddress1: quote.event?.venue?.rehearsalDinnerVenueAddress1 || '',
    rehearsalDinnerVenueAddress2: quote.event?.venue?.rehearsalDinnerVenueAddress2 || '',
    rehearsalDinnerVenueCountry: quote.event?.venue?.rehearsalDinnerVenueCountry || '',
    rehearsalDinnerVenueCity: quote.event?.venue?.rehearsalDinnerVenueCity || '',
    rehearsalDinnerVenueState: quote.event?.venue?.rehearsalDinnerVenueState || '',
    rehearsalDinnerVenueZip: quote.event?.venue?.rehearsalDinnerVenueZip || '',
    rehearsalDinnerVenueAsInsured: quote.event?.venue?.rehearsalDinnerVenueAsInsured || false,
    firstName: quote.policyHolder?.firstName || '',
    lastName: quote.policyHolder?.lastName || '',
    phone: quote.policyHolder?.phone || '',
    relationship: quote.policyHolder?.relationship || '',
    hearAboutUs: quote.policyHolder?.hearAboutUs || '',
    address: quote.policyHolder?.address || '',
    country: quote.policyHolder?.country || 'United States',
    city: quote.policyHolder?.city || '',
    state: quote.policyHolder?.state || '',
    zip: quote.policyHolder?.zip || '',
    legalNotices: quote.policyHolder?.legalNotices || false,
    completingFormName: quote.policyHolder?.completingFormName || '',
    quoteNumber: quote.quoteNumber,
    totalPremium: quote.totalPremium,
    basePremium: quote.basePremium,
    liabilityPremium: quote.liabilityPremium,
    liquorLiabilityPremium: quote.liquorLiabilityPremium,
    status: quote.status,
  };
}

export default function EditUserQuote() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [step, setStep] = useState(1);
  const [formState, setFormState] = useState<QuoteFormState | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showQuoteResults, setShowQuoteResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { dispatch } = useQuote();

  // ==================================================================
  // ===== API CHANGE #1: Fetching the initial quote data ===========
  // ==================================================================
  useEffect(() => {
    async function fetchQuote() {
      setIsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      try {
        // Use the new backend endpoint to fetch the quote by its number
        const res = await fetch(`${apiUrl}/quotes?quoteNumber=${id}`);
        if (res.ok) {
          const data = await res.json();
          const flatQuote = flattenQuote(data.quote);
          setFormState(flatQuote);
          dispatch({
            type: 'SET_ENTIRE_QUOTE_STATE',
            payload: flatQuote as Partial<QuoteState>,
          });
          if (typeof window !== 'undefined') {
            localStorage.setItem('retrievedQuote', 'true');
          }
        } else {
          toast({
            title: 'Failed to load quote.',
            description: 'Please try again later.',
            variant: 'destructive',
          });
          router.push('/');
        }
      } catch {
        //removed (error)
        toast({
          title: 'An error occurred.',
          description: 'Could not connect to the server.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
    if (id) {
      fetchQuote();
    }
  }, [id, dispatch, router]);

  const EditUserQuoteSkeleton = () => (
    <div className="p-6 m-auto animate-pulse">{/* ... Skeleton UI remains identical ... */}</div>
  );

  if (isLoading || !formState) return <EditUserQuoteSkeleton />;

  const handleInputChange = (field: string, value: any) => {
    // If value is an event object, extract the value from it
    const actualValue = value?.target?.value !== undefined ? value.target.value : value;

    setFormState((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [field]: actualValue,
      };
    });
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formState?.residentState) newErrors.residentState = 'Required';
    if (!formState?.eventType) newErrors.eventType = 'Required';
    if (!formState?.maxGuests) newErrors.maxGuests = 'Required';
    if (!formState?.email) newErrors.email = 'Required';
    if (!formState?.eventDate) newErrors.eventDate = 'Required';
    if (!formState?.coverageLevel) newErrors.coverageLevel = 'Required';
    if (formState?.covidDisclosure === undefined || formState?.covidDisclosure === null)
      newErrors.covidDisclosure = 'Required';
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
    if (!formState.legalNotices) newErrors.legalNotices = 'Required';
    if (!formState.completingFormName) newErrors.completingFormName = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==================================================================
  // ===== API CHANGE #2: Saving data for the current step ==========
  // ==================================================================
  const saveCurrentStepData = async (currentStepNumForValidation: number) => {
    let valid = false;
    if (currentStepNumForValidation === 1) valid = validateStep1();
    else if (currentStepNumForValidation === 2) valid = validateStep2();
    else if (currentStepNumForValidation === 3) valid = validateStep3();

    if (!valid) {
      toast({ title: 'Please fix errors before saving.', variant: 'destructive' });
      return false;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    // The payload is the entire form state, as the backend can handle partial updates.
    const payload = { ...formState };

    // console.log('Saving quote with payload:', payload);
    // console.log('API URL:', apiUrl);
    // console.log('Quote ID:', id);

    try {
      const res = await fetch(`${apiUrl}/quotes/${id}`, {
        // UPDATED PATH
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // console.log('Response status:', res.status);
      const responseData = await res.json();
      // console.log('Response data:', responseData);

      if (res.ok) {
        toast({ title: 'Quote progress saved!', variant: 'default' });
        const updatedStateFromSave = flattenQuote(responseData.quote);
        setFormState(updatedStateFromSave);
        dispatch({
          type: 'SET_ENTIRE_QUOTE_STATE',
          payload: updatedStateFromSave as Partial<QuoteState>,
        });
        return true;
      } else {
        throw new Error(responseData.error || 'Failed to update quote.');
      }
    } catch (error) {
      console.error('Save error:', error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({ title: message, variant: 'destructive' });
      return false;
    }
  };

  // ==================================================================
  // ===== API CHANGE #3: Finalizing the quote for review ===========
  // ==================================================================
  const handleProceedToReview = async () => {
    if (!validateStep1()) {
      setStep(1);
      toast({ title: 'Please complete Step 1 correctly.', variant: 'destructive' });
      return;
    }
    if (!validateStep2()) {
      setStep(2);
      toast({ title: 'Please complete Step 2 correctly.', variant: 'destructive' });
      return;
    }
    if (!validateStep3()) {
      setStep(3);
      toast({ title: 'Please complete Step 3 correctly.', variant: 'destructive' });
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    // The payload now just needs to mark the status as complete.
    const payload = { ...formState, status: 'COMPLETE' };

    try {
      const res = await fetch(`${apiUrl}/quotes/${id}`, {
        // UPDATED PATH
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const finalQuoteState = flattenQuote(data.quote);
        setFormState(finalQuoteState);
        dispatch({
          type: 'SET_ENTIRE_QUOTE_STATE',
          payload: finalQuoteState as Partial<QuoteState>,
        });
        localStorage.setItem('quoteNumber', id);
        router.push(`/customer/review?qn=${finalQuoteState.quoteNumber}&retrieved=true`);
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to finalize quote for review.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({ title: message, variant: 'destructive' });
    }
  };

  const handleStep1Continue = async () => {
    if (validateStep1()) {
      if (!showQuoteResults && formState.eventType) {
        toast({
          title: 'Please calculate the quote first (button in Step 1).',
          variant: 'default',
        });
        return;
      }
      const saved = await saveCurrentStepData(1);
      if (saved) setStep(2);
    }
  };

  const handleStep2Continue = async () => {
    if (validateStep2()) {
      const saved = await saveCurrentStepData(2);
      if (saved) setStep(3);
    }
  };

  const handleStep1QuoteCalculated = async () => {
    setShowQuoteResults(true);
    await saveCurrentStepData(1);
  };

  return (
    <div className="p-6 m-auto">
      <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl text-center sm:text-left font-bold text-gray-900 order-1 sm:order-none">
          Edit Your Quote
        </h1>
        <Button
          className="w-full sm:w-auto order-2 sm:order-none"
          variant="outline"
          size="sm"
          onClick={() => router.push('/')}
        >
          Back to Home
        </Button>
      </div>
      <div className="mb-8 flex flex-row justify-center max-w-4xl mx-auto items-center gap-2 sm:gap-3 md:gap-10">
        {[
          { label: 'Step 1', stepNum: 1 },
          { label: 'Step 2', stepNum: 2 },
          { label: 'Step 3', stepNum: 3 },
          { label: 'Review & Pay', stepNum: 4 },
        ].map((s_item) => (
          <Button
            key={s_item.stepNum}
            className="flex-1 min-w-0 text-center rounded-full md:flex-initial md:w-48"
            variant={step === s_item.stepNum && s_item.stepNum !== 4 ? 'default' : 'outline'}
            onClick={() => {
              if (s_item.stepNum === 4) {
                handleProceedToReview();
              } else {
                setStep(s_item.stepNum);
              }
            }}
          >
            {s_item.label}
          </Button>
        ))}
      </div>
      {step === 1 && (
        <Step1Form
          state={formState}
          errors={errors}
          onChange={handleInputChange}
          onValidate={validateStep1}
          onContinue={handleStep1Continue}
          showQuoteResults={showQuoteResults}
          handleCalculateQuote={handleStep1QuoteCalculated}
          onSave={() => saveCurrentStepData(1)}
          isCustomerEdit={true}
        />
      )}
      {step === 2 && (
        <Step2Form
          state={formState}
          errors={errors}
          onChange={handleInputChange}
          onValidate={validateStep2}
          onContinue={handleStep2Continue}
          onSave={() => saveCurrentStepData(2)}
        />
      )}
      {step === 3 && (
        <Step3Form
          state={formState}
          errors={errors}
          onChange={handleInputChange}
          onSave={() => saveCurrentStepData(3)}
        />
      )}
    </div>
  );
}
