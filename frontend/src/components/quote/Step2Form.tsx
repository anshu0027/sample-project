/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { MapPin, CalendarCheck, ChevronDown, AlertCircle } from 'lucide-react';
// import Card from "@/components/ui/Card";
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
// import Select from "@/components/ui/Select";
import Checkbox from '@/components/ui/Checkbox';
import {
  VENUE_TYPES,
  INDOOR_OUTDOOR_OPTIONS,
  COUNTRIES,
  STATES_BY_COUNTRY,
} from '@/utils/constants';
import { isValidName } from '@/utils/validators';
// import { isValidZip } from '@/utils/validators';

// Define the shape of the state data Step2Form actually needs for displaying and editing fields.
// This is compatible with QuoteFormState from the edit page and a subset of QuoteState from context.
interface Step2FormData {
  eventType: string;
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
  receptionUseMainVenueAddress: boolean;

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
  brunchUseMainVenueAddress: boolean;

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
  rehearsalUseMainVenueAddress: boolean;

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
  rehearsalDinnerUseMainVenueAddress: boolean;
  // Ensure all fields accessed via state[keyof QuoteState] or state.fieldName are listed here
  // For example, if renderVenueSection dynamically creates keys like `${prefix}VenueName`,
  // those effective keys need to be part of this interface if type safety is desired for them.
  // The current implementation of renderVenueSection uses direct prop names, which is fine.
}

// ------------------------
// Type definition for the props of Step2Form component
// ------------------------
type Step2FormProps = {
  state: Step2FormData; // The current state of the quote form, specific to Step 2 data fields
  errors: Record<string, string | undefined>; // Object containing validation errors for form fields
  onChange: (field: string, value: any) => void; // Callback function to handle field changes
  onValidate?: () => void; // Optional callback for form validation
  onContinue?: () => void; // Optional callback to proceed to the next step
  onSave?: () => void; // Optional callback to save the form data
  isRestored?: boolean; // Flag indicating if the form data is restored from a previous session
};

