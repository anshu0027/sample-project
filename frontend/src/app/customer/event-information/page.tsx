'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, CalendarCheck, ChevronDown } from 'lucide-react';
import { useQuote } from '@/context/QuoteContext';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Checkbox from '@/components/ui/Checkbox';
import {
  VENUE_TYPES,
  INDOOR_OUTDOOR_OPTIONS,
  COUNTRIES,
  STATES_BY_COUNTRY,
} from '@/utils/constants';
import { isEmpty, isValidZip } from '@/utils/validators';
import dynamic from 'next/dynamic';
import { toast } from '@/hooks/use-toast';
import type { QuoteState } from '@/context/QuoteContext';

const QuotePreview = dynamic(() => import('@/components/ui/QuotePreview'), {
  ssr: false,
});

const EventInformationSkeleton = () => (
  <div className="w-full pb-12 animate-pulse">
    <div className="mb-10 shadow-2xl border-0 bg-slate-200/90 p-8 sm:p-10 md:p-12 rounded-2xl w-full">
      <div className="flex items-center justify-center text-center mb-4 gap-4">
        <div className="flex-shrink-0">
          <div className="w-9 h-9 bg-slate-300 rounded"></div>
        </div>
        <div>
          <div className="h-6 bg-slate-300 rounded w-48 mb-2"></div>
          <div className="h-4 bg-slate-300 rounded w-64"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {[1, 2].map((i) => (
          <div key={i}>
            <div className={`h-5 bg-slate-300 rounded ${i === 1 ? 'w-32' : 'w-40'} mb-4`}></div>
            <div className="mb-4">
              <div className="h-4 bg-slate-300 rounded w-24 mb-2"></div>
              <div className="h-10 bg-slate-300 rounded w-full"></div>
            </div>
            <div className="mb-4 md:mb-0">
              <div className="h-4 bg-slate-300 rounded w-24 mb-2"></div>
              <div className="h-10 bg-slate-300 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="mb-8 shadow-lg border-0 bg-slate-200/90 p-8 sm:p-10 md:p-12 rounded-2xl w-full">
      <div className="flex items-center justify-center text-center mb-4 gap-4">
        <div className="flex-shrink-0">
          <div className="w-7 h-7 bg-slate-300 rounded"></div>
        </div>
        <div>
          <div className="h-6 bg-slate-300 rounded w-56 mb-2"></div>
          <div className="h-4 bg-slate-300 rounded w-72"></div>
        </div>
      </div>
      <div className="space-y-8 w-full px-2 sm:px-4 md:px-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-4">
            <div className="h-10 bg-slate-300 rounded w-full"></div>
            <div className="h-10 bg-slate-300 rounded w-full"></div>
          </div>
        ))}
        <div className="h-6 bg-slate-300 rounded w-3/4 mt-4"></div>
      </div>
    </div>
    <div className="flex flex-col sm:flex-row justify-between items-center mt-10 gap-4 w-full">
      <div className="h-10 bg-slate-300 rounded w-full sm:w-32"></div>
      <div className="h-10 bg-slate-300 rounded w-full sm:w-48"></div>
    </div>
  </div>
);

