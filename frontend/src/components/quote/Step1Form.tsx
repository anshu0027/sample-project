/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { AlertCircle, DollarSign, ChevronDown } from 'lucide-react';
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
  CORE_COVERAGE_PREMIUMS, // Added
  LIABILITY_COVERAGE_PREMIUMS, // Added
  COVERAGE_DETAILS, // Added
} from '@/utils/constants';

// ------------------------
// Interface for the form's state
// ------------------------
interface Step1FormState {
  residentState: string;
  eventType: string;
  maxGuests: string;
  eventDate: string;
  email: string;
  coverageLevel: number | string;
  liabilityCoverage: string;
  liquorLiability: boolean;
  specialActivities: boolean;
  covidDisclosure: boolean;
  [key: string]: any; // For any additional dynamic fields
}

// ------------------------
// Interface for the form's error messages
// ------------------------
interface Step1FormErrors {
  [key: string]: string | undefined;
  residentState?: string;
  eventType?: string;
  maxGuests?: string;
  eventDate?: string;
  email?: string;
  coverageLevel?: string;
  liabilityCoverage?: string;
  liquorLiability?: string;
  specialActivities?: string;
  covidDisclosure?: string;
}

// ------------------------
// Interface for the Step1Form component's props
// ------------------------
interface Step1FormProps {
  state: Step1FormState;
  errors: Step1FormErrors;
  onChange: (field: string, value: any) => void;
  onValidate?: () => void;
  onContinue?: () => void;
  showQuoteResults?: boolean;
  handleCalculateQuote: () => void;
  onSave?: () => void;
  isCustomerEdit?: boolean;
  isRestored?: boolean;
}