// ------------------------
// Step2Form component: Handles the second step of the quote generation process.
// It collects information about honorees and event venues.
// ------------------------
export default function Step2Form({
  state,
  errors,
  onChange,
  // onValidate,
  onContinue,
  // onSave,
  isRestored = false,
}: Step2FormProps) {
  // ------------------------
  // Determine if the ceremony location is a cruise ship.
  // This affects which fields are displayed for venue details.
  // ------------------------
  const isCruiseShip = state.ceremonyLocationType === 'cruise_ship';
  // ------------------------
  // Determine if the event type is a wedding.
  // This affects whether additional venue sections (reception, brunch, etc.) are displayed.
  // ------------------------
  const isWedding = state.eventType === 'wedding';

  const handleInputChange = (
    field: keyof Step2FormData,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    onChange(field, e.target.value);
  };

  const handleSelectChange = (
    field: keyof Step2FormData,
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    onChange(field, e.target.value);
  };

  const handleCheckboxChange = (field: keyof Step2FormData, checked: boolean) => {
    onChange(field, checked);
  };

  const handleZipKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

    // Allow only digits (no hyphens, no alphabets)
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }

    // Limit to 5 digits maximum
    const target = e.target as HTMLInputElement;
    if (target.value.length >= 5 && !['Backspace', 'Delete'].includes(e.key)) {
      e.preventDefault();
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

  // ------------------------
  // Reusable function to render a venue information section.
  // This helps to avoid repetitive code for different venue types (ceremony, reception, etc.).
  // Parameters:
  // - title: The title of the venue section.
  // - nameField, address1Field, etc.: Keys of the QuoteState for the respective venue fields.
  // - asInsuredField: Key of the QuoteState for the "add as additional insured" checkbox.
  // - useMainVenueAddressField: Key of the QuoteState for the "use main venue address" checkbox.
  // ------------------------
  const renderVenueSection = (
    title: string,
    nameField: keyof Step2FormData,
    address1Field: keyof Step2FormData,
    address2Field: keyof Step2FormData,
    countryField: keyof Step2FormData,
    cityField: keyof Step2FormData,
    stateField: keyof Step2FormData,
    zipField: keyof Step2FormData,
    asInsuredField: keyof Step2FormData,
    locationTypeField: keyof Step2FormData,
    indoorOutdoorField: keyof Step2FormData,
    useMainVenueAddressField: keyof Step2FormData,
  ) => {
    const selectedCountry = state[countryField] as string;
    const statesForCountry = STATES_BY_COUNTRY[selectedCountry] || [];
    const isCruiseShipVenue = state[locationTypeField] === 'cruise_ship';
    const useMainVenueAddress = state[useMainVenueAddressField] as boolean;

    const validateZip = (zip: string) => {
      if (!zip) return undefined; // Don't show error for empty field
      if (zip.length < 4) return 'ZIP code must be 4 or 5 digits';
      if (zip.length > 5) return 'ZIP code must be 4 or 5 digits';
      if (!/^\d{4,5}$/.test(zip)) return 'ZIP code must contain only digits';
      return undefined;
    };

    const zipError = validateZip(state[zipField] as string) || errors[zipField];

    return (
      <div className="mb-8 shadow-lg border-0 text-left bg-white p-8 sm:p-10 md:p-12 rounded-2xl w-full max-w-4xl mx-auto">
        <div className="flex mb-4 gap-4">
          <div className="flex-shrink-0">
            <MapPin size={28} className="text-blue-600" />
          </div>
          <div>
            <div className="text-xl md:text-2xl font-extrabold leading-tight mb-1">{title}</div>
            <div className="text-base text-gray-500 font-medium leading-tight">
              Details about where this portion of your event will be held
            </div>
          </div>
        </div>
        <div className="space-y-8 w-full px-2 sm:px-4 md:px-2">
          {/* Add checkbox for using main venue address if eventType is 'wedding' */}
          {state.eventType === 'wedding' && (
            <div className="mb-4">
              <Checkbox
                id={`${String(nameField)}UseMainVenueAddress`}
                label="Use main venue address for this venue"
                checked={useMainVenueAddress}
                onChange={(checked) => {
                  onChange(String(useMainVenueAddressField), checked);
                  if (checked) {
                    // Copy all main venue fields to the current venue
                    onChange(String(locationTypeField), state.ceremonyLocationType);
                    onChange(String(indoorOutdoorField), state.indoorOutdoor);
                    onChange(String(nameField), state.venueName);
                    onChange(String(address1Field), state.venueAddress1);
                    onChange(String(address2Field), state.venueAddress2);
                    onChange(String(countryField), state.venueCountry);
                    onChange(String(cityField), state.venueCity);
                    onChange(String(stateField), state.venueState);
                    onChange(String(zipField), state.venueZip);
                    onChange(String(asInsuredField), state.venueAsInsured);
                  }
                }}
                className="mb-4"
              />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {/* Venue Type */}
            <div className="space-y-2">
              <label
                htmlFor={String(locationTypeField)}
                className="block text-sm font-medium text-gray-700"
              >
                Venue Type {isWedding && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <select
                  id={String(locationTypeField)}
                  value={state[locationTypeField] as string}
                  onChange={(e) => handleSelectChange(locationTypeField, e)}
                  disabled={useMainVenueAddress}
                  className={`w-full px-3 py-2 border rounded-xl appearance-none pr-10 ${errors[locationTypeField] ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="">Select venue type</option>
                  {VENUE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              {errors[locationTypeField] && (
                <p className="text-sm text-red-500">{errors[locationTypeField]}</p>
              )}
            </div>
            {/* Indoor/Outdoor */}
            <div className="space-y-2">
              <label
                htmlFor={String(indoorOutdoorField)}
                className="block text-sm font-medium text-gray-700"
              >
                Indoor/Outdoor {isWedding && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <select
                  id={String(indoorOutdoorField)}
                  value={state[indoorOutdoorField] as string}
                  onChange={(e) => handleSelectChange(indoorOutdoorField, e)}
                  disabled={useMainVenueAddress}
                  className={`w-full px-3 py-2 border rounded-xl appearance-none pr-10 ${errors[indoorOutdoorField] ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="">Select option</option>
                  {INDOOR_OUTDOOR_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              {errors[indoorOutdoorField] && (
                <p className="text-sm text-red-500">{errors[indoorOutdoorField]}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor={String(nameField)} className="block text-sm font-medium text-gray-700">
              Venue Name {isWedding && <span className="text-red-500">*</span>}
            </label>
            <Input
              id={String(nameField)}
              value={state[nameField] as string}
              onChange={(e) => handleInputChange(nameField, e)}
              placeholder={isCruiseShipVenue ? 'Cruise Ship Name' : 'Venue Name'}
              className={`w-full ${errors[nameField] ? 'border-red-500' : ''}`}
              disabled={useMainVenueAddress}
            />
            {errors[nameField] && <p className="text-sm text-red-500">{errors[nameField]}</p>}
          </div>

          {isCruiseShipVenue ? (
            // Cruise ship specific fields
            <>
              <div className="flex gap-4">
                <div className="space-y-2 flex-1">
                  <label
                    htmlFor={String(address1Field)}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Cruise Line Name *
                  </label>
                  <Input
                    id={String(address1Field)}
                    value={state[address1Field] as string}
                    onChange={(e) => handleInputChange(address1Field, e)}
                    placeholder="e.g., Royal Caribbean"
                    className={`w-full ${errors[address1Field] ? 'border-red-500' : ''}`}
                  />
                  {errors[address1Field] && (
                    <p className="text-sm text-red-500">{errors[address1Field]}</p>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <label
                    htmlFor={String(cityField)}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Departure Port / City *
                  </label>
                  <Input
                    id={String(cityField)}
                    value={state[cityField] as string}
                    onChange={(e) => handleInputChange(cityField, e)}
                    placeholder="e.g., Miami, Florida"
                    className={`w-full ${errors[cityField] ? 'border-red-500' : ''}`}
                  />
                  {errors[cityField] && <p className="text-sm text-red-500">{errors[cityField]}</p>}
                </div>
              </div>
            </>
          ) : (
            // Land venue fields
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div className="mb-4 text-left">
                  <label htmlFor={address1Field} className="block mb-1 font-medium text-gray-800">
                    Address Line 1
                  </label>
                  <div className="w-full">
                    <Input
                      id={address1Field}
                      value={state[address1Field] as string}
                      onChange={(e) => handleInputChange(address1Field, e)}
                      error={!!errors[address1Field]}
                      placeholder="Street Address"
                      className="text-left w-full"
                      disabled={useMainVenueAddress}
                    />
                  </div>
                  {errors[address1Field] && (
                    <p className="text-sm text-red-500 mt-1">{errors[address1Field]}</p>
                  )}
                </div>
                <div className="mb-4 text-left">
                  <label htmlFor={address2Field} className="block mb-1 font-medium text-gray-800">
                    Address Line 2
                  </label>
                  <div className="w-full">
                    <Input
                      id={address2Field}
                      value={state[address2Field] as string}
                      onChange={(e) => handleInputChange(address2Field, e)}
                      placeholder="Apt, Suite, Building (optional)"
                      className="text-left w-full"
                      disabled={useMainVenueAddress}
                    />
                  </div>
                </div>
              </div>
              <div className="mb-4 text-left flex gap-4">
                <div className="flex-1">
                  <label htmlFor={cityField} className="block mb-1 font-medium text-gray-800">
                    City
                  </label>
                  <div className="w-full">
                    <Input
                      id={cityField}
                      value={state[cityField] as string}
                      onChange={(e) => handleInputChange(cityField, e)}
                      error={!!errors[cityField]}
                      className="text-left w-full"
                      disabled={useMainVenueAddress}
                    />
                  </div>
                  {errors[cityField] && (
                    <p className="text-sm text-red-500 mt-1">{errors[cityField]}</p>
                  )}
                </div>
                <div className="flex-1">
                  <label htmlFor={countryField} className="block mb-1 font-medium text-gray-800">
                    Country
                  </label>
                  <div className="relative w-full">
                    <select
                      id={countryField}
                      value={state[countryField] as string}
                      onChange={(e) => handleSelectChange(countryField, e)}
                      className={`block w-full rounded-md shadow-sm pl-3 pr-10 py-2 text-base border appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[countryField] ? 'border-red-500 text-red-900' : 'border-gray-300 text-gray-900'} text-left`}
                      disabled={useMainVenueAddress}
                    >
                      <option value="">Select country</option>
                      {COUNTRIES.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {errors[countryField] && (
                    <p className="text-sm text-red-500 mt-1">{errors[countryField]}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div className="mb-4 text-left">
                  <label htmlFor={stateField} className="block mb-1 font-medium text-gray-800">
                    State
                  </label>
                  <div className="relative w-full">
                    <select
                      id={stateField}
                      value={state[stateField] as string}
                      onChange={(e) => handleSelectChange(stateField, e)}
                      disabled={!selectedCountry || useMainVenueAddress}
                      className={`block w-full rounded-md shadow-sm pl-3 pr-10 py-2 text-base border appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[stateField] ? 'border-red-500 text-red-900' : 'border-gray-300 text-gray-900'} text-left`}
                    >
                      <option value="">Select state</option>
                      {statesForCountry.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {errors[stateField] && (
                    <p className="text-sm text-red-500 mt-1">{errors[stateField]}</p>
                  )}
                </div>
                <div className="mb-4 text-left">
                  <label htmlFor={zipField} className="block mb-1 font-medium text-gray-800">
                    ZIP Code
                  </label>
                  <div className="w-full">
                    <Input
                      id={zipField}
                      value={state[zipField] as string}
                      onChange={(e) => handleInputChange(zipField, e)}
                      onKeyDown={handleZipKeyDown}
                      error={!!zipError}
                      className="text-left w-full"
                      disabled={useMainVenueAddress}
                    />
                  </div>
                  {zipError && <p className="text-sm text-red-500 mt-1">{zipError}</p>}
                </div>
              </div>
            </>
          )}

          <div className="mb-4 text-left">
            <Checkbox
              id={String(asInsuredField)}
              label="Add this venue as an Additional Insured on my policy"
              checked={state[asInsuredField] as boolean}
              onChange={(checked) => handleCheckboxChange(asInsuredField, checked)}
            />
          </div>
        </div>
      </div>
    );
  };

  const ceremonyZipError = (() => {
    const zip = state.venueZip;
    if (!zip) return errors.venueZip; // Don't show error for empty field
    if (zip.length < 4) return 'ZIP code must be 4 or 5 digits';
    if (zip.length > 5) return 'ZIP code must be 4 or 5 digits';
    if (!/^\d{4,5}$/.test(zip)) return 'ZIP code must contain only digits';
    return errors.venueZip;
  })();

  // Name validation
  const honoree1FirstNameError = (() => {
    if (!state.honoree1FirstName) return errors.honoree1FirstName;
    if (!isValidName(state.honoree1FirstName))
      return 'First name must contain only letters and spaces';
    return errors.honoree1FirstName;
  })();

  const honoree1LastNameError = (() => {
    if (!state.honoree1LastName) return errors.honoree1LastName;
    if (!isValidName(state.honoree1LastName))
      return 'Last name must contain only letters and spaces';
    return errors.honoree1LastName;
  })();

  const honoree2FirstNameError = (() => {
    if (!state.honoree2FirstName) return errors.honoree2FirstName;
    if (!isValidName(state.honoree2FirstName))
      return 'First name must contain only letters and spaces';
    return errors.honoree2FirstName;
  })();

  const honoree2LastNameError = (() => {
    if (!state.honoree2LastName) return errors.honoree2LastName;
    if (!isValidName(state.honoree2LastName))
      return 'Last name must contain only letters and spaces';
    return errors.honoree2LastName;
  })();

  return (
    <>
      {isRestored && (
        // ------------------------
        // Restored Form Notification
        // Displays a message if the form data was restored from a previous session.
        // ------------------------
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center text-blue-800">
            <AlertCircle size={20} className="mr-2" />
            <span className="font-medium">
              This form has been restored from a previous version. Review the changes before saving.
            </span>
          </div>
        </div>
      )}
      {/* ------------------------ */}
      {/* Honoree Information Section */}
      {/* Collects names of the honorees for the event. */}
      {/* ------------------------ */}
      <div className="mb-10 shadow-2xl border-0 bg-white/90 p-8 sm:p-10 md:p-12 rounded-2xl w-full max-w-4xl mx-auto">
        {/* ------------------------ */}
        {/* Section Header */}
        {/* ------------------------ */}
        <div className="flex mb-4 gap-4">
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
        {/* ------------------------ */}
        {/* Honoree Fields (Honoree 1 and Honoree 2) */}
        {/* ------------------------ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* ------------------------ */}
          {/* Honoree #1 Fields */}
          {/* ------------------------ */}
          <div>
            <h3 className="font-bold text-gray-700 mb-4 text-left text-lg">Honoree #1</h3>
            <div className="space-y-4">
              {/* Honoree 1 First Name */}
              <div className="space-y-2 w-full">
                <label
                  htmlFor="honoree1FirstName"
                  className="block text-sm font-medium text-gray-700"
                >
                  First Name *
                </label>
                <Input
                  id="honoree1FirstName"
                  value={state.honoree1FirstName}
                  onChange={(e) => onChange('honoree1FirstName', e.target.value)}
                  onKeyDown={handleNameKeyDown}
                  className={`w-full ${honoree1FirstNameError ? 'border-red-500' : ''}`}
                />
                {honoree1FirstNameError && (
                  <p className="text-sm text-red-500">{honoree1FirstNameError}</p>
                )}
              </div>
              {/* Honoree 1 Last Name */}
              <div className="space-y-2 w-full">
                <label
                  htmlFor="honoree1LastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Name *
                </label>
                <Input
                  id="honoree1LastName"
                  value={state.honoree1LastName}
                  onChange={(e) => onChange('honoree1LastName', e.target.value)}
                  onKeyDown={handleNameKeyDown}
                  className={`w-full ${honoree1LastNameError ? 'border-red-500' : ''}`}
                />
                {honoree1LastNameError && (
                  <p className="text-sm text-red-500">{honoree1LastNameError}</p>
                )}
              </div>
            </div>
          </div>
          {/* ------------------------ */}
          {/* Honoree #2 Fields (Optional) */}
          {/* ------------------------ */}
          <div>
            <h3 className="font-bold text-left text-gray-700 mb-4 text-lg">
              Honoree #2{' '}
              <span className="text-semibold text-sm text-gray-400">(if applicable)</span>
            </h3>
            <div className="space-y-4">
              {/* Honoree 2 First Name */}
              <div className="space-y-2">
                <label
                  htmlFor="honoree2FirstName"
                  className="block text-sm font-medium text-gray-700"
                >
                  First Name
                </label>
                <Input
                  id="honoree2FirstName"
                  value={state.honoree2FirstName}
                  onChange={(e) => onChange('honoree2FirstName', e.target.value)}
                  onKeyDown={handleNameKeyDown}
                  placeholder="John"
                  className={`w-full ${honoree2FirstNameError ? 'border-red-500' : ''}`}
                />
                {honoree2FirstNameError && (
                  <p className="text-sm text-red-500">{honoree2FirstNameError}</p>
                )}
              </div>
              {/* Honoree 2 Last Name */}
              <div className="space-y-2">
                <label
                  htmlFor="honoree2LastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>
                <Input
                  id="honoree2LastName"
                  value={state.honoree2LastName}
                  onChange={(e) => onChange('honoree2LastName', e.target.value)}
                  onKeyDown={handleNameKeyDown}
                  placeholder="Doe"
                  className={`w-full ${honoree2LastNameError ? 'border-red-500' : ''}`}
                />
                {honoree2LastNameError && (
                  <p className="text-sm text-red-500">{honoree2LastNameError}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------ */}
      {/* Ceremony Venue Information Section */}
      {/* Collects details about the main event/ceremony venue. */}
      {/* ------------------------ */}
      <div className="mb-8 shadow-lg border-0 bg-white p-8 sm:p-10 md:p-12 rounded-2xl w-full max-w-4xl mx-auto">
        {/* ------------------------ */}
        {/* Section Header */}
        {/* ------------------------ */}
        <div className="flex mb-4 gap-4">
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
        {/* ------------------------ */}
        {/* Ceremony Venue Fields */}
        {/* ------------------------ */}
        <div className="space-y-8 w-full px-2 sm:px-4 md:px-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {/* ------------------------ */}
            {/* Venue Type Field */}
            {/* ------------------------ */}
            <div className="space-y-2">
              <label
                htmlFor="ceremonyLocationType"
                className="block text-sm font-medium text-gray-700"
              >
                Venue Type *
              </label>
              <div className="relative">
                <select
                  id="ceremonyLocationType"
                  value={state.ceremonyLocationType}
                  onChange={(e) => onChange('ceremonyLocationType', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl appearance-none pr-10 ${
                    errors.ceremonyLocationType ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="">Select venue type</option>
                  {VENUE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              {errors.ceremonyLocationType && (
                <p className="text-sm text-red-500">{errors.ceremonyLocationType}</p>
              )}
            </div>

            {/* ------------------------ */}
            {/* Indoor/Outdoor Field */}
            {/* ------------------------ */}
            <div className="space-y-2">
              <label htmlFor="indoorOutdoor" className="block text-sm font-medium text-gray-700">
                Indoor/Outdoor *
              </label>
              <div className="relative">
                <select
                  id="indoorOutdoor"
                  value={state.indoorOutdoor}
                  onChange={(e) => onChange('indoorOutdoor', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl appearance-none pr-10 ${
                    errors.indoorOutdoor ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="">Select option</option>
                  {INDOOR_OUTDOOR_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              {errors.indoorOutdoor && (
                <p className="text-sm text-red-500">{errors.indoorOutdoor}</p>
              )}
            </div>
          </div>

          {/* ------------------------ */}
          {/* Venue Name Field (Label changes if it's a cruise ship) */}
          {/* ------------------------ */}
          <div className="space-y-2">
            <label htmlFor="venueName" className="block text-sm font-medium text-gray-700">
              {`Venue Name${isCruiseShip ? '' : ' *'}`}
            </label>
            <Input
              id="venueName"
              value={state.venueName}
              onChange={(e) => onChange('venueName', e.target.value)}
              placeholder={isCruiseShip ? 'Cruise Ship Name' : 'Venue Name'}
              className={`w-full ${errors.venueName ? 'border-red-500' : ''}`}
            />
            {errors.venueName && <p className="text-sm text-red-500">{errors.venueName}</p>}
          </div>

          {/* ------------------------ */}
          {/* Conditional Fields for Cruise Ship vs. Land Venue */}
          {/* ------------------------ */}
          {isCruiseShip ? (
            // ------------------------
            // Fields specific to Cruise Ship venues
            // ------------------------
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {/* Cruise Line Name */}
              <div className="space-y-2">
                <label htmlFor="venueAddress1" className="block text-sm font-medium text-gray-700">
                  Cruise Line Name *
                </label>
                <Input
                  id="venueAddress1"
                  value={state.venueAddress1} // Note: Reusing venueAddress1 for Cruise Line Name
                  onChange={(e) => onChange('venueAddress1', e.target.value)}
                  placeholder="e.g., Royal Caribbean"
                  className={`w-full ${errors.venueAddress1 ? 'border-red-500' : ''}`}
                />
                {errors.venueAddress1 && (
                  <p className="text-sm text-red-500">{errors.venueAddress1}</p>
                )}
              </div>
              {/* Departure Port / City */}
              <div className="space-y-2">
                <label htmlFor="venueCity" className="block text-sm font-medium text-gray-700">
                  Departure Port / City *
                </label>
                <Input
                  id="venueCity"
                  value={state.venueCity} // Note: Reusing venueCity for Departure Port
                  onChange={(e) => onChange('venueCity', e.target.value)}
                  placeholder="e.g., Miami, Florida"
                  className={`w-full ${errors.venueCity ? 'border-red-500' : ''}`}
                />
                {errors.venueCity && <p className="text-sm text-red-500">{errors.venueCity}</p>}
              </div>
            </div>
          ) : (
            // ------------------------
            // Fields specific to Land-based venues
            // ------------------------
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {/* Address Line 1 */}
              <div className="space-y-2">
                <label htmlFor="venueAddress1" className="block text-sm font-medium text-gray-700">
                  Address Line 1 *
                </label>
                <Input
                  id="venueAddress1"
                  value={state.venueAddress1}
                  onChange={(e) => onChange('venueAddress1', e.target.value)}
                  placeholder="Street Address"
                  className={`w-full ${errors.venueAddress1 ? 'border-red-500' : ''}`}
                />
                {errors.venueAddress1 && (
                  <p className="text-sm text-red-500">{errors.venueAddress1}</p>
                )}
              </div>
              {/* Address Line 2 */}
              <div className="space-y-2">
                <label htmlFor="venueAddress2" className="block text-sm font-medium text-gray-700">
                  Address Line 2
                </label>
                <Input
                  id="venueAddress2"
                  value={state.venueAddress2}
                  onChange={(e) => onChange('venueAddress2', e.target.value)}
                  placeholder="Apt, Suite, Building (optional)"
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* ------------------------ */}
          {/* Address Fields (Country, City, State, Zip) - Not shown for cruise ships */}
          {/* ------------------------ */}
          {!isCruiseShip && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {/* Country */}
                <div className="space-y-2">
                  <label htmlFor="venueCountry" className="block text-sm font-medium text-gray-700">
                    Country *
                  </label>
                  <div className="relative">
                    <select
                      id="venueCountry"
                      value={state.venueCountry}
                      onChange={(e) => {
                        onChange('venueCountry', e.target.value);
                        // Reset state when country changes
                        onChange('venueState', '');
                      }}
                      className={`w-full px-3 py-2 border rounded-xl appearance-none pr-10 ${
                        errors.venueCountry ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    >
                      <option value="">Select country</option>
                      {COUNTRIES.map((country) => (
                        <option key={country.value} value={country.value}>
                          {country.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.venueCountry && (
                    <p className="text-sm text-red-500">{errors.venueCountry}</p>
                  )}
                </div>
                {/* City */}
                <div className="space-y-2">
                  <label htmlFor="venueCity" className="block text-sm font-medium text-gray-700">
                    City *
                  </label>
                  <Input
                    id="venueCity"
                    value={state.venueCity}
                    onChange={(e) => onChange('venueCity', e.target.value)}
                    className={`w-full ${errors.venueCity ? 'border-red-500' : ''}`}
                  />
                  {errors.venueCity && <p className="text-sm text-red-500">{errors.venueCity}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {/* State */}
                <div className="space-y-2">
                  <label htmlFor="venueState" className="block text-sm font-medium text-gray-700">
                    State *
                  </label>
                  <div className="relative">
                    <select
                      id="venueState"
                      value={state.venueState}
                      onChange={(e) => onChange('venueState', e.target.value)}
                      disabled={!state.venueCountry}
                      className={`w-full px-3 py-2 border rounded-xl appearance-none pr-10 ${
                        errors.venueState ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100`}
                    >
                      <option value="">Select state</option>
                      {(STATES_BY_COUNTRY[state.venueCountry] || []).map((state) => (
                        <option key={state.value} value={state.value}>
                          {state.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.venueState && <p className="text-sm text-red-500">{errors.venueState}</p>}
                </div>
                {/* ZIP Code */}
                <div className="space-y-2">
                  <label htmlFor="venueZip" className="block text-sm font-medium text-gray-700">
                    ZIP Code *
                  </label>
                  <Input
                    id="venueZip"
                    value={state.venueZip}
                    onKeyDown={handleZipKeyDown}
                    onChange={(e) => onChange('venueZip', e.target.value)}
                    className={`w-full ${ceremonyZipError ? 'border-red-500' : ''}`}
                    error={!!ceremonyZipError}
                  />
                  {ceremonyZipError && <p className="text-sm text-red-500">{ceremonyZipError}</p>}
                </div>
              </div>
            </>
          )}

          {/* ------------------------ */}
          {/* Add Ceremony Venue as Additional Insured Checkbox */}
          {/* ------------------------ */}
          <div className="mb-4 text-left">
            <Checkbox
              id="venueAsInsured"
              label="Add this venue as an Additional Insured on my policy"
              checked={state.venueAsInsured}
              onChange={(checked) => onChange('venueAsInsured', checked)}
            />
          </div>
        </div>
      </div>

      {/* ------------------------ */}
      {/* Additional Venue Sections for Weddings */}
      {/* These sections (Reception, Brunch, Rehearsal, Rehearsal Dinner) are only shown if eventType is 'wedding'. */}
      {/* They reuse the `renderVenueSection` function. */}
      {/* ------------------------ */}
      {isWedding && (
        <>
          {/* ------------------------ */}
          {/* Reception Venue Section */}
          {/* ------------------------ */}
          {renderVenueSection(
            'Reception Venue Information',
            'receptionVenueName',
            'receptionVenueAddress1',
            'receptionVenueAddress2',
            'receptionVenueCountry',
            'receptionVenueCity',
            'receptionVenueState',
            'receptionVenueZip',
            'receptionVenueAsInsured',
            'receptionLocationType',
            'receptionIndoorOutdoor',
            'receptionUseMainVenueAddress',
          )}

          {/* ------------------------ */}
          {/* Brunch Venue Section */}
          {/* ------------------------ */}
          {renderVenueSection(
            'Brunch Venue Information',
            'brunchVenueName',
            'brunchVenueAddress1',
            'brunchVenueAddress2',
            'brunchVenueCountry',
            'brunchVenueCity',
            'brunchVenueState',
            'brunchVenueZip',
            'brunchVenueAsInsured',
            'brunchLocationType',
            'brunchIndoorOutdoor',
            'brunchUseMainVenueAddress',
          )}

          {/* ------------------------ */}
          {/* Rehearsal Venue Section */}
          {/* ------------------------ */}
          {renderVenueSection(
            'Rehearsal Venue Information',
            'rehearsalVenueName',
            'rehearsalVenueAddress1',
            'rehearsalVenueAddress2',
            'rehearsalVenueCountry',
            'rehearsalVenueCity',
            'rehearsalVenueState',
            'rehearsalVenueZip',
            'rehearsalVenueAsInsured',
            'rehearsalLocationType',
            'rehearsalIndoorOutdoor',
            'rehearsalUseMainVenueAddress',
          )}

          {/* ------------------------ */}
          {/* Rehearsal Dinner Venue Section */}
          {/* ------------------------ */}
          {renderVenueSection(
            'Rehearsal Dinner Venue Information',
            'rehearsalDinnerVenueName',
            'rehearsalDinnerVenueAddress1',
            'rehearsalDinnerVenueAddress2',
            'rehearsalDinnerVenueCountry',
            'rehearsalDinnerVenueCity',
            'rehearsalDinnerVenueState',
            'rehearsalDinnerVenueZip',
            'rehearsalDinnerVenueAsInsured',
            'rehearsalDinnerLocationType',
            'rehearsalDinnerIndoorOutdoor',
            'rehearsalDinnerUseMainVenueAddress',
          )}
        </>
      )}

      {/* ------------------------ */}
      {/* Form Action Buttons (Continue, Save Quote) */}
      {/* ------------------------ */}
      <div className="flex flex-col md:flex-row justify-between mt-8 gap-4 w-full max-w-4xl mx-auto">
        {/* ------------------------ */}
        {/* Continue Button (if onContinue callback is provided) */}
        {/* ------------------------ */}
        {onContinue && (
          <Button
            variant="primary"
            size="lg"
            onClick={onContinue}
            className="transition-transform duration-150 hover:scale-105 w-full md:w-auto"
          >
            Continue
          </Button>
        )}
      </div>
    </>
  );
}
