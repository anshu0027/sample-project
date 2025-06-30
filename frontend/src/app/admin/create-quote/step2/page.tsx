'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, CalendarCheck, ChevronDown } from 'lucide-react'; // Added ChevronDown
import { useQuote } from '@/context/QuoteContext';
import type { QuoteState } from '@/context/QuoteContext';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Checkbox from '@/components/ui/Checkbox';
import {
  VENUE_TYPES,
  INDOOR_OUTDOOR_OPTIONS,
  COUNTRIES,
  STATES_BY_COUNTRY,
} from '@/utils/constants';
import { isEmpty, isValidZip, isValidName } from '@/utils/validators';
import { useAuth } from '@clerk/nextjs';
// import dynamic from 'next/dynamic';
import { toast } from '@/hooks/use-toast';

// =============================
// ===== Dynamic Import for QuotePreview =====
// =============================
// const QuotePreview = dynamic(() => import('@/components/ui/QuotePreview'), {
//   ssr: false,
//   loading: () => (
//     <div className="w-full h-96 flex items-center justify-center bg-gray-100 rounded-lg shadow">
//       <p className="text-gray-500">Loading Preview...</p>
//     </div>
//   ),
// });

// =============================
// ===== Skeleton Component for Step 2 =====
// =============================
const EventInformationSkeleton = () => (
  <div className="w-full pb-12 animate-pulse">
    {/* Honoree Information Skeleton */}
    <div className="mb-10 shadow-2xl border-0 bg-gray-100 p-8 sm:p-10 md:p-12 rounded-2xl w-full">
      <div className="flex items-center justify-center text-center mb-6 gap-4">
        <div className="h-9 w-9 bg-gray-300 rounded-full"></div>
        <div>
          <div className="h-6 bg-gray-300 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-64"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="h-5 bg-gray-300 rounded w-1/3 mx-auto mb-3"></div> {/* Honoree Title */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-1/4 mx-auto"></div> {/* Label */}
              <div className="h-10 bg-gray-200 rounded w-72 mx-auto"></div> {/* Input */}
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-1/4 mx-auto"></div> {/* Label */}
              <div className="h-10 bg-gray-200 rounded w-72 mx-auto"></div> {/* Input */}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Venue Information Skeleton */}
    <div className="mb-8 shadow-lg border-0 bg-gray-100 p-8 sm:p-10 md:p-12 rounded-2xl w-full">
      <div className="flex items-center justify-center text-center mb-6 gap-4">
        <div className="h-9 w-9 bg-gray-300 rounded-full"></div>
        <div>
          <div className="h-6 bg-gray-300 rounded w-56 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-72"></div>
        </div>
      </div>
      <div className="space-y-8 w-full px-2 sm:px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-1/4 mx-auto"></div> {/* Label */}
              <div className="h-10 bg-gray-200 rounded w-72 mx-auto"></div> {/* Select */}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-1/4 mx-auto"></div> {/* Label */}
          <div className="h-10 bg-gray-200 rounded w-[92%] mx-auto"></div> {/* Input */}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {[...Array(4)].map(
            (
              _,
              i, // For Address, City, State, Zip pairs
            ) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-1/4 mx-auto"></div> {/* Label */}
                <div className="h-10 bg-gray-200 rounded w-72 mx-auto"></div> {/* Input/Select */}
              </div>
            ),
          )}
        </div>
        <div className="h-10 bg-gray-200 rounded w-3/4 mx-auto mt-4"></div> {/* Checkbox */}
      </div>
    </div>

    {/* Buttons Skeleton */}
    <div className="flex flex-col sm:flex-row justify-between items-center mt-10 gap-4 w-full">
      <div className="h-12 bg-gray-200 rounded w-full sm:w-40"></div>
      <div className="h-12 bg-gray-300 rounded w-full sm:w-48"></div>
    </div>
  </div>
);