export default function EventInformation() {
  const router = useRouter();
  const { state, dispatch } = useQuote();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isMounted, setIsMounted] = useState(false);

  // Define isCruiseShip at the top so it's available in all functions
  const isCruiseShip = state.ceremonyLocationType === 'cruise_ship';

  // 1. Add new state for each checkbox at the top of the component
  const [receptionUseMainVenueAddress, setReceptionUseMainVenueAddress] = useState(false);
  const [brunchUseMainVenueAddress, setBrunchUseMainVenueAddress] = useState(false);
  const [rehearsalUseMainVenueAddress, setRehearsalUseMainVenueAddress] = useState(false);
  const [rehearsalDinnerUseMainVenueAddress, setRehearsalDinnerUseMainVenueAddress] =
    useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !state.step1Complete) {
      router.replace('/customer/quote-generator');
    }
  }, [state.step1Complete, router, isMounted]);

  // 2. Add useEffect for each to sync fields when checked
  useEffect(() => {
    if (receptionUseMainVenueAddress) {
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
  useEffect(() => {
    if (brunchUseMainVenueAddress) {
      dispatch({
        type: 'UPDATE_FIELD',
        field: 'brunchLocationType',
        value: state.ceremonyLocationType,
      });
      dispatch({ type: 'UPDATE_FIELD', field: 'brunchIndoorOutdoor', value: state.indoorOutdoor });
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

  const handleInputChange = (field: keyof QuoteState, value: string | boolean) => {
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

  // Handle name input keydown to restrict to letters and spaces only
  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const nameRegex = /^[a-zA-Z\-' ]+$/;

    if (isEmpty(state.honoree1FirstName))
      newErrors.honoree1FirstName = 'Please enter the first name';
    else if (!nameRegex.test(state.honoree1FirstName))
      newErrors.honoree1FirstName = 'First name contains invalid characters';
    if (isEmpty(state.honoree1LastName)) newErrors.honoree1LastName = 'Please enter the last name';
    else if (!nameRegex.test(state.honoree1LastName))
      newErrors.honoree1LastName = 'Last name contains invalid characters';

    if (!nameRegex.test(state.honoree2FirstName))
      newErrors.honoree2FirstName = 'First name contains invalid characters';
    if (!nameRegex.test(state.honoree2LastName))
      newErrors.honoree2LastName = 'Last name contains invalid characters';

    if (isEmpty(state.ceremonyLocationType))
      newErrors.ceremonyLocationType = 'Please select a venue type';
    if (isEmpty(state.indoorOutdoor))
      newErrors.indoorOutdoor = 'Please select indoor/outdoor option';
    if (isEmpty(state.venueName)) newErrors.venueName = 'Please enter the venue name';
    if (isEmpty(state.venueAddress1)) newErrors.venueAddress1 = 'Please enter the venue address';
    if (isEmpty(state.venueCity)) newErrors.venueCity = 'Please enter the city';

    const validateVenueFields = (prefix: string) => {
      const venueName = state[`${prefix}VenueName` as keyof QuoteState] as string;
      const venueAddress1 = state[`${prefix}VenueAddress1` as keyof QuoteState] as string;
      const venueCity = state[`${prefix}VenueCity` as keyof QuoteState] as string;
      const venueState = state[`${prefix}VenueState` as keyof QuoteState] as string;
      const venueZip = state[`${prefix}VenueZip` as keyof QuoteState] as string;
      const isCruiseShipVenue =
        state[`${prefix}LocationType` as keyof QuoteState] === 'cruise_ship';

      if (isEmpty(venueName)) newErrors[`${prefix}VenueName`] = 'Please enter the venue name';
      if (isEmpty(venueAddress1))
        newErrors[`${prefix}VenueAddress1`] = 'Please enter the venue address';
      if (isEmpty(venueCity)) newErrors[`${prefix}VenueCity`] = 'Please enter the city';

      // Only validate state and zip for non-cruise ship venues
      if (!isCruiseShipVenue) {
        if (isEmpty(venueState)) newErrors[`${prefix}VenueState`] = 'Please select a state';
        if (isEmpty(venueZip)) newErrors[`${prefix}VenueZip`] = 'Please enter the ZIP code';
        else if (!isValidZip(venueZip))
          newErrors[`${prefix}VenueZip`] = 'Please enter a valid ZIP code';
      }
    };

    // Only validate state and zip for ceremony venue if it's not a cruise ship
    if (!isCruiseShip) {
      if (isEmpty(state.venueState)) newErrors.venueState = 'Please select a state';
      if (isEmpty(state.venueZip)) newErrors.venueZip = 'Please enter the ZIP code';
      else if (!isValidZip(state.venueZip)) newErrors.venueZip = 'Please enter a valid ZIP code';
    }

    if (state.eventType === 'wedding') {
      // For weddings, all additional venue sections are required

      // Reception Venue - Required for weddings
      validateVenueFields('reception');
      if (isEmpty(state.receptionLocationType))
        newErrors.receptionLocationType = 'Please select a venue type';
      if (isEmpty(state.receptionIndoorOutdoor))
        newErrors.receptionIndoorOutdoor = 'Please select indoor/outdoor option';
      if (isEmpty(state.receptionVenueName))
        newErrors.receptionVenueName = 'Please enter the venue name';
      if (isEmpty(state.receptionVenueAddress1))
        newErrors.receptionVenueAddress1 = 'Please enter the venue address';

      // Only validate country, state, zip for reception if it's not a cruise ship
      const isReceptionCruiseShip = state.receptionLocationType === 'cruise_ship';
      if (!isReceptionCruiseShip) {
        if (isEmpty(state.receptionVenueCountry))
          newErrors.receptionVenueCountry = 'Please select the venue country';
        if (isEmpty(state.receptionVenueCity))
          newErrors.receptionVenueCity = 'Please enter the venue city';
        if (isEmpty(state.receptionVenueState))
          newErrors.receptionVenueState = 'Please select the venue state';
        if (isEmpty(state.receptionVenueZip))
          newErrors.receptionVenueZip = 'Please enter the venue ZIP code';
        else if (!isValidZip(state.receptionVenueZip))
          newErrors.receptionVenueZip = 'Please enter a valid venue ZIP code';
      }

      // Brunch Venue - Required for weddings
      validateVenueFields('brunch');
      if (isEmpty(state.brunchLocationType))
        newErrors.brunchLocationType = 'Please select a venue type';
      if (isEmpty(state.brunchIndoorOutdoor))
        newErrors.brunchIndoorOutdoor = 'Please select indoor/outdoor option';
      if (isEmpty(state.brunchVenueName)) newErrors.brunchVenueName = 'Please enter the venue name';
      if (isEmpty(state.brunchVenueAddress1))
        newErrors.brunchVenueAddress1 = 'Please enter the venue address';

      // Only validate country, state, zip for brunch if it's not a cruise ship
      const isBrunchCruiseShip = state.brunchLocationType === 'cruise_ship';
      if (!isBrunchCruiseShip) {
        if (isEmpty(state.brunchVenueCountry))
          newErrors.brunchVenueCountry = 'Please select the venue country';
        if (isEmpty(state.brunchVenueCity))
          newErrors.brunchVenueCity = 'Please enter the venue city';
        if (isEmpty(state.brunchVenueState))
          newErrors.brunchVenueState = 'Please select the venue state';
        if (isEmpty(state.brunchVenueZip))
          newErrors.brunchVenueZip = 'Please enter the venue ZIP code';
        else if (!isValidZip(state.brunchVenueZip))
          newErrors.brunchVenueZip = 'Please enter a valid venue ZIP code';
      }

      // Rehearsal Venue - Required for weddings
      validateVenueFields('rehearsal');
      if (isEmpty(state.rehearsalLocationType))
        newErrors.rehearsalLocationType = 'Please select a venue type';
      if (isEmpty(state.rehearsalIndoorOutdoor))
        newErrors.rehearsalIndoorOutdoor = 'Please select indoor/outdoor option';
      if (isEmpty(state.rehearsalVenueName))
        newErrors.rehearsalVenueName = 'Please enter the venue name';
      if (isEmpty(state.rehearsalVenueAddress1))
        newErrors.rehearsalVenueAddress1 = 'Please enter the venue address';

      // Only validate country, state, zip for rehearsal if it's not a cruise ship
      const isRehearsalCruiseShip = state.rehearsalLocationType === 'cruise_ship';
      if (!isRehearsalCruiseShip) {
        if (isEmpty(state.rehearsalVenueCountry))
          newErrors.rehearsalVenueCountry = 'Please select the venue country';
        if (isEmpty(state.rehearsalVenueCity))
          newErrors.rehearsalVenueCity = 'Please enter the venue city';
        if (isEmpty(state.rehearsalVenueState))
          newErrors.rehearsalVenueState = 'Please select the venue state';
        if (isEmpty(state.rehearsalVenueZip))
          newErrors.rehearsalVenueZip = 'Please enter the venue ZIP code';
        else if (!isValidZip(state.rehearsalVenueZip))
          newErrors.rehearsalVenueZip = 'Please enter a valid venue ZIP code';
      }

      // Rehearsal Dinner Venue - Required for weddings
      validateVenueFields('rehearsalDinner');
      if (isEmpty(state.rehearsalDinnerLocationType))
        newErrors.rehearsalDinnerLocationType = 'Please select a venue type';
      if (isEmpty(state.rehearsalDinnerIndoorOutdoor))
        newErrors.rehearsalDinnerIndoorOutdoor = 'Please select indoor/outdoor option';
      if (isEmpty(state.rehearsalDinnerVenueName))
        newErrors.rehearsalDinnerVenueName = 'Please enter the venue name';
      if (isEmpty(state.rehearsalDinnerVenueAddress1))
        newErrors.rehearsalDinnerVenueAddress1 = 'Please enter the venue address';

      // Only validate country, state, zip for rehearsal dinner if it's not a cruise ship
      const isRehearsalDinnerCruiseShip = state.rehearsalDinnerLocationType === 'cruise_ship';
      if (!isRehearsalDinnerCruiseShip) {
        if (isEmpty(state.rehearsalDinnerVenueCountry))
          newErrors.rehearsalDinnerVenueCountry = 'Please select the venue country';
        if (isEmpty(state.rehearsalDinnerVenueCity))
          newErrors.rehearsalDinnerVenueCity = 'Please enter the venue city';
        if (isEmpty(state.rehearsalDinnerVenueState))
          newErrors.rehearsalDinnerVenueState = 'Please select the venue state';
        if (isEmpty(state.rehearsalDinnerVenueZip))
          newErrors.rehearsalDinnerVenueZip = 'Please enter the venue ZIP code';
        else if (!isValidZip(state.rehearsalDinnerVenueZip))
          newErrors.rehearsalDinnerVenueZip = 'Please enter a valid venue ZIP code';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBack = () => {
    router.push('/customer/quote-generator');
  };

  // ==================================================================
  // ===== THE ONLY CHANGES ARE IN THIS FUNCTION ======================
  // ==================================================================
  const handleContinue = async () => {
    if (validateForm()) {
      const storedQuoteNumber = localStorage.getItem('quoteNumber');
      if (!storedQuoteNumber) {
        toast.error('Missing quote number. Please start from Step 1.');
        return;
      }

      // Define the new API URL from environment variables
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

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

          // Only include country, state, zip if it's not a cruise ship
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

        // The payload now includes all additional venue fields, even if empty
        const payload: Partial<QuoteState> = {
          eventType: state.eventType,
          maxGuests: state.maxGuests,
          honoree1FirstName: state.honoree1FirstName,
          honoree1LastName: state.honoree1LastName,
          honoree2FirstName: state.honoree2FirstName,
          honoree2LastName: state.honoree2LastName,

          // Ceremony Venue
          ceremonyLocationType: state.ceremonyLocationType,
          indoorOutdoor: state.indoorOutdoor,
          venueName: state.venueName,
          venueAddress1: state.venueAddress1,
          venueAddress2: state.venueAddress2,
          venueCity: state.venueCity,
          venueAsInsured: state.venueAsInsured,
          eventDate: state.eventDate,
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

        const res = await fetch(`${apiUrl}/quotes/${storedQuoteNumber}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to update quote.');
        }

        // If successful, update local state and proceed
        dispatch({ type: 'COMPLETE_STEP', step: 2 });
        router.push('/customer/policy-holder');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        toast.error(message);
      }
    } else {
      Object.values(errors).forEach((msg) => toast.error(msg));
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus({ preventScroll: true });
        }
      }
    }
  };
  // ==================================================================
  // ==================================================================
  // ==================================================================

  const renderVenueSection = (
    title: string,
    prefix: string,
    venueState: QuoteState,
    venueErrors: Record<string, string>,
    useMainVenueAddress: boolean,
    setUseMainVenueAddress: (checked: boolean) => void,
  ) => {
    const isCruiseShipVenue =
      venueState[`${prefix}LocationType` as keyof QuoteState] === 'cruise_ship';

    return (
      <div className="mb-8 shadow-lg border-0 bg-white p-8 sm:p-10 md:p-12 rounded-2xl w-full">
        <div className="flex items-center justify-center text-left mb-4 gap-4">
          <div className="flex-shrink-0">
            <MapPin size={28} className="text-blue-600" />
          </div>
          <div>
            <div className="text-xl md:text-2xl font-extrabold leading-tight mb-1">
              {title} Information
            </div>
            <div className="text-base text-gray-500 font-medium leading-tight">
              Details about where your {title.toLowerCase()} will be held
            </div>
          </div>
        </div>
        <div className="space-y-8 w-full px-2 sm:px-4 md:px-8">
          {state.eventType === 'wedding' && (
            <Checkbox
              id={`${prefix}UseMainVenueAddress`}
              label="Use main venue address for this venue"
              checked={useMainVenueAddress}
              onChange={setUseMainVenueAddress}
              className="mb-4"
            />
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div className="mb-4 text-left">
              <label
                htmlFor={`${prefix}LocationType`}
                className="block mb-1 font-medium text-gray-800"
              >
                Venue Type <span className="text-red-500">*</span>
              </label>
              <div className="relative w-full">
                <select
                  id={`${prefix}LocationType`}
                  value={venueState[`${prefix}LocationType` as keyof QuoteState] as string}
                  onChange={(e) =>
                    handleInputChange(`${prefix}LocationType` as keyof QuoteState, e.target.value)
                  }
                  className={`block w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${venueErrors[`${prefix}LocationType`] ? 'border-red-500 text-red-900' : 'border-gray-300 text-gray-900'} text-left`}
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
              {venueErrors[`${prefix}LocationType`] && (
                <p className="text-sm text-red-500 mt-1">{venueErrors[`${prefix}LocationType`]}</p>
              )}
            </div>
            <div className="mb-4 text-left">
              <label
                htmlFor={`${prefix}IndoorOutdoor`}
                className="block mb-1 font-medium text-gray-800"
              >
                Indoor/Outdoor <span className="text-red-500">*</span>
              </label>
              <div className="relative w-full">
                <select
                  id={`${prefix}IndoorOutdoor`}
                  value={venueState[`${prefix}IndoorOutdoor` as keyof QuoteState] as string}
                  onChange={(e) =>
                    handleInputChange(`${prefix}IndoorOutdoor` as keyof QuoteState, e.target.value)
                  }
                  className={`block w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${venueErrors[`${prefix}IndoorOutdoor`] ? 'border-red-500 text-red-900' : 'border-gray-300 text-gray-900'} text-left`}
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
              {venueErrors[`${prefix}IndoorOutdoor`] && (
                <p className="text-sm text-red-500 mt-1">{venueErrors[`${prefix}IndoorOutdoor`]}</p>
              )}
            </div>
          </div>
          <div className="mb-4 text-left">
            <label htmlFor={`${prefix}VenueName`} className="block mb-1 font-medium text-gray-800">
              Venue Name <span className="text-red-500">*</span>
            </label>
            <Input
              id={`${prefix}VenueName`}
              value={venueState[`${prefix}VenueName` as keyof QuoteState] as string}
              onChange={(e) =>
                handleInputChange(`${prefix}VenueName` as keyof QuoteState, e.target.value)
              }
              error={!!venueErrors[`${prefix}VenueName`]}
              placeholder={isCruiseShipVenue ? 'Cruise Ship Name' : 'Venue Name'}
              className="text-left w-full"
            />
            {venueErrors[`${prefix}VenueName`] && (
              <p className="text-sm text-red-500 mt-1">{venueErrors[`${prefix}VenueName`]}</p>
            )}
          </div>
          {isCruiseShipVenue ? (
            <>
              <div className="mb-4 text-left">
                <label
                  htmlFor={`${prefix}VenueAddress1`}
                  className="block mb-1 font-medium text-gray-800"
                >
                  Cruise Line <span className="text-red-500">*</span>
                </label>
                <Input
                  id={`${prefix}VenueAddress1`}
                  value={venueState[`${prefix}VenueAddress1` as keyof QuoteState] as string}
                  onChange={(e) =>
                    handleInputChange(`${prefix}VenueAddress1` as keyof QuoteState, e.target.value)
                  }
                  error={!!venueErrors[`${prefix}VenueAddress1`]}
                  placeholder="e.g., Royal Caribbean"
                  className="text-left w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {venueErrors[`${prefix}VenueAddress1`] && (
                  <p className="text-sm text-red-500 mt-1">
                    {venueErrors[`${prefix}VenueAddress1`]}
                  </p>
                )}
              </div>
              <div className="mb-4 text-left">
                <label
                  htmlFor={`${prefix}VenueCity`}
                  className="block mb-1 font-medium text-gray-800"
                >
                  Departure Port <span className="text-red-500">*</span>
                </label>
                <Input
                  id={`${prefix}VenueCity`}
                  value={venueState[`${prefix}VenueCity` as keyof QuoteState] as string}
                  onChange={(e) =>
                    handleInputChange(`${prefix}VenueCity` as keyof QuoteState, e.target.value)
                  }
                  error={!!venueErrors[`${prefix}VenueCity`]}
                  placeholder="e.g., Miami, Florida"
                  className="text-left w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {venueErrors[`${prefix}VenueCity`] && (
                  <p className="text-sm text-red-500 mt-1">{venueErrors[`${prefix}VenueCity`]}</p>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div className="mb-4 text-left">
                  <label
                    htmlFor={`${prefix}VenueAddress1`}
                    className="block mb-1 font-medium text-gray-800"
                  >
                    Address Line 1 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id={`${prefix}VenueAddress1`}
                    value={venueState[`${prefix}VenueAddress1` as keyof QuoteState] as string}
                    onChange={(e) =>
                      handleInputChange(
                        `${prefix}VenueAddress1` as keyof QuoteState,
                        e.target.value,
                      )
                    }
                    error={!!venueErrors[`${prefix}VenueAddress1`]}
                    placeholder="Street Address"
                    className="text-left w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {venueErrors[`${prefix}VenueAddress1`] && (
                    <p className="text-sm text-red-500 mt-1">
                      {venueErrors[`${prefix}VenueAddress1`]}
                    </p>
                  )}
                </div>
                <div className="mb-4 text-left">
                  <label
                    htmlFor={`${prefix}VenueAddress2`}
                    className="block mb-1 font-medium text-gray-800"
                  >
                    Address Line 2
                  </label>
                  <Input
                    id={`${prefix}VenueAddress2`}
                    value={venueState[`${prefix}VenueAddress2` as keyof QuoteState] as string}
                    onChange={(e) =>
                      handleInputChange(
                        `${prefix}VenueAddress2` as keyof QuoteState,
                        e.target.value,
                      )
                    }
                    placeholder="Apt, Suite, Building (optional)"
                    className="text-left w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div className="mb-4 text-left">
                  <label
                    htmlFor={`${prefix}VenueCountry`}
                    className="block mb-1 font-medium text-gray-800"
                  >
                    Country <span className="text-red-500">*</span>
                  </label>
                  <div className="relative w-full">
                    <select
                      id={`${prefix}VenueCountry`}
                      value={venueState[`${prefix}VenueCountry` as keyof QuoteState] as string}
                      onChange={(e) =>
                        handleInputChange(
                          `${prefix}VenueCountry` as keyof QuoteState,
                          e.target.value,
                        )
                      }
                      className={`block w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${venueErrors[`${prefix}VenueCountry`] ? 'border-red-500 text-red-900' : 'border-gray-300 text-gray-900'} text-left`}
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
                  {venueErrors[`${prefix}VenueCountry`] && (
                    <p className="text-sm text-red-500 mt-1">
                      {venueErrors[`${prefix}VenueCountry`]}
                    </p>
                  )}
                </div>
                <div className="mb-4 text-left">
                  <label
                    htmlFor={`${prefix}VenueCity`}
                    className="block mb-1 font-medium text-gray-800"
                  >
                    City <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id={`${prefix}VenueCity`}
                    value={venueState[`${prefix}VenueCity` as keyof QuoteState] as string}
                    onChange={(e) =>
                      handleInputChange(`${prefix}VenueCity` as keyof QuoteState, e.target.value)
                    }
                    error={!!venueErrors[`${prefix}VenueCity`]}
                    className="text-left w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {venueErrors[`${prefix}VenueCity`] && (
                    <p className="text-sm text-red-500 mt-1">{venueErrors[`${prefix}VenueCity`]}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div className="mb-4 text-left">
                  <label
                    htmlFor={`${prefix}VenueState`}
                    className="block mb-1 font-medium text-gray-800"
                  >
                    State <span className="text-red-500">*</span>
                  </label>
                  <div className="relative w-full">
                    <select
                      id={`${prefix}VenueState`}
                      value={venueState[`${prefix}VenueState` as keyof QuoteState] as string}
                      onChange={(e) =>
                        handleInputChange(`${prefix}VenueState` as keyof QuoteState, e.target.value)
                      }
                      disabled={!venueState[`${prefix}VenueCountry` as keyof QuoteState]}
                      className={`block w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${venueErrors[`${prefix}VenueState`] ? 'border-red-500 text-red-900' : 'border-gray-300 text-gray-900'} text-left`}
                    >
                      <option value="">Select state</option>
                      {(
                        STATES_BY_COUNTRY[
                          venueState[`${prefix}VenueCountry` as keyof QuoteState] as string
                        ] || []
                      ).map((option) => (
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
                  {venueErrors[`${prefix}VenueState`] && (
                    <p className="text-sm text-red-500 mt-1">
                      {venueErrors[`${prefix}VenueState`]}
                    </p>
                  )}
                </div>
                <div className="mb-4 text-left">
                  <label
                    htmlFor={`${prefix}VenueZip`}
                    className="block mb-1 font-medium text-gray-800"
                  >
                    ZIP Code <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id={`${prefix}VenueZip`}
                    value={venueState[`${prefix}VenueZip` as keyof QuoteState] as string}
                    onChange={(e) =>
                      handleInputChange(`${prefix}VenueZip` as keyof QuoteState, e.target.value)
                    }
                    error={!!venueErrors[`${prefix}VenueZip`]}
                    className="text-left w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {venueErrors[`${prefix}VenueZip`] && (
                    <p className="text-sm text-red-500 mt-1">{venueErrors[`${prefix}VenueZip`]}</p>
                  )}
                </div>
              </div>
            </>
          )}
          <div className="mb-4 text-left">
            <Checkbox
              id={`${prefix}VenueAsInsured`}
              label={
                <span className="font-medium text-left">
                  Add this venue as an Additional Insured on my policy
                </span>
              }
              checked={venueState[`${prefix}VenueAsInsured` as keyof QuoteState] as boolean}
              onChange={(checked) =>
                handleInputChange(`${prefix}VenueAsInsured` as keyof QuoteState, checked)
              }
            />
          </div>
        </div>
      </div>
    );
  };

  if (!isMounted) {
    return <EventInformationSkeleton />;
  }

  if (!state.step1Complete) {
    return <EventInformationSkeleton />;
  }

  return (
    <>
      {/* Flex container for main content and sidebar */}
      <div className="flex flex-col lg:flex-row lg:gap-x-8">
        {/* Main content area */}
        <div className="w-full lg:flex-1 pb-12">
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
                <div className="mb-4">
                  <label
                    htmlFor="honoree1FirstName"
                    className="block mb-1 font-medium text-gray-800 text-left"
                  >
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <div className="w-full mr-auto">
                    <Input
                      id="honoree1FirstName"
                      value={state.honoree1FirstName}
                      onChange={(e) => handleInputChange('honoree1FirstName', e.target.value)}
                      error={!!errors.honoree1FirstName}
                      placeholder="John"
                      className="text-left w-full"
                      onKeyDown={handleNameKeyDown}
                    />
                  </div>
                  {errors.honoree1FirstName && (
                    <p className="text-sm text-red-500 mt-1">{errors.honoree1FirstName}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="honoree1LastName"
                    className="block mb-1 font-medium text-gray-800 text-left"
                  >
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <div className="w-full mr-auto">
                    <Input
                      id="honoree1LastName"
                      value={state.honoree1LastName}
                      onChange={(e) => handleInputChange('honoree1LastName', e.target.value)}
                      error={!!errors.honoree1LastName}
                      placeholder="Doe"
                      className="text-left w-full"
                      onKeyDown={handleNameKeyDown}
                    />
                  </div>
                  {errors.honoree1LastName && (
                    <p className="text-sm text-red-500 mt-1">{errors.honoree1LastName}</p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-left text-gray-700 mb-4 text-lg">
                  Honoree #2{' '}
                  <span className="text-semibold text-sm text-gray-400">(if applicable)</span>
                </h3>
                <div className="mb-4">
                  <label
                    htmlFor="honoree2FirstName"
                    className="block mb-1 font-medium text-gray-800 text-left"
                  >
                    First Name
                  </label>
                  <div className="w-full mr-auto">
                    <Input
                      id="honoree2FirstName"
                      value={state.honoree2FirstName}
                      onChange={(e) => handleInputChange('honoree2FirstName', e.target.value)}
                      placeholder="John"
                      className="text-left w-full"
                      onKeyDown={handleNameKeyDown}
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="honoree2LastName"
                    className="block mb-1 font-medium text-gray-800 text-left"
                  >
                    Last Name
                  </label>
                  <div className="w-full mr-auto">
                    <Input
                      id="honoree2LastName"
                      value={state.honoree2LastName}
                      onChange={(e) => handleInputChange('honoree2LastName', e.target.value)}
                      placeholder="Doe"
                      className="text-left w-full"
                      onKeyDown={handleNameKeyDown}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
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
            <div className="space-y-8 w-full px-2 sm:px-4 md:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
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
                      className={`block w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                <div className="mb-4 text-left">
                  <label htmlFor="indoorOutdoor" className="block mb-1 font-medium text-gray-800">
                    Indoor/Outdoor <span className="text-red-500">*</span>
                  </label>
                  <div className="relative w-full">
                    <select
                      id="indoorOutdoor"
                      value={state.indoorOutdoor}
                      onChange={(e) => handleInputChange('indoorOutdoor', e.target.value)}
                      className={`block w-full rounded-xl shadow-sm border pl-3 pr-10 py-2 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
              <div className="mb-4 text-left">
                <label htmlFor="venueName" className="block mb-1 font-medium text-gray-800">
                  Venue Name <span className="text-red-500">*</span>
                </label>
                <div className="w-full flex justify-start">
                  <Input
                    id="venueName"
                    value={state.venueName}
                    onChange={(e) => handleInputChange('venueName', e.target.value)}
                    error={!!errors.venueName}
                    placeholder={isCruiseShip ? 'Cruise Ship Name' : 'Venue Name'}
                    className="text-left w-full"
                  />
                </div>
                {errors.venueName && (
                  <p className="text-sm text-red-500 mt-1">{errors.venueName}</p>
                )}
              </div>
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
                        className="text-left w-full rounded-xl shadow-sm border pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        className="text-left w-full rounded-xl shadow-sm border pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        className="text-left w-full rounded-xl shadow-sm border pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    {errors.venueAddress1 && (
                      <p className="text-sm text-red-500 mt-1">{errors.venueAddress1}</p>
                    )}
                  </div>
                  <div className="mb-4 text-left">
                    <label htmlFor="venueAddress2" className="block mb-1 font-medium text-gray-800">
                      Address Line 2
                    </label>
                    <div className="w-full">
                      <Input
                        id="venueAddress2"
                        value={state.venueAddress2}
                        onChange={(e) => handleInputChange('venueAddress2', e.target.value)}
                        placeholder="Apt, Suite, Building (optional)"
                        className="text-left w-full rounded-xl shadow-sm border pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
              {!isCruiseShip && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    <div className="mb-4 text-left">
                      <label
                        htmlFor="venueCountry"
                        className="block mb-1 font-medium text-gray-800"
                      >
                        Country <span className="text-red-500">*</span>
                      </label>
                      <div className="relative w-full">
                        <select
                          id="venueCountry"
                          value={state.venueCountry}
                          onChange={(e) => handleInputChange('venueCountry', e.target.value)}
                          className={`block w-full rounded-xl shadow-sm border pl-3 pr-10 py-2 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                          className="text-left w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      {errors.venueCity && (
                        <p className="text-sm text-red-500 mt-1">{errors.venueCity}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    <div className="mb-4 text-left">
                      <label htmlFor="venueState" className="block mb-1 font-medium text-gray-800">
                        State <span className="text-red-500">*</span>
                      </label>
                      <div className="relative w-full">
                        <select
                          id="venueState"
                          value={state.venueState}
                          onChange={(e) => handleInputChange('venueState', e.target.value)}
                          className={`block w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                          className="text-left w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      {errors.venueZip && (
                        <p className="text-sm text-red-500 mt-1">{errors.venueZip}</p>
                      )}
                    </div>
                  </div>
                </>
              )}
              <div className="mb-4 text-left">
                <div className="w-full flex justify-start">
                  <Checkbox
                    id="venueAsInsured"
                    label={
                      <span className="font-medium text-left">
                        Add this venue as an Additional Insured on my policy
                      </span>
                    }
                    checked={state.venueAsInsured}
                    onChange={(checked) => handleInputChange('venueAsInsured', checked)}
                    className=""
                  />
                </div>
              </div>
            </div>
          </div>

          {state.eventType === 'wedding' && (
            <>
              {/* Reception Venue Information */}
              {renderVenueSection(
                'Reception Venue',
                'reception',
                state,
                errors,
                receptionUseMainVenueAddress,
                setReceptionUseMainVenueAddress,
              )}

              {/* Brunch Venue Information */}
              {renderVenueSection(
                'Brunch Venue',
                'brunch',
                state,
                errors,
                brunchUseMainVenueAddress,
                setBrunchUseMainVenueAddress,
              )}

              {/* Rehearsal Venue Information */}
              {renderVenueSection(
                'Rehearsal Venue',
                'rehearsal',
                state,
                errors,
                rehearsalUseMainVenueAddress,
                setRehearsalUseMainVenueAddress,
              )}

              {/* Rehearsal Dinner Venue Information */}
              {renderVenueSection(
                'Rehearsal Dinner Venue',
                'rehearsalDinner',
                state,
                errors,
                rehearsalDinnerUseMainVenueAddress,
                setRehearsalDinnerUseMainVenueAddress,
              )}
            </>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-center mt-10 gap-4 w-full">
            <Button
              variant="outline"
              onClick={handleBack}
              onMouseEnter={() => router.prefetch('/customer/quote-generator')}
              className="w-full sm:w-auto transition-transform duration-150 hover:scale-105"
            >
              Back to Quote
            </Button>
            <Button
              variant="primary"
              onMouseEnter={() => router.prefetch('/customer/policy-holder')}
              onClick={handleContinue}
              className="w-full sm:w-auto transition-transform duration-150 hover:scale-105"
            >
              Continue to Policyholder
            </Button>
          </div>
        </div>{' '}
        {/* End of Main content area */}
        {/* Sidebar for QuotePreview */}
        {/* Hidden on small screens, becomes a sticky sidebar on lg screens */}
        <div className="hidden lg:block lg:w-80 lg:sticky lg:top-24 self-start">
          <QuotePreview />
        </div>
      </div>
    </>
  );
}
