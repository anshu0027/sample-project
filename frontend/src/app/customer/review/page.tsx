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
import type { QuoteState } from '@/context/QuoteContext';
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
    <div className="py-2 sm:py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-gray-100 last:border-0 gap-1 sm:gap-2">
      <span className="text-xs sm:text-sm text-gray-500 font-medium">{label}:</span>
      <span className="text-sm sm:text-sm font-medium text-gray-800 break-words">
        {value || 'Not provided'}
      </span>
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
    'venueCity',
    'firstName',
    'lastName',
    'email',
    // Add all other required fields as per backend validation
  ];

  // Check if it's a cruise ship venue
  const isCruiseShip = state.ceremonyLocationType === 'cruise_ship';

  // Only require country, state, zip if it's not a cruise ship
  if (!isCruiseShip) {
    requiredFields.push('venueCountry', 'venueState', 'venueZip');
  }

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
      'venueCity',
      'firstName',
      'lastName',
      'email',
    ] as const;
    type FlatQuote = { [K in (typeof requiredFields)[number]]: any } & {
      venueCountry?: any;
      venueState?: any;
      venueZip?: any;
    };

    const flat: FlatQuote = {
      eventType: quote.event?.eventType,
      eventDate: quote.event?.eventDate,
      maxGuests: quote.event?.maxGuests,
      coverageLevel: quote.coverageLevel,
      liabilityCoverage: quote.liabilityCoverage,
      venueName: quote.event?.venue?.name,
      venueAddress1: quote.event?.venue?.address1,
      venueCity: quote.event?.venue?.city,
      firstName: quote.policyHolder?.firstName,
      lastName: quote.policyHolder?.lastName,
      email: quote?.email,
    };

    // Check if it's a cruise ship venue
    const isCruiseShip = quote.event?.venue?.ceremonyLocationType === 'cruise_ship';

    // Only require country, state, zip if it's not a cruise ship
    if (!isCruiseShip) {
      flat.venueCountry = quote.event?.venue?.country;
      flat.venueState = quote.event?.venue?.state;
      flat.venueZip = quote.event?.venue?.zip;
    }

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

// Add this utility function to flatten the quote (copy from customer edit page)
function flattenQuote(quote: any) {
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
    rehearsalDinnerLocationType: quote.event?.venue?.rehearsalDinnerLocationType || '',
    rehearsalDinnerIndoorOutdoor: quote.event?.venue?.rehearsalDinnerIndoorOutdoor || '',
    rehearsalDinnerVenueName: quote.event?.venue?.rehearsalDinnerVenueName || '',
    rehearsalDinnerVenueAddress1: quote.event?.venue?.rehearsalDinnerVenueAddress1 || '',
    rehearsalDinnerVenueAddress2: quote.event?.venue?.rehearsalDinnerVenueAddress2 || '',
    rehearsalDinnerVenueCountry: quote.event?.venue?.rehearsalDinnerCountry || '',
    rehearsalDinnerVenueCity: quote.event?.venue?.rehearsalDinnerCity || '',
    rehearsalDinnerVenueState: quote.event?.venue?.rehearsalDinnerState || '',
    rehearsalDinnerVenueZip: quote.event?.venue?.rehearsalDinnerZip || '',
    rehearsalDinnerVenueAsInsured: quote.event?.venue?.rehearsalDinnerAsInsured || false,
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
    step3Complete: true, // Mark as complete for review page
  };
}

function ReviewClientContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentSuccessParam = searchParams.get('payment') === 'success';
  // const paymentMethodParam = searchParams.get('method') || 'Unknown'; // Get payment method
  const { state, dispatch } = useQuote();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [paymentSuccess] = useState(paymentSuccessParam); // removed setPaymentSuccess
  const [showPolicyNumber, setShowPolicyNumber] = useState(paymentSuccessParam);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [policySaved, setPolicySaved] = useState(false);
  const [policyNumber, setPolicyNumber] = useState<string>('');
  const [quoteLoaded, setQuoteLoaded] = useState(false);

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
    const isRetrievedQuote = searchParams.get('retrieved') === 'true';
    const quoteNumber = searchParams.get('qn');

    if (isRetrievedQuote && quoteNumber) {
      router.push(`/customer/edit/${quoteNumber}`);
    } else {
      router.push('/customer/policy-holder');
    }
  };

  // Generate PDF quote
  const generatePdf = async () => {
    setIsGeneratingPdf(true);
    const jsPDF = (await import('jspdf')).default;
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      const contentWidth = pageWidth - margin * 2;
      const columnWidth = (contentWidth - 30) / 2;
      const leftColX = margin;
      const rightColX = margin + columnWidth + 30;

      // --- Colors and Fonts ---
      const primaryColor = '#233F96'; // Deep Blue
      const secondaryColor = '#F0F4FF'; // Light Blue background
      const textColor = '#333333';
      const labelColor = '#555555';
      const white = '#FFFFFF';
      doc.setFont('helvetica');

      // --- Header ---
      doc.setFillColor(primaryColor);
      doc.rect(0, 0, pageWidth, 60, 'F');
      doc.setTextColor(white);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Insurance Quote', margin, 38);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Quote #: ${state.quoteNumber}`, pageWidth - margin, 30, { align: 'right' });
      doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin, 42, {
        align: 'right',
      });

      let leftY = 90;
      let rightY = 90;

      // --- Helper Functions ---
      const drawSectionTitle = (title: string, x: number, y: number, w: number) => {
        doc.setFillColor(secondaryColor);
        doc.rect(x, y - 12, w, 18, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor);
        doc.text(title, x + 10, y);
        return y + 25;
      };

      const drawField = (
        label: string,
        value: string | undefined | null,
        x: number,
        y: number,
        w: number,
      ) => {
        if (!value) return y;
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(labelColor);
        doc.text(label, x, y);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(textColor);
        const valueLines = doc.splitTextToSize(value, w - 135);
        doc.text(valueLines, x + 140, y);
        const lineCount = Array.isArray(valueLines) ? valueLines.length : 1;
        return y + lineCount * 11 + 4;
      };

      // --- Right Column: Premium & Policyholder ---
      rightY = drawSectionTitle('Premium Summary', rightColX, rightY, columnWidth);
      rightY = drawField(
        'Total Premium:',
        formatCurrency(state.totalPremium),
        rightColX,
        rightY,
        columnWidth,
      );
      rightY = drawField(
        'Core Coverage:',
        formatCurrency(state.basePremium),
        rightColX,
        rightY,
        columnWidth,
      );
      if (state.liabilityCoverage !== 'none') {
        rightY = drawField(
          'Liability Premium:',
          formatCurrency(state.liabilityPremium),
          rightColX,
          rightY,
          columnWidth,
        );
      }
      if (state.liquorLiability) {
        rightY = drawField(
          'Host Liquor Premium:',
          formatCurrency(state.liquorLiabilityPremium),
          rightColX,
          rightY,
          columnWidth,
        );
      }

      rightY += 15;
      rightY = drawSectionTitle('Policyholder Details', rightColX, rightY, columnWidth);
      rightY = drawField(
        'Name:',
        `${state.firstName} ${state.lastName}`,
        rightColX,
        rightY,
        columnWidth,
      );
      rightY = drawField('Relationship:', relationshipLabel, rightColX, rightY, columnWidth);
      rightY = drawField('Email:', state.email, rightColX, rightY, columnWidth);
      rightY = drawField('Phone:', state.phone, rightColX, rightY, columnWidth);
      rightY = drawField('Address:', `${state.address}`, rightColX, rightY, columnWidth);
      rightY = drawField(
        'Location:',
        `${state.city}, ${state.state} ${state.zip}`,
        rightColX,
        rightY,
        columnWidth,
      );

      // --- Left Column: Event & Coverage ---
      leftY = drawSectionTitle('Event & Coverage', leftColX, leftY, columnWidth);
      leftY = drawField('Event Type:', eventTypeLabel, leftColX, leftY, columnWidth);
      leftY = drawField('Event Date:', formattedEventDate, leftColX, leftY, columnWidth);
      leftY = drawField('Guest Count:', guestRangeLabel, leftColX, leftY, columnWidth);
      leftY = drawField('Core Coverage:', coverageLevelLabel, leftColX, leftY, columnWidth);
      leftY = drawField('Liability Coverage:', liabilityOptionLabel, leftColX, leftY, columnWidth);
      leftY = drawField(
        'Host Liquor:',
        state.liquorLiability ? 'Included' : 'Not Included',
        leftColX,
        leftY,
        columnWidth,
      );

      leftY += 15;
      leftY = drawSectionTitle('Ceremony Venue', leftColX, leftY, columnWidth);
      leftY = drawField('Venue Name:', state.venueName, leftColX, leftY, columnWidth);
      leftY = drawField('Venue Type:', venueTypeLabel, leftColX, leftY, columnWidth);
      leftY = drawField('Indoor/Outdoor:', indoorOutdoorLabel, leftColX, leftY, columnWidth);
      const venueAddress = `${state.venueAddress1}${state.venueAddress2 ? `, ${state.venueAddress2}` : ''}`;
      leftY = drawField('Address:', venueAddress, leftColX, leftY, columnWidth);
      leftY = drawField(
        'Location:',
        `${state.venueCity}, ${state.venueState} ${state.venueZip}`,
        leftColX,
        leftY,
        columnWidth,
      );
      leftY = drawField(
        'As Additional Insured:',
        state.venueAsInsured ? 'Yes' : 'No ',
        leftColX,
        leftY,
        columnWidth,
      );

      // --- Full Width Section for Additional Venues ---
      let y = Math.max(leftY, rightY) + 15;

      if (state.eventType === 'wedding') {
        const venues = [
          {
            type: 'Reception',
            name: state.receptionVenueName,
            address: `${state.receptionVenueAddress1}${state.receptionVenueAddress2 ? `, ${state.receptionVenueAddress2}` : ''}`,
            location: `${state.receptionVenueCity}, ${state.receptionVenueState} ${state.receptionVenueZip}`,
            locationType: VENUE_TYPES.find((o) => o.value === state.receptionLocationType)?.label,
            indoorOutdoor: INDOOR_OUTDOOR_OPTIONS.find(
              (o) => o.value === state.receptionIndoorOutdoor,
            )?.label,
            asInsured: state.receptionVenueAsInsured ? 'Yes' : 'No ',
          },
          {
            type: 'Brunch',
            name: state.brunchVenueName,
            address: `${state.brunchVenueAddress1}${state.brunchVenueAddress2 ? `, ${state.brunchVenueAddress2}` : ''}`,
            location: `${state.brunchVenueCity}, ${state.brunchVenueState} ${state.brunchVenueZip}`,
            locationType: VENUE_TYPES.find((o) => o.value === state.brunchLocationType)?.label,
            indoorOutdoor: INDOOR_OUTDOOR_OPTIONS.find((o) => o.value === state.brunchIndoorOutdoor)
              ?.label,
            asInsured: state.brunchVenueAsInsured ? 'Yes' : 'No ',
          },
          {
            type: 'Rehearsal',
            name: state.rehearsalVenueName,
            address: `${state.rehearsalVenueAddress1}${state.rehearsalVenueAddress2 ? `, ${state.rehearsalVenueAddress2}` : ''}`,
            location: `${state.rehearsalVenueCity}, ${state.rehearsalVenueState} ${state.rehearsalVenueZip}`,
            locationType: VENUE_TYPES.find((o) => o.value === state.rehearsalLocationType)?.label,
            indoorOutdoor: INDOOR_OUTDOOR_OPTIONS.find(
              (o) => o.value === state.rehearsalIndoorOutdoor,
            )?.label,
            asInsured: state.rehearsalVenueAsInsured ? 'Yes' : 'No ',
          },
          {
            type: 'Rehearsal Dinner',
            name: state.rehearsalDinnerVenueName,
            address: `${state.rehearsalDinnerVenueAddress1}${state.rehearsalDinnerVenueAddress2 ? `, ${state.rehearsalDinnerVenueAddress2}` : ''}`,
            location: `${state.rehearsalDinnerVenueCity}, ${state.rehearsalDinnerVenueState} ${state.rehearsalDinnerVenueZip}`,
            locationType: VENUE_TYPES.find((o) => o.value === state.rehearsalDinnerLocationType)
              ?.label,
            indoorOutdoor: INDOOR_OUTDOOR_OPTIONS.find(
              (o) => o.value === state.rehearsalDinnerIndoorOutdoor,
            )?.label,
            asInsured: state.rehearsalDinnerVenueAsInsured ? 'Yes' : 'No ',
          },
        ].filter((v) => v.name);

        if (venues.length > 0) {
          y = drawSectionTitle('Additional Venues', margin, y, contentWidth);
          for (const venue of venues) {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(textColor);
            doc.text(`${venue.type} Venue`, margin, y);
            y += 12;
            y = drawField('Name:', venue.name, margin, y, contentWidth);
            y = drawField('Address:', venue.address, margin, y, contentWidth);
            y = drawField('Location:', venue.location, margin, y, contentWidth);
            y = drawField('Venue Type:', venue.locationType, margin, y, contentWidth);
            y = drawField('Indoor/Outdoor:', venue.indoorOutdoor, margin, y, contentWidth);
            y = drawField('As Additional Insured:', venue.asInsured, margin, y, contentWidth);
            y += 8;
          }
        }
      }

      // --- Footer ---
      doc.setFillColor(secondaryColor);
      doc.rect(0, pageHeight - 40, pageWidth, 40, 'F');
      doc.setFontSize(8);
      doc.setTextColor(labelColor);
      const footerText = `This quote is valid for 30 days. Terms and conditions apply. | WeddingGuard Insurance - 1-800-555-0123`;
      doc.text(footerText, pageWidth / 2, pageHeight - 18, { align: 'center' });

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
        // Create a proper payload that handles cruise ship venues correctly
        const isCruiseShip = state.ceremonyLocationType === 'cruise_ship';

        // Helper function to conditionally include venue fields based on venue type
        const getVenueFields = (prefix: string) => {
          const isCruiseShipVenue = (state as any)[`${prefix}LocationType`] === 'cruise_ship';

          const baseFields = {
            [`${prefix}LocationType`]: (state as any)[`${prefix}LocationType`],
            [`${prefix}IndoorOutdoor`]: (state as any)[`${prefix}IndoorOutdoor`],
            [`${prefix}VenueName`]: (state as any)[`${prefix}VenueName`],
            [`${prefix}VenueAddress1`]: (state as any)[`${prefix}VenueAddress1`],
            [`${prefix}VenueAddress2`]: (state as any)[`${prefix}VenueAddress2`],
            [`${prefix}VenueAsInsured`]: (state as any)[`${prefix}VenueAsInsured`],
            [`${prefix}VenueCity`]: (state as any)[`${prefix}VenueCity`] || '',
          };

          if (!isCruiseShipVenue) {
            return {
              ...baseFields,
              [`${prefix}VenueCountry`]: (state as any)[`${prefix}VenueCountry`] || '',
              [`${prefix}VenueState`]: (state as any)[`${prefix}VenueState`] || '',
              [`${prefix}VenueZip`]: (state as any)[`${prefix}VenueZip`] || '',
            };
          }

          return baseFields;
        };

        // Base payload with ceremony venue fields
        const payload: Partial<QuoteState> & { status: string } = {
          eventType: state.eventType,
          eventDate: state.eventDate,
          maxGuests: state.maxGuests,
          honoree1FirstName: state.honoree1FirstName,
          honoree1LastName: state.honoree1LastName,
          honoree2FirstName: state.honoree2FirstName,
          honoree2LastName: state.honoree2LastName,
          venueName: state.venueName,
          venueAddress1: state.venueAddress1,
          venueAddress2: state.venueAddress2,
          venueCity: state.venueCity,
          ceremonyLocationType: state.ceremonyLocationType,
          indoorOutdoor: state.indoorOutdoor,
          venueAsInsured: state.venueAsInsured,
          status: 'COMPLETE',
        };

        // Only include country, state, zip for ceremony venue if it's not a cruise ship
        if (!isCruiseShip) {
          payload.venueCountry = state.venueCountry;
          payload.venueState = state.venueState;
          payload.venueZip = state.venueZip;
        }

        // Add additional venue fields for weddings
        if (state.eventType === 'wedding') {
          Object.assign(payload, getVenueFields('reception'));
          Object.assign(payload, getVenueFields('brunch'));
          Object.assign(payload, getVenueFields('rehearsal'));
          Object.assign(payload, getVenueFields('rehearsalDinner'));
        }

        // 1. Update quote to COMPLETE status (using quoteNumberFromParams)
        const quoteRes = await fetch(`${apiUrl}/quotes/${quoteNumberFromParams}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
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

          // 3. Check if policy exists and send policy email
          try {
            // Fetch the quote with policy relation to check if policy was created
            const quoteWithPolicyRes = await fetch(
              `${apiUrl}/quotes?quoteNumber=${quoteNumberFromParams}`,
            );
            if (quoteWithPolicyRes.ok) {
              const quoteWithPolicyData = await quoteWithPolicyRes.json();
              const quoteWithPolicy = quoteWithPolicyData.quote;

              // Check if policy exists for this quote
              if (quoteWithPolicy && quoteWithPolicy.policy) {
                // Send policy email
                const emailRes = await fetch(`${apiUrl}/email/send`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    to: state.email,
                    type: 'policy',
                    data: {
                      quoteNumber: quoteWithPolicy.quoteNumber,
                      policyHolder: quoteWithPolicy.policyHolder,
                      totalPremium: quoteWithPolicy.totalPremium,
                      policy: quoteWithPolicy.policy,
                    },
                  }),
                });

                if (emailRes.ok) {
                  console.log('Policy email sent successfully');
                } else {
                  console.error('Failed to send policy email');
                }
              }
            }
          } catch (emailError) {
            console.error('Error sending policy email:', emailError);
          }
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

  // Fetch quote if qn param is present
  useEffect(() => {
    const qn = searchParams.get('qn');
    const isRetrieved = searchParams.get('retrieved') === 'true';

    if (qn) {
      const fetchQuote = async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          const res = await fetch(`${apiUrl}/quotes?quoteNumber=${qn}`, { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            const flatQuote = flattenQuote(data.quote);
            dispatch({ type: 'SET_ENTIRE_QUOTE_STATE', payload: flatQuote });
            setQuoteLoaded(true);
          } else {
            // For retrieved quotes, don't redirect - just show an error
            if (isRetrieved) {
              toast({
                title: 'Error',
                description: 'Failed to load quote details. Please try again or contact support.',
                variant: 'destructive',
              });
              setQuoteLoaded(true); // Set to true to stop loading
              return;
            }
            router.replace('/customer/quote-generator');
          }
        } catch {
          // For retrieved quotes, don't redirect - just show an error
          if (isRetrieved) {
            toast({
              title: 'Error',
              description: 'Failed to load quote details. Please try again or contact support.',
              variant: 'destructive',
            });
            setQuoteLoaded(true); // Set to true to stop loading
            return;
          }
          router.replace('/customer/quote-generator');
        }
      };
      fetchQuote();
    } else {
      setQuoteLoaded(true);
    }
  }, [searchParams, dispatch, router]);

  const handleGoToPayment = async () => {
    const quoteNumber = state.quoteNumber;
    if (!quoteNumber) {
      toast({
        title: 'Error',
        description: 'Quote number is missing. Cannot proceed.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/quotes/${quoteNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state), // Send the entire state
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update quote before payment.');
      }

      // Check if this is a retrieved quote and pass the parameter
      const isRetrieved = searchParams.get('retrieved') === 'true';
      const paymentUrl = isRetrieved ? '/customer/payment?retrieved=true' : '/customer/payment';

      // If save is successful, then navigate
      router.push(paymentUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        title: 'Save Error',
        description: `Could not save quote details. ${message}`,
        variant: 'destructive',
      });
    }
  };

  if (!quoteLoaded) return <ReviewPageSkeleton />;

  if (!pageReady) {
    return <ReviewPageSkeleton />;
  }

  // Add a function to render additional venue information if eventType is 'wedding'
  const renderAdditionalVenues = () => {
    if (state.eventType !== 'wedding' || paymentSuccess) return null;
    return (
      <>
        <ReviewSection
          title={
            <span className="text-lg font-bold text-blue-800">Additional Venue Information</span>
          }
          icon={<Calendar size={20} className="text-blue-600" />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 w-full">
            <div className="space-y-3">
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
            <div className="space-y-3">
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
        <div className="w-full lg:flex-1">
          <div className="flex flex-col gap-6 sm:gap-8 pb-8 sm:pb-12 w-full mt-6 sm:mt-8">
            <div className="flex-1 min-w-0">
              {paymentSuccess ? (
                <Card
                  title={
                    <span className="text-xl sm:text-2xl font-bold text-green-700">
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
                      <CheckCircle size={24} className="sm:w-7 sm:h-7 text-green-600" />
                    ) : (
                      <DollarSign size={24} className="sm:w-7 sm:h-7 text-blue-600" />
                    )
                  }
                  className={`mb-6 sm:mb-8 shadow-lg border-0 bg-white ${
                    showPolicyNumber ? 'border-green-100' : 'border-blue-100'
                  }`}
                >
                  <div className="text-center py-8 sm:py-10">
                    {showPolicyNumber ? (
                      <div className="space-y-6 sm:space-y-8">
                        <div className="bg-green-50 border border-green-100 rounded-xl p-6 sm:p-8">
                          <CheckCircle
                            size={40}
                            className="sm:w-12 sm:h-12 text-green-500 mx-auto mb-4"
                          />
                          <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
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
                        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
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
                      <span className="text-xl sm:text-2xl font-bold text-blue-800">
                        Review Your Quote
                      </span>
                    }
                    subtitle={
                      <span className="text-sm sm:text-base text-gray-600">
                        Quote #{state.quoteNumber}
                      </span>
                    }
                    icon={<FileCog size={24} className="sm:w-7 sm:h-7 text-blue-600" />}
                    className="mb-6 sm:mb-8 shadow-lg border-0 bg-white"
                  >
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 mb-6 sm:mb-8 flex items-start gap-3">
                      <AlertTriangle size={18} className="sm:w-5 sm:h-5 text-yellow-500 mt-1" />
                      <div>
                        <p className="text-xs sm:text-sm text-yellow-800 font-semibold">
                          Please review all information carefully before proceeding to payment. You
                          can go back to make changes if needed.
                        </p>
                      </div>
                    </div>
                    <div className="mb-6 sm:mb-8">
                      <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200 mb-6">
                        <div className="text-center mb-4">
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1">
                            Total Premium
                          </h3>
                          <p className="text-2xl sm:text-3xl font-bold text-blue-700">
                            {formatCurrency(state.totalPremium)}
                          </p>
                        </div>
                        <div className="pt-4 border-t border-gray-100">
                          <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                            Premium Breakdown:
                          </h4>
                          <div className="space-y-2 text-gray-700">
                            <div className="flex justify-between text-xs sm:text-sm">
                              <span>Core Coverage:</span>
                              <span className="font-medium">
                                {formatCurrency(state.basePremium)}
                              </span>
                            </div>
                            {state.liabilityCoverage !== 'none' && (
                              <div className="flex justify-between text-xs sm:text-sm">
                                <span>Liability Coverage:</span>
                                <span className="font-medium">
                                  {formatCurrency(state.liabilityPremium)}
                                </span>
                              </div>
                            )}
                            {state.liquorLiability && (
                              <div className="flex justify-between text-xs sm:text-sm">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 w-full">
                      <div className="space-y-3">
                        <ReviewItem label="Event Type" value={eventTypeLabel} />
                        <ReviewItem label="Guest Count" value={guestRangeLabel} />
                        <ReviewItem label="Event Date" value={formattedEventDate} />
                      </div>
                      <div className="space-y-3">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 w-full">
                      <div className="space-y-3">
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
                      <div className="space-y-3">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 w-full">
                      <div className="space-y-3">
                        <ReviewItem
                          label="Policyholder"
                          value={`${state.firstName} ${state.lastName}`}
                        />
                        <ReviewItem label="Relationship" value={relationshipLabel} />
                        <ReviewItem label="Email" value={state.email} />
                        <ReviewItem label="Phone" value={state.phone} />
                      </div>
                      <div className="space-y-3">
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
                      <span className="text-sm sm:text-base text-gray-600">
                        Complete your purchase securely
                      </span>
                    }
                    icon={<DollarSign size={20} className="sm:w-6 sm:h-6 text-blue-600" />}
                    className="mb-6 sm:mb-8 shadow-lg border-0 bg-white"
                  >
                    <div className="py-8 sm:py-10 text-center">
                      <p className="text-sm sm:text-base text-gray-700 mb-4 px-4">
                        For this demonstration, we&apos;ve simplified the payment process. Click the
                        button below to simulate payment and complete your policy purchase.
                      </p>
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={handleGoToPayment}
                        onMouseEnter={() => router.prefetch('/customer/payment')}
                        className="min-w-44 transition-transform duration-150 hover:scale-105"
                      >
                        <DollarSign size={18} />
                        Complete Purchase
                      </Button>
                      <p className="text-xs text-gray-500 mt-4 px-4">
                        Your total charge will be {formatCurrency(state.totalPremium)}. In a real
                        application, this would include a secure payment form.
                      </p>
                    </div>
                  </Card>
                  <div className="flex justify-between mt-8 sm:mt-10 gap-4">
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
              {renderAdditionalVenues()}{' '}
              {/* Moved additional venues inside the main content flow */}
            </div>
          </div>
        </div>{' '}
        {/* End of Main content area */}
        {/* Sidebar for QuotePreview */}
        <div className="hidden lg:block lg:w-80 lg:sticky lg:top-24 self-start mt-8">
          {' '}
          {/* Added mt-8 to align with main content's top margin */}
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
