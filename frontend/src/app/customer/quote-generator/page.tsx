'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ChevronDown, DollarSign } from 'lucide-react';
import { useQuote } from '@/context/QuoteContext';
import type { QuoteState } from '@/context/QuoteContext';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
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
  COVERAGE_DETAILS,
  LIQUOR_LIABILITY_PREMIUMS_NEW,
  CORE_COVERAGE_PREMIUMS,
  LIABILITY_COVERAGE_PREMIUMS,
} from '@/utils/constants';
import {
  isDateInFuture,
  isDateAtLeast48HoursAhead,
  isDateWithinTwoYears,
  formatCurrency,
} from '@/utils/validators';
import { toast } from '@/hooks/use-toast';

// Add type definitions
type GuestRange = (typeof GUEST_RANGES)[number]['value'];
type CoverageLevel = number;
type LiabilityOption = string;

// Add premium calculation functions
const calculateBasePremium = (level: CoverageLevel | null): number => {
  if (!level) return 0;
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

export default function QuoteGenerator() {
  const router = useRouter();
  const { state, dispatch } = useQuote();

  // Form state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showQuoteResults, setShowQuoteResults] = useState(false);
  const [showSpecialActivitiesModal, setShowSpecialActivitiesModal] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Clear quoteNumber on mount to always start a new quote
  useEffect(() => {
    localStorage.removeItem('quoteNumber');
    // Set pageLoading to false after initial setup like clearing localStorage
    setPageLoading(false);
  }, []);

  // Handle form field changes
  const handleInputChange = useCallback(
    (field: keyof QuoteState, value: QuoteState[keyof QuoteState]) => {
      dispatch({ type: 'UPDATE_FIELD', field, value });

      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }

      if (['coverageLevel', 'liabilityCoverage', 'liquorLiability', 'maxGuests'].includes(field)) {
        setShowQuoteResults(false);
      }
    },
    [dispatch, errors],
  );

  const parseDateStringLocal = (dateString: string | null): Date | null => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const formatDateStringLocal = (date: Date | null): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const selectedDate = parseDateStringLocal(state.eventDate);

  // const handleDateChange = (date: Date | null) => {
  //   if (date) {
  //     handleInputChange('eventDate', date.toISOString().split('T')[0]);
  //   } else {
  //     handleInputChange('eventDate', '');
  //   }
  // };

  const minDate = new Date();
  minDate.setHours(minDate.getHours() + 48);

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 2);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!state.residentState) newErrors.residentState = 'Please select your state of residence';
    if (!state.eventType) newErrors.eventType = 'Please select an event type';
    if (!state.maxGuests) newErrors.maxGuests = 'Please select the maximum number of guests';
    if (!state.eventDate) {
      newErrors.eventDate = 'Please select the event date';
    } else {
      const eventDate = new Date(state.eventDate);
      if (!isDateInFuture(eventDate)) newErrors.eventDate = 'Event date must be in the future';
      else if (!isDateAtLeast48HoursAhead(eventDate))
        newErrors.eventDate = 'Event date must be at least 48 hours in the future';
      else if (!isDateWithinTwoYears(eventDate))
        newErrors.eventDate = 'Event date must be within the next 2 years';
    }
    if (!state.email) newErrors.email = 'Please enter your email address';
    if (state.coverageLevel === null) newErrors.coverageLevel = 'Please select a coverage level';
    if (!state.covidDisclosure)
      newErrors.covidDisclosure = 'You must acknowledge the COVID-19 exclusion';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDateChangeCorrected = (date: Date | null) => {
    if (date) {
      handleInputChange('eventDate', formatDateStringLocal(date));
    } else {
      handleInputChange('eventDate', '');
    }
  };

  // ==================================================================
  // ===== THE ONLY CHANGES ARE IN THIS FUNCTION ======================
  // ==================================================================
  const handleCalculateQuote = async () => {
    if (validateForm()) {
      // Calculate premiums first
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

      try {
        // 1. Call the new backend to create the quote
        const res = await fetch(`${apiUrl}/quotes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            residentState: state.residentState,
            eventType: state.eventType,
            maxGuests: state.maxGuests,
            eventDate: state.eventDate,
            coverageLevel: state.coverageLevel,
            liabilityCoverage: state.liabilityCoverage,
            liquorLiability: state.liquorLiability,
            covidDisclosure: state.covidDisclosure,
            specialActivities: state.specialActivities,
            email: state.email,
            totalPremium: totalPremium, // Use the calculated value directly
            basePremium: basePremium,
            liabilityPremium: liabilityPremium,
            liquorLiabilityPremium: liquorLiabilityPremium,
            source: 'CUSTOMER',
          }),
        });
        const data = await res.json();

        // The backend now returns the full quote object in a 'quote' property
        const newQuote = data.quote;

        if (res.ok && newQuote && newQuote.quoteNumber) {
          localStorage.setItem('quoteNumber', newQuote.quoteNumber);
          dispatch({
            type: 'UPDATE_FIELD',
            field: 'quoteNumber',
            value: newQuote.quoteNumber,
          });
          setShowQuoteResults(true);

          // 2. Call the new backend to send the email
          try {
            const emailRes = await fetch(`${apiUrl}/email/send`, {
              // UPDATED PATH
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: state.email,
                type: 'quote',
                // The backend email service now takes the full quote object
                data: newQuote,
              }),
            });

            if (emailRes.ok) {
              toast.success('Quotation email sent!');
            } else {
              const emailData = await emailRes.json();
              toast.error(`Failed to send email: ${emailData.error || 'Unknown error'}`);
            }
          } catch { // removed (err)
            toast.error('Failed to send email.');
          }
        } else {
          toast.error(`Failed to create quote: ${data.error || 'Unknown error'}`);
        }
      } catch {
        // removed (err)
        toast.error('Failed to create quote.');
      }
    } else {
      Object.entries(errors).forEach(([, msg]) => toast.error(msg));
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  };

  const handleContinue = async () => {
    if (validateForm()) {
      if (!showQuoteResults) {
        handleCalculateQuote();
        return;
      }
      dispatch({ type: 'COMPLETE_STEP', step: 1 });
      router.push('/customer/event-information');
    } else {
      Object.entries(errors).forEach(([, msg]) => toast.error(msg));
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  };

  const isLiquorLiabilityDisabled = state.liabilityCoverage === 'none';

  useEffect(() => {
    if (isLiquorLiabilityDisabled && state.liquorLiability) {
      handleInputChange('liquorLiability', false);
    }
  }, [
    isLiquorLiabilityDisabled,
    state.liquorLiability,
    state.liabilityCoverage,
    handleInputChange,
  ]);

  const handleSpecialActivitiesChange = (checked: boolean) => {
    if (checked) {
      setShowSpecialActivitiesModal(true);
    } else {
      handleInputChange('specialActivities', false);
    }
  };

  const QuoteGeneratorSkeleton = () => (
    <div className="animate-pulse">
      <div className="w-full mx-auto mb-10 text-center shadow-2xl bg-gray-100/90 rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10">
        <div className="mb-6 sm:mb-8">
          <div className="h-8 sm:h-10 bg-gray-300 rounded w-3/4 mx-auto mb-2 sm:mb-3"></div>
          <div className="h-5 sm:h-6 bg-gray-300 rounded w-1/2 mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="mb-4 sm:mb-6 flex flex-col items-center">
              <div className="h-4 sm:h-5 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-8 sm:h-10 bg-gray-200 rounded w-full sm:w-[325px]"></div>
            </div>
          ))}
        </div>
        <div className="w-full bg-yellow-100 border-l-4 border-yellow-300 rounded-lg p-3 sm:p-4 mt-6 sm:mt-8 flex items-start gap-2 sm:gap-3">
          <div className="h-5 sm:h-6 w-5 sm:w-6 bg-yellow-200 rounded-full mt-1"></div>
          <div>
            <div className="h-4 sm:h-5 bg-yellow-200 rounded w-1/3 mb-2"></div>
            <div className="h-8 sm:h-10 bg-yellow-200 rounded w-full"></div>
          </div>
        </div>
        <div className="flex justify-center mt-6 sm:mt-8">
          <div className="h-10 sm:h-12 bg-blue-300 rounded-md w-full sm:w-48"></div>
        </div>
      </div>
      <div className="mb-6 sm:mb-8 border-0 bg-gray-100 shadow-lg rounded-lg p-4 sm:p-6">
        <div className="h-6 sm:h-7 bg-gray-300 rounded w-1/2 mb-2"></div>
        <div className="h-4 sm:h-5 bg-gray-300 rounded w-1/3 mb-4 sm:mb-6"></div>
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gray-200 rounded-xl p-4 sm:p-6">
            <div className="h-5 sm:h-6 bg-gray-300 rounded w-1/3 mx-auto mb-2"></div>
            <div className="h-8 sm:h-10 bg-gray-300 rounded w-1/2 mx-auto mb-3 sm:mb-4"></div>
            <div className="h-3 sm:h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
            <div className="h-3 sm:h-4 bg-gray-300 rounded w-2/5 mb-1"></div>
            <div className="h-3 sm:h-4 bg-gray-300 rounded w-2/5"></div>
          </div>
        </div>
        <div className="flex justify-end mt-4 sm:mt-6">
          <div className="h-10 sm:h-12 bg-blue-300 rounded-md w-full sm:w-48"></div>
        </div>
      </div>
    </div>
  );

  if (pageLoading) {
    return <QuoteGeneratorSkeleton />;
  }

  return (
    <>
      <div className="w-full mx-auto mb-6 sm:mb-10 text-center text-black shadow-2xl border-0 bg-white/90 rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10">
        <div className="mb-6 sm:mb-8">
          <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-900 drop-shadow text-center">
            Get Your Wedding Insurance Quote
          </p>
          <p className="text-base sm:text-lg md:text-xl text-blue-700 font-medium text-center mt-2">
            Tell us about your event to receive an instant quote
          </p>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Policy Holder's Resident State */}
          <div className="flex flex-col">
            <label htmlFor="residentState" className="font-semibold text-gray-800 text-left mb-1">
              Policy Holder&apos;s Resident State
            </label>
            <div className="relative w-full">
              <select
                id="residentState"
                value={state.residentState}
                onChange={(e) => handleInputChange('residentState', e.target.value)}
                className={`w-full p-2 pr-8 border rounded-xl text-left appearance-none ${
                  errors.residentState ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select your state</option>
                {US_STATES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                size={16}
              />
            </div>
            {errors.residentState && (
              <p className="mt-1 text-xs text-red-500 text-left">{errors.residentState}</p>
            )}
          </div>

          {/* Event Type */}
          <div className="flex flex-col">
            <label htmlFor="eventType" className="font-semibold text-gray-800 text-left mb-1">
              Event Type
            </label>
            <div className="relative w-full">
              <select
                id="eventType"
                value={state.eventType}
                onChange={(e) => handleInputChange('eventType', e.target.value)}
                className={`w-full p-2 pr-8 border rounded-xl text-left appearance-none ${
                  errors.eventType ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select event type</option>
                {EVENT_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                size={16}
              />
            </div>
            {errors.eventType && (
              <p className="mt-1 text-xs text-red-500 text-left">{errors.eventType}</p>
            )}
          </div>

          {/* Maximum Number of Guests */}
          <div className="flex flex-col">
            <label htmlFor="maxGuests" className="font-semibold text-gray-800 text-left mb-1">
              Maximum Number of Guests
            </label>
            <div className="relative w-full">
              <select
                id="maxGuests"
                value={state.maxGuests}
                onChange={(e) => handleInputChange('maxGuests', e.target.value)}
                className={`w-full p-2 pr-8 border rounded-xl text-left appearance-none ${
                  errors.maxGuests ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select guest count range</option>
                {GUEST_RANGES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                size={16}
              />
            </div>
            {errors.maxGuests && (
              <p className="mt-1 text-xs text-red-500 text-left">{errors.maxGuests}</p>
            )}
          </div>

          {/* Event Date */}
          <div className="flex flex-col">
            <label htmlFor="eventDate" className="font-semibold text-gray-800 text-left mb-1">
              Event Date
            </label>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChangeCorrected}
              minDate={minDate}
              maxDate={maxDate}
              placeholderText="Select event date"
              error={!!errors.eventDate}
              className="w-full text-left block"
            />
            {errors.eventDate && (
              <p className="mt-1 text-xs text-red-500 text-left">{errors.eventDate}</p>
            )}
          </div>

          {/* Email Address */}
          <div className="flex flex-col col-span-1 sm:col-span-2 gap-4 sm:gap-6">
            <div className="flex flex-col">
              <label htmlFor="email" className="font-semibold text-gray-800 text-left mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={state.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                className={`w-full text-left p-2 border rounded-xl ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500 text-left">{errors.email}</p>
              )}
            </div>
            <div className="flex flex-col">
              <label htmlFor="coverageLevel" className="font-semibold text-gray-800 text-left mb-1">
                Core Coverage Level
              </label>
              <div className="relative w-full">
                <select
                  id="coverageLevel"
                  value={state.coverageLevel?.toString() || ''}
                  onChange={(e) => handleInputChange('coverageLevel', parseInt(e.target.value))}
                  className={`w-full p-2 pr-8 border rounded-xl text-left appearance-none ${
                    errors.coverageLevel ? 'border-red-500' : 'border-gray-300'
                  }`}
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
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  size={16}
                />
              </div>
              {errors.coverageLevel && (
                <p className="mt-1 text-xs text-red-500 text-left">{errors.coverageLevel}</p>
              )}
              {state.coverageLevel && COVERAGE_DETAILS[state.coverageLevel.toString()] && (
                <div className="mt-4 w-full bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <h4 className="text-base sm:text-lg font-bold text-left text-blue-600 mb-2">
                    Coverage Details:
                  </h4>
                  <div className="space-y-2">
                    {COVERAGE_DETAILS[state.coverageLevel.toString()].map((detail, index) => (
                      <div key={index} className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-700">{detail.name}:</span>
                        <span className="font-medium text-blue-700">{detail.limit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Liability Coverage */}
          <div className="flex flex-col">
            <label
              htmlFor="liabilityCoverage"
              className="font-semibold text-gray-800 text-left mb-1"
            >
              Liability Coverage
            </label>
            <div className="relative w-full">
              <select
                id="liabilityCoverage"
                value={state.liabilityCoverage}
                onChange={(e) => handleInputChange('liabilityCoverage', e.target.value)}
                className={`w-full p-2 pr-8 border rounded-xl text-left appearance-none ${
                  errors.liabilityCoverage ? 'border-red-500' : 'border-gray-300'
                }`}
              >
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
                      className={option.isNew ? 'text-red-400' : 'border-gray-300'}
                    >
                      {option.label}
                      {premiumText}
                    </option>
                  );
                })}
              </select>
              <ChevronDown
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                size={16}
              />
            </div>
          </div>

          {/* Host Liquor Liability */}
          <div className="flex flex-col items-start">
            <label htmlFor="liquorLiability" className="font-semibold text-gray-800 text-left mb-1">
              Host Liquor Liability
            </label>
            <Checkbox
              id="liquorLiability"
              label={
                <span className="font-medium text-left text-sm sm:text-base">
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
                <span className="break-words whitespace-normal text-left text-xs sm:text-sm">
                  {isLiquorLiabilityDisabled
                    ? 'You must select Liability Coverage to add Host Liquor Liability'
                    : 'Provides coverage for alcohol-related incidents if alcohol is served at your event'}
                </span>
              }
            />
          </div>

          {/* Special Activities */}
          <div className="flex flex-col items-start">
            <label
              htmlFor="specialActivities"
              className="font-semibold text-gray-800 text-left mb-1"
            >
              Special Activities
            </label>
            <Checkbox
              id="specialActivities"
              label={
                <span className="font-medium text-sm sm:text-base">
                  My event will include special activities or features
                </span>
              }
              checked={state.specialActivities}
              onChange={handleSpecialActivitiesChange}
              description="Examples: fireworks, bounce houses, live animals, etc."
            />
          </div>
        </div>

        {/* Important Disclosures */}
        <div className="w-full bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-3 sm:p-4 mt-6 sm:mt-8 flex items-start gap-2 sm:gap-3">
          <AlertCircle size={20} className="text-yellow-500 mt-1" />
          <div>
            <h3 className="font-semibold text-yellow-800 mb-1 text-sm sm:text-base">
              Important Disclosures
            </h3>
            <FormField
              label={
                <span className="font-medium text-gray-800 text-sm sm:text-base">
                  COVID-19 Exclusion Acknowledgment
                </span>
              }
              htmlFor="covidDisclosure"
              error={errors.covidDisclosure}
              className="mt-2 sm:mt-3"
            >
              <Checkbox
                id="covidDisclosure"
                label={
                  <span className="font-medium text-xs sm:text-sm">
                    I understand that cancellations or impacts due to COVID-19, pandemics, or
                    communicable diseases are not covered by this policy
                  </span>
                }
                checked={state.covidDisclosure}
                onChange={(checked) => handleInputChange('covidDisclosure', checked)}
                error={!!errors.covidDisclosure}
              />
            </FormField>
          </div>
        </div>

        {/* Calculate Quote Button */}
        <div className="flex justify-center mt-6 sm:mt-8">
          <Button
            variant="primary"
            size="lg"
            onClick={handleCalculateQuote}
            className="w-full sm:w-auto transition-transform cursor-pointer duration-150 hover:scale-105"
          >
            <DollarSign size={18} />
            Calculate Quote
          </Button>
        </div>
      </div>

      {/* Quote Results */}
      {showQuoteResults && (
        <Card
          title={
            <span className="text-lg sm:text-xl font-bold text-blue-800">Your Insurance Quote</span>
          }
          subtitle={
            <span className="text-sm sm:text-base text-gray-600">
              Quote #{state.quoteNumber || 'PENDING'}
            </span>
          }
          icon={<DollarSign size={24} className="text-blue-600" />}
          className="mb-6 sm:mb-8 border-0 bg-white shadow-lg scroll-mt-24"
          footer={
            <div className="flex justify-end">
              <Button
                variant="primary"
                size="lg"
                onClick={handleContinue}
                className="transition-transform duration-150 hover:scale-105"
              >
                Continue to Event Details
              </Button>
            </div>
          }
        >
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-1">Total Premium</h3>
                <p className="text-3xl font-bold text-blue-700">
                  {formatCurrency(state.totalPremium)}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Premium Breakdown:</h4>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between text-sm">
                    <span>Core Coverage:</span>
                    <span className="font-medium">{formatCurrency(state.basePremium)}</span>
                  </div>
                  {state.liabilityCoverage !== 'none' && (
                    <div className="flex justify-between text-sm">
                      <span>Liability Coverage:</span>
                      <span className="font-medium">{formatCurrency(state.liabilityPremium)}</span>
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
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Coverage Summary</h3>
              <ul className="space-y-2 text-sm text-gray-700">
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
                {state.coverageLevel &&
                  COVERAGE_DETAILS[state.coverageLevel.toString()] &&
                  COVERAGE_DETAILS[state.coverageLevel.toString()].map((detail) => (
                    <li key={detail.name} className="flex justify-between">
                      <span>{detail.name}:</span>
                      <span className="font-medium">{detail.limit}</span>
                    </li>
                  ))}
              </ul>
            </div>
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
                    setShowSpecialActivitiesModal(false);
                    window.open('/contact', '_blank', 'noopener,noreferrer');
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