// =============================
// ===== EventInformation Component =====
// =============================
export default function EventInformation() {
  const router = useRouter();
  const { state, dispatch } = useQuote();
  const { isSignedIn, isLoaded, getToken } = useAuth();
  // =============================
  // ===== Component State =====
  // =============================
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pageReady, setPageReady] = useState(false);
  // 1. Add new state for each checkbox at the top of the component
  const [receptionUseMainVenueAddress, setReceptionUseMainVenueAddress] = useState(false);
  const [brunchUseMainVenueAddress, setBrunchUseMainVenueAddress] = useState(false);
  const [rehearsalUseMainVenueAddress, setRehearsalUseMainVenueAddress] = useState(false);
  const [rehearsalDinnerUseMainVenueAddress, setRehearsalDinnerUseMainVenueAddress] =
    useState(false);

  // =============================
  // ===== Conditional Rendering Check for Cruise Ship Venue Type =====
  // =============================
  const isCruiseShip = state.ceremonyLocationType === 'cruise_ship';

  // =============================
  // ===== useEffect for Authentication and Step Completion Check =====
  // =============================
  useEffect(() => {
    // Simulate page readiness and perform checks
    const timer = setTimeout(() => {
      if (isLoaded && !isSignedIn) {
        router.replace('/admin/login');
        return; // Stop further execution if redirecting
      }
      if (!state.step1Complete) {
        router.replace('/admin/create-quote/step1');
        return; // Stop further execution if redirecting
      }
      setPageReady(true); // Page is ready to be displayed
    }, 300); // Short delay to make skeleton visible for demo purposes

    return () => clearTimeout(timer);
  }, [router, state.step1Complete, isLoaded, isSignedIn]); // state.step1Complete is a dependency

  // 2. Add useEffect for each to sync fields when checked
  useEffect(() => {
    if (receptionUseMainVenueAddress) {
      // Copy all relevant fields from main venue to reception
      dispatch({
        type: 'UPDATE_FIELD',
        field: 'receptionLocationType',
        value: state.ceremonyLocationType,
      });
      dispatch({
        type: 'UPDATE_FIELD',
        field: 'receptionIndoorOutdoor',
        value: state.indoorOutdoor,
      });
      dispatch({ type: 'UPDATE_FIELD', field: 'receptionVenueName', value: state.venueName });
      dispatch({
        type: 'UPDATE_FIELD',
        field: 'receptionVenueAddress1',
        value: state.venueAddress1,
      });
      dispatch({
        type: 'UPDATE_FIELD',
        field: 'receptionVenueAddress2',
        value: state.venueAddress2,
      });
      dispatch({ type: 'UPDATE_FIELD', field: 'receptionVenueCountry', value: state.venueCountry });
      dispatch({ type: 'UPDATE_FIELD', field: 'receptionVenueCity', value: state.venueCity });
      dispatch({ type: 'UPDATE_FIELD', field: 'receptionVenueState', value: state.venueState });
      dispatch({ type: 'UPDATE_FIELD', field: 'receptionVenueZip', value: state.venueZip });
      dispatch({
        type: 'UPDATE_FIELD',
        field: 'receptionVenueAsInsured',
        value: state.venueAsInsured,
      });
      // For cruise ship
      if (isCruiseShip) {
        dispatch({
          type: 'UPDATE_FIELD',
          field: 'receptionVenueAddress1',
          value: state.venueAddress1,
        });
        dispatch({ type: 'UPDATE_FIELD', field: 'receptionVenueCity', value: state.venueCity });
      }
    }
  }, [
    receptionUseMainVenueAddress,
    state.ceremonyLocationType,
    state.indoorOutdoor,
    state.venueName,
    state.venueAddress1,
    state.venueAddress2,
    state.venueCountry,
    state.venueCity,
    state.venueState,
    state.venueZip,
    state.venueAsInsured,
    isCruiseShip,
    dispatch,
  ]);
  // Repeat for brunch, rehearsal, rehearsal dinner
  useEffect(() => {
    if (brunchUseMainVenueAddress) {
      dispatch({
        type: 'UPDATE_FIELD',
        field: 'brunchLocationType',
        value: state.ceremonyLocationType,
      });
      dispatch({
        type: 'UPDATE_FIELD',
        field: 'brunchIndoorOutdoor',
        value: state.indoorOutdoor,
      });
      dispatch({ type: 'UPDATE_FIELD', field: 'brunchVenueName', value: state.venueName });
      dispatch({ type: 'UPDATE_FIELD', field: 'brunchVenueAddress1', value: state.venueAddress1 });
      dispatch({ type: 'UPDATE_FIELD', field: 'brunchVenueAddress2', value: state.venueAddress2 });
      dispatch({ type: 'UPDATE_FIELD', field: 'brunchVenueCountry', value: state.venueCountry });
      dispatch({ type: 'UPDATE_FIELD', field: 'brunchVenueCity', value: state.venueCity });
      dispatch({ type: 'UPDATE_FIELD', field: 'brunchVenueState', value: state.venueState });
      dispatch({ type: 'UPDATE_FIELD', field: 'brunchVenueZip', value: state.venueZip });
      dispatch({
        type: 'UPDATE_FIELD',
        field: 'brunchVenueAsInsured',
        value: state.venueAsInsured,
      });
      if (isCruiseShip) {
        dispatch({
          type: 'UPDATE_FIELD',
          field: 'brunchVenueAddress1',
          value: state.venueAddress1,
        });
        dispatch({ type: 'UPDATE_FIELD', field: 'brunchVenueCity', value: state.venueCity });
      }
    }
  }, [
    brunchUseMainVenueAddress,
    state.ceremonyLocationType,
    state.indoorOutdoor,
    state.venueName,
    state.venueAddress1,
    state.venueAddress2,
    state.venueCountry,
    state.venueCity,
    state.venueState,
    state.venueZip,
    state.venueAsInsured,
    isCruiseShip,
    dispatch,
  ]);
  useEffect(() => {
    if (rehearsalUseMainVenueAddress) {
      dispatch({
        type: 'UPDATE_FIELD',
        field: 'rehearsalLocationType',
        value: state.ceremonyLocationType,
      });
      dispatch({
        type: 'UPDATE_FIELD',
        field: 'rehearsalIndoorOutdoor',
        value: state.indoorOutdoor,
      });
      dispatch({ type: 'UPDATE_FIELD', field: 'rehearsalVenueName', value: state.venueName });
      dispatch({
        type: 'UPDATE_FIELD',
        field: 'rehearsalVenueAddress1',
        value: state.venueAddress1,
      });
      dispatch({
        type: 'UPDATE_FIELD',
        field: 'rehearsalVenueAddress2',
        value: state.venueAddress2,
      });
      dispatch({ type: 'UPDATE_FIELD', field: 'rehearsalVenueCountry', value: state.venueCountry });
      dispatch({ type: 'UPDATE_FIELD', field: 'rehearsalVenueCity', value: state.venueCity });
      dispatch({ type: 'UPDATE_FIELD', field: 'rehearsalVenueState', value: state.venueState });
      dispatch({ type: 'UPDATE_FIELD', field: 'rehearsalVenueZip', value: state.venueZip });
      dispatch({
        type: 'UPDATE_FIELD',
        field: 'rehearsalVenueAsInsured',
        value: state.venueAsInsured,
      });
      if (isCruiseShip) {
        dispatch({
          type: 'UPDATE_FIELD',
          field: 'rehearsalVenueAddress1',
          value: state.venueAddress1,
        });
        dispatch({ type: 'UPDATE_FIELD', field: 'rehearsalVenueCity', value: state.venueCity });
      }
    }
  }, [
    rehearsalUseMainVenueAddress,
    state.ceremonyLocationType,
    state.indoorOutdoor,
    state.venueName,
    state.venueAddress1,
    state.venueAddress2,
    state.venueCountry,
    state.venueCity,
    state.venueState,
    state.venueZip,
    state.venueAsInsured,
    isCruiseShip,
    dispatch,
  ]);
  useEffect(() => {
    if (rehearsalDinnerUseMainVenueAddress) {
      dispatch({
        type: 'UPDATE_FIELD',
        field: 'rehearsalDinnerLocationType',
        value: state.ceremonyLocationType,
      });
      dispatch({
        type: 'UPDATE_FIELD',
        field: 'rehearsalDinnerIndoorOutdoor',
        value: state.indoorOutdoor,
      });
      dispatch({ type: 'UPDATE_FIELD', field: 'rehearsalDinnerVenueName', value: state.venueName });
      dispatch({
        type: 'UPDATE_FIELD',
        field: 'rehearsalDinnerVenueAddress1',
        value: state.venueAddress1,
      });
      dispatch({
        type: 'UPDATE_FIELD',
        field: 'rehearsalDinnerVenueAddress2',
        value: state.venueAddress2,
      });
      dispatch({
        type: 'UPDATE_FIELD',
        field: 'rehearsalDinnerVenueCountry',
        value: state.venueCountry,
      });
      dispatch({ type: 'UPDATE_FIELD', field: 'rehearsalDinnerVenueCity', value: state.venueCity });
      dispatch({
        type: 'UPDATE_FIELD',
        field: 'rehearsalDinnerVenueState',
        value: state.venueState,
      });
      dispatch({ type: 'UPDATE_FIELD', field: 'rehearsalDinnerVenueZip', value: state.venueZip });
      dispatch({
        type: 'UPDATE_FIELD',
        field: 'rehearsalDinnerVenueAsInsured',
        value: state.venueAsInsured,
      });
      if (isCruiseShip) {
        dispatch({
          type: 'UPDATE_FIELD',
          field: 'rehearsalDinnerVenueAddress1',
          value: state.venueAddress1,
        });
        dispatch({
          type: 'UPDATE_FIELD',
          field: 'rehearsalDinnerVenueCity',
          value: state.venueCity,
        });
      }
    }
  }, [
    rehearsalDinnerUseMainVenueAddress,
    state.ceremonyLocationType,
    state.indoorOutdoor,
    state.venueName,
    state.venueAddress1,
    state.venueAddress2,
    state.venueCountry,
    state.venueCity,
    state.venueState,
    state.venueZip,
    state.venueAsInsured,
    isCruiseShip,
    dispatch,
  ]);

  // =============================
  // ===== Input Change Handler =====
  // =============================
  const handleInputChange = (field: keyof QuoteState, value: string | boolean) => {
    // Ensure pageReady is true before allowing input changes if needed,
    // though typically inputs would be disabled or not present if !pageReady
    // For this setup, direct interaction implies pageReady is true.
    dispatch({ type: 'UPDATE_FIELD', field, value });
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Reset state if country is changed
    if (field.endsWith('Country')) {
      const prefix = field.replace('Country', '');
      const stateField = `${prefix}State` as keyof QuoteState;
      dispatch({ type: 'UPDATE_FIELD', field: stateField, value: '' });
    }
  };

  // =============================
  // ===== Form Validation Logic =====
  // =============================
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (isEmpty(state.honoree1FirstName))
      newErrors.honoree1FirstName = 'Please enter the first name';
    else if (!isValidName(state.honoree1FirstName))
      newErrors.honoree1FirstName = 'First name must contain only letters and spaces';
    if (isEmpty(state.honoree1LastName)) newErrors.honoree1LastName = 'Please enter the last name';
    else if (!isValidName(state.honoree1LastName))
      newErrors.honoree1LastName = 'Last name must contain only letters and spaces';

    if (!isValidName(state.honoree2FirstName))
      newErrors.honoree2FirstName = 'First name contains invalid characters';
    if (!isValidName(state.honoree2LastName))
      newErrors.honoree2LastName = 'Last name contains invalid characters';

    if (isEmpty(state.ceremonyLocationType))
      newErrors.ceremonyLocationType = 'Please select a venue type';
    if (isEmpty(state.indoorOutdoor))
      newErrors.indoorOutdoor = 'Please select indoor/outdoor option';
    if (isEmpty(state.venueName)) newErrors.venueName = 'Please enter the venue name';
    if (isEmpty(state.venueAddress1)) newErrors.venueAddress1 = 'Please enter the venue address';
    if (isEmpty(state.venueCity)) newErrors.venueCity = 'Please enter the city';

    // Only validate state and zip for ceremony venue if it's not a cruise ship
    if (!isCruiseShip) {
      if (isEmpty(state.venueState)) newErrors.venueState = 'Please select a state';
      if (isEmpty(state.venueZip)) newErrors.venueZip = 'Please enter the ZIP code';
      else if (!isValidZip(state.venueZip)) newErrors.venueZip = 'Please enter a valid ZIP code';
    }

    // Helper function to validate venue fields based on venue type
    const validateVenueFields = (prefix: string) => {
      const isCruiseShipVenue =
        state[`${prefix}LocationType` as keyof QuoteState] === 'cruise_ship';

      if (isEmpty(state[`${prefix}VenueName` as keyof QuoteState] as string))
        newErrors[`${prefix}VenueName`] = 'Please enter the venue name';
      if (isEmpty(state[`${prefix}VenueAddress1` as keyof QuoteState] as string))
        newErrors[`${prefix}VenueAddress1`] = 'Please enter the venue address';
      if (isEmpty(state[`${prefix}VenueCity` as keyof QuoteState] as string))
        newErrors[`${prefix}VenueCity`] = 'Please enter the venue city';

      // Only validate country, state, zip if it's not a cruise ship
      if (!isCruiseShipVenue) {
        if (isEmpty(state[`${prefix}VenueCountry` as keyof QuoteState] as string))
          newErrors[`${prefix}VenueCountry`] = 'Please select the venue country';
        if (isEmpty(state[`${prefix}VenueState` as keyof QuoteState] as string))
          newErrors[`${prefix}VenueState`] = 'Please select the venue state';
        if (isEmpty(state[`${prefix}VenueZip` as keyof QuoteState] as string))
          newErrors[`${prefix}VenueZip`] = 'Please enter the venue ZIP code';
        else if (!isValidZip(state[`${prefix}VenueZip` as keyof QuoteState] as string))
          newErrors[`${prefix}VenueZip`] = 'Please enter a valid venue ZIP code';
      }
    };

    if (state.eventType === 'wedding') {
      // For weddings, all additional venue sections are required

      // Reception Venue - Required for weddings
      if (isEmpty(state.receptionLocationType))
        newErrors.receptionLocationType = 'Please select a venue type';
      if (isEmpty(state.receptionIndoorOutdoor))
        newErrors.receptionIndoorOutdoor = 'Please select indoor/outdoor option';
      validateVenueFields('reception');

      // Brunch Venue - Required for weddings
      if (isEmpty(state.brunchLocationType))
        newErrors.brunchLocationType = 'Please select a venue type';
      if (isEmpty(state.brunchIndoorOutdoor))
        newErrors.brunchIndoorOutdoor = 'Please select indoor/outdoor option';
      validateVenueFields('brunch');

      // Rehearsal Venue - Required for weddings
      if (isEmpty(state.rehearsalLocationType))
        newErrors.rehearsalLocationType = 'Please select a venue type';
      if (isEmpty(state.rehearsalIndoorOutdoor))
        newErrors.rehearsalIndoorOutdoor = 'Please select indoor/outdoor option';
      validateVenueFields('rehearsal');

      // Rehearsal Dinner Venue - Required for weddings
      if (isEmpty(state.rehearsalDinnerLocationType))
        newErrors.rehearsalDinnerLocationType = 'Please select a venue type';
      if (isEmpty(state.rehearsalDinnerIndoorOutdoor))
        newErrors.rehearsalDinnerIndoorOutdoor = 'Please select indoor/outdoor option';
      validateVenueFields('rehearsalDinner');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =============================
  // ===== Navigation: Back to Step 1 =====
  // =============================
  const handleBack = () => {
    router.push('/admin/create-quote/step1');
  };

  // =============================
  // ===== Continue to Next Step (Step 3) and API Call =====
  // =============================
  const handleContinue = async () => {
    if (validateForm()) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const quoteNumber = localStorage.getItem('quoteNumber');

      if (!quoteNumber) {
        toast.error('Quote number not found. Please start over.');
        router.push('/admin/create-quote/step1');
        return;
      }

      try {
        // Helper function to conditionally include venue fields based on venue type
        const getVenueFields = (prefix: string) => {
          const isCruiseShipVenue =
            state[`${prefix}LocationType` as keyof QuoteState] === 'cruise_ship';

          const baseFields = {
            [`${prefix}LocationType`]: state[`${prefix}LocationType` as keyof QuoteState],
            [`${prefix}IndoorOutdoor`]: state[`${prefix}IndoorOutdoor` as keyof QuoteState],
            [`${prefix}VenueName`]: state[`${prefix}VenueName` as keyof QuoteState],
            [`${prefix}VenueAddress1`]: state[`${prefix}VenueAddress1` as keyof QuoteState],
            [`${prefix}VenueAddress2`]: state[`${prefix}VenueAddress2` as keyof QuoteState],
            [`${prefix}VenueAsInsured`]: state[`${prefix}VenueAsInsured` as keyof QuoteState],
            [`${prefix}VenueCity`]: state[`${prefix}VenueCity` as keyof QuoteState] || '',
          };

          if (!isCruiseShipVenue) {
            return {
              ...baseFields,
              [`${prefix}VenueCountry`]: state[`${prefix}VenueCountry` as keyof QuoteState] || '',
              [`${prefix}VenueState`]: state[`${prefix}VenueState` as keyof QuoteState] || '',
              [`${prefix}VenueZip`]: state[`${prefix}VenueZip` as keyof QuoteState] || '',
            };
          }

          return baseFields;
        };

        // Define payload type
        interface QuoteUpdatePayload {
          eventType: string;
          eventDate: string;
          maxGuests: string;
          honoree1FirstName: string;
          honoree1LastName: string;
          honoree2FirstName: string;
          honoree2LastName: string;
          venueName: string;
          venueAddress1: string;
          venueAddress2: string;
          venueCity: string;
          ceremonyLocationType: string;
          indoorOutdoor: string;
          venueAsInsured: boolean;
          venueCountry?: string;
          venueState?: string;
          venueZip?: string;
          status: string;
          [key: string]: string | boolean | undefined;
        }

        // Base payload with ceremony venue fields
        const payload: QuoteUpdatePayload = {
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
          status: 'STEP2',
        };

        // Only include country, state, zip for ceremony venue if it's not a cruise ship
        if (!isCruiseShip) {
          payload.venueCountry = state.venueCountry;
          payload.venueState = state.venueState;
          payload.venueZip = state.venueZip;
        }
        // For cruise ships, do not include these fields in the payload

        // Add additional venue fields for weddings
        if (state.eventType === 'wedding') {
          Object.assign(payload, getVenueFields('reception'));
          Object.assign(payload, getVenueFields('brunch'));
          Object.assign(payload, getVenueFields('rehearsal'));
          Object.assign(payload, getVenueFields('rehearsalDinner'));
        }

        // Update quote with event information
        const token = await getToken();
        const res = await fetch(`${apiUrl}/quotes/${quoteNumber}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to update quote');
        }

        dispatch({ type: 'COMPLETE_STEP', step: 2 });
        router.push('/admin/create-quote/step3');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        toast.error(message);
      }
    } else {
      Object.entries(errors).forEach(([, msg]) => toast.error(msg));
    }
  };

  // =============================
  // ===== Render Skeleton if Page is Not Ready =====
  // =============================
  if (!pageReady) {
    return <EventInformationSkeleton />;
  }

  // =============================
  // ===== Main Component Render =====
  // =============================
  return (
    <>
      {/* Outermost div simplified: max-width, margins, horizontal padding, and top margin are now handled by CreateQuoteLayout.tsx */}
      <div className="w-full pb-12">
        {' '}
        {/* Retain bottom padding, or manage spacing within sections */}
        {/* Honoree Information */}
        {/* ============================= */}
        {/* ===== Honoree Information Section ===== */}
        {/* ============================= */}
        <div className="mb-10 shadow-2xl border-0 bg-white/90 p-8 sm:p-10 md:p-12 rounded-2xl w-full">
          <div className="flex items-center justify-center text-center mb-4 gap-4">
            <div className="flex-shrink-0">
              <CalendarCheck size={36} className="text-indigo-600" />
            </div>
            <div>
              <div className="text-xl md:text-2xl font-extrabold leading-tight mb-1">
                Honoree Information
              </div>
              <div className="text-base text-gray-500 font-medium leading-tight">
                Tell us who is being celebrated
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div>
              <h3 className="font-bold text-gray-700 mb-4 text-left text-lg">Honoree #1</h3>
              {/* First Name Field Unit */}
              <div className="mb-4">
                <label
                  htmlFor="honoree1FirstName"
                  className="block mb-1 font-medium text-gray-800 text-left"
                >
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="w-full">
                  <Input
                    id="honoree1FirstName"
                    value={state.honoree1FirstName}
                    onChange={(e) => handleInputChange('honoree1FirstName', e.target.value)}
                    onKeyDown={handleNameKeyDown}
                    error={!!errors.honoree1FirstName}
                    placeholder="John"
                    className="text-left w-full"
                  />
                </div>
                {errors.honoree1FirstName && (
                  <p className="text-sm text-red-500 mt-1 text-left">{errors.honoree1FirstName}</p>
                )}
              </div>

              {/* Last Name Field Unit */}
              <div className="mb-4">
                <label
                  htmlFor="honoree1LastName"
                  className="block mb-1 font-medium text-gray-800 text-left"
                >
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="w-full">
                  <Input
                    id="honoree1LastName"
                    value={state.honoree1LastName}
                    onChange={(e) => handleInputChange('honoree1LastName', e.target.value)}
                    onKeyDown={handleNameKeyDown}
                    error={!!errors.honoree1LastName}
                    placeholder="Doe"
                    className="text-left w-full"
                  />
                </div>
                {errors.honoree1LastName && (
                  <p className="text-sm text-red-500 mt-1 text-left">{errors.honoree1LastName}</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-left text-gray-700 mb-4 text-lg">
                Honoree #2{' '}
                <span className="text-semibold text-sm text-gray-400">(if applicable)</span>
              </h3>
              {/* First Name Field Unit */}
              <div className="mb-4">
                <label
                  htmlFor="honoree2FirstName"
                  className="block mb-1 font-medium text-gray-800 text-left"
                >
                  First Name
                </label>
                <div className="w-full">
                  <Input
                    id="honoree2FirstName"
                    value={state.honoree2FirstName}
                    onChange={(e) => handleInputChange('honoree2FirstName', e.target.value)}
                    onKeyDown={handleNameKeyDown}
                    placeholder="John"
                    className="text-left w-full"
                  />
                </div>
                {/* Optional: Error display for Honoree 2 if validation is added */}
              </div>

              {/* Last Name Field Unit */}
              <div className="mb-4">
                <label
                  htmlFor="honoree2LastName"
                  className="block mb-1 font-medium text-gray-800 text-left"
                >
                  Last Name
                </label>
                <div className="w-full">
                  <Input
                    id="honoree2LastName"
                    value={state.honoree2LastName}
                    onChange={(e) => handleInputChange('honoree2LastName', e.target.value)}
                    onKeyDown={handleNameKeyDown}
                    placeholder="Doe"
                    className="text-left w-full"
                  />
                </div>
                {/* Optional: Error display for Honoree 2 if validation is added */}
              </div>
            </div>
          </div>
        </div>
        {/* Venue Information */}
        {/* ============================= */}
        {/* ===== Ceremony Venue Information Section ===== */}
        {/* ============================= */}
        <div className="mb-8 shadow-lg border-0 bg-white p-8 sm:p-10 md:p-12 rounded-2xl w-full">
          <div className="flex items-center justify-center text-left mb-4 gap-4">
            <div className="flex-shrink-0">
              <MapPin size={28} className="text-blue-600" />
            </div>
            <div>
              <div className="text-xl md:text-2xl font-extrabold leading-tight mb-1">
                Ceremony Venue Information
              </div>
              <div className="text-base text-gray-500 font-medium leading-tight">
                Details about where your event will be held
              </div>
            </div>
          </div>
          <div className="space-y-8 w-full px-2 sm:px-4 md:px-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {/* ============================= */}
              {/* ===== Venue Type Field ===== */}
              {/* ============================= */}
              {/* Venue Type */}
              <div className="mb-4 text-left">
                <label
                  htmlFor="ceremonyLocationType"
                  className="block mb-1 font-medium text-gray-800"
                >
                  Venue Type <span className="text-red-500">*</span>
                </label>
                <div className="relative w-full">
                  <select
                    id="ceremonyLocationType"
                    value={state.ceremonyLocationType}
                    onChange={(e) => handleInputChange('ceremonyLocationType', e.target.value)}
                    className={`block w-full rounded-md shadow-sm pl-3 pr-10 py-2 text-base border appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.ceremonyLocationType
                        ? 'border-red-500 text-red-900'
                        : 'border-gray-300 text-gray-900'
                    } text-left`}
                  >
                    <option value="">Select venue type</option>
                    {VENUE_TYPES.map((option) => (
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
                {errors.ceremonyLocationType && (
                  <p className="text-sm text-red-500 mt-1">{errors.ceremonyLocationType}</p>
                )}
              </div>

              {/* ============================= */}
              {/* ===== Indoor/Outdoor Field ===== */}
              {/* ============================= */}
              {/* Indoor/Outdoor */}
              <div className="mb-4 text-left">
                <label htmlFor="indoorOutdoor" className="block mb-1 font-medium text-gray-800">
                  Indoor/Outdoor <span className="text-red-500">*</span>
                </label>
                <div className="relative w-full">
                  <select
                    id="indoorOutdoor"
                    value={state.indoorOutdoor}
                    onChange={(e) => handleInputChange('indoorOutdoor', e.target.value)}
                    className={`block w-full rounded-md shadow-sm pl-3 pr-10 py-2 text-base border appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.indoorOutdoor
                        ? 'border-red-500 text-red-900'
                        : 'border-gray-300 text-gray-900'
                    } text-left`}
                  >
                    <option value="">Select option</option>
                    {INDOOR_OUTDOOR_OPTIONS.map((option) => (
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
                {errors.indoorOutdoor && (
                  <p className="text-sm text-red-500 mt-1">{errors.indoorOutdoor}</p>
                )}
              </div>
            </div>

            {/* ============================= */}
            {/* ===== Venue Name Field ===== */}
            {/* ============================= */}
            <div className="mb-4 text-left">
              <label htmlFor="venueName" className="block mb-1 font-medium text-gray-800">
                Venue Name <span className="text-red-500">*</span>
              </label>
              <div className="w-full">
                <Input
                  id="venueName"
                  value={state.venueName}
                  onChange={(e) => handleInputChange('venueName', e.target.value)}
                  error={!!errors.venueName}
                  placeholder={isCruiseShip ? 'Cruise Ship Name' : 'Venue Name'}
                  className="text-left w-full"
                />
              </div>
              {errors.venueName && <p className="text-sm text-red-500 mt-1">{errors.venueName}</p>}
            </div>

            {/* Cruise ship conditionals */}
            {/* ============================= */}
            {/* ===== Conditional Fields for Cruise Ship Venue ===== */}
            {/* ============================= */}
            {isCruiseShip ? (
              <>
                <div className="mb-4 text-left">
                  <label htmlFor="venueAddress1" className="block mb-1 font-medium text-gray-800">
                    Cruise Line <span className="text-red-500">*</span>
                  </label>
                  <div className="w-full">
                    <Input
                      id="venueAddress1"
                      value={state.venueAddress1}
                      onChange={(e) => handleInputChange('venueAddress1', e.target.value)}
                      error={!!errors.venueAddress1}
                      placeholder="e.g., Royal Caribbean"
                      className="text-left w-full"
                    />
                  </div>
                  {errors.venueAddress1 && (
                    <p className="text-sm text-red-500 mt-1">{errors.venueAddress1}</p>
                  )}
                </div>
                <div className="mb-4 text-left">
                  <label htmlFor="venueCity" className="block mb-1 font-medium text-gray-800">
                    Departure Port <span className="text-red-500">*</span>
                  </label>
                  <div className="w-full">
                    <Input
                      id="venueCity"
                      value={state.venueCity}
                      onChange={(e) => handleInputChange('venueCity', e.target.value)}
                      error={!!errors.venueCity}
                      placeholder="e.g., Miami, Florida"
                      className="text-left w-full"
                    />
                  </div>
                  {errors.venueCity && (
                    <p className="text-sm text-red-500 mt-1">{errors.venueCity}</p>
                  )}
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div className="mb-4 text-left">
                  {/* ============================= */}
                  {/* ===== Address Line 1 Field (Non-Cruise) ===== */}
                  {/* ============================= */}
                  <label htmlFor="venueAddress1" className="block mb-1 font-medium text-gray-800">
                    Address Line 1 <span className="text-red-500">*</span>
                  </label>
                  <div className="w-full">
                    <Input
                      id="venueAddress1"
                      value={state.venueAddress1}
                      onChange={(e) => handleInputChange('venueAddress1', e.target.value)}
                      error={!!errors.venueAddress1}
                      placeholder="Street Address"
                      className="text-left w-full"
                    />
                  </div>
                  {errors.venueAddress1 && (
                    <p className="text-sm text-red-500 mt-1">{errors.venueAddress1}</p>
                  )}
                </div>
                <div className="mb-4 text-left">
                  {/* ============================= */}
                  {/* ===== Address Line 2 Field (Non-Cruise) ===== */}
                  {/* ============================= */}
                  <label htmlFor="venueAddress2" className="block mb-1 font-medium text-gray-800">
                    Address Line 2
                  </label>
                  <div className="w-full">
                    <Input
                      id="venueAddress2"
                      value={state.venueAddress2}
                      onChange={(e) => handleInputChange('venueAddress2', e.target.value)}
                      placeholder="Apt, Suite, Building (optional)"
                      className="text-left w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Country, City, State are only relevant if not a cruise ship */}
            {/* ============================= */}
            {/* ===== Address Fields (Non-Cruise) ===== */}
            {/* ============================= */}
            {!isCruiseShip && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  {/* ============================= */}
                  {/* ===== Country Field ===== */}
                  {/* ============================= */}
                  {/* Country */}
                  <div className="mb-4 text-left">
                    <label htmlFor="venueCountry" className="block mb-1 font-medium text-gray-800">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <div className="relative w-full">
                      <select
                        id="venueCountry"
                        value={state.venueCountry}
                        onChange={(e) => handleInputChange('venueCountry', e.target.value)}
                        className={`block w-full rounded-md shadow-sm pl-3 pr-10 py-2 text-base border appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.venueCountry
                            ? 'border-red-500 text-red-900'
                            : 'border-gray-300 text-gray-900'
                        } text-left`}
                      >
                        <option value="">Select country</option>
                        {COUNTRIES.map((option) => (
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
                    {errors.venueCountry && (
                      <p className="text-sm text-red-500 mt-1">{errors.venueCountry}</p>
                    )}
                  </div>

                  {/* ============================= */}
                  {/* ===== City Field ===== */}
                  {/* ============================= */}
                  {/* City */}
                  <div className="mb-4 text-left">
                    <label htmlFor="venueCity" className="block mb-1 font-medium text-gray-800">
                      City <span className="text-red-500">*</span>
                    </label>
                    <div className="w-full">
                      <Input
                        id="venueCity"
                        value={state.venueCity}
                        onChange={(e) => handleInputChange('venueCity', e.target.value)}
                        error={!!errors.venueCity}
                        className="text-left w-full"
                      />
                    </div>
                    {errors.venueCity && (
                      <p className="text-sm text-red-500 mt-1">{errors.venueCity}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  {/* ============================= */}
                  {/* ===== State Field ===== */}
                  {/* ============================= */}
                  {/* State */}
                  <div className="mb-4 text-left">
                    <label htmlFor="venueState" className="block mb-1 font-medium text-gray-800">
                      State <span className="text-red-500">*</span>
                    </label>
                    <div className="relative w-full">
                      <select
                        id="venueState"
                        value={state.venueState}
                        onChange={(e) => handleInputChange('venueState', e.target.value)}
                        disabled={!state.venueCountry}
                        className={`block w-full rounded-md shadow-sm pl-3 pr-10 py-2 text-base border appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.venueState
                            ? 'border-red-500 text-red-900'
                            : 'border-gray-300 text-gray-900'
                        } text-left`}
                      >
                        <option value="">Select state</option>
                        {(STATES_BY_COUNTRY[state.venueCountry] || []).map((option) => (
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
                    {errors.venueState && (
                      <p className="text-sm text-red-500 mt-1">{errors.venueState}</p>
                    )}
                  </div>
                  {/* ============================= */}
                  {/* ===== ZIP Code Field ===== */}
                  {/* ============================= */}
                  {/* ZIP Code */}
                  <div className="mb-4 text-left">
                    <label htmlFor="venueZip" className="block mb-1 font-medium text-gray-800">
                      ZIP Code <span className="text-red-500">*</span>
                    </label>
                    <div className="w-full">
                      <Input
                        id="venueZip"
                        value={state.venueZip}
                        onChange={(e) => handleInputChange('venueZip', e.target.value)}
                        error={!!errors.venueZip}
                        className="text-left w-full"
                      />
                    </div>
                    {errors.venueZip && (
                      <p className="text-sm text-red-500 mt-1">{errors.venueZip}</p>
                    )}
                  </div>
                </div>
              </>
            )}
            {/* Checkbox for "Add venue as Additional Insured" */}
            {/* ============================= */}
            {/* ===== Venue as Additional Insured Checkbox ===== */}
            {/* ============================= */}
            <div className="mb-4 text-left">
              <div className="w-full flex justify-start">
                {' '}
                {/* Align checkbox to the left */}
                <Checkbox
                  id="venueAsInsured"
                  label={
                    <span className="font-medium text-left">
                      Add this venue as an Additional Insured on my policy
                    </span>
                  }
                  checked={state.venueAsInsured}
                  onChange={(checked) => handleInputChange('venueAsInsured', checked)}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Additional Venue Sections for Weddings */}
        {/* ============================= */}
        {/* ===== Conditional Rendering for Wedding Event Type (Additional Venues) ===== */}
        {/* ============================= */}
        {state.eventType === 'wedding' && (
          <>
            {/* Reception Venue */}
            {/* ============================= */}
            {/* ===== Reception Venue Section ===== */}
            {/* ============================= */}
            <div className="mb-8 shadow-lg border-0 bg-white p-8 sm:p-10 md:p-12 rounded-2xl w-full">
              <div className="flex items-center justify-center text-left mb-4 gap-4">
                <div className="flex-shrink-0">
                  <MapPin size={28} className="text-blue-600" />
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-extrabold leading-tight mb-1">
                    Reception Venue Information
                  </div>
                  <div className="text-base text-gray-500 font-medium leading-tight">
                    Details about where your reception will be held
                  </div>
                </div>
              </div>
              <div className="space-y-8 w-full px-2 sm:px-4 md:px-2">
                <div className="mb-4 text-left">
                  <label
                    htmlFor="receptionVenueName"
                    className="block mb-1 font-medium text-gray-800"
                  >
                    Venue Name
                  </label>
                  <div className="w-full">
                    <Input
                      id="receptionVenueName"
                      value={state.receptionVenueName}
                      onChange={(e) => handleInputChange('receptionVenueName', e.target.value)}
                      error={!!errors.receptionVenueName}
                      className="text-left w-full"
                    />
                  </div>
                  {errors.receptionVenueName && (
                    <p className="text-sm text-red-500 mt-1">{errors.receptionVenueName}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  {/* Venue Type */}
                  <div className="mb-4 text-left">
                    <label
                      htmlFor="receptionLocationType"
                      className="block mb-1 font-medium text-gray-800"
                    >
                      Venue Type
                    </label>
                    <div className="relative w-full">
                      <select
                        id="receptionLocationType"
                        value={state.receptionLocationType}
                        onChange={(e) => handleInputChange('receptionLocationType', e.target.value)}
                        className={`block w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.receptionLocationType ? 'border-red-500 text-red-900' : 'border-gray-300 text-gray-900'} text-left`}
                      >
                        <option value="">Select venue type</option>
                        {VENUE_TYPES.map((option) => (
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
                    {errors.receptionLocationType && (
                      <p className="text-sm text-red-500 mt-1">{errors.receptionLocationType}</p>
                    )}
                  </div>
                  {/* Indoor/Outdoor */}
                  <div className="mb-4 text-left">
                    <label
                      htmlFor="receptionIndoorOutdoor"
                      className="block mb-1 font-medium text-gray-800"
                    >
                      Indoor/Outdoor
                    </label>
                    <div className="relative w-full">
                      <select
                        id="receptionIndoorOutdoor"
                        value={state.receptionIndoorOutdoor}
                        onChange={(e) =>
                          handleInputChange('receptionIndoorOutdoor', e.target.value)
                        }
                        className={`block w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.receptionIndoorOutdoor ? 'border-red-500 text-red-900' : 'border-gray-300 text-gray-900'} text-left`}
                      >
                        <option value="">Select option</option>
                        {INDOOR_OUTDOOR_OPTIONS.map((option) => (
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
                    {errors.receptionIndoorOutdoor && (
                      <p className="text-sm text-red-500 mt-1">{errors.receptionIndoorOutdoor}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <div className="mb-4 text-left">
                    <label
                      htmlFor="receptionVenueAddress1"
                      className="block mb-1 font-medium text-gray-800"
                    >
                      Address Line 1
                    </label>
                    <div className="w-full">
                      <Input
                        id="receptionVenueAddress1"
                        value={state.receptionVenueAddress1}
                        onChange={(e) =>
                          handleInputChange('receptionVenueAddress1', e.target.value)
                        }
                        error={!!errors.receptionVenueAddress1}
                        className="text-left w-full"
                      />
                    </div>
                    {errors.receptionVenueAddress1 && (
                      <p className="text-sm text-red-500 mt-1">{errors.receptionVenueAddress1}</p>
                    )}
                  </div>
                  <div className="mb-4 text-left">
                    <label
                      htmlFor="receptionVenueAddress2"
                      className="block mb-1 font-medium text-gray-800"
                    >
                      Address Line 2
                    </label>
                    <div className="w-full">
                      <Input
                        id="receptionVenueAddress2"
                        value={state.receptionVenueAddress2}
                        onChange={(e) =>
                          handleInputChange('receptionVenueAddress2', e.target.value)
                        }
                        className="text-left w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <div className="mb-4 text-left">
                    <label
                      htmlFor="receptionVenueCountry"
                      className="block mb-1 font-medium text-gray-800"
                    >
                      Country
                    </label>
                    <div className="relative w-full">
                      <select
                        id="receptionVenueCountry"
                        value={state.receptionVenueCountry}
                        onChange={(e) => handleInputChange('receptionVenueCountry', e.target.value)}
                        className={`block w-full rounded-md shadow-sm pl-3 pr-10 py-2 text-base border appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.receptionVenueCountry
                            ? 'border-red-500 text-red-900'
                            : 'border-gray-300 text-gray-900'
                        } text-left`}
                      >
                        <option value="">Select country</option>
                        {COUNTRIES.map((option) => (
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
                    {errors.receptionVenueCountry && (
                      <p className="text-sm text-red-500 mt-1">{errors.receptionVenueCountry}</p>
                    )}
                  </div>
                  <div className="mb-4 text-left">
                    <label
                      htmlFor="receptionVenueCity"
                      className="block mb-1 font-medium text-gray-800"
                    >
                      City
                    </label>
                    <div className="w-full">
                      <Input
                        id="receptionVenueCity"
                        value={state.receptionVenueCity}
                        onChange={(e) => handleInputChange('receptionVenueCity', e.target.value)}
                        error={!!errors.receptionVenueCity}
                        className="text-left w-full"
                      />
                    </div>
                    {errors.receptionVenueCity && (
                      <p className="text-sm text-red-500 mt-1">{errors.receptionVenueCity}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <div className="mb-4 text-left">
                    <label
                      htmlFor="receptionVenueState"
                      className="block mb-1 font-medium text-gray-800"
                    >
                      State
                    </label>
                    <div className="relative w-full">
                      <select
                        id="receptionVenueState"
                        value={state.receptionVenueState}
                        onChange={(e) => handleInputChange('receptionVenueState', e.target.value)}
                        disabled={!state.receptionVenueCountry}
                        className={`block w-full rounded-md shadow-sm pl-3 pr-10 py-2 text-base border appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.receptionVenueState
                            ? 'border-red-500 text-red-900'
                            : 'border-gray-300 text-gray-900'
                        } text-left`}
                      >
                        <option value="">Select state</option>
                        {(STATES_BY_COUNTRY[state.receptionVenueCountry] || []).map((option) => (
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
                    {errors.receptionVenueState && (
                      <p className="text-sm text-red-500 mt-1">{errors.receptionVenueState}</p>
                    )}
                  </div>
                  <div className="mb-4 text-left">
                    <label
                      htmlFor="receptionVenueZip"
                      className="block mb-1 font-medium text-gray-800"
                    >
                      ZIP Code
                    </label>
                    <div className="w-full">
                      <Input
                        id="receptionVenueZip"
                        value={state.receptionVenueZip}
                        onChange={(e) => handleInputChange('receptionVenueZip', e.target.value)}
                        error={!!errors.receptionVenueZip}
                        className="text-left w-full"
                      />
                    </div>
                    {errors.receptionVenueZip && (
                      <p className="text-sm text-red-500 mt-1">{errors.receptionVenueZip}</p>
                    )}
                  </div>
                </div>

                <div className="mb-4 text-left">
                  <div className="w-full flex justify-start">
                    <Checkbox
                      id="receptionVenueAsInsured"
                      label={
                        <span className="font-medium text-left">
                          Add this venue as an Additional Insured on my policy
                        </span>
                      }
                      checked={state.receptionVenueAsInsured}
                      onChange={(checked) => handleInputChange('receptionVenueAsInsured', checked)}
                    />
                  </div>
                </div>

                {/* 3. In each additional venue section, add the checkbox and disable address fields if checked */}
                {/* (Reception example shown, repeat for others) */}
                <Checkbox
                  id="receptionUseMainVenueAddress"
                  label="Use main venue address for this venue"
                  checked={receptionUseMainVenueAddress}
                  onChange={setReceptionUseMainVenueAddress}
                  className="mb-4"
                />
                {/* Reception address fields: add disabled={receptionUseMainVenueAddress} to each */}
                {/* ...repeat for brunch, rehearsal, rehearsal dinner... */}
              </div>
            </div>

            {/* Brunch Venue */}
            {/* ============================= */}
            {/* ===== Brunch Venue Section ===== */}
            {/* ============================= */}
            <div className="mb-8 shadow-lg border-0 bg-white p-8 sm:p-10 md:p-12 rounded-2xl w-full">
              <div className="flex items-center justify-center text-left mb-4 gap-4">
                <div className="flex-shrink-0">
                  <MapPin size={28} className="text-blue-600" />
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-extrabold leading-tight mb-1">
                    Brunch Venue Information
                  </div>
                  <div className="text-base text-gray-500 font-medium leading-tight">
                    Details about where your brunch will be held
                  </div>
                </div>
              </div>
              <div className="space-y-8 w-full px-2 sm:px-4 md:px-2">
                <div className="mb-4 text-left">
                  <label htmlFor="brunchVenueName" className="block mb-1 font-medium text-gray-800">
                    Venue Name
                  </label>
                  <div className="w-full">
                    <Input
                      id="brunchVenueName"
                      value={state.brunchVenueName}
                      onChange={(e) => handleInputChange('brunchVenueName', e.target.value)}
                      error={!!errors.brunchVenueName}
                      className="text-left w-full"
                    />
                  </div>
                  {errors.brunchVenueName && (
                    <p className="text-sm text-red-500 mt-1">{errors.brunchVenueName}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  {/* Venue Type */}
                  <div className="mb-4 text-left">
                    <label
                      htmlFor="brunchLocationType"
                      className="block mb-1 font-medium text-gray-800"
                    >
                      Venue Type
                    </label>
                    <div className="relative w-full">
                      <select
                        id="brunchLocationType"
                        value={state.brunchLocationType}
                        onChange={(e) => handleInputChange('brunchLocationType', e.target.value)}
                        className={`block w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.brunchLocationType ? 'border-red-500 text-red-900' : 'border-gray-300 text-gray-900'} text-left`}
                      >
                        <option value="">Select venue type</option>
                        {VENUE_TYPES.map((option) => (
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
                    {errors.brunchLocationType && (
                      <p className="text-sm text-red-500 mt-1">{errors.brunchLocationType}</p>
                    )}
                  </div>
                  {/* Indoor/Outdoor */}
                  <div className="mb-4 text-left">
                    <label
                      htmlFor="brunchIndoorOutdoor"
                      className="block mb-1 font-medium text-gray-800"
                    >
                      Indoor/Outdoor
                    </label>
                    <div className="relative w-full">
                      <select
                        id="brunchIndoorOutdoor"
                        value={state.brunchIndoorOutdoor}
                        onChange={(e) => handleInputChange('brunchIndoorOutdoor', e.target.value)}
                        className={`block w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.brunchIndoorOutdoor ? 'border-red-500 text-red-900' : 'border-gray-300 text-gray-900'} text-left`}
                      >
                        <option value="">Select option</option>
                        {INDOOR_OUTDOOR_OPTIONS.map((option) => (
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
                    {errors.brunchIndoorOutdoor && (
                      <p className="text-sm text-red-500 mt-1">{errors.brunchIndoorOutdoor}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <div className="mb-4 text-left">
                    <label
                      htmlFor="brunchVenueAddress1"
                      className="block mb-1 font-medium text-gray-800"
                    >
                      Address Line 1
                    </label>
                    <div className="w-full">
                      <Input
                        id="brunchVenueAddress1"
                        value={state.brunchVenueAddress1}
                        onChange={(e) => handleInputChange('brunchVenueAddress1', e.target.value)}
                        error={!!errors.brunchVenueAddress1}
                        className="text-left w-full"
                      />
                    </div>
                    {errors.brunchVenueAddress1 && (
                      <p className="text-sm text-red-500 mt-1">{errors.brunchVenueAddress1}</p>
                    )}
                  </div>
                  <div className="mb-4 text-left">
                    <label
                      htmlFor="brunchVenueAddress2"
                      className="block mb-1 font-medium text-gray-800"
                    >
                      Address Line 2
                    </label>
                    <div className="w-full">
                      <Input
                        id="brunchVenueAddress2"
                        value={state.brunchVenueAddress2}
                        onChange={(e) => handleInputChange('brunchVenueAddress2', e.target.value)}
                        className="text-left w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <div className="mb-4 text-left">
                    <label
                      htmlFor="brunchVenueCountry"
                      className="block mb-1 font-medium text-gray-800"
                    >
                      Country
                    </label>
                    <div className="relative w-full">
                      <select
                        id="brunchVenueCountry"
                        value={state.brunchVenueCountry}
                        onChange={(e) => handleInputChange('brunchVenueCountry', e.target.value)}
                        className={`block w-full rounded-md shadow-sm pl-3 pr-10 py-2 text-base border appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.brunchVenueCountry
                            ? 'border-red-500 text-red-900'
                            : 'border-gray-300 text-gray-900'
                        } text-left`}
                      >
                        <option value="">Select country</option>
                        {COUNTRIES.map((option) => (
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
                    {errors.brunchVenueCountry && (
                      <p className="text-sm text-red-500 mt-1">{errors.brunchVenueCountry}</p>
                    )}
                  </div>
                  <div className="mb-4 text-left">
                    <label
                      htmlFor="brunchVenueCity"
                      className="block mb-1 font-medium text-gray-800"
                    >
                      City
                    </label>
                    <div className="w-full">
                      <Input
                        id="brunchVenueCity"
                        value={state.brunchVenueCity}
                        onChange={(e) => handleInputChange('brunchVenueCity', e.target.value)}
                        error={!!errors.brunchVenueCity}
                        className="text-left w-full"
                      />
                    </div>
                    {errors.brunchVenueCity && (
                      <p className="text-sm text-red-500 mt-1">{errors.brunchVenueCity}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <div className="mb-4 text-left">
                    <label
                      htmlFor="brunchVenueState"
                      className="block mb-1 font-medium text-gray-800"
                    >
                      State
                    </label>
                    <div className="relative w-full">
                      <select
                        id="brunchVenueState"
                        value={state.brunchVenueState}
                        onChange={(e) => handleInputChange('brunchVenueState', e.target.value)}
                        disabled={!state.brunchVenueCountry}
                        className={`block w-full rounded-md shadow-sm pl-3 pr-10 py-2 text-base border appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.brunchVenueState
                            ? 'border-red-500 text-red-900'
                            : 'border-gray-300 text-gray-900'
                        } text-left`}
                      >
                        <option value="">Select state</option>
                        {(STATES_BY_COUNTRY[state.brunchVenueCountry] || []).map((option) => (
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
                    {errors.brunchVenueState && (
                      <p className="text-sm text-red-500 mt-1">{errors.brunchVenueState}</p>
                    )}
                  </div>
                  <div className="mb-4 text-left">
                    <label
                      htmlFor="brunchVenueZip"
                      className="block mb-1 font-medium text-gray-800"
                    >
                      ZIP Code
                    </label>
                    <div className="w-full">
                      <Input
                        id="brunchVenueZip"
                        value={state.brunchVenueZip}
                        onChange={(e) => handleInputChange('brunchVenueZip', e.target.value)}
                        error={!!errors.brunchVenueZip}
                        className="text-left w-full"
                      />
                    </div>
                    {errors.brunchVenueZip && (
                      <p className="text-sm text-red-500 mt-1">{errors.brunchVenueZip}</p>
                    )}
                  </div>
                </div>

                <div className="mb-4 text-left">
                  <div className="w-full flex justify-start">
                    <Checkbox
                      id="brunchVenueAsInsured"
                      label={
                        <span className="font-medium text-left">
                          Add this venue as an Additional Insured on my policy
                        </span>
                      }
                      checked={state.brunchVenueAsInsured}
                      onChange={(checked) => handleInputChange('brunchVenueAsInsured', checked)}
                    />
                  </div>
                </div>

                {/* 3. In each additional venue section, add the checkbox and disable address fields if checked */}
                {/* (Reception example shown, repeat for others) */}
                <Checkbox
                  id="brunchUseMainVenueAddress"
                  label="Use main venue address for this venue"
                  checked={brunchUseMainVenueAddress}
                  onChange={setBrunchUseMainVenueAddress}
                  className="mb-4"
                />
                {/* Reception address fields: add disabled={receptionUseMainVenueAddress} to each */}
                {/* ...repeat for brunch, rehearsal, rehearsal dinner... */}
              </div>
            </div>

            {/* Rehearsal Venue */}
            {/* ============================= */}
            {/* ===== Rehearsal Venue Section ===== */}
            {/* ============================= */}
            <div className="mb-8 shadow-lg border-0 bg-white p-8 sm:p-10 md:p-12 rounded-2xl w-full">
              <div className="flex items-center justify-center text-left mb-4 gap-4">
                <div className="flex-shrink-0">
                  <MapPin size={28} className="text-blue-600" />
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-extrabold leading-tight mb-1">
                    Rehearsal Venue Information
                  </div>
                  <div className="text-base text-gray-500 font-medium leading-tight">
                    Details about where your rehearsal will be held
                  </div>
                </div>
              </div>
              <div className="space-y-8 w-full px-2 sm:px-4 md:px-2">
                <div className="mb-4 text-left">
                  <label
                    htmlFor="rehearsalVenueName"
                    className="block mb-1 font-medium text-gray-800"
                  >
                    Venue Name
                  </label>
                  <div className="w-full">
                    <Input
                      id="rehearsalVenueName"
                      value={state.rehearsalVenueName}
                      onChange={(e) => handleInputChange('rehearsalVenueName', e.target.value)}
                      error={!!errors.rehearsalVenueName}
                      className="text-left w-full"
                    />
                  </div>
                  {errors.rehearsalVenueName && (
                    <p className="text-sm text-red-500 mt-1">{errors.rehearsalVenueName}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  {/* Venue Type */}
                  <div className="mb-4 text-left">
                    <label
                      htmlFor="rehearsalLocationType"
                      className="block mb-1 font-medium text-gray-800"
                    >
                      Venue Type
                    </label>
                    <div className="relative w-full">
                      <select
                        id="rehearsalLocationType"
                        value={state.rehearsalLocationType}
                        onChange={(e) => handleInputChange('rehearsalLocationType', e.target.value)}
                        className={`block w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.rehearsalLocationType ? 'border-red-500 text-red-900' : 'border-gray-300 text-gray-900'} text-left`}
                      >
                        <option value="">Select venue type</option>
                        {VENUE_TYPES.map((option) => (
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
                    {errors.rehearsalLocationType && (
                      <p className="text-sm text-red-500 mt-1">{errors.rehearsalLocationType}</p>
                    )}
                  </div>
                  {/* Indoor/Outdoor */}
                  <div className="mb-4 text-left">
                    <label
                      htmlFor="rehearsalIndoorOutdoor"
                      className="block mb-1 font-medium text-gray-800"
                    >
                      Indoor/Outdoor
                    </label>
                    <div className="relative w-full">
                      <select
                        id="rehearsalIndoorOutdoor"
                        value={state.rehearsalIndoorOutdoor}
                        onChange={(e) =>
                          handleInputChange('rehearsalIndoorOutdoor', e.target.value)
                        }
                        className={`block w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.rehearsalIndoorOutdoor ? 'border-red-500 text-red-900' : 'border-gray-300 text-gray-900'} text-left`}
                      >
                        <option value="">Select option</option>
                        {INDOOR_OUTDOOR_OPTIONS.map((option) => (
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
                    {errors.rehearsalIndoorOutdoor && (
                      <p className="text-sm text-red-500 mt-1">{errors.rehearsalIndoorOutdoor}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <div className="mb-4 text-left">
                    <label
                      htmlFor="rehearsalVenueAddress1"
                      className="block mb-1 font-medium text-gray-800"
                    >
                      Address Line 1
                    </label>
                    <div className="w-full">
                      <Input
                        id="rehearsalVenueAddress1"
                        value={state.rehearsalVenueAddress1}
                        onChange={(e) =>
                          handleInputChange('rehearsalVenueAddress1', e.target.value)
                        }
                        error={!!errors.rehearsalVenueAddress1}
                        className="text-left w-full"
                      />
                    </div>
                    {errors.rehearsalVenueAddress1 && (
                      <p className="text-sm text-red-500 mt-1">{errors.rehearsalVenueAddress1}</p>
                    )}
                  </div>
                  <div className="mb-4 text-left">
                    <label
                      htmlFor="rehearsalVenueAddress2"
                      className="block mb-1 font-medium text-gray-800"
                    >
                      Address Line 2
                    </label>
                    <div className="w-full">
                      <Input
                        id="rehearsalVenueAddress2"
                        value={state.rehearsalVenueAddress2}
                        onChange={(e) =>
                          handleInputChange('rehearsalVenueAddress2', e.target.value)
                        }
                        className="text-left w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <div className="mb-4 text-left">
                    <label
                      htmlFor="rehearsalVenueCountry"
                      className="block mb-1 font-medium text-gray-800"
                    >
                      Country
                    </label>
                    <div className="relative w-full">
                      <select
                        id="rehearsalVenueCountry"
                        value={state.rehearsalVenueCountry}
                        onChange={(e) => handleInputChange('rehearsalVenueCountry', e.target.value)}
                        className={`block w-full rounded-md shadow-sm pl-3 pr-10 py-2 text-base border appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.rehearsalVenueCountry
                            ? 'border-red-500 text-red-900'
                            : 'border-gray-300 text-gray-900'
                        } text-left`}
                      >
                        <option value="">Select country</option>
                        {COUNTRIES.map((option) => (
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
                    {errors.rehearsalVenueCountry && (
                      <p className="text-sm text-red-500 mt-1">{errors.rehearsalVenueCountry}</p>
                    )}
                  </div>
                  <div className="mb-4 text-left">
                    <label
                      htmlFor="rehearsalVenueCity"
                      className="block mb-1 font-medium text-gray-800"
                    >
                      City
                    </label>
                    <div className="w-full">
                      <Input
                        id="rehearsalVenueCity"
                        value={state.rehearsalVenueCity}
                        onChange={(e) => handleInputChange('rehearsalVenueCity', e.target.value)}
                        error={!!errors.rehearsalVenueCity}
                        className="text-left w-full"
                      />
                    </div>
                    {errors.rehearsalVenueCity && (
                      <p className="text-sm text-red-500 mt-1">{errors.rehearsalVenueCity}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <div className="mb-4 text-left">
                    <label
                      htmlFor="rehearsalVenueState"
                      className="block mb-1 font-medium text-gray-800"
                    >
                      State
                    </label>
                    <div className="relative w-full">
                      <select
                        id="rehearsalVenueState"
                        value={state.rehearsalVenueState}
                        onChange={(e) => handleInputChange('rehearsalVenueState', e.target.value)}
                        disabled={!state.rehearsalVenueCountry}
                        className={`block w-full rounded-md shadow-sm pl-3 pr-10 py-2 text-base border appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.rehearsalVenueState
                            ? 'border-red-500 text-red-900'
                            : 'border-gray-300 text-gray-900'
                        } text-left`}
                      >
                        <option value="">Select state</option>
                        {(STATES_BY_COUNTRY[state.rehearsalVenueCountry] || []).map((option) => (
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
                    {errors.rehearsalVenueState && (
                      <p className="text-sm text-red-500 mt-1">{errors.rehearsalVenueState}</p>
                    )}
                  </div>
                  <div className="mb-4 text-left">
                    <label
                      htmlFor="rehearsalVenueZip"
                      className="block mb-1 font-medium text-gray-800"
                    >
                      ZIP Code
                    </label>
                    <div className="w-full">
                      <Input
                        id="rehearsalVenueZip"
                        value={state.rehearsalVenueZip}
                        onChange={(e) => handleInputChange('rehearsalVenueZip', e.target.value)}
                        error={!!errors.rehearsalVenueZip}
                        className="text-left w-full"
                      />
                    </div>
                    {errors.rehearsalVenueZip && (
                      <p className="text-sm text-red-500 mt-1">{errors.rehearsalVenueZip}</p>
                    )}
                  </div>
                </div>

                <div className="mb-4 text-left">
                  <div className="w-full flex justify-start">
                    <Checkbox
                      id="rehearsalVenueAsInsured"
                      label={
                        <span className="font-medium text-left">
                          Add this venue as an Additional Insured on my policy
                        </span>
                      }
                      checked={state.rehearsalVenueAsInsured}
                      onChange={(checked) => handleInputChange('rehearsalVenueAsInsured', checked)}
                    />
                  </div>
                </div>

                {/* 3. In each additional venue section, add the checkbox and disable address fields if checked */}
                {/* (Rehearsal example shown, repeat for others) */}
                <Checkbox
                  id="rehearsalUseMainVenueAddress"
                  label="Use main venue address for this venue"
                  checked={rehearsalUseMainVenueAddress}
                  onChange={setRehearsalUseMainVenueAddress}
                  className="mb-4"
                />
                {/* Reception address fields: add disabled={receptionUseMainVenueAddress} to each */}
                {/* ...repeat for brunch, rehearsal, rehearsal dinner... */}
              </div>
            </div>

            {/* Rehearsal Dinner Venue */}
            {/* ============================= */}
            {/* ===== Rehearsal Dinner Venue Section ===== */}
            {/* ============================= */}
            <div className="mb-8 shadow-lg border-0 bg-white p-8 sm:p-10 md:p-12 rounded-2xl w-full">
              <div className="flex items-center justify-center text-left mb-4 gap-4">
                <div className="flex-shrink-0">
                  <MapPin size={28} className="text-blue-600" />
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-extrabold leading-tight mb-1">
                    Rehearsal Dinner Venue Information
                  </div>
                  <div className="text-base text-gray-500 font-medium leading-tight">
                    Details about where your rehearsal dinner will be held
                  </div>
                </div>
              </div>
              <div className="space-y-8 w-full px-2 sm:px-4 md:px-2">
                <div className="mb-4 text-left">
                  <label
                    htmlFor="rehearsalDinnerVenueName"
                    className="block mb-1 font-medium text-gray-800"
                  >
                    Venue Name
                  </label>
                  <div className="w-full">
                    <Input
                      id="rehearsalDinnerVenueName"
                      value={state.rehearsalDinnerVenueName}
                      onChange={(e) =>
                        handleInputChange('rehearsalDinnerVenueName', e.target.value)
                      }
                      error={!!errors.rehearsalDinnerVenueName}
                      className="text-left w-full"
                    />
                  </div>
                  {errors.rehearsalDinnerVenueName && (
                    <p className="text-sm text-red-500 mt-1">{errors.rehearsalDinnerVenueName}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  {/* Venue Type */}
                  <div className="mb-4 text-left">
                    <label
                      htmlFor="rehearsalDinnerLocationType"
                      className="block mb-1 font-medium text-gray-800"
                    >
                      Venue Type
                    </label>
                    <div className="relative w-full">
                      <select
                        id="rehearsalDinnerLocationType"
                        value={state.rehearsalDinnerLocationType}
                        onChange={(e) =>
                          handleInputChange('rehearsalDinnerLocationType', e.target.value)
                        }
                        className={`block w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.rehearsalDinnerLocationType ? 'border-red-500 text-red-900' : 'border-gray-300 text-gray-900'} text-left`}
                      >
                        <option value="">Select venue type</option>
                        {VENUE_TYPES.map((option) => (
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
                    {errors.rehearsalDinnerLocationType && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.rehearsalDinnerLocationType}
                      </p>
                    )}
                  </div>
                  {/* Indoor/Outdoor */}
                  <div className="mb-4 text-left">
                    <label
                      htmlFor="rehearsalDinnerIndoorOutdoor"
                      className="block mb-1 font-medium text-gray-800"
                    >
                      Indoor/Outdoor
                    </label>
                    <div className="relative w-full">
                      <select
                        id="rehearsalDinnerIndoorOutdoor"
                        value={state.rehearsalDinnerIndoorOutdoor}
                        onChange={(e) =>
                          handleInputChange('rehearsalDinnerIndoorOutdoor', e.target.value)
                        }
                        className={`block w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.rehearsalDinnerIndoorOutdoor ? 'border-red-500 text-red-900' : 'border-gray-300 text-gray-900'} text-left`}
                      >
                        <option value="">Select option</option>
                        {INDOOR_OUTDOOR_OPTIONS.map((option) => (
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
                    {errors.rehearsalDinnerIndoorOutdoor && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.rehearsalDinnerIndoorOutdoor}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <div className="mb-4 text-left">
                    <label
                      htmlFor="rehearsalDinnerVenueAddress1"
                      className="block mb-1 font-medium text-gray-800"
                    >
                      Address Line 1
                    </label>
                    <div className="w-full">
                      <Input
                        id="rehearsalDinnerVenueAddress1"
                        value={state.rehearsalDinnerVenueAddress1}
                        onChange={(e) =>
                          handleInputChange('rehearsalDinnerVenueAddress1', e.target.value)
                        }
                        error={!!errors.rehearsalDinnerVenueAddress1}
                        className="text-left w-full"
                      />
                    </div>
                    {errors.rehearsalDinnerVenueAddress1 && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.rehearsalDinnerVenueAddress1}
                      </p>
                    )}
                  </div>
                  <div className="mb-4 text-left">
                    <label
                      htmlFor="rehearsalDinnerVenueAddress2"
                      className="block mb-1 font-medium text-gray-800"
                    >
                      Address Line 2
                    </label>
                    <div className="w-full">
                      <Input
                        id="rehearsalDinnerVenueAddress2"
                        value={state.rehearsalDinnerVenueAddress2}
                        onChange={(e) =>
                          handleInputChange('rehearsalDinnerVenueAddress2', e.target.value)
                        }
                        className="text-left w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <div className="mb-4 text-left">
                    <label
                      htmlFor="rehearsalDinnerVenueCountry"
                      className="block mb-1 font-medium text-gray-800"
                    >
                      Country
                    </label>
                    <div className="relative w-full">
                      <select
                        id="rehearsalDinnerVenueCountry"
                        value={state.rehearsalDinnerVenueCountry}
                        onChange={(e) =>
                          handleInputChange('rehearsalDinnerVenueCountry', e.target.value)
                        }
                        className={`block w-full rounded-md shadow-sm pl-3 pr-10 py-2 text-base border appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.rehearsalDinnerVenueCountry
                            ? 'border-red-500 text-red-900'
                            : 'border-gray-300 text-gray-900'
                        } text-left`}
                      >
                        <option value="">Select country</option>
                        {COUNTRIES.map((option) => (
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
                    {errors.rehearsalDinnerVenueCountry && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.rehearsalDinnerVenueCountry}
                      </p>
                    )}
                  </div>
                  <div className="mb-4 text-left">
                    <label
                      htmlFor="rehearsalDinnerVenueCity"
                      className="block mb-1 font-medium text-gray-800"
                    >
                      City
                    </label>
                    <div className="w-full">
                      <Input
                        id="rehearsalDinnerVenueCity"
                        value={state.rehearsalDinnerVenueCity}
                        onChange={(e) =>
                          handleInputChange('rehearsalDinnerVenueCity', e.target.value)
                        }
                        error={!!errors.rehearsalDinnerVenueCity}
                        className="text-left w-full"
                      />
                    </div>
                    {errors.rehearsalDinnerVenueCity && (
                      <p className="text-sm text-red-500 mt-1">{errors.rehearsalDinnerVenueCity}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <div className="mb-4 text-left">
                    <label
                      htmlFor="rehearsalDinnerVenueState"
                      className="block mb-1 font-medium text-gray-800"
                    >
                      State
                    </label>
                    <div className="relative w-full">
                      <select
                        id="rehearsalDinnerVenueState"
                        value={state.rehearsalDinnerVenueState}
                        onChange={(e) =>
                          handleInputChange('rehearsalDinnerVenueState', e.target.value)
                        }
                        disabled={!state.rehearsalDinnerVenueCountry}
                        className={`block w-full rounded-md shadow-sm pl-3 pr-10 py-2 text-base border appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.rehearsalDinnerVenueState
                            ? 'border-red-500 text-red-900'
                            : 'border-gray-300 text-gray-900'
                        } text-left`}
                      >
                        <option value="">Select state</option>
                        {(STATES_BY_COUNTRY[state.rehearsalDinnerVenueCountry] || []).map(
                          (option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ),
                        )}
                      </select>
                      <ChevronDown
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                        size={16}
                      />
                    </div>
                    {errors.rehearsalDinnerVenueState && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.rehearsalDinnerVenueState}
                      </p>
                    )}
                  </div>
                  <div className="mb-4 text-left">
                    <label
                      htmlFor="rehearsalDinnerVenueZip"
                      className="block mb-1 font-medium text-gray-800"
                    >
                      ZIP Code
                    </label>
                    <div className="w-full">
                      <Input
                        id="rehearsalDinnerVenueZip"
                        value={state.rehearsalDinnerVenueZip}
                        onChange={(e) =>
                          handleInputChange('rehearsalDinnerVenueZip', e.target.value)
                        }
                        error={!!errors.rehearsalDinnerVenueZip}
                        className="text-left w-full"
                      />
                    </div>
                    {errors.rehearsalDinnerVenueZip && (
                      <p className="text-sm text-red-500 mt-1">{errors.rehearsalDinnerVenueZip}</p>
                    )}
                  </div>
                </div>

                <div className="mb-4 text-left">
                  <div className="w-full flex justify-start">
                    <Checkbox
                      id="rehearsalDinnerVenueAsInsured"
                      label={
                        <span className="font-medium text-left">
                          Add this venue as an Additional Insured on my policy
                        </span>
                      }
                      checked={state.rehearsalDinnerVenueAsInsured}
                      onChange={(checked) =>
                        handleInputChange('rehearsalDinnerVenueAsInsured', checked)
                      }
                    />
                  </div>
                </div>

                {/* 3. In each additional venue section, add the checkbox and disable address fields if checked */}
                {/* (Rehearsal example shown, repeat for others) */}
                <Checkbox
                  id="rehearsalDinnerUseMainVenueAddress"
                  label="Use main venue address for this venue"
                  checked={rehearsalDinnerUseMainVenueAddress}
                  onChange={setRehearsalDinnerUseMainVenueAddress}
                  className="mb-4"
                />
                {/* Reception address fields: add disabled={receptionUseMainVenueAddress} to each */}
                {/* ...repeat for brunch, rehearsal, rehearsal dinner... */}
              </div>
            </div>
          </>
        )}
        {/* ============================= */}
        {/* ===== Navigation Buttons (Back/Continue) ===== */}
        {/* ============================= */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-10 gap-4 w-full">
          <Button
            variant="outline"
            onClick={handleBack}
            onMouseEnter={() => router.prefetch('/admin/create-quote/step1')}
            className="w-full sm:w-auto transition-transform duration-150 hover:scale-105"
          >
            Back to Quote
          </Button>
          <Button
            variant="primary"
            onClick={handleContinue}
            onMouseEnter={() => router.prefetch('/admin/create-quote/step3')}
            className="w-full sm:w-auto transition-transform duration-150 hover:scale-105"
          >
            Continue to Policyholder
          </Button>
        </div>
      </div>
      {/* ============================= */}
      {/* ===== Quote Preview (Sticky Sidebar) ===== */}
      {/* ============================= */}
      {/* <div className="hidden lg:block fixed w-80 right-11 mr-2 top-[260px] z-10">
        <QuotePreview />
      </div> */}
    </>
  );
}

// =============================
// ===== Helper Function =====
// =============================
function handleNameKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
  // Allow: backspace, delete, tab, escape, enter, arrows, home, end
  if (
    [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End',
    ].includes(e.key) ||
    // Allow: Ctrl+A, Command+A, Ctrl+C, Ctrl+V, Ctrl+X
    ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase()))
  ) {
    return; // Let it happen
  }

  // Allow only letters and spaces
  if (!/^[a-zA-Z\s]$/.test(e.key)) {
    e.preventDefault();
  }
}