// ------------------------
// Step1Form component: Handles the first step of the quote generation process.
// It collects basic event details and coverage preferences.
// ------------------------
export default function Step1Form({
  state,
  errors,
  onChange,
  // onValidate,
  // onContinue,
  // showQuoteResults,
  handleCalculateQuote,
  // onSave,
  // isCustomerEdit = false,
  isRestored = false,
}: Step1FormProps) {
  // Add state for modals
  const [showSpecialActivitiesModal, setShowSpecialActivitiesModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // ------------------------
  // Date parsing and formatting functions (similar to quote-generator)
  // ------------------------
  // Formats a Date object into a "YYYY-MM-DD" string
  const formatDateStringLocal = (date: Date | null): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // ------------------------
  // Date picker configurations
  // ------------------------
  const selectedDate = state.eventDate ? new Date(state.eventDate) : null;
  const minDate = new Date();
  minDate.setHours(minDate.getHours() + 48);
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 2); // Event can be at most 2 years in the future

  // ------------------------
  // useEffect hook to manage liquorLiability based on liabilityCoverage.
  // If liabilityCoverage is 'none', liquorLiability is automatically set to false.
  // ------------------------
  useEffect(() => {
    const isLiquorLiabilityDisabled = state.liabilityCoverage === 'none';
    //if liabilityCoverage is none, disable liquorLiability as well
    if (isLiquorLiabilityDisabled && state.liquorLiability) {
      onChange('liquorLiability', false);
    }
  }, [state.liabilityCoverage, onChange, state.liquorLiability]);

  // Handle special activities change
  const handleSpecialActivitiesChange = (checked: boolean) => {
    if (checked) {
      setShowSpecialActivitiesModal(true);
    } else {
      onChange('specialActivities', false);
    }
  };

  return (
    <div className="mb-8 shadow-lg border-0 bg-white p-8 sm:p-10 md:p-12 rounded-2xl w-full max-w-4xl mx-auto">
      {/* ------------------------ */}
      {/* Restored Form Notification */}
      {/* ------------------------ */}
      {isRestored && (
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
      {/* Form Header */}
      {/* ------------------------ */}
      <div className="mb-8">
        <p className="text-3xl md:text-4xl font-extrabold text-blue-900 drop-shadow text-center">
          Get Your Wedding Insurance Quote
        </p>
        <p className="text-lg md:text-xl text-blue-700 font-medium text-center">
          Tell us about your event to receive an instant quote
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2 sm:px-4 md:px-2">
        {' '}
        {/* Adjusted gap and padding */}
        {/* ------------------------ */}
        {/* Policy Holder's Resident State Field */}
        {/* ------------------------ */}
        <div className="flex flex-col">
          <label htmlFor="residentState" className="font-semibold text-gray-800 text-left mb-1">
            Policy Holder&apos;s Resident State <span className="text-red-500">*</span>
          </label>
          <div className="relative w-full">
            <select
              id="residentState"
              value={state.residentState}
              onChange={(e) => onChange('residentState', e.target.value)}
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
        {/* ------------------------ */}
        {/* Event Type Field */}
        {/* ------------------------ */}
        <div className="flex flex-col">
          <label htmlFor="eventType" className="font-semibold text-gray-800 text-left mb-1">
            Event Type <span className="text-red-500">*</span>
          </label>
          <div className="relative w-full">
            <select
              id="eventType"
              value={state.eventType}
              onChange={(e) => onChange('eventType', e.target.value)}
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
        {/* ------------------------ */}
        {/* Maximum Number of Guests Field */}
        {/* ------------------------ */}
        <div className="flex flex-col">
          <label htmlFor="maxGuests" className="font-semibold text-gray-800 text-left mb-1">
            Maximum Number of Guests <span className="text-red-500">*</span>
          </label>
          <div className="relative w-full">
            <select
              id="maxGuests"
              value={state.maxGuests}
              onChange={(e) => onChange('maxGuests', e.target.value)}
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
        {/* ------------------------ */}
        {/* Event Date Field */}
        {/* ------------------------ */}
        <div className="flex flex-col">
          <label htmlFor="eventDate" className="font-semibold text-gray-800 text-left mb-1">
            Event Date <span className="text-red-500">*</span>
          </label>
          <DatePicker
            selected={selectedDate}
            onChange={(date: Date | null) => onChange('eventDate', formatDateStringLocal(date))}
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
        {/* ------------------------ */}
        {/* Container for Email Address and Coverage Level fields.
                // Spans two columns on medium screens and above.
                // ------------------------ */}
        <div className="flex flex-col md:col-span-2 gap-6">
          {/* ------------------------ */}
          {/* Email Address Field */}
          {/* ------------------------ */}
          <div className="flex flex-col">
            <label htmlFor="email" className="font-semibold text-gray-800 text-left mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={state.email || ''}
              onChange={(e) => onChange('email', e.target.value)}
              placeholder="you@email.com"
              required
              className={`w-full text-left p-2 border rounded-xl ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500 text-left">{errors.email}</p>}
          </div>

          {/* ------------------------ */}
          {/* Core Coverage Level Field */}
          {/* ------------------------ */}
          <div className="flex flex-col">
            <label htmlFor="coverageLevel" className="font-semibold text-gray-800 text-left mb-1">
              Core Coverage Level <span className="text-red-500">*</span>
            </label>
            <div className="relative w-full">
              <select
                id="coverageLevel"
                value={state.coverageLevel?.toString() || ''}
                onChange={(e) => onChange('coverageLevel', parseInt(e.target.value))}
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
              <div className="mt-4 w-full bg-blue-50 rounded-xl p-4 border border-blue-100 text-left">
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
        {/* ------------------------ */}
        {/* Liability Coverage Field */}
        {/* ------------------------ */}
        <div className="flex flex-col">
          <label htmlFor="liabilityCoverage" className="font-semibold text-gray-800 text-left mb-1">
            Liability Coverage
          </label>
          <div className="relative w-full">
            <select
              id="liabilityCoverage"
              value={state.liabilityCoverage}
              onChange={(e) => onChange('liabilityCoverage', e.target.value)}
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
                    className={option.isNew ? 'text-red-400' : ''}
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
          {errors.liabilityCoverage && (
            <p className="mt-1 text-xs text-red-500 text-left">{errors.liabilityCoverage}</p>
          )}
        </div>
        {/* ------------------------ */}
        {/* Host Liquor Liability Checkbox Field */}
        {/* ------------------------ */}
        <div className="flex flex-col items-start">
          <label htmlFor="liquorLiability" className="font-semibold text-gray-800 text-left mb-1">
            Host Liquor Liability
          </label>
          <Checkbox
            id="liquorLiability"
            label={
              <span
                className={`font-medium text-left text-sm sm:text-base ${state.liabilityCoverage === 'none' ? 'text-gray-400' : ''}`}
              >
                Yes, add Host Liquor Liability coverage{' '}
                {state.liabilityCoverage !== 'none' && state.maxGuests
                  ? `(+$${
                      LIABILITY_OPTIONS.find((o) => o.value === state.liabilityCoverage && o.isNew)
                        ? LIQUOR_LIABILITY_PREMIUMS_NEW[state.maxGuests]
                        : LIQUOR_LIABILITY_PREMIUMS[state.maxGuests]
                    })`
                  : ''}
              </span>
            }
            checked={state.liquorLiability}
            onChange={(checked) => {
              onChange('liquorLiability', checked);
              // Also set liquorLiability to false if liabilityCoverage is 'none'
              if (state.liabilityCoverage === 'none') {
                onChange('liquorLiability', false);
              }
            }}
            disabled={state.liabilityCoverage === 'none'}
            description={
              <span className="text-left text-xs sm:text-base">
                {state.liabilityCoverage === 'none'
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
        {/* ------------------------ */}
        {/* Special Activities Checkbox Field */}
        {/* ------------------------ */}
        <div className="flex flex-col items-start">
          <label htmlFor="specialActivities" className="font-semibold text-gray-800 text-left mb-1">
            Special Activities
          </label>
          <Checkbox
            id="specialActivities"
            label={
              <span className="font-medium text-left text-sm sm:text-base">
                My event will include special activities or features
              </span>
            }
            checked={state.specialActivities}
            onChange={handleSpecialActivitiesChange}
            description={
              <span className="text-left text-xs sm:text-base">
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

      {/* ------------------------ */}
      {/* COVID-19 Disclosure Section.
            // This section is full-width.
            // ------------------------ */}
      <div className="px-2 sm:px-4 md:px-8 mt-8">
        {' '}
        {/* Added mt-8 for spacing from grid */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 mt-8 flex flex-col sm:flex-row items-start gap-3">
          <AlertCircle size={20} className="text-yellow-500 mt-1" />
          <div className="w-full text-left">
            {' '}
            {/* Ensure this div takes full width and aligns text left */}
            <h3 className="font-semibold text-yellow-800 mb-1 text-sm sm:text-base">
              Important Disclosures
            </h3>
            <div className="mt-3">
              {' '}
              {/* Replaces FormField */}
              <label
                htmlFor="covidDisclosure"
                className="block font-medium text-gray-800 text-sm sm:text-base mb-1"
              >
                COVID-19 Exclusion Acknowledgment <span className="text-red-500">*</span>
              </label>
              <Checkbox
                id="covidDisclosure"
                label={
                  <span className="font-medium text-sm sm:text-base">
                    I understand that cancellations or impacts due to COVID-19, pandemics, or
                    communicable diseases are not covered by this policy
                  </span>
                }
                checked={state.covidDisclosure}
                onChange={(checked) => onChange('covidDisclosure', checked)}
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
      {/* ------------------------ */}
      {/* Form Action Buttons (Calculate Quote, Save) */}
      {/* ------------------------ */}
      <div className="px-2 sm:px-4 md:px-8">
        {' '}
        {/* Wrapper for buttons to align with padding */}
        <div className="flex flex-col md:flex-row justify-center mt-10 gap-4 w-full">
          <Button
            variant="primary"
            size="lg"
            onClick={handleCalculateQuote}
            //
            className="transition-transform duration-150 rounded-full"
          >
            <DollarSign size={18} />
            Calculate Quote
          </Button>
        </div>
      </div>

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
                    onChange('specialActivities', false);
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
                    setShowContactModal(true);
                  }}
                >
                  Contact me for special coverage
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 py-6 sm:px-6">
          <div className="bg-white rounded-2xl shadow-xl w-full min-w-[300px] sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl max-h-[90vh] overflow-y-auto transition-transform duration-300 ease-out animate-fade-in">
            <div className="p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-semibold text-blue-600 mb-4">
                Contact Our Support Team
              </h3>
              <p className="text-gray-700 mb-5 text-sm sm:text-base leading-relaxed">
                For special activities coverage, please contact our support team directly.
                We&apos;ll work with you to provide the appropriate coverage for your event.
              </p>

              <div className="space-y-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-20">Email:</span>
                      <span className="text-blue-600">support@weddinginsurance.com</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-20">Phone:</span>
                      <span className="text-blue-600">1-800-WEDDING</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-20">Hours:</span>
                      <span className="text-gray-600">Mon-Fri 9AM-6PM EST</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-2">What to Include</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Description of your special activities</li>
                    <li>• Event date and location</li>
                    <li>• Number of guests</li>
                    <li>• Any existing quote number</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setShowContactModal(false);
                    onChange('specialActivities', false);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
