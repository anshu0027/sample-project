'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ChevronDown, DollarSign } from 'lucide-react';
import { useQuote } from '@/context/QuoteContext';
import type { QuoteState } from '@/context/QuoteContext'; // Keep this if it's used elsewhere, or remove if only for Input
import { Button } from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import DatePicker from '@/components/ui/DatePicker';
import {
  US_STATES,
  EVENT_TYPES,
  GUEST_RANGES,
  COVERAGE_LEVELS,
  LIABILITY_OPTIONS,
  PROHIBITED_ACTIVITIES,
  LIQUOR_LIABILITY_PREMIUMS,
  LIQUOR_LIABILITY_PREMIUMS_NEW,
  COVERAGE_DETAILS,
  CORE_COVERAGE_PREMIUMS, // Added for dynamic pricing
  LIABILITY_COVERAGE_PREMIUMS, // Added for dynamic pricing
} from '@/utils/constants';
import {
  isDateInFuture,
  isDateAtLeast48HoursAhead,
  isDateWithinTwoYears,
  formatCurrency,
} from '@/utils/validators';
import { toast } from '@/hooks/use-toast';
import Card from '@/components/ui/Card';

// =============================
// ===== Type Definitions for Form Fields =====
// =============================
// Add type definitions
type GuestRange = (typeof GUEST_RANGES)[number]['value'];
type CoverageLevel = number;
type LiabilityOption = string;

// =============================
// ===== Premium Calculation Functions =====
// =============================
// Add premium calculation functions
const calculateBasePremium = (level: CoverageLevel | null): number => {
  if (!level) return 0;
  // =============================
  // ===== Mapping of Coverage Level to Base Premium =====
  // =============================
  const premiumMap: Record<CoverageLevel, number> = {
    1: 160, // $7,500 coverage
    2: 200,
    3: 250,
    4: 300,
    5: 355, // $50,000 coverage
    6: 450,
    7: 600,
    8: 750,
    9: 900,
    10: 1025, // $175,000 coverage
  };
  return premiumMap[level] || 0;
};

const calculateLiabilityPremium = (option: LiabilityOption): number => {
  // =============================
  // ===== Calculation of Liability Premium based on Selected Option =====
  // =============================
  switch (option) {
    case 'option1': // $1M liability with $25K property damage
      return 195;
    case 'option2': // $1M liability with $250K property damage
      return 210;
    case 'option3': // $1M liability with $1M property damage
      return 240;
    case 'option4': // $1M/$2M Aggregate Liability with $25K PD
      return 240;
    case 'option5': // $1M/$2M Aggregate Liability with $250K PD
      return 255;
    case 'option6': // $1M/$2M Aggregate Liability with $1M PD
      return 265;
    default:
      return 0;
  }
};

const calculateLiquorLiabilityPremium = (
  hasLiquorLiability: boolean,
  guestRange: GuestRange,
): number => {
  if (!hasLiquorLiability) return 0;
  // =============================
  // ===== Mapping of Guest Range to Liquor Liability Premium =====
  // =============================
  const premiumMap: Record<GuestRange, number> = {
    '1-50': 65,
    '51-100': 65,
    '101-150': 85,
    '151-200': 85,
    '201-250': 100,
    '251-300': 100,
    '301-350': 150,
    '351-400': 150,
  };
  return premiumMap[guestRange] || 0;
};

