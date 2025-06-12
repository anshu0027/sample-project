import React from 'react';
import { MapPin, CalendarCheck, ChevronDown, AlertCircle } from 'lucide-react';
// import Card from "@/components/ui/Card";
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
// import Select from "@/components/ui/Select";
import Checkbox from '@/components/ui/Checkbox';
import { VENUE_TYPES, INDOOR_OUTDOOR_OPTIONS, COUNTRIES, US_STATES } from '@/utils/constants';
import { QuoteState } from '@/context/QuoteContext';

// ------------------------
// Type definition for the props of Step2Form component
// ------------------------
type Step2FormProps = {
  state: QuoteState; // The current state of the quote form
  errors: Record<keyof QuoteState, string | undefined>; // Object containing validation errors for form fields
  onChange: (field: keyof QuoteState, value: any) => void; // Callback function to handle field changes
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
  //  onValidate,
  onContinue,
  onSave,
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

  // ------------------------
  // Reusable function to render a venue information section.
  // This helps to avoid repetitive code for different venue types (ceremony, reception, etc.).
  // Parameters:
  // - title: The title of the venue section.
  // - nameField, address1Field, etc.: Keys of the QuoteState for the respective venue fields.
  // - asInsuredField: Key of the QuoteState for the "add as additional insured" checkbox.
  // ------------------------
  const renderVenueSection = (
    title: string,
    nameField: keyof QuoteState,
    address1Field: keyof QuoteState,
    address2Field: keyof QuoteState,
    countryField: keyof QuoteState,
    cityField: keyof QuoteState,
    stateField: keyof QuoteState,
    zipField: keyof QuoteState,
    asInsuredField: keyof QuoteState,
  ) => (
    // ------------------------
    // Main container for a venue section
    // ------------------------
    <div className="mb-8 shadow-lg border-0 text-left bg-white p-8 sm:p-10 md:p-12 rounded-2xl w-full max-w-4xl mx-auto">
      {/* ------------------------ */}
      {/* Venue Section Header (Icon and Title) */}
      {/* ------------------------ */}
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
      {/* ------------------------ */}
      {/* Form fields for the venue section */}
      {/* ------------------------ */}
      <div className="space-y-8 w-full px-2 sm:px-4 md:px-2">
        {/* ------------------------ */}
        {/* Venue Name Field */}
        {/* ------------------------ */}
        <div className="space-y-2">
          <label htmlFor={String(nameField)} className="block text-sm font-medium text-gray-700">
            Venue Name
          </label>
          <Input
            id={String(nameField)}
            value={state[nameField] as string}
            onChange={(e) => onChange(nameField, e.target.value)}
            placeholder="Venue Name"
            className={`w-full ${errors[nameField] ? 'border-red-500' : ''}`}
          />
          {errors[nameField] && <p className="text-sm text-red-500">{errors[nameField]}</p>}
        </div>

        {/* ------------------------ */}
        {/* Address Line 1 Field */}
        {/* ------------------------ */}
        <div className="space-y-2">
          <label
            htmlFor={String(address1Field)}
            className="block text-sm font-medium text-gray-700"
          >
            Address Line 1
          </label>
          <Input
            id={String(address1Field)}
            value={state[address1Field] as string}
            onChange={(e) => onChange(address1Field, e.target.value)}
            placeholder="Street Address"
            className={`w-full ${errors[address1Field] ? 'border-red-500' : ''}`}
          />
          {errors[address1Field] && <p className="text-sm text-red-500">{errors[address1Field]}</p>}
        </div>

        {/* ------------------------ */}
        {/* Address Line 2 Field (Optional) */}
        {/* ------------------------ */}
        <div className="space-y-2">
          <label
            htmlFor={String(address2Field)}
            className="block text-sm font-medium text-gray-700"
          >
            Address Line 2
          </label>
          <Input
            id={String(address2Field)}
            value={state[address2Field] as string}
            onChange={(e) => onChange(address2Field, e.target.value)}
            placeholder="Apt, Suite, Building (optional)"
            className="w-full"
          />
        </div>

        {/* ------------------------ */}
        {/* Grid for Country and City fields */}
        {/* ------------------------ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* ------------------------ */}
          {/* Country Field */}
          {/* ------------------------ */}
          <div className="space-y-2">
            <label
              htmlFor={String(countryField)}
              className="block text-sm font-medium text-gray-700"
            >
              Country
            </label>
            <div className="relative">
              <select
                id={String(countryField)}
                value={state[countryField] as string}
                onChange={(e) => onChange(countryField, e.target.value)}
                className={`w-full px-3 py-2 border rounded-xl appearance-none pr-10 ${
                  errors[countryField] ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                <option value="">Select country</option>
                {COUNTRIES.map((country) => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            {errors[countryField] && <p className="text-sm text-red-500">{errors[countryField]}</p>}
          </div>

          {/* ------------------------ */}
          {/* City Field */}
          {/* ------------------------ */}
          <div className="space-y-2">
            <label htmlFor={String(cityField)} className="block text-sm font-medium text-gray-700">
              City
            </label>
            <Input
              id={String(cityField)}
              value={state[cityField] as string}
              onChange={(e) => onChange(cityField, e.target.value)}
              className={errors[cityField] ? 'border-red-500' : ''}
            />
            {errors[cityField] && <p className="text-sm text-red-500">{errors[cityField]}</p>}
          </div>
        </div>

        {/* ------------------------ */}
        {/* Grid for State and ZIP Code fields */}
        {/* ------------------------ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* ------------------------ */}
          {/* State Field */}
          {/* ------------------------ */}
          <div className="space-y-2">
            <label htmlFor={String(stateField)} className="block text-sm font-medium text-gray-700">
              State
            </label>
            <div className="relative">
              <select
                id={String(stateField)}
                value={state[stateField] as string}
                onChange={(e) => onChange(stateField, e.target.value)}
                className={`w-full px-3 py-2 border rounded-xl appearance-none pr-10 ${
                  errors[stateField] ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                <option value="">Select state</option>
                {US_STATES.map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            {errors[stateField] && <p className="text-sm text-red-500">{errors[stateField]}</p>}
          </div>

          {/* ------------------------ */}
          {/* ZIP Code Field */}
          {/* ------------------------ */}
          <div className="space-y-2">
            <label htmlFor={String(zipField)} className="block text-sm font-medium text-gray-700">
              ZIP Code
            </label>
            <Input
              id={String(zipField)}
              value={state[zipField] as string}
              onChange={(e) => onChange(zipField, e.target.value)}
              className={errors[zipField] ? 'border-red-500' : ''}
            />
            {errors[zipField] && <p className="text-sm text-red-500">{errors[zipField]}</p>}
          </div>
        </div>

        {/* ------------------------ */}
        {/* Add venue as Additional Insured Checkbox */}
        {/* ------------------------ */}
        <div className="mb-4 text-left">
          <Checkbox
            id={String(asInsuredField)}
            label="Add this venue as an Additional Insured on my policy"
            checked={state[asInsuredField] as boolean}
            onChange={(checked) => onChange(asInsuredField, checked)}
          />
        </div>
      </div>
    </div>
  );

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
                  className={`w-full ${errors.honoree1FirstName ? 'border-red-500' : ''}`}
                />
                {errors.honoree1FirstName && (
                  <p className="text-sm text-red-500">{errors.honoree1FirstName}</p>
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
                  className={`w-full ${errors.honoree1LastName ? 'border-red-500' : ''}`}
                />
                {errors.honoree1LastName && (
                  <p className="text-sm text-red-500">{errors.honoree1LastName}</p>
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
                  placeholder="John"
                  className="w-full"
                />
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
                  placeholder="Doe"
                  className="w-full"
                />
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
              onChange={(value) => onChange('venueName', value)}
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
                  onChange={(value) => onChange('venueAddress1', value)}
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
                  onChange={(value) => onChange('venueCity', value)}
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
                  onChange={(value) => onChange('venueAddress1', value)}
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
                  onChange={(value) => onChange('venueAddress2', value)}
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
                      onChange={(e) => onChange('venueCountry', e.target.value)}
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
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </div>
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
                    onChange={(value) => onChange('venueCity', value)}
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
                      className={`w-full px-3 py-2 border rounded-xl appearance-none pr-10 ${
                        errors.venueState ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    >
                      <option value="">Select state</option>
                      {US_STATES.map((state) => (
                        <option key={state.value} value={state.value}>
                          {state.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </div>
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
                    onChange={(value) => onChange('venueZip', value)}
                    className={`w-full ${errors.venueZip ? 'border-red-500' : ''}`}
                  />
                  {errors.venueZip && <p className="text-sm text-red-500">{errors.venueZip}</p>}
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
        {/* ------------------------ */}
        {/* Save Quote Button (if onSave callback is provided) */}
        {/* ------------------------ */}
        {onSave && (
          <Button
            variant="outline"
            size="lg"
            onClick={onSave}
            className="transition-transform duration-150 hover:scale-105 w-full md:w-auto"
          >
            Save Quote
          </Button>
        )}
      </div>
    </>
  );
}
