/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FileCog,
  CheckCircle,
  Download,
  DollarSign,
  Shield,
  Calendar,
  User,
  AlertTriangle,
} from 'lucide-react';
import { useQuote } from '@/context/QuoteContext';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  EVENT_TYPES,
  GUEST_RANGES,
  COVERAGE_LEVELS,
  LIABILITY_OPTIONS,
  VENUE_TYPES,
  INDOOR_OUTDOOR_OPTIONS,
  RELATIONSHIP_OPTIONS,
} from '@/utils/constants';
import { formatCurrency } from '@/utils/validators';
import dynamic from 'next/dynamic';
import { toast } from '@/hooks/use-toast';

const QuotePreview = dynamic(() => import('@/components/ui/QuotePreview'), {
  ssr: false,
});

function ReviewSection({
  title,
  icon,
  children,
}: {
  title: React.ReactNode;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 flex items-center border-b border-gray-200">
        <div className="mr-2 text-blue-600">{icon}</div>
        <h3 className="font-medium text-gray-800">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="py-2 flex justify-between border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}:</span>
      <span className="text-sm font-medium text-gray-800">{value || 'Not provided'}</span>
    </div>
  );
}

// Add validation for all required fields
function validateAllFields(state: Record<string, unknown>) {
  const requiredFields = [
    'eventType',
    'eventDate',
    'maxGuests',
    'coverageLevel',
    'liabilityCoverage',
    'venueName',
    'venueAddress1',
    'venueCountry',
    'venueCity',
    'venueState',
    'venueZip',
    'firstName',
    'lastName',
    'email',
    // Add all other required fields as per backend validation
  ];
  for (const field of requiredFields) {
    if (!state[field]) return false;
  }
  return true;
}

// Helper to validate required fields from a quote object (DB or context)
async function validateRetrievedQuoteFields(quoteNumber: string): Promise<boolean> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    // UPDATED PATH to fetch a single quote
    const res = await fetch(`${apiUrl}/quotes?quoteNumber=${quoteNumber}`);
    if (!res.ok) return false;
    const data = await res.json();
    const quote = data.quote;
    if (!quote) return false;

    const requiredFields = [
      'eventType',
      'eventDate',
      'maxGuests',
      'coverageLevel',
      'liabilityCoverage',
      'venueName',
      'venueAddress1',
      'venueCountry',
      'venueCity',
      'venueState',
      'venueZip',
      'firstName',
      'lastName',
      'email',
    ] as const;
    type FlatQuote = { [K in (typeof requiredFields)[number]]: any };

    const flat: FlatQuote = {
      eventType: quote.event?.eventType,
      eventDate: quote.event?.eventDate,
      maxGuests: quote.event?.maxGuests,
      coverageLevel: quote.coverageLevel,
      liabilityCoverage: quote.liabilityCoverage,
      venueName: quote.event?.venue?.name,
      venueAddress1: quote.event?.venue?.address1,
      venueCountry: quote.event?.venue?.country,
      venueCity: quote.event?.venue?.city,
      venueState: quote.event?.venue?.state,
      venueZip: quote.event?.venue?.zip,
      firstName: quote.policyHolder?.firstName,
      lastName: quote.policyHolder?.lastName,
      email: quote?.email,
    };

    for (const field of requiredFields) {
      if (!flat[field]) return false;
    }
    return true;
  } catch {
    return false;
  }
}