// =============================
// ===== QuoteGenerator Component =====
// =============================
export default function QuoteGenerator() {
  const router = useRouter();
  const { state, dispatch } = useQuote();

  // =============================
  // ===== Component State =====
  // =============================
  // Form state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showQuoteResults, setShowQuoteResults] = useState(false);
  const [showSpecialActivitiesModal, setShowSpecialActivitiesModal] = useState(false);
  const [isLoading] = useState(false); // removed setIsLoading as it was never used

  // =============================
  // ===== Input Change Handler =====
  // =============================
  // Handle form field changes
  const handleInputChange = (field: keyof QuoteState, value: QuoteState[keyof QuoteState]) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
    // Clear error for this field when it's updated
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    // Reset quote results when key fields change
    if (['coverageLevel', 'liabilityCoverage', 'liquorLiability', 'maxGuests'].includes(field)) {
      setShowQuoteResults(false);
    }
  };

  // =============================
  // ===== Date Handling =====
  // =============================
  // Format date for the date picker
  const selectedDate = state.eventDate ? new Date(state.eventDate) : null;

  const formatDateStringLocal = (date: Date | null): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle date change
  const handleDateChange = (date: Date | null) => {
    if (date) {
      handleInputChange('eventDate', formatDateStringLocal(date));
    } else {
      handleInputChange('eventDate', '');
    }
  };
  // Calculate minimum date (48 hours from now)
  const minDate = new Date();
  minDate.setHours(minDate.getHours() + 48);
  // Calculate maximum date (2 years from now)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 2);

  // =============================
  // ===== Form Validation Logic =====
  // =============================
  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!state.residentState) {
      newErrors.residentState = 'Please select your state of residence';
    }
    if (!state.eventType) {
      newErrors.eventType = 'Please select an event type';
    }

    if (!state.maxGuests) {
      newErrors.maxGuests = 'Please select the maximum number of guests';
    }
    if (!state.eventDate) {
      newErrors.eventDate = 'Please select the event date';
    } else {
      const eventDate = new Date(state.eventDate);
      if (!isDateInFuture(eventDate)) {
        newErrors.eventDate = 'Event date must be in the future';
      } else if (!isDateAtLeast48HoursAhead(eventDate)) {
        newErrors.eventDate = 'Event date must be at least 48 hours in the future';
      } else if (!isDateWithinTwoYears(eventDate)) {
        newErrors.eventDate = 'Event date must be within the next 2 years';
      }
    }
    if (!state.email) {
      newErrors.email = 'Please enter your email address';
    } else if (!/^\S+@\S+\.\S+$/.test(state.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (state.coverageLevel === null) {
      newErrors.coverageLevel = 'Please select a coverage level';
    }
    if (!state.covidDisclosure) {
      newErrors.covidDisclosure = 'You must acknowledge the COVID-19 exclusion';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =============================
  // ===== Calculate Quote and API Call =====
  // =============================
  // Handle calculate quote
  const handleCalculateQuote = async () => {
    if (validateForm()) {
      try {
        // Calculate premiums
        const basePremium = calculateBasePremium(state.coverageLevel);
        const liabilityPremium = calculateLiabilityPremium(state.liabilityCoverage);
        const liquorLiabilityPremium = calculateLiquorLiabilityPremium(
          state.liquorLiability,
          state.maxGuests as GuestRange,
        );
        const totalPremium = basePremium + liabilityPremium + liquorLiabilityPremium;
        // Update state with calculated values
        dispatch({
          type: 'CALCULATE_QUOTE',
          payload: {
            basePremium,
            liabilityPremium,
            liquorLiabilityPremium,
            totalPremium,
          },
        });
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        // Create initial quote with step 1 data
        const res = await fetch(`${apiUrl}/quotes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // Base quote data
            residentState: state.residentState,
            email: state.email,
            coverageLevel: state.coverageLevel,
            liabilityCoverage: state.liabilityCoverage,
            liquorLiability: state.liquorLiability,
            covidDisclosure: state.covidDisclosure,
            specialActivities: state.specialActivities,
            totalPremium: totalPremium,
            basePremium: basePremium,
            liabilityPremium: liabilityPremium,
            liquorLiabilityPremium: liquorLiabilityPremium,
            source: 'ADMIN',
            status: 'STEP1',
            // Add event details directly to the quote
            eventType: state.eventType,
            eventDate: state.eventDate,
            maxGuests: state.maxGuests,
            // Event data structure for compatibility
            event: {
              eventType: state.eventType,
              eventDate: state.eventDate,
              maxGuests: state.maxGuests,
              honoree1FirstName: '',
              honoree1LastName: '',
              honoree2FirstName: '',
              honoree2LastName: '',
              venue: {
                name: '',
                address1: '',
                address2: '',
                city: '',
                state: '',
                zip: '',
                country: '',
                locationType: '',
                indoorOutdoor: '',
                venueAsInsured: false,
                // Additional venue fields
                receptionLocationType: '',
                receptionIndoorOutdoor: '',
                receptionAddress1: '',
                receptionAddress2: '',
                receptionCity: '',
                receptionState: '',
                receptionZip: '',
                receptionCountry: '',
                receptionVenueAsInsured: false,
                brunchLocationType: '',
                brunchIndoorOutdoor: '',
                brunchAddress1: '',
                brunchAddress2: '',
                brunchCity: '',
                brunchState: '',
                brunchZip: '',
                brunchCountry: '',
                brunchVenueAsInsured: false,
                rehearsalLocationType: '',
                rehearsalIndoorOutdoor: '',
                rehearsalAddress1: '',
                rehearsalAddress2: '',
                rehearsalCity: '',
                rehearsalState: '',
                rehearsalZip: '',
                rehearsalCountry: '',
                rehearsalVenueAsInsured: false,
                rehearsalDinnerLocationType: '',
                rehearsalDinnerIndoorOutdoor: '',
                rehearsalDinnerAddress1: '',
                rehearsalDinnerAddress2: '',
                rehearsalDinnerCity: '',
                rehearsalDinnerState: '',
                rehearsalDinnerZip: '',
                rehearsalDinnerCountry: '',
                rehearsalDinnerVenueAsInsured: false,
              },
            },
            // Policy holder data
            policyHolder: {
              firstName: '',
              lastName: '',
              email: state.email,
              phone: '',
              address: '',
              city: '',
              state: '',
              zip: '',
              country: '',
              relationship: '',
              hearAboutUs: '',
              legalNotices: false,
              completingFormName: '',
            },
          }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to create quote');
        }
        const data = await res.json();
        localStorage.setItem('quoteNumber', data.quote.quoteNumber);
        dispatch({
          type: 'UPDATE_FIELD',
          field: 'quoteNumber',
          value: data.quote.quoteNumber,
        });
        setShowQuoteResults(true);
        dispatch({ type: 'COMPLETE_STEP', step: 1 });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        toast.error(message);
      }
    } else {
      Object.entries(errors).forEach(([, msg]) => toast.error(msg));
    }
  };

  // =============================
  // ===== Navigation: Continue to Next Step =====
  // =============================
  // Handle continue to next step
  const handleContinue = () => {
    if (validateForm()) {
      if (!showQuoteResults) {
        handleCalculateQuote();
        return;
      }
      dispatch({ type: 'COMPLETE_STEP', step: 1 });
      router.push('/admin/create-quote/step2');
    }
  };

  // =============================
  // ===== Conditional Logic for Liquor Liability =====
  // =============================
  // Disable liquor liability if no liability coverage selected
  const isLiquorLiabilityDisabled = state.liabilityCoverage === 'none';
  // If liability is none, ensure liquor liability is false
  useEffect(() => {
    if (isLiquorLiabilityDisabled && state.liquorLiability) {
      handleInputChange('liquorLiability', false);
    }
  }, [state.liabilityCoverage]);

  // =============================
  // ===== Special Activities Modal Handling =====
  // =============================
  // Handle special activities checkbox
  const handleSpecialActivitiesChange = (checked: boolean) => {
    if (checked) {
      setShowSpecialActivitiesModal(true);
      // =============================
      // ===== useEffect for Admin Authentication =====
      // =============================
    } else {
      handleInputChange('specialActivities', false);
    }
  };

  useEffect(() => {
    // Replace with real admin auth check
    const isAdminAuthenticated = () => {
      // Use the same key as AdminLayout
      return typeof window !== 'undefined' && localStorage.getItem('admin_logged_in') === 'true';
    };
    if (!isAdminAuthenticated()) {
      router.replace('/admin/login');
    }
  }, [router]);

  // =============================
  // ===== Main Component Render =====
  // =============================
  return (
    <>
      {/* Replaced Card with div structure from Step1Form.tsx */}
      {/* Outermost div simplified. Layout handles max-width and centering. This div now focuses on card-like styling. */}
      <div className="w-full mb-10 text-center shadow-2xl border-0 bg-white/90 rounded-2xl p-8 sm:p-10 md:p-12">
        {/* ============================= */}
        {/* ===== Page Header ===== */}
        {/* ============================= */}
        <div className="mb-8">
          <p className="text-3xl md:text-4xl font-extrabold text-blue-900 drop-shadow text-center">
            Get Your Wedding Insurance Quote
          </p>
          <p className="text-lg md:text-xl text-blue-700 font-medium text-center">
            Tell us about your event to receive an instant quote
          </p>
        </div>
        {/* ============================= */}
        {/* ===== Form Fields Grid ===== */}
        {/* ============================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 px-2 sm:px-4 md:px-8">
          {/* ============================= */}
          {/* ===== Resident State Field ===== */}
          {/* ============================= */}
          {/* Resident State */}
          <div className="flex flex-col">
            <label
              htmlFor="residentState"
              className="block text-sm font-medium text-gray-700 text-left mb-1"
            >
              Policy Holder&apos;s Resident State
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative w-full">
              <select
                id="residentState"
                value={state.residentState}
                onChange={(e) => handleInputChange('residentState', e.target.value)}
                className={`block w-full rounded-md shadow-sm pl-3 pr-10 py-2 text-base border appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.residentState
                    ? 'border-red-500 text-red-900'
                    : 'border-gray-300 text-gray-900'
                } text-left`}
              >
                <option value="">Select your state</option>
                {US_STATES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                size={16}
              />
            </div>
            {errors.residentState && (
              <p className="mt-1 text-xs text-red-500 text-left">{errors.residentState}</p>
            )}
          </div>

          {/* ============================= */}
          {/* ===== Event Type Field ===== */}
          {/* ============================= */}
          {/* Event Type */}
          <div className="flex flex-col">
            <label
              htmlFor="eventType"
              className="block text-sm font-medium text-gray-700 text-left mb-1"
            >
              Event Type
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative w-full">
              <select
                id="eventType"
                value={state.eventType}
                onChange={(e) => handleInputChange('eventType', e.target.value)}
                className={`block w-full rounded-md shadow-sm pl-3 pr-10 py-2 text-base border appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.eventType ? 'border-red-500 text-red-900' : 'border-gray-300 text-gray-900'
                } text-left`}
              >
                <option value="">Select event type</option>
                {EVENT_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                size={16}
              />
            </div>
            {errors.eventType && (
              <p className="mt-1 text-xs text-red-500 text-left">{errors.eventType}</p>
            )}
          </div>

          {/* ============================= */}
          {/* ===== Maximum Guests Field ===== */}
          {/* ============================= */}
          {/* Maximum Guests */}
          <div className="flex flex-col">
            <label
              htmlFor="maxGuests"
              className="block text-sm font-medium text-gray-700 text-left mb-1"
            >
              Maximum Number of Guests
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative w-full">
              <select
                id="maxGuests"
                value={state.maxGuests}
                onChange={(e) => handleInputChange('maxGuests', e.target.value)}
                className={`block w-full rounded-md shadow-sm pl-3 pr-10 py-2 text-base border appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.maxGuests ? 'border-red-500 text-red-900' : 'border-gray-300 text-gray-900'
                } text-left`}
              >
                <option value="">Select guest count range</option>
                {GUEST_RANGES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                size={16}
              />
            </div>
            {errors.maxGuests && (
              <p className="mt-1 text-xs text-red-500 text-left">{errors.maxGuests}</p>
            )}
          </div>

          {/* ============================= */}
          {/* ===== Event Date Field ===== */}
          {/* ============================= */}
          {/* Event Date */}
          <div className="flex flex-col">
            <label
              htmlFor="eventDate"
              className="block text-sm font-medium text-gray-700 text-left mb-1"
            >
              Event Date
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="w-full">
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                minDate={minDate}
                maxDate={maxDate}
                placeholderText="Select event date"
                error={!!errors.eventDate}
                className="w-full text-left"
              />
            </div>
            {errors.eventDate && (
              <p className="mt-1 text-xs text-red-500 text-left">{errors.eventDate}</p>
            )}
          </div>

          {/* ============================= */}
          {/* ===== Email and Coverage Level Container ===== */}
          {/* ============================= */}
          {/* Email and Coverage Level Container */}
          <div className="flex flex-col md:col-span-2 gap-y-6">
            {/* ============================= */}
            {/* ===== Email Address Field ===== */}
            {/* ============================= */}
            {/* Email Address */}
            <div className="flex flex-col">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 text-left mb-1"
              >
                Email Address
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="w-full">
                <input
                  id="email"
                  type="email"
                  value={state.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="you@email.com"
                  required
                  className={`w-full text-left p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-500 text-red-900' : 'border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500 text-left">{errors.email}</p>
              )}
            </div>

            {/* ============================= */}
            {/* ===== Coverage Level Field ===== */}
            {/* ============================= */}
            {/* Coverage Level */}
            <div className="flex flex-col">
              <label
                htmlFor="coverageLevel"
                className="block text-sm font-medium text-gray-700 text-left mb-1"
              >
                Core Coverage Level
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative w-full">
                <select
                  id="coverageLevel"
                  value={state.coverageLevel?.toString() || ''}
                  onChange={(e) => handleInputChange('coverageLevel', parseInt(e.target.value))}
                  className={`block w-full rounded-md shadow-sm pl-3 pr-10 py-2 text-base border appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.coverageLevel
                      ? 'border-red-500 text-red-900'
                      : 'border-gray-300 text-gray-900'
                  } text-left`}
                >
                  <option value="">Select coverage level</option>
                  {COVERAGE_LEVELS.map((level) => {
                    let premiumText = '';
                    if (
                      level.value &&
                      state.maxGuests &&
                      CORE_COVERAGE_PREMIUMS[state.maxGuests] &&
                      CORE_COVERAGE_PREMIUMS[state.maxGuests][level.value] !== undefined
                    ) {
                      const premium = CORE_COVERAGE_PREMIUMS[state.maxGuests][level.value];
                      premiumText = ` (+$${premium})`;
                    }
                    return (
                      <option key={level.value} value={level.value}>
                        {level.label}
                        {premiumText}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  size={16}
                />
              </div>
              {errors.coverageLevel && (
                <p className="mt-1 text-xs text-red-500 text-left">{errors.coverageLevel}</p>
              )}
              {/* ============================= */}
              {/* ===== Coverage Details Section ===== */}
              {/* ============================= */}
              {/* Coverage Details Section */}
              {state.coverageLevel && COVERAGE_DETAILS[state.coverageLevel.toString()] && (
                <div className="mt-4 w-full bg-blue-50 rounded-lg p-4 border border-blue-100 text-left">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">Coverage Details:</h4>
                  <div className="space-y-2">
                    {COVERAGE_DETAILS[state.coverageLevel.toString()].map((detail, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-700">{detail.name}:</span>
                        <span className="font-medium text-blue-700">{detail.limit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ============================= */}
          {/* ===== Liability Coverage Field ===== */}
          {/* ============================= */}
          {/* Liability Coverage */}
          <div className="flex flex-col">
            <label
              htmlFor="liabilityCoverage"
              className="block text-sm font-medium text-gray-700 text-left mb-1"
            >
              Liability Coverage
            </label>
            <div className="relative w-full">
              <select
                id="liabilityCoverage"
                value={state.liabilityCoverage}
                onChange={(e) => handleInputChange('liabilityCoverage', e.target.value)}
                className={`block w-full rounded-md shadow-sm pl-3 pr-10 py-2 text-base border appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.liabilityCoverage
                    ? 'border-red-500 text-red-900'
                    : 'border-gray-300 text-gray-900'
                } text-left`}
              >
                <option value="">Select liability coverage</option>
                {LIABILITY_OPTIONS.map((option) => {
                  let premiumText = '';
                  if (
                    option.value &&
                    state.maxGuests &&
                    LIABILITY_COVERAGE_PREMIUMS[state.maxGuests] &&
                    LIABILITY_COVERAGE_PREMIUMS[state.maxGuests][option.value] !== undefined
                  ) {
                    const premium = LIABILITY_COVERAGE_PREMIUMS[state.maxGuests][option.value];
                    if (option.value === 'none' && premium === 0) {
                      premiumText = ` (+$${premium})`;
                    } else if (option.value !== 'none' && premium >= 0) {
                      premiumText = ` (+$${premium})`;
                    }
                  }
                  return (
                    <option
                      key={option.value}
                      value={option.value}
                      className={option.isNew ? 'text-red-400' : ''}
                    >
                      {option.label}
                      {premiumText}
                    </option>
                  );
                })}
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                size={16}
              />
            </div>
            {errors.liabilityCoverage && (
              <p className="mt-1 text-xs text-red-500 text-left">{errors.liabilityCoverage}</p>
            )}
          </div>

          {/* ============================= */}
          {/* ===== Liquor Liability Field ===== */}
          {/* ============================= */}
          {/* Liquor Liability */}
          <div className="flex flex-col items-start">
            <label
              htmlFor="liquorLiability"
              className="block text-sm font-medium text-gray-700 text-left mb-1 w-full"
            >
              Host Liquor Liability
            </label>
            <Checkbox
              id="liquorLiability"
              label={
                <span className="font-medium text-left">
                  Yes, add Host Liquor Liability coverage{' '}
                  {!isLiquorLiabilityDisabled && state.maxGuests
                    ? `(+$${
                        LIABILITY_OPTIONS.find(
                          (o) => o.value === state.liabilityCoverage && o.isNew,
                        )
                          ? LIQUOR_LIABILITY_PREMIUMS_NEW[state.maxGuests]
                          : LIQUOR_LIABILITY_PREMIUMS[state.maxGuests]
                      })`
                    : ''}
                </span>
              }
              checked={state.liquorLiability}
              onChange={(checked) => handleInputChange('liquorLiability', checked)}
              disabled={isLiquorLiabilityDisabled}
              description={
                <span className="text-left">
                  {isLiquorLiabilityDisabled
                    ? 'You must select Liability Coverage to add Host Liquor Liability'
                    : 'Provides coverage for alcohol-related incidents if alcohol is served at your event'}
                </span>
              }
              error={!!errors.liquorLiability}
            />
            {errors.liquorLiability && (
              <p className="mt-1 text-xs text-red-500 text-left">{errors.liquorLiability}</p>
            )}
          </div>

          {/* ============================= */}
          {/* ===== Special Activities Field ===== */}
          {/* ============================= */}
          {/* Special Activities */}
          <div className="flex flex-col items-start">
            <label
              htmlFor="specialActivities"
              className="block text-sm font-medium text-gray-700 text-left mb-1 w-full"
            >
              Special Activities
            </label>
            <Checkbox
              id="specialActivities"
              label={
                <span className="font-medium text-left">
                  My event will include special activities or features
                </span>
              }
              checked={state.specialActivities}
              onChange={handleSpecialActivitiesChange}
              description={
                <span className="text-left">
                  Examples: fireworks, bounce houses, live animals, etc.
                </span>
              }
              error={!!errors.specialActivities}
            />
            {errors.specialActivities && (
              <p className="mt-1 text-xs text-red-500 text-left">{errors.specialActivities}</p>
            )}
          </div>
        </div>

        {/* ============================= */}
        {/* ===== COVID-19 Disclosure Section ===== */}
        {/* ============================= */}
        {/* COVID-19 Disclosure */}
        <div className="px-2 sm:px-4 md:px-8 mt-8">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 mt-8 flex flex-col sm:flex-row items-start gap-3">
            <AlertCircle size={20} className="text-yellow-500 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-800 mb-1 text-sm sm:text-base">
                Important Disclosures
              </h3>
              <div className="flex flex-col items-start mt-3 w-full text-left">
                {' '}
                {/* Replaced FormField and applied its className */}
                <label
                  htmlFor="covidDisclosure"
                  className="block text-sm font-medium text-gray-700 text-left mb-1"
                >
                  <span className="font-medium text-gray-800 text-sm sm:text-base">
                    COVID-19 Exclusion Acknowledgment
                  </span>
                </label>
                <Checkbox
                  id="covidDisclosure"
                  label={
                    <span className="font-medium text-left">
                      I understand that cancellations or impacts due to COVID-19, pandemics, or
                      communicable diseases are not covered by this policy
                    </span>
                  }
                  checked={state.covidDisclosure}
                  onChange={(checked) => handleInputChange('covidDisclosure', checked)}
                  error={!!errors.covidDisclosure}
                  className="w-full"
                />
                {errors.covidDisclosure && (
                  <p className="mt-1 text-xs text-red-500 text-left">{errors.covidDisclosure}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* ============================= */}
        {/* ===== Calculate Quote Button ===== */}
        {/* ============================= */}
        <div className="px-2 sm:px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-center mt-10 gap-4 w-full">
            <Button
              variant="primary"
              size="lg"
              onClick={handleCalculateQuote}
              //
              className="transition-transform duration-150"
            >
              <DollarSign size={18} />
              Calculate Quote
            </Button>
            {/* onSave button is not part of this page's logic, so it's omitted */}
          </div>
        </div>
      </div>

      {/* ============================= */}
      {/* ===== Quote Results Section ===== */}
      {/* ============================= */}
      {/* Quote Results */}
      {(showQuoteResults || isLoading) && (
        <Card
          title={<span className="text-xl font-bold text-blue-800">Your Insurance Quote</span>}
          subtitle={<span className="text-base text-gray-600">Quote #{state.quoteNumber}</span>}
          //
          className="mb-8 border-0 bg-white shadow-lg"
          footer={
            <div className="flex justify-end">
              <Button
                variant="primary"
                size="lg"
                onClick={handleContinue}
                className="transition-transform duration-150 hover:scale-105"
              >
                <DollarSign size={24} className="text-blue-600" />
                Continue to Event Details
              </Button>
            </div>
          }
        >
          <div className="space-y-6">
            {/* ============================= */}
            {/* ===== Total Premium Display ===== */}
            {/* ============================= */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="text-center">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1">
                  Total Premium
                </h3>
                {isLoading ? (
                  <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mx-auto"></div>
                ) : (
                  <p className="text-2xl sm:text-3xl font-bold text-blue-700">
                    {formatCurrency(state.totalPremium)}
                  </p>
                )}
              </div>
              {/* ============================= */}
              {/* ===== Premium Breakdown ===== */}
              {/* ============================= */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Premium Breakdown:</h4>
                <div className="space-y-1 text-gray-700">
                  {isLoading ? (
                    <>
                      {/* Skeleton for Premium Breakdown */}
                      <div className="flex justify-between text-sm py-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                      </div>
                      <div className="flex justify-between text-sm py-1">
                        <div className="h-4 bg-gray-200 rounded w-2/5 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/5 animate-pulse"></div>
                      </div>
                      <div className="flex justify-between text-sm py-1">
                        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/6 animate-pulse"></div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>Core Coverage:</span>
                        <span className="font-medium">{formatCurrency(state.basePremium)}</span>
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
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ============================= */}
            {/* ===== Coverage Summary ===== */}
            {/* ============================= */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Coverage Summary</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {isLoading ? (
                  <>
                    {/* Skeleton for Coverage Summary */}
                    {[...Array(5)].map((_, i) => (
                      <li key={i} className="flex justify-between py-1">
                        <div
                          className={`h-4 bg-gray-200 rounded animate-pulse ${
                            i % 2 === 0 ? 'w-1/3' : 'w-2/5'
                          }`}
                        ></div>
                        <div
                          className={`h-4 bg-gray-200 rounded animate-pulse ${
                            i % 2 === 0 ? 'w-1/4' : 'w-1/5'
                          }`}
                        ></div>
                      </li>
                    ))}
                    <li className="flex justify-between py-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex justify-between">
                      <span>Event Type:</span>
                      <span className="font-medium">
                        {EVENT_TYPES.find((t) => t.value === state.eventType)?.label}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span>Event Date:</span>
                      <span className="font-medium">
                        {state.eventDate ? new Date(state.eventDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span>Core Coverage:</span>
                      <span className="font-medium">
                        {
                          COVERAGE_LEVELS.find((l) => l.value === state.coverageLevel?.toString())
                            ?.label
                        }
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span>Liability Coverage:</span>
                      <span className="font-medium">
                        {LIABILITY_OPTIONS.find((o) => o.value === state.liabilityCoverage)?.label}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span>Host Liquor Liability:</span>
                      <span className="font-medium">
                        {state.liquorLiability ? 'Included' : 'Not Included'}
                      </span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* ============================= */}
            {/* ===== Quote Validity Information ===== */}
            {/* ============================= */}
            <div className="flex items-center text-sm bg-gray-100 text-gray-700 p-4 rounded-lg">
              <AlertCircle size={16} className="flex-shrink-0 mr-2" />
              <p>
                This quote is valid for 30 days. Continue to provide event details and complete your
                purchase.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* ============================= */}
      {/* ===== Special Activities Modal ===== */}
      {/* ============================= */}
      {/* Special Activities Modal */}
      {showSpecialActivitiesModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 py-6 sm:px-6">
          <div className="bg-white rounded-2xl shadow-xl w-full min-w-[300px] sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl max-h-[90vh] overflow-y-auto transition-transform duration-300 ease-out animate-fade-in">
            <div className="p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-semibold text-red-600 mb-4">
                Special Activities Warning
              </h3>
              <p className="text-gray-700 mb-5 text-sm sm:text-base leading-relaxed">
                The following activities are typically excluded from coverage. If your event
                includes any of these, please contact our support team for special underwriting.
              </p>
              <ul className="list-disc pl-5 mb-6 space-y-1 text-sm text-gray-800">
                {PROHIBITED_ACTIVITIES.map((activity, index) => (
                  <li key={index}>{activity}</li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    handleInputChange('specialActivities', false);
                    setShowSpecialActivitiesModal(false);
                  }}
                >
                  My event doesn&apos;t include these
                </Button>
                <Button
                  variant="primary"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    // Retain existing logic for admin: just close modal, admin will contact separately if needed.
                    setShowSpecialActivitiesModal(false);
                    // Optionally, you could set specialActivities to true here if that's the desired admin flow.
                    // handleInputChange("specialActivities", true);
                  }}
                >
                  Contact me for special coverage
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
