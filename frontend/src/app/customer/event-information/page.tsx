"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, CalendarCheck, ChevronDown } from "lucide-react";
import { useQuote } from "@/context/QuoteContext";
import { Button } from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import Checkbox from "@/components/ui/Checkbox";
import {
  VENUE_TYPES,
  INDOOR_OUTDOOR_OPTIONS,
  COUNTRIES,
  US_STATES,
} from "@/utils/constants";
import { isEmpty, isValidZip } from "@/utils/validators";
import dynamic from "next/dynamic";
import { toast } from "@/hooks/use-toast";
import type { QuoteState } from "@/context/QuoteContext";

const QuotePreview = dynamic(() => import("@/components/ui/QuotePreview"), {
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !state.step1Complete) {
      router.replace("/customer/quote-generator");
    }
  }, [state.step1Complete, router, isMounted]);

  const handleInputChange = (
    field: keyof QuoteState,
    value: string | boolean
  ) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const nameRegex = /^[a-zA-Z\-' ]+$/;
    if (isEmpty(state.honoree1FirstName)) newErrors.honoree1FirstName = "Please enter the first name";
    else if (!nameRegex.test(state.honoree1FirstName)) newErrors.honoree1FirstName = "First name contains invalid characters";
    if (isEmpty(state.honoree1LastName)) newErrors.honoree1LastName = "Please enter the last name";
    else if (!nameRegex.test(state.honoree1LastName)) newErrors.honoree1LastName = "Last name contains invalid characters";
    if (isEmpty(state.ceremonyLocationType)) newErrors.ceremonyLocationType = "Please select a venue type";
    if (isEmpty(state.indoorOutdoor)) newErrors.indoorOutdoor = "Please select indoor/outdoor option";
    if (isEmpty(state.venueName)) newErrors.venueName = "Please enter the venue name";
    if (isEmpty(state.venueAddress1)) newErrors.venueAddress1 = "Please enter the venue address";
    if (isEmpty(state.venueCity)) newErrors.venueCity = "Please enter the city";

    const validateVenueFields = (prefix: string) => {
      const venueName = state[`${prefix}VenueName` as keyof QuoteState] as string;
      const venueAddress1 = state[`${prefix}VenueAddress1` as keyof QuoteState] as string;
      const venueCity = state[`${prefix}VenueCity` as keyof QuoteState] as string;
      const venueState = state[`${prefix}VenueState` as keyof QuoteState] as string;
      const venueZip = state[`${prefix}VenueZip` as keyof QuoteState] as string;

      if (isEmpty(venueName)) newErrors[`${prefix}VenueName`] = "Please enter the venue name";
      if (isEmpty(venueAddress1)) newErrors[`${prefix}VenueAddress1`] = "Please enter the venue address";
      if (isEmpty(venueCity)) newErrors[`${prefix}VenueCity`] = "Please enter the city";

      const isCruiseShipVenue = state[`${prefix}LocationType` as keyof QuoteState] === "cruise_ship";
      if (!isCruiseShipVenue) {
        if (isEmpty(venueState)) newErrors[`${prefix}VenueState`] = "Please select a state";
        if (isEmpty(venueZip)) newErrors[`${prefix}VenueZip`] = "Please enter the ZIP code";
        else if (!isValidZip(venueZip)) newErrors[`${prefix}VenueZip`] = "Please enter a valid ZIP code";
      }
    };

    if (!isCruiseShip) {
      if (isEmpty(state.venueState)) newErrors.venueState = "Please select a state";
      if (isEmpty(state.venueZip)) newErrors.venueZip = "Please enter the ZIP code";
      else if (!isValidZip(state.venueZip)) newErrors.venueZip = "Please enter a valid ZIP code";
    }

    if (state.eventType === 'wedding') {
      // Validate Ceremony Venue (already done above)

      // Validate Reception Venue
      validateVenueFields('reception');
      if (isEmpty(state.receptionLocationType)) newErrors.receptionLocationType = "Please select a venue type";
      if (isEmpty(state.receptionIndoorOutdoor)) newErrors.receptionIndoorOutdoor = "Please select indoor/outdoor option";

      // Validate Brunch Venue (optional, only if name is provided)
      if (!isEmpty(state.brunchVenueName)) {
        validateVenueFields('brunch');
        if (isEmpty(state.brunchLocationType)) newErrors.brunchLocationType = "Please select a venue type";
        if (isEmpty(state.brunchIndoorOutdoor)) newErrors.brunchIndoorOutdoor = "Please select indoor/outdoor option";
      }

      // Validate Rehearsal Venue (optional, only if name is provided)
      if (!isEmpty(state.rehearsalVenueName)) {
        validateVenueFields('rehearsal');
        if (isEmpty(state.rehearsalLocationType)) newErrors.rehearsalLocationType = "Please select a venue type";
        if (isEmpty(state.rehearsalIndoorOutdoor)) newErrors.rehearsalIndoorOutdoor = "Please select indoor/outdoor option";
      }

      // Validate Rehearsal Dinner Venue (optional, only if name is provided)
      if (!isEmpty(state.rehearsalDinnerVenueName)) {
        validateVenueFields('rehearsalDinner');
        if (isEmpty(state.rehearsalDinnerLocationType)) newErrors.rehearsalDinnerLocationType = "Please select a venue type";
        if (isEmpty(state.rehearsalDinnerIndoorOutdoor)) newErrors.rehearsalDinnerIndoorOutdoor = "Please select indoor/outdoor option";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBack = () => {
    router.push("/customer/quote-generator");
  };

  // ==================================================================
  // ===== THE ONLY CHANGES ARE IN THIS FUNCTION ======================
  // ==================================================================
  const handleContinue = async () => {
    if (validateForm()) {
      const storedQuoteNumber = localStorage.getItem("quoteNumber");
      if (!storedQuoteNumber) {
        toast.error("Missing quote number. Please start from Step 1.");
        return;
      }

      // Define the new API URL from environment variables
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      try {
        // The payload now only needs the fields being updated
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
          venueCountry: isCruiseShip ? '' : state.venueCountry, // Don't send country for cruise ships
          venueCity: state.venueCity, // City is Departure Port for cruise ships
          venueState: isCruiseShip ? '' : state.venueState, // Don't send state for cruise ships
          venueZip: isCruiseShip ? '' : state.venueZip, // Don't send zip for cruise ships
          venueAsInsured: state.venueAsInsured,
        };

        if (state.eventType === 'wedding') {
          // Reception Venue
          payload.receptionLocationType = state.receptionLocationType;
          payload.receptionIndoorOutdoor = state.receptionIndoorOutdoor;
          payload.receptionVenueName = state.receptionVenueName;
          payload.receptionVenueAddress1 = state.receptionVenueAddress1;
          payload.receptionVenueAddress2 = state.receptionVenueAddress2;
          payload.receptionVenueCountry = state.receptionVenueCountry;
          payload.receptionVenueCity = state.receptionVenueCity;
          payload.receptionVenueState = state.receptionVenueState;
          payload.receptionVenueZip = state.receptionVenueZip;
          payload.receptionVenueAsInsured = state.receptionVenueAsInsured;

          // Brunch Venue (only if name is provided)
          if (!isEmpty(state.brunchVenueName)) {
            // Add brunch venue fields to payload
            payload.brunchLocationType = state.brunchLocationType;
            payload.brunchIndoorOutdoor = state.brunchIndoorOutdoor;
            payload.brunchVenueName = state.brunchVenueName;
            payload.brunchVenueAddress1 = state.brunchVenueAddress1;
            payload.brunchVenueAddress2 = state.brunchVenueAddress2;
            payload.brunchVenueCountry = state.brunchVenueCountry;
            payload.brunchVenueCity = state.brunchVenueCity;
            payload.brunchVenueState = state.brunchVenueState;
            payload.brunchVenueZip = state.brunchVenueZip;
            payload.brunchVenueAsInsured = state.brunchVenueAsInsured;
          }

          // Rehearsal Venue (only if name is provided)
          if (!isEmpty(state.rehearsalVenueName)) {
            // Add rehearsal venue fields to payload
            payload.rehearsalLocationType = state.rehearsalLocationType;
            payload.rehearsalIndoorOutdoor = state.rehearsalIndoorOutdoor;
            payload.rehearsalVenueName = state.rehearsalVenueName;
            payload.rehearsalVenueAddress1 = state.rehearsalVenueAddress1;
            payload.rehearsalVenueAddress2 = state.rehearsalVenueAddress2;
            payload.rehearsalVenueCountry = state.rehearsalVenueCountry;
            payload.rehearsalVenueCity = state.rehearsalVenueCity;
            payload.rehearsalVenueState = state.rehearsalVenueState;
            payload.rehearsalVenueZip = state.rehearsalVenueZip;
            payload.rehearsalVenueAsInsured = state.rehearsalVenueAsInsured;
          }

          // Rehearsal Dinner Venue (only if name is provided)
          if (!isEmpty(state.rehearsalDinnerVenueName)) {
            // Add rehearsal dinner venue fields to payload
            payload.rehearsalDinnerLocationType = state.rehearsalDinnerLocationType;
            payload.rehearsalDinnerIndoorOutdoor = state.rehearsalDinnerIndoorOutdoor;
            payload.rehearsalDinnerVenueName = state.rehearsalDinnerVenueName;
            payload.rehearsalDinnerVenueAddress1 = state.rehearsalDinnerVenueAddress1;
            payload.rehearsalDinnerVenueAddress2 = state.rehearsalDinnerVenueAddress2;
            payload.rehearsalDinnerVenueCountry = state.rehearsalDinnerVenueCountry;
            payload.rehearsalDinnerVenueCity = state.rehearsalDinnerVenueCity;
            payload.rehearsalDinnerVenueState = state.rehearsalDinnerVenueState;
            payload.rehearsalDinnerVenueZip = state.rehearsalDinnerVenueZip;
            payload.rehearsalDinnerVenueAsInsured = state.rehearsalDinnerVenueAsInsured;
          }
        }

        const res = await fetch(`${apiUrl}/quotes/${storedQuoteNumber}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to update quote.");
        }

        // If successful, update local state and proceed
        dispatch({ type: "COMPLETE_STEP", step: 2 });
        router.push("/customer/policy-holder");

      } catch (error) {
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        toast.error(message);
      }
    } else {
      Object.values(errors).forEach((msg) => toast.error(msg));
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
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
    venueErrors: Record<string, string>
  ) => {
    const isCruiseShipVenue = venueState[`${prefix}CeremonyLocationType` as keyof QuoteState] === "cruise_ship";

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div className="mb-4 text-left">
              <label htmlFor={`${prefix}LocationType`} className="block mb-1 font-medium text-gray-800">
                Venue Type <span className="text-red-500">*</span>
              </label>
              <div className="relative w-full">
                <select
                  id={`${prefix}LocationType`}
                  value={venueState[`${prefix}LocationType` as keyof QuoteState] as string}
                  onChange={(e) => handleInputChange(`${prefix}LocationType` as keyof QuoteState, e.target.value)}
                  className={`block w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${venueErrors[`${prefix}LocationType`] ? "border-red-500 text-red-900" : "border-gray-300 text-gray-900"} text-left`}
                >
                  <option value="">Select venue type</option>
                  {VENUE_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
              </div>
              {venueErrors[`${prefix}LocationType`] && <p className="text-sm text-red-500 mt-1">{venueErrors[`${prefix}LocationType`]}</p>}
            </div>
            <div className="mb-4 text-left">
              <label htmlFor={`${prefix}IndoorOutdoor`} className="block mb-1 font-medium text-gray-800">
                Indoor/Outdoor <span className="text-red-500">*</span>
              </label>
              <div className="relative w-full">
                <select
                  id={`${prefix}IndoorOutdoor`}
                  value={venueState[`${prefix}IndoorOutdoor` as keyof QuoteState] as string}
                  onChange={(e) => handleInputChange(`${prefix}IndoorOutdoor` as keyof QuoteState, e.target.value)}
                  className={`block w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${venueErrors[`${prefix}IndoorOutdoor`] ? "border-red-500 text-red-900" : "border-gray-300 text-gray-900"} text-left`}
                >
                  <option value="">Select option</option>
                  {INDOOR_OUTDOOR_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
              </div>
              {venueErrors[`${prefix}IndoorOutdoor`] && <p className="text-sm text-red-500 mt-1">{venueErrors[`${prefix}IndoorOutdoor`]}</p>}
            </div>
          </div>
          <div className="mb-4 text-left">
            <label htmlFor={`${prefix}VenueName`} className="block mb-1 font-medium text-gray-800">
              Venue Name <span className="text-red-500">*</span>
            </label>
            <Input
              id={`${prefix}VenueName`}
              value={venueState[`${prefix}VenueName` as keyof QuoteState] as string}
              onChange={(e) => handleInputChange(`${prefix}VenueName` as keyof QuoteState, e.target.value)}
              error={!!venueErrors[`${prefix}VenueName`]}
              placeholder={isCruiseShipVenue ? "Cruise Ship Name" : "Venue Name"}
              className="text-left w-full"
            />
            {venueErrors[`${prefix}VenueName`] && <p className="text-sm text-red-500 mt-1">{venueErrors[`${prefix}VenueName`]}</p>}
          </div>
          {isCruiseShipVenue ? (
            <>
              <div className="mb-4 text-left">
                <label htmlFor={`${prefix}VenueAddress1`} className="block mb-1 font-medium text-gray-800">Cruise Line <span className="text-red-500">*</span></label>
                <Input id={`${prefix}VenueAddress1`} value={venueState[`${prefix}VenueAddress1` as keyof QuoteState] as string} onChange={(e) => handleInputChange(`${prefix}VenueAddress1` as keyof QuoteState, e.target.value)} error={!!venueErrors[`${prefix}VenueAddress1`]} placeholder="e.g., Royal Caribbean" className="text-left w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                {venueErrors[`${prefix}VenueAddress1`] && <p className="text-sm text-red-500 mt-1">{venueErrors[`${prefix}VenueAddress1`]}</p>}
              </div>
              <div className="mb-4 text-left">
                <label htmlFor={`${prefix}VenueCity`} className="block mb-1 font-medium text-gray-800">Departure Port <span className="text-red-500">*</span></label>
                <Input id={`${prefix}VenueCity`} value={venueState[`${prefix}VenueCity` as keyof QuoteState] as string} onChange={(e) => handleInputChange(`${prefix}VenueCity` as keyof QuoteState, e.target.value)} error={!!venueErrors[`${prefix}VenueCity`]} placeholder="e.g., Miami, Florida" className="text-left w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                {venueErrors[`${prefix}VenueCity`] && <p className="text-sm text-red-500 mt-1">{venueErrors[`${prefix}VenueCity`]}</p>}
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div className="mb-4 text-left"><label htmlFor={`${prefix}VenueAddress1`} className="block mb-1 font-medium text-gray-800">Address Line 1 <span className="text-red-500">*</span></label><Input id={`${prefix}VenueAddress1`} value={venueState[`${prefix}VenueAddress1` as keyof QuoteState] as string} onChange={(e) => handleInputChange(`${prefix}VenueAddress1` as keyof QuoteState, e.target.value)} error={!!venueErrors[`${prefix}VenueAddress1`]} placeholder="Street Address" className="text-left w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />{venueErrors[`${prefix}VenueAddress1`] && <p className="text-sm text-red-500 mt-1">{venueErrors[`${prefix}VenueAddress1`]}</p>}</div>
                <div className="mb-4 text-left"><label htmlFor={`${prefix}VenueAddress2`} className="block mb-1 font-medium text-gray-800">Address Line 2</label><Input id={`${prefix}VenueAddress2`} value={venueState[`${prefix}VenueAddress2` as keyof QuoteState] as string} onChange={(e) => handleInputChange(`${prefix}VenueAddress2` as keyof QuoteState, e.target.value)} placeholder="Apt, Suite, Building (optional)" className="text-left w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div className="mb-4 text-left"><label htmlFor={`${prefix}VenueCountry`} className="block mb-1 font-medium text-gray-800">Country <span className="text-red-500">*</span></label><div className="relative w-full"><select id={`${prefix}VenueCountry`} value={venueState[`${prefix}VenueCountry` as keyof QuoteState] as string} onChange={(e) => handleInputChange(`${prefix}VenueCountry` as keyof QuoteState, e.target.value)} className={`block w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${venueErrors[`${prefix}VenueCountry`] ? "border-red-500 text-red-900" : "border-gray-300 text-gray-900"} text-left`}><option value="">Select country</option>{COUNTRIES.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}</select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} /></div>{venueErrors[`${prefix}VenueCountry`] && <p className="text-sm text-red-500 mt-1">{venueErrors[`${prefix}VenueCountry`]}</p>}</div>
                <div className="mb-4 text-left"><label htmlFor={`${prefix}VenueCity`} className="block mb-1 font-medium text-gray-800">City <span className="text-red-500">*</span></label><Input id={`${prefix}VenueCity`} value={venueState[`${prefix}VenueCity` as keyof QuoteState] as string} onChange={(e) => handleInputChange(`${prefix}VenueCity` as keyof QuoteState, e.target.value)} error={!!venueErrors[`${prefix}VenueCity`]} className="text-left w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />{venueErrors[`${prefix}VenueCity`] && <p className="text-sm text-red-500 mt-1">{venueErrors[`${prefix}VenueCity`]}</p>}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div className="mb-4 text-left"><label htmlFor={`${prefix}VenueState`} className="block mb-1 font-medium text-gray-800">State <span className="text-red-500">*</span></label><div className="relative w-full"><select id={`${prefix}VenueState`} value={venueState[`${prefix}VenueState` as keyof QuoteState] as string} onChange={(e) => handleInputChange(`${prefix}VenueState` as keyof QuoteState, e.target.value)} className={`block w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${venueErrors[`${prefix}VenueState`] ? "border-red-500 text-red-900" : "border-gray-300 text-gray-900"} text-left`}><option value="">Select state</option>{US_STATES.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}</select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} /></div>{venueErrors[`${prefix}VenueState`] && <p className="text-sm text-red-500 mt-1">{venueErrors[`${prefix}VenueState`]}</p>}</div>
                <div className="mb-4 text-left"><label htmlFor={`${prefix}VenueZip`} className="block mb-1 font-medium text-gray-800">ZIP Code <span className="text-red-500">*</span></label><Input id={`${prefix}VenueZip`} value={venueState[`${prefix}VenueZip` as keyof QuoteState] as string} onChange={(e) => handleInputChange(`${prefix}VenueZip` as keyof QuoteState, e.target.value)} error={!!venueErrors[`${prefix}VenueZip`]} className="text-left w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />{venueErrors[`${prefix}VenueZip`] && <p className="text-sm text-red-500 mt-1">{venueErrors[`${prefix}VenueZip`]}</p>}</div>
              </div>
            </>
          )}
          <div className="mb-4 text-left">
            <Checkbox
              id={`${prefix}VenueAsInsured`}
              label={<span className="font-medium text-left">Add this venue as an Additional Insured on my policy</span>}
              checked={venueState[`${prefix}VenueAsInsured` as keyof QuoteState] as boolean}
              onChange={(checked) => handleInputChange(`${prefix}VenueAsInsured` as keyof QuoteState, checked)}
            />
          </div>
        </div>
      </div>
    );
  };

  const isCruiseShip = state.ceremonyLocationType === "cruise_ship";

  if (!isMounted) {
    return <EventInformationSkeleton />;
  }

  if (!state.step1Complete) {
    return <EventInformationSkeleton />;
  }

  return (
    <>
      <div className="w-full pb-12">
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
              <h3 className="font-bold text-gray-700 mb-4 text-left text-lg">
                Honoree #1
              </h3>
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
                    onChange={(e) =>
                      handleInputChange("honoree1FirstName", e.target.value)
                    }
                    error={!!errors.honoree1FirstName}
                    placeholder="John"
                    className="text-left w-full"
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
                    onChange={(e) =>
                      handleInputChange("honoree1LastName", e.target.value)
                    }
                    error={!!errors.honoree1LastName}
                    placeholder="Doe"
                    className="text-left w-full"
                  />
                </div>
                {errors.honoree1LastName && (
                  <p className="text-sm text-red-500 mt-1">{errors.honoree1LastName}</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-left text-gray-700 mb-4 text-lg">
                Honoree #2{" "}
                <span className="text-semibold text-sm text-gray-400">
                  (if applicable)
                </span>
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
                    onChange={(e) =>
                      handleInputChange("honoree2FirstName", e.target.value)
                    }
                    placeholder="John"
                    className="text-left w-full"
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
                    onChange={(e) =>
                      handleInputChange("honoree2LastName", e.target.value)
                    }
                    placeholder="Doe"
                    className="text-left w-full"
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
                    onChange={(e) =>
                      handleInputChange("ceremonyLocationType", e.target.value)
                    }
                    className={`block w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.ceremonyLocationType
                      ? "border-red-500 text-red-900"
                      : "border-gray-300 text-gray-900"
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
                <label
                  htmlFor="indoorOutdoor"
                  className="block mb-1 font-medium text-gray-800"
                >
                  Indoor/Outdoor <span className="text-red-500">*</span>
                </label>
                <div className="relative w-full">
                  <select
                    id="indoorOutdoor"
                    value={state.indoorOutdoor}
                    onChange={(e) =>
                      handleInputChange("indoorOutdoor", e.target.value)
                    }
                    className={`block w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.indoorOutdoor
                      ? "border-red-500 text-red-900"
                      : "border-gray-300 text-gray-900"
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
              <label
                htmlFor="venueName"
                className="block mb-1 font-medium text-gray-800"
              >
                Venue Name <span className="text-red-500">*</span>
              </label>
              <div className="w-full flex justify-start">
                <Input
                  id="venueName"
                  value={state.venueName}
                  onChange={(e) =>
                    handleInputChange("venueName", e.target.value)
                  }
                  error={!!errors.venueName}
                  placeholder={isCruiseShip ? "Cruise Ship Name" : "Venue Name"}
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
                  <label
                    htmlFor="venueAddress1"
                    className="block mb-1 font-medium text-gray-800"
                  >
                    Cruise Line <span className="text-red-500">*</span>
                  </label>
                  <div className="w-full">
                    <Input
                      id="venueAddress1"
                      value={state.venueAddress1}
                      onChange={(e) =>
                        handleInputChange("venueAddress1", e.target.value)
                      }
                      error={!!errors.venueAddress1}
                      placeholder="e.g., Royal Caribbean"
                      className="text-left w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  {errors.venueAddress1 && (
                    <p className="text-sm text-red-500 mt-1">{errors.venueAddress1}</p>
                  )}
                </div>
                <div className="mb-4 text-left">
                  <label
                    htmlFor="venueCity"
                    className="block mb-1 font-medium text-gray-800"
                  >
                    Departure Port <span className="text-red-500">*</span>
                  </label>
                  <div className="w-full">
                    <Input
                      id="venueCity"
                      value={state.venueCity}
                      onChange={(e) =>
                        handleInputChange("venueCity", e.target.value)
                      }
                      error={!!errors.venueCity}
                      placeholder="e.g., Miami, Florida"
                      className="text-left w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <label
                    htmlFor="venueAddress1"
                    className="block mb-1 font-medium text-gray-800"
                  >
                    Address Line 1 <span className="text-red-500">*</span>
                  </label>
                  <div className="w-full">
                    <Input
                      id="venueAddress1"
                      value={state.venueAddress1}
                      onChange={(e) =>
                        handleInputChange("venueAddress1", e.target.value)
                      }
                      error={!!errors.venueAddress1}
                      placeholder="Street Address"
                      className="text-left w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  {errors.venueAddress1 && (
                    <p className="text-sm text-red-500 mt-1">{errors.venueAddress1}</p>
                  )}
                </div>
                <div className="mb-4 text-left">
                  <label
                    htmlFor="venueAddress2"
                    className="block mb-1 font-medium text-gray-800"
                  >
                    Address Line 2
                  </label>
                  <div className="w-full">
                    <Input
                      id="venueAddress2"
                      value={state.venueAddress2}
                      onChange={(e) =>
                        handleInputChange("venueAddress2", e.target.value)
                      }
                      placeholder="Apt, Suite, Building (optional)"
                      className="text-left w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        onChange={(e) =>
                          handleInputChange("venueCountry", e.target.value)
                        }
                        className={`block w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.venueCountry
                          ? "border-red-500 text-red-900"
                          : "border-gray-300 text-gray-900"
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
                    <label
                      htmlFor="venueCity"
                      className="block mb-1 font-medium text-gray-800"
                    >
                      City <span className="text-red-500">*</span>
                    </label>
                    <div className="w-full">
                      <Input
                        id="venueCity"
                        value={state.venueCity}
                        onChange={(e) =>
                          handleInputChange("venueCity", e.target.value)
                        }
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
                    <label
                      htmlFor="venueState"
                      className="block mb-1 font-medium text-gray-800"
                    >
                      State <span className="text-red-500">*</span>
                    </label>
                    <div className="relative w-full">
                      <select
                        id="venueState"
                        value={state.venueState}
                        onChange={(e) =>
                          handleInputChange("venueState", e.target.value)
                        }
                        className={`block w-full rounded-md shadow-sm border pl-3 pr-10 py-2 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.venueState
                          ? "border-red-500 text-red-900"
                          : "border-gray-300 text-gray-900"
                          } text-left`}
                      >
                        <option value="">Select state</option>
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
                    {errors.venueState && (
                      <p className="text-sm text-red-500 mt-1">{errors.venueState}</p>
                    )}
                  </div>
                  <div className="mb-4 text-left">
                    <label
                      htmlFor="venueZip"
                      className="block mb-1 font-medium text-gray-800"
                    >
                      ZIP Code <span className="text-red-500">*</span>
                    </label>
                    <div className="w-full">
                      <Input
                        id="venueZip"
                        value={state.venueZip}
                        onChange={(e) =>
                          handleInputChange("venueZip", e.target.value)
                        }
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
                  onChange={(checked) =>
                    handleInputChange("venueAsInsured", checked)
                  }
                  className=""
                />
              </div>
            </div>
          </div>
        </div>

        {state.eventType === 'wedding' && (
          <>
            {/* Reception Venue Information */}
            {renderVenueSection('Reception Venue', 'reception', state, errors)}

            {/* Brunch Venue Information */}
            {/* Only render if name is provided, making it optional */}
            {renderVenueSection('Brunch Venue', 'brunch', state, errors)}

            {/* Rehearsal Venue Information */}
            {/* Only render if name is provided, making it optional */}
            {renderVenueSection('Rehearsal Venue', 'rehearsal', state, errors)}

            {/* Rehearsal Dinner Venue Information */}
            {/* Only render if name is provided, making it optional */}
            {renderVenueSection('Rehearsal Dinner Venue', 'rehearsalDinner', state, errors)}
          </>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center mt-10 gap-4 w-full">
          <Button
            variant="outline"
            onClick={handleBack}
            className="w-full sm:w-auto transition-transform duration-150 hover:scale-105"
          >
            Back to Quote
          </Button>
          <Button
            variant="primary"
            onClick={handleContinue}
            className="w-full sm:w-auto transition-transform duration-150 hover:scale-105"
          >
            Continue to Policyholder
          </Button>
        </div>
      </div>
      <div className="hidden lg:block fixed w-80 right-11 mr-2 top-[260px] z-10">
        <QuotePreview />
      </div>
    </>
  );
}