// Define ReviewPageSkeleton at the top level so it can be used by Suspense fallback
const ReviewPageSkeleton = () => (
  <div className="relative flex justify-center min-h-screen bg-white z-0 animate-pulse">
    <div className="w-full max-w-3xl z-0">
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto px-2 sm:px-4 md:px-6 pb-12 w-full mt-8">
        <div className="flex-1 min-w-0">
          {/* Main Card Skeleton */}
          <div className="mb-8 shadow-lg border-0 bg-gray-100 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="h-7 w-7 bg-gray-300 rounded-full mr-3"></div>
              <div>
                <div className="h-6 bg-gray-300 rounded w-48 mb-1"></div>
                <div className="h-4 bg-gray-300 rounded w-32"></div>
              </div>
            </div>
            <div className="bg-yellow-100 border-l-4 border-yellow-300 p-4 mb-6 rounded-md">
              <div className="h-4 bg-yellow-200 rounded w-full"></div>
            </div>
            <div className="bg-gray-200 rounded-xl p-6 mb-6">
              <div className="h-6 bg-gray-300 rounded w-1/3 mx-auto mb-2"></div>
              <div className="h-10 bg-gray-300 rounded w-1/2 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/5 mb-1"></div>
              <div className="h-4 bg-gray-300 rounded w-2/5"></div>
            </div>
            <div className="h-10 bg-gray-300 rounded-md w-48 mx-auto"></div> {/* Download button */}
          </div>

          {/* Review Section Skeletons (repeat 3 times) */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="mb-6 border border-gray-200 rounded-lg">
              <div className="bg-gray-100 px-4 py-3 flex items-center border-b">
                <div className="h-5 w-5 bg-gray-300 rounded-full mr-2"></div>
                <div className="h-5 bg-gray-300 rounded w-1/3"></div>
              </div>
              <div className="p-4 space-y-3">
                {[...Array(2)].map(
                  (
                    _,
                    j, // 2 items per section
                  ) => (
                    <div key={j} className="py-2 flex justify-between border-b border-gray-100">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  ),
                )}
              </div>
            </div>
          ))}
          {/* Payment Card Skeleton */}
          <div className="mb-8 shadow-lg border-0 bg-gray-100 p-6 rounded-lg">
            <div className="h-6 bg-gray-300 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-6"></div>
            <div className="h-12 bg-gray-300 rounded-md w-1/2 mx-auto"></div>
          </div>
          {/* Back Button Skeleton */}
          <div className="h-10 bg-gray-200 rounded-md w-40"></div>
        </div>
      </div>
    </div>
  </div>
);

function ReviewClientContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentSuccessParam = searchParams.get('payment') === 'success';
  // const paymentMethodParam = searchParams.get('method') || 'Unknown'; // Get payment method
  const { state } = useQuote();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [paymentSuccess] = useState(paymentSuccessParam); // removed setPaymentSuccess
  const [showPolicyNumber, setShowPolicyNumber] = useState(paymentSuccessParam);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [policySaved, setPolicySaved] = useState(false);
  const [policyNumber, setPolicyNumber] = useState<string>('');

  // Find option labels from their values
  const eventTypeLabel = EVENT_TYPES.find((t) => t.value === state.eventType)?.label || '';
  const guestRangeLabel = GUEST_RANGES.find((g) => g.value === state.maxGuests)?.label || '';
  const coverageLevelLabel =
    COVERAGE_LEVELS.find((l) => l.value === state.coverageLevel?.toString())?.label || '';
  const liabilityOptionLabel =
    LIABILITY_OPTIONS.find((o) => o.value === state.liabilityCoverage)?.label || '';
  const venueTypeLabel =
    VENUE_TYPES.find((v) => v.value === state.ceremonyLocationType)?.label || '';
  const indoorOutdoorLabel =
    INDOOR_OUTDOOR_OPTIONS.find((o) => o.value === state.indoorOutdoor)?.label || '';
  const relationshipLabel =
    RELATIONSHIP_OPTIONS.find((r) => r.value === state.relationship)?.label || '';

  // Format event date
  const formattedEventDate = state.eventDate
    ? new Date(state.eventDate).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  // Handle back button
  const handleBack = () => {
    router.push('/customer/policy-holder');
  };

  // Generate PDF quote
  const generatePdf = async () => {
    setIsGeneratingPdf(true);
    const jsPDF = (await import('jspdf')).default;
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      // Header
      doc.setFillColor(35, 63, 150);
      doc.rect(0, 0, pageWidth, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text('WeddingGuard Insurance Quote', pageWidth / 2, 15, {
        align: 'center',
      });
      // Quote info
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.text(`Policy #: ${policyNumber}`, 15, 40);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 48);
      // Separator line
      doc.setDrawColor(200, 200, 200);
      doc.line(15, 55, pageWidth - 15, 55);
      // Premium summary
      doc.setFontSize(16);
      doc.text('Premium Summary', 15, 65);
      doc.setFontSize(12);
      doc.text(`Total Premium: ${formatCurrency(state.totalPremium)}`, pageWidth - 15, 65, {
        align: 'right',
      });
      doc.text(`Core Coverage: ${formatCurrency(state.basePremium)}`, 20, 75);
      if (state.liabilityCoverage !== 'none') {
        doc.text(`Liability Coverage: ${formatCurrency(state.liabilityPremium)}`, 20, 83);
      }
      if (state.liquorLiability) {
        doc.text(`Host Liquor Liability: ${formatCurrency(state.liquorLiabilityPremium)}`, 20, 91);
      }
      // Separator line
      doc.line(15, 100, pageWidth - 15, 100);
      // Coverage details
      doc.setFontSize(16);
      doc.text('Coverage Details', 15, 110);
      doc.setFontSize(12);
      doc.text(`Event Type: ${eventTypeLabel}`, 20, 120);
      doc.text(`Event Date: ${formattedEventDate}`, 20, 128);
      doc.text(`Guest Count: ${guestRangeLabel}`, 20, 136);
      doc.text(`Core Coverage: ${coverageLevelLabel}`, 20, 144);
      doc.text(`Liability Coverage: ${liabilityOptionLabel}`, 20, 152);
      doc.text(
        `Host Liquor Liability: ${state.liquorLiability ? 'Included' : 'Not Included'}`,
        20,
        160,
      );
      // Separator line
      doc.line(15, 170, pageWidth - 15, 170);
      // Event details
      doc.setFontSize(16);
      doc.text('Event Details', 15, 180);
      doc.setFontSize(12);
      doc.text(
        `Honorees: ${state.honoree1FirstName} ${state.honoree1LastName}${
          state.honoree2FirstName ? ` & ${state.honoree2FirstName} ${state.honoree2LastName}` : ''
        }`,
        20,
        190,
      );
      doc.text(`Venue: ${state.venueName}`, 20, 198);
      doc.text(
        `Location: ${state.venueAddress1}, ${state.venueCity}, ${state.venueState} ${state.venueZip}`,
        20,
        206,
      );
      // Footer
      doc.setFillColor(240, 240, 240);
      doc.rect(0, 270, pageWidth, 25, 'F');
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
        'This quote is valid for 30 days from the date of issue. Terms and conditions apply.',
        pageWidth / 2,
        280,
        { align: 'center' },
      );
      doc.text(
        'WeddingGuard Insurance - 1-800-555-0123 - support@weddingguard.com',
        pageWidth / 2,
        285,
        { align: 'center' },
      );
      // Save the PDF
      doc.save(`WeddingGuard_Quote_${state.quoteNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Define savePolicyAndPayment function at component level
  const savePolicyAndPayment = useCallback(async () => {
    // console.log('savePolicyAndPayment CALLED'); // CRUCIAL: First log in the function

    const quoteNumberFromParams = searchParams.get('qn');

    if (!quoteNumberFromParams) {
      toast.error('Missing quote number in URL. Payment process might be incomplete.');
      console.error('savePolicyAndPayment: quoteNumber (qn) is missing from URL searchParams.');
      return;
    }

    if (paymentSuccess && !policySaved) {
      setSavingPolicy(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!validateAllFields(state as unknown as Record<string, unknown>)) {
        toast({
          title: 'Please complete all required fields before submitting.',
          variant: 'destructive',
        });
        setSavingPolicy(false);
        return;
      }

      try {
        // 1. Update quote to COMPLETE status (using quoteNumberFromParams)
        const quoteRes = await fetch(`${apiUrl}/quotes/${quoteNumberFromParams}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'COMPLETE' }),
        });

        const quoteData = await quoteRes.json();
        if (!quoteRes.ok) {
          throw new Error(quoteData.error || 'Failed to update quote status.');
        }

        // 2. Convert quote to policy
        const convertRes = await fetch(`${apiUrl}/policies/from-quote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quoteNumber: quoteNumberFromParams }),
        });

        const convertData = await convertRes.json();
        // console.log('Policy conversion response:', convertData);

        if (!convertRes.ok) {
          throw new Error(convertData.error || 'Failed to convert quote to policy.');
        }

        // Check if policyNumber is directly in convertData or nested (e.g., convertData.policy.policyNumber)
        // Adjust the access path based on the actual structure logged by "Policy conversion response:"
        let actualPolicyNumber;

        // console.log('Attempting direct access: convertData.policyNumber', convertData.policyNumber);
        if (convertData.policyNumber) {
          actualPolicyNumber = convertData.policyNumber;
        }

        // console.log(
        //   'Attempting nested access: convertData.policy.policyNumber',
        //   convertData.policy
        //     ? convertData.policy.policyNumber
        //     : 'convertData.policy is undefined/null',
        // );
        if (!actualPolicyNumber && convertData.policy && convertData.policy.policyNumber) {
          actualPolicyNumber = convertData.policy.policyNumber;
        }

        // console.log(
        //   'Attempting nested access: convertData.payment.policy.policyNumber',
        //   convertData.payment && convertData.payment.policy
        //     ? convertData.payment.policy.policyNumber
        //     : 'convertData.payment or convertData.payment.policy is undefined/null',
        // );
        if (
          !actualPolicyNumber &&
          convertData.payment &&
          convertData.payment.policy &&
          convertData.payment.policy.policyNumber
        ) {
          actualPolicyNumber = convertData.payment.policy.policyNumber;
        }
        // console.log(
        //   'Attempting nested access: convertData.data.policyDetails.policyNumber',
        //   convertData.data && convertData.data.policyDetails
        //     ? convertData.data.policyDetails.policyNumber
        //     : 'convertData.data or convertData.data.policyDetails is undefined/null',
        // );
        if (
          !actualPolicyNumber &&
          convertData.data &&
          convertData.data.policyDetails &&
          convertData.data.policyDetails.policyNumber
        ) {
          actualPolicyNumber = convertData.data.policyDetails.policyNumber;
        }

        if (actualPolicyNumber) {
          // console.log('Setting policy number:', actualPolicyNumber);
          setPolicyNumber(actualPolicyNumber);
          setPolicySaved(true);
          // Force a re-render to show the policy number
          setShowPolicyNumber(true);
        } else {
          console.error(
            'Policy number extraction failed. \nAttempted convertData.policyNumber:',
            convertData.policyNumber,
            '\nAttempted convertData.policy.policyNumber:',
            convertData.policy
              ? convertData.policy.policyNumber
              : 'convertData.policy was undefined/null or policyNumber missing',
            '\nAttempted convertData.payment.policy.policyNumber:',
            convertData.payment && convertData.payment.policy
              ? convertData.payment.policy.policyNumber
              : 'convertData.payment.policy was undefined/null or structure missing',
            '\nAttempted convertData.data.policyDetails.policyNumber:',
            convertData.data && convertData.data.policyDetails
              ? convertData.data.policyDetails.policyNumber
              : 'convertData.data.policyDetails structure missing or policyNumber missing',
            '\nFull response object (convertData):',
            convertData,
          );
          // Inform the user gracefully, assuming the policy creation API call itself was successful
          toast.error(
            'Policy created, but policy number could not be retrieved for display. Please check your email or contact support.',
          );
          setPolicySaved(true); // Mark as saved if the API call didn't throw an error
          setShowPolicyNumber(true); // Still show the "Payment Successful" UI, policyNumber will be blank
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        // console.log(message);
        toast.error(message);
      } finally {
        setSavingPolicy(false);
      }
    }
  }, [state, paymentSuccess, policySaved, searchParams]); // Added searchParams dependency

  // Effect to save policy after payment success
  useEffect(() => {
    // console.log('Review Page Effect for savePolicyAndPayment triggered. Current conditions:');
    // console.log('paymentSuccess:', paymentSuccess);
    // console.log('showPolicyNumber:', showPolicyNumber);
    // console.log('!policySaved:', !policySaved, '(policySaved:', policySaved, ')');
    // console.log('!savingPolicy:', !savingPolicy, '(savingPolicy:', savingPolicy, ')');
    // console.log("searchParams.get('retrieved'):", searchParams.get('retrieved'));

    async function handleRetrievedValidationAndSave() {
      if (
        paymentSuccess &&
        showPolicyNumber &&
        !policySaved &&
        !savingPolicy &&
        searchParams.get('retrieved') === 'true'
      ) {
        // Validate using DB for retrieved quote
        const qnForValidation = searchParams.get('qn');
        if (!qnForValidation) {
          toast.error('Missing quote number (qn) in URL for retrieved validation.');
          console.error(
            'handleRetrievedValidationAndSave: Missing qn in searchParams for validation.',
          );
          return;
        }
        const valid = await validateRetrievedQuoteFields(qnForValidation);
        // console.log('Valid:', valid);
        if (!valid) {
          alert(
            'Some required fields are missing in your saved quote. Please edit and save all steps before payment.',
          );
          return;
        }
        // console.log('Conditions MET for calling savePolicyAndPayment (retrieved).');
        savePolicyAndPayment();
      } else {
        // console.log('Conditions NOT MET for calling savePolicyAndPayment (retrieved).');
      }
    }
    if (searchParams.get('retrieved') === 'true') {
      handleRetrievedValidationAndSave();
    } else {
      if (paymentSuccess && showPolicyNumber && !policySaved && !savingPolicy) {
        // console.log('Conditions MET for calling savePolicyAndPayment (non-retrieved).');
        savePolicyAndPayment();
      }
    }
  }, [
    paymentSuccess,
    showPolicyNumber,
    policySaved,
    savingPolicy,
    savePolicyAndPayment,
    searchParams,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Ensure previous step is complete before showing review page
      // Also check if essential quote data like quoteNumber is present
      if (!state.step3Complete || !state.quoteNumber) {
        // Redirect to an earlier step or home if prerequisites aren't met
        router.replace('/customer/quote-generator');
        return;
      }
      setPageReady(true);
    }, 250); // Slightly longer delay to ensure context is fully settled
    return () => clearTimeout(timer);
  }, [router, state.step3Complete, state.quoteNumber]);

  if (!pageReady) {
    return <ReviewPageSkeleton />;
  }

  // Add a function to render additional venue information if eventType is 'wedding'
  const renderAdditionalVenues = () => {
    if (state.eventType !== 'wedding') return null;
    return (
      <>
        <ReviewSection
          title={
            <span className="text-lg font-bold text-blue-800">Additional Venue Information</span>
          }
          icon={<Calendar size={20} className="text-blue-600" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 w-full">
            <div>
              <ReviewItem label="Reception Venue Name" value={state.receptionVenueName} />
              <ReviewItem
                label="Reception Venue Address"
                value={`${state.receptionVenueAddress1}${state.receptionVenueAddress2 ? `, ${state.receptionVenueAddress2}` : ''}`}
              />
              <ReviewItem
                label="Reception Venue Location"
                value={`${state.receptionVenueCity}, ${state.receptionVenueState} ${state.receptionVenueZip}`}
              />
              <ReviewItem label="Brunch Venue Name" value={state.brunchVenueName} />
              <ReviewItem
                label="Brunch Venue Address"
                value={`${state.brunchVenueAddress1}${state.brunchVenueAddress2 ? `, ${state.brunchVenueAddress2}` : ''}`}
              />
              <ReviewItem
                label="Brunch Venue Location"
                value={`${state.brunchVenueCity}, ${state.brunchVenueState} ${state.brunchVenueZip}`}
              />
            </div>
            <div>
              <ReviewItem label="Rehearsal Venue Name" value={state.rehearsalVenueName} />
              <ReviewItem
                label="Rehearsal Venue Address"
                value={`${state.rehearsalVenueAddress1}${state.rehearsalVenueAddress2 ? `, ${state.rehearsalVenueAddress2}` : ''}`}
              />
              <ReviewItem
                label="Rehearsal Venue Location"
                value={`${state.rehearsalVenueCity}, ${state.rehearsalVenueState} ${state.rehearsalVenueZip}`}
              />
              <ReviewItem
                label="Rehearsal Dinner Venue Name"
                value={state.rehearsalDinnerVenueName}
              />
              <ReviewItem
                label="Rehearsal Dinner Venue Address"
                value={`${state.rehearsalDinnerVenueAddress1}${state.rehearsalDinnerVenueAddress2 ? `, ${state.rehearsalDinnerVenueAddress2}` : ''}`}
              />
              <ReviewItem
                label="Rehearsal Dinner Venue Location"
                value={`${state.rehearsalDinnerVenueCity}, ${state.rehearsalDinnerVenueState} ${state.rehearsalDinnerVenueZip}`}
              />
            </div>
          </div>
        </ReviewSection>
      </>
    );
  };

  return (
    <>
      {/* Flex container for main content and sidebar */}
      <div className="flex flex-col lg:flex-row lg:gap-x-8">
        {/* Main content area */}
        <div className="w-full lg:flex-1"> {/* Removed pb-12 as Card likely has its own bottom margin */}
          <div className="flex flex-col gap-8 pb-12 w-full mt-8"> {/* md:flex-row removed, px removed as layout handles it */}
            <div className="flex-1 min-w-0">
              {paymentSuccess ? (
                <Card
                  title={
                    <span className="text-2xl font-bold text-green-700">
                      {showPolicyNumber ? 'Payment Successful' : 'Processing Payment'}
                    </span>
                  }
                  subtitle={
                    showPolicyNumber
                      ? 'Your insurance policy has been issued'
                      : 'Please wait while we process your payment'
                  }
                  icon={
                    showPolicyNumber ? (
                      <CheckCircle size={28} className="text-green-600" />
                    ) : (
                      <DollarSign size={28} className="text-blue-600" />
                    )
                  }
                  className={`mb-8 shadow-lg border-0 bg-white ${
                    showPolicyNumber ? 'border-green-100' : 'border-blue-100'
                  }`}
                >
                  <div className="text-center py-10">
                    {showPolicyNumber ? (
                      <div className="space-y-8">
                        <div className="bg-green-50 border border-green-100 rounded-xl p-8">
                          <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                          <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                            Your Policy is Active
                          </h3>
                          <p className="text-gray-700 mb-4">
                            Thank you for purchasing WeddingGuard insurance!
                          </p>
                          <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-md mx-auto">
                            <h4 className="text-sm font-medium text-gray-500 mb-1">
                              Policy Number
                            </h4>
                            <p className="text-lg font-bold text-blue-600">{policyNumber}</p>
                            <h4 className="text-sm font-medium text-gray-500 mt-4 mb-1">
                              Coverage Period
                            </h4>
                            <p className="font-medium text-gray-700">
                              {new Date().toLocaleDateString()} to {formattedEventDate}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                          <Button
                            variant="outline"
                            onClick={generatePdf}
                            className="transition-transform duration-150 hover:scale-105"
                          >
                            <Download size={18} />
                            Download Policy Documents
                          </Button>
                          <Button
                            variant="primary"
                            onClick={() => router.push('/')}
                            onMouseEnter={() => router.prefetch('/')}
                            className="transition-transform duration-150 hover:scale-105"
                          >
                            Return to Home
                          </Button>
                        </div>
                        <div className="text-sm text-gray-500 mt-6">
                          <p>
                            You will receive a confirmation email with your policy documents at{' '}
                            {state.email}. If you have any questions, please contact our customer
                            service at 1-800-555-0123.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-600">
                          Please wait while we process your payment...
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              ) : (
                <>
                  <Card
                    title={
                      <span className="text-2xl font-bold text-blue-800">Review Your Quote</span>
                    }
                    subtitle={
                      <span className="text-base text-gray-600">Quote #{state.quoteNumber}</span>
                    }
                    icon={<FileCog size={28} className="text-blue-600" />}
                    className="mb-8 shadow-lg border-0 bg-white"
                  >
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 mb-8 flex items-start gap-3">
                      <AlertTriangle size={20} className="text-yellow-500 mt-1" />
                      <div>
                        <p className="text-sm text-yellow-800 font-semibold">
                          Please review all information carefully before proceeding to payment. You
                          can go back to make changes if needed.
                        </p>
                      </div>
                    </div>
                    <div className="mb-8">
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-6">
                        <div className="text-center mb-4">
                          <h3 className="text-xl font-semibold text-gray-800 mb-1">
                            Total Premium
                          </h3>
                          <p className="text-3xl font-bold text-blue-700">
                            {formatCurrency(state.totalPremium)}
                          </p>
                        </div>
                        <div className="pt-4 border-t border-gray-100">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Premium Breakdown:
                          </h4>
                          <div className="space-y-2 text-gray-700">
                            <div className="flex justify-between text-sm">
                              <span>Core Coverage:</span>
                              <span className="font-medium">
                                {formatCurrency(state.basePremium)}
                              </span>
                            </div>
                            {state.liabilityCoverage !== 'none' && (
                              <div className="flex justify-between text-sm">
                                <span>Liability Coverage:</span>
                                <span className="font-medium">
                                  {formatCurrency(state.liabilityPremium)}
                                </span>
                              </div>
                            )}
                            {state.liquorLiability && (
                              <div className="flex justify-between text-sm">
                                <span>Host Liquor Liability:</span>
                                <span className="font-medium">
                                  {formatCurrency(state.liquorLiabilityPremium)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={generatePdf}
                          disabled={isGeneratingPdf}
                          className="transition-transform duration-150 hover:scale-105"
                        >
                          <Download size={16} />
                          {isGeneratingPdf ? 'Generating...' : 'Download Quote PDF'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                  <ReviewSection
                    title={
                      <span className="text-lg font-bold text-blue-800">Quote Information</span>
                    }
                    icon={<Shield size={20} className="text-blue-600" />}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 w-full">
                      <div>
                        <ReviewItem label="Event Type" value={eventTypeLabel} />
                        <ReviewItem label="Guest Count" value={guestRangeLabel} />
                        <ReviewItem label="Event Date" value={formattedEventDate} />
                      </div>
                      <div>
                        <ReviewItem label="Core Coverage" value={coverageLevelLabel} />
                        <ReviewItem label="Liability Coverage" value={liabilityOptionLabel} />
                        <ReviewItem
                          label="Host Liquor Liability"
                          value={state.liquorLiability ? 'Included' : 'Not Included'}
                        />
                      </div>
                    </div>
                  </ReviewSection>
                  <ReviewSection
                    title={
                      <span className="text-lg font-bold text-blue-800">Event Information</span>
                    }
                    icon={<Calendar size={20} className="text-blue-600" />}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 w-full">
                      <div>
                        <ReviewItem
                          label="Honorees"
                          value={`${state.honoree1FirstName} ${state.honoree1LastName}${
                            state.honoree2FirstName
                              ? ` & ${state.honoree2FirstName} ${state.honoree2LastName}`
                              : ''
                          }`}
                        />
                        <ReviewItem label="Venue Type" value={venueTypeLabel} />
                        <ReviewItem label="Indoor/Outdoor" value={indoorOutdoorLabel} />
                      </div>
                      <div>
                        <ReviewItem label="Venue Name" value={state.venueName} />
                        <ReviewItem
                          label="Venue Address"
                          value={`${state.venueAddress1}${
                            state.venueAddress2 ? `, ${state.venueAddress2}` : ''
                          }`}
                        />
                        <ReviewItem
                          label="Venue Location"
                          value={`${state.venueCity}, ${state.venueState} ${state.venueZip}`}
                        />
                      </div>
                    </div>
                  </ReviewSection>
                  <ReviewSection
                    title={
                      <span className="text-lg font-bold text-blue-800">
                        Policyholder Information
                      </span>
                    }
                    icon={<User size={20} className="text-blue-600" />}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 w-full">
                      <div>
                        <ReviewItem
                          label="Policyholder"
                          value={`${state.firstName} ${state.lastName}`}
                        />
                        <ReviewItem label="Relationship" value={relationshipLabel} />
                        <ReviewItem label="Email" value={state.email} />
                        <ReviewItem label="Phone" value={state.phone} />
                      </div>
                      <div>
                        <ReviewItem label="Address" value={state.address} />
                        <ReviewItem
                          label="Location"
                          value={`${state.city}, ${state.state} ${state.zip}`}
                        />
                      </div>
                    </div>
                  </ReviewSection>
                  <Card
                    title={
                      <span className="text-lg font-bold text-blue-800">Payment Information</span>
                    }
                    subtitle={
                      <span className="text-base text-gray-600">
                        Complete your purchase securely
                      </span>
                    }
                    icon={<DollarSign size={24} className="text-blue-600" />}
                    className="mb-8 shadow-lg border-0 bg-white"
                  >
                    <div className="py-10 text-center">
                      <p className="text-gray-700 mb-4">
                        For this demonstration, we&apos;ve simplified the payment process. Click the
                        button below to simulate payment and complete your policy purchase.
                      </p>
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={() => router.push('/customer/payment')}
                        onMouseEnter={() => router.prefetch('/customer/payment')}
                        className="min-w-44 transition-transform duration-150 hover:scale-105"
                      >
                        <DollarSign size={18} />
                        Complete Purchase
                      </Button>
                      <p className="text-xs text-gray-500 mt-4">
                        Your total charge will be {formatCurrency(state.totalPremium)}. In a real
                        application, this would include a secure payment form.
                      </p>
                    </div>
                  </Card>
                  <div className="flex justify-between mt-10 gap-4">
                    <Button
                      variant="secondary"
                      onClick={handleBack}
                      onMouseEnter={() => router.prefetch('/customer/policy-holder')}
                      className="transition-transform duration-150 hover:scale-105"
                    >
                      Back to Policyholder
                    </Button>
                  </div>
                </>
              )}
              {renderAdditionalVenues()} {/* Moved additional venues inside the main content flow */}
            </div>
          </div>
        </div> {/* End of Main content area */}

        {/* Sidebar for QuotePreview */}
        <div className="hidden lg:block lg:w-80 lg:sticky lg:top-24 self-start mt-8"> {/* Added mt-8 to align with main content's top margin */}
          <QuotePreview />
        </div>
      </div>
    </>
  );
}

// This is the actual page component.
// Since the file has 'use client' at the top, this is also a Client Component.
// It wraps the content that uses useSearchParams with Suspense.
export default function ReviewPage() {
  return (
    <Suspense fallback={<ReviewPageSkeleton />}>
      <ReviewClientContent />
    </Suspense>
  );
}
