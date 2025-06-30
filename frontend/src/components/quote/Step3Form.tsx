/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { User, Phone, MapPin, ChevronDown, AlertCircle } from 'lucide-react';
// import { Button } from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import { US_STATES, RELATIONSHIP_OPTIONS, REFERRAL_OPTIONS } from '@/utils/constants';
import { isValidPhone, formatPhoneNumber, isValidName } from '@/utils/validators';
// ------------------------
// Type definition for the props of Step3Form component.
// state: An object representing the current form data.
// errors: An object containing validation error messages for form fields.
// onChange: Callback function to handle changes in form fields.
// onSave: Optional callback function to save the form data.
// isRestored: Optional boolean indicating if the form data is restored from a previous session.
// ------------------------
type Step3FormProps = {
  state: Record<string, any>;
  errors: Record<string, string>;
  onChange: (field: string, value: any) => void;
  onSave?: () => void;
  isRestored?: boolean;
  onValidate?: () => void;
};
// ------------------------
// Step3Form component: Handles the third step of the quote generation process.
// It collects information about the policyholder, including contact details,
// mailing address, and legal acknowledgments.
// ------------------------
export default function Step3Form({
  state,
  errors,
  onChange,
  // onSave,
  isRestored = false,
}: Step3FormProps) {
  // Phone validation state
  const [phoneError, setPhoneError] = React.useState<string | undefined>(undefined);

  // Phone number validation function
  const validatePhone = (phone: string) => {
    if (!phone) return undefined; // Don't show error for empty field
    if (!isValidPhone(phone)) return 'Please enter a valid phone number';
    return undefined;
  };

  // Handle phone number input with validation
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Clear error when user starts typing
    if (phoneError) {
      setPhoneError(undefined);
    }

    // Format the phone number as user types
    const digitsOnly = value.replace(/\D/g, '');
    let formatted = value;

    if (digitsOnly.length <= 3) {
      formatted = digitsOnly;
    } else if (digitsOnly.length <= 6) {
      formatted = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`;
    } else {
      formatted = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
    }

    onChange('phone', formatted);
  };

  // Handle phone number blur with validation
  const handlePhoneBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const error = validatePhone(value);
    setPhoneError(error);

    // Format the phone number if it's valid
    if (!error && value) {
      const formatted = formatPhoneNumber(value);
      onChange('phone', formatted);
    }
  };

  // Handle phone number keydown to restrict input
  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

    // Allow only digits, spaces, parentheses, hyphens, and plus sign
    if (!/^[\d\s\(\)\-\+]$/.test(e.key)) {
      e.preventDefault();
      return;
    }

    // Limit to 10 digits maximum
    const target = e.target as HTMLInputElement;
    const currentDigits = target.value.replace(/\D/g, '');
    if (currentDigits.length >= 10 && /^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  // Handle ZIP code keydown to restrict input
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

  // Calculate final phone error (from props or local state)
  const finalPhoneError = phoneError || errors.phone;

  // Name validation
  const firstNameError = (() => {
    if (!state.firstName) return errors.firstName;
    if (!isValidName(state.firstName)) return 'First name must contain only letters and spaces';
    return errors.firstName;
  })();

  const lastNameError = (() => {
    if (!state.lastName) return errors.lastName;
    if (!isValidName(state.lastName)) return 'Last name must contain only letters and spaces';
    return errors.lastName;
  })();

  const completingFormNameError = (() => {
    if (!state.completingFormName) return errors.completingFormName;
    if (!isValidName(state.completingFormName)) return 'Name must contain only letters and spaces';
    return errors.completingFormName;
  })();

  // ZIP code validation
  const zipError = (() => {
    const zip = state.zip;
    if (!zip) return errors.zip; // Don't show error for empty field
    if (zip.length < 4) return 'ZIP code must be 4 or 5 digits';
    if (zip.length > 5) return 'ZIP code must be 4 or 5 digits';
    if (!/^\d{4,5}$/.test(zip)) return 'ZIP code must contain only digits';
    return errors.zip;
  })();

  return (
    <>
      {/* ------------------------ */}
      {/* Restored Form Notification */}
      {/* Displays a message if the form data was restored from a previous session. */}
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
      {/* Policyholder Information Section */}
      {/* Collects the first and last name of the policyholder. */}
      {/* ------------------------ */}
      <div className="mb-10 shadow-2xl border-0 bg-white/90 p-8 sm:p-10 md:p-12 rounded-2xl w-full max-w-4xl mx-auto">
        {/* ------------------------ */}
        {/* Section Header */}
        {/* ------------------------ */}
        <div className="flex items-center justify-center text-left mb-4 gap-4">
          <div className="flex-shrink-0">
            <User size={36} className="text-indigo-600" />
          </div>
          <div>
            <div className="text-xl md:text-2xl font-extrabold leading-tight mb-1">
              Policyholder Information
            </div>
            <div className="text-base text-gray-500 font-medium leading-tight">
              Enter the policyholder&apos;s details
            </div>
          </div>
        </div>

        <div className="space-y-10">
          {/* ------------------------ */}
          {/* Grid for First Name and Last Name fields */}
          {/* ------------------------ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {/* ------------------------ */}
            {/* First Name Field */}
            {/* ------------------------ */}
            <div className="mb-4">
              <label htmlFor="firstName" className="block font-medium text-gray-800 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                value={state.firstName}
                onChange={(e) => onChange('firstName', e.target.value)}
                onKeyDown={handleNameKeyDown}
                className={`w-full border rounded-md py-2 px-4 mx-auto ${
                  firstNameError ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {firstNameError && <p className="text-sm text-red-500 mt-1">{firstNameError}</p>}
            </div>

            {/* ------------------------ */}
            {/* Last Name Field */}
            {/* ------------------------ */}
            <div className="mb-4">
              <label htmlFor="lastName" className="block font-medium text-gray-800 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                value={state.lastName}
                onChange={(e) => onChange('lastName', e.target.value)}
                onKeyDown={handleNameKeyDown}
                className={`w-full border rounded-md py-2 px-4 mx-auto ${
                  lastNameError ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {lastNameError && <p className="text-sm text-red-500 mt-1">{lastNameError}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------ */}
      {/* Contact Information Section */}
      {/* Collects phone number, relationship to honorees, and referral source. */}
      {/* ------------------------ */}
      <div className="mb-8 shadow-lg border-0 bg-white p-8 sm:p-10 md:p-12 rounded-2xl w-full max-w-4xl mx-auto">
        {/* ------------------------ */}
        {/* Section Header */}
        {/* ------------------------ */}
        <div className="flex items-center justify-center text-left mb-4 gap-4">
          <div className="flex-shrink-0">
            <Phone size={28} className="text-blue-600" />
          </div>
          <div>
            <div className="text-xl md:text-2xl font-extrabold leading-tight mb-1">
              Contact Information
            </div>
            <div className="text-base text-gray-500 font-medium leading-tight">
              How we can reach you regarding your policy
            </div>
          </div>
        </div>

        {/* ------------------------ */}
        {/* Grid for contact fields */}
        {/* ------------------------ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full px-2 sm:px-4 md:px-2">
          {/* ------------------------ */}
          {/* Phone Number Field */}
          {/* ------------------------ */}
          <div className="mb-4">
            <label htmlFor="phone" className="block font-medium text-gray-800 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="phone"
                type="tel"
                value={state.phone}
                onChange={handlePhoneChange}
                onBlur={handlePhoneBlur}
                onKeyDown={handlePhoneKeyDown}
                placeholder="(123) 456-7890"
                className={`text-center w-full border rounded-md py-2 pr-2 ${
                  finalPhoneError ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            {finalPhoneError && <p className="text-sm text-red-500 mt-1">{finalPhoneError}</p>}
          </div>

          {/* ------------------------ */}
          {/* Relationship to Honorees Field */}
          {/* ------------------------ */}
          <div className="mb-4">
            <label htmlFor="relationship" className="block font-medium text-gray-800 mb-1">
              Relationship to Honorees <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="relationship"
                value={state.relationship}
                onChange={(e) => onChange('relationship', e.target.value)}
                className={`appearance-none w-full text-center border rounded-md py-2 pl-3 pr-10 ${
                  errors.relationship ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="" disabled>
                  Select relationship
                </option>
                {RELATIONSHIP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                size={18}
              />
            </div>
            {errors.relationship && (
              <p className="text-sm text-red-500 mt-1">{errors.relationship}</p>
            )}
          </div>

          {/* ------------------------ */}
          {/* How Did You Hear About Us Field (Optional) */}
          {/* ------------------------ */}
          <div className="mb-4">
            <label htmlFor="hearAboutUs" className="block font-medium text-gray-800 mb-1">
              How Did You Hear About Us?
            </label>
            <div className="relative">
              <select
                id="hearAboutUs"
                value={state.hearAboutUs}
                onChange={(e) => onChange('hearAboutUs', e.target.value)}
                className="appearance-none w-full text-center border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select option (optional)</option>
                {REFERRAL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                size={18}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------ */}
      {/* Mailing Address Section */}
      {/* Collects the policyholder's mailing address. */}
      {/* ------------------------ */}
      <div className="mb-8 shadow-lg border-0 bg-white p-8 sm:p-10 md:p-12 rounded-2xl w-full max-w-4xl mx-auto">
        {/* ------------------------ */}
        {/* Section Header */}
        {/* ------------------------ */}
        <div className="flex items-center justify-center text-left mb-4 gap-4">
          <div className="flex-shrink-0">
            <MapPin size={28} className="text-blue-600" />
          </div>
          <div>
            <div className="text-xl md:text-2xl font-extrabold leading-tight mb-1">
              Mailing Address
            </div>
            <div className="text-base text-gray-500 font-medium leading-tight">
              Where should we send physical policy documents?
            </div>
          </div>
        </div>

        {/* ------------------------ */}
        {/* Form fields for mailing address */}
        {/* ------------------------ */}
        <div className="space-y-8 w-full px-2 sm:px-4 md:px-8">
          {/* ------------------------ */}
          {/* Address Line 1 Field */}
          {/* ------------------------ */}
          <div className="mb-4">
            <label htmlFor="address" className="block font-medium text-gray-800 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              id="address"
              value={state.address}
              onChange={(e) => onChange('address', e.target.value)}
              placeholder="Street Address"
              className={`w-full border rounded-md py-2 px-3 ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
          </div>

          {/* ------------------------ */}
          {/* Grid for Country and City fields */}
          {/* ------------------------ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {/* ------------------------ */}
            {/* Country Field (Disabled, defaults to United States) */}
            {/* ------------------------ */}
            <div className="mb-4">
              <label htmlFor="country" className="block font-medium text-gray-800 mb-1">
                Country <span className="text-red-500">*</span>
              </label>
              <input
                id="country"
                value={state.country}
                disabled
                className="w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* ------------------------ */}
            {/* City Field */}
            {/* ------------------------ */}
            <div className="mb-4">
              <label htmlFor="city" className="block font-medium text-gray-800 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                id="city"
                value={state.city}
                onChange={(e) => onChange('city', e.target.value)}
                className={`w-full border rounded-md py-2 px-3 ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
            </div>
          </div>

          {/* ------------------------ */}
          {/* Grid for State and ZIP Code fields */}
          {/* ------------------------ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {/* ------------------------ */}
            {/* State Field */}
            {/* ------------------------ */}
            <div className="mb-4">
              <label htmlFor="state" className="block font-medium text-gray-800 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="state"
                  value={state.state}
                  onChange={(e) => onChange('state', e.target.value)}
                  className={`appearance-none w-full border rounded-md py-2 pl-3 pr-10 ${
                    errors.state ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="" disabled>
                    Select state
                  </option>
                  {US_STATES.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={18}
                />
              </div>
              {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state}</p>}
            </div>

            {/* ------------------------ */}
            {/* ZIP Code Field */}
            {/* ------------------------ */}
            <div className="mb-4">
              <label htmlFor="zip" className="block font-medium text-gray-800 mb-1">
                ZIP Code <span className="text-red-500">*</span>
              </label>
              <input
                id="zip"
                value={state.zip}
                onChange={(e) => onChange('zip', e.target.value)}
                onKeyDown={handleZipKeyDown}
                className={`w-full border rounded-md py-2 px-3 ${
                  zipError ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {zipError && <p className="text-sm text-red-500 mt-1">{zipError}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------ */}
      {/* Legal Notices Section */}
      {/* Displays legal disclaimers and requires acknowledgment. */}
      {/* ------------------------ */}
      <div className="mb-8 shadow-lg border-0 bg-white p-8 sm:p-10 md:p-12 rounded-2xl w-full max-w-4xl mx-auto">
        {/* ------------------------ */}
        {/* Form fields for legal notices and acceptance */}
        {/* ------------------------ */}
        <div className="space-y-8 w-full px-2 sm:px-4 md:px-8">
          {/* ------------------------ */}
          {/* Legal Notices Text Block */}
          {/* ------------------------ */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Legal Notices</h3>
            <p className="text-sm text-gray-700 mb-4">
              By proceeding with this insurance application, I understand and agree to the
              following:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
              <li>
                All information I have provided is accurate and complete to the best of my
                knowledge.
              </li>
              <li>Coverage is subject to the terms, conditions, and exclusions of the policy.</li>
              <li>
                This insurance does not cover cancellations or impacts due to COVID-19, pandemics,
                or communicable diseases.
              </li>
              <li>
                The company reserves the right to verify any information provided and may adjust or
                deny claims based on investigation findings.
              </li>
              <li>
                If payment is authorized, I understand the coverage begins on the specified date and
                ends after the event date according to policy terms.
              </li>
            </ul>
          </div>
          {/* ------------------------ */}
          {/* Legal Acceptance Checkbox */}
          {/* ------------------------ */}
          <div className="mb-4">
            <label htmlFor="legalNotices" className="block font-medium text-gray-800 mb-1">
              Legal Acceptance <span className="text-red-500">*</span>
            </label>
            <Checkbox
              id="legalNotices"
              label={
                <span className="font-medium">
                  I have read, understand, and agree to the terms and conditions above
                </span>
              }
              checked={state.legalNotices}
              onChange={(checked) => onChange('legalNotices', checked)}
              error={!!errors.legalNotices}
            />
            {errors.legalNotices && (
              <p className="text-sm text-red-500 mt-1">{errors.legalNotices}</p>
            )}
          </div>

          {/* ------------------------ */}
          {/* Name of Person Completing Form Field */}
          {/* ------------------------ */}
          <div className="mb-4">
            <label
              htmlFor="completingFormName"
              className="block text-center font-medium text-gray-800 mb-1"
            >
              Name of person completing this form <span className="text-red-500">*</span>
              <span
                className="ml-2 text-gray-400"
                title="Please enter your full name to verify your acceptance"
              >
                ⓘ
              </span>
            </label>
            <input
              id="completingFormName"
              type="text"
              value={state.completingFormName}
              onChange={(e) => onChange('completingFormName', e.target.value)}
              onKeyDown={handleNameKeyDown}
              placeholder="Full Name"
              className={`block w-[60%] text-center mx-auto rounded-md shadow-sm text-base font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border pl-4 pr-4 py-2 ${
                completingFormNameError
                  ? 'border-red-400 text-red-900 placeholder-red-300 bg-red-50'
                  : 'border-gray-200 text-gray-900 placeholder-gray-400'
              }`}
            />
            {completingFormNameError && (
              <p className="text-sm text-red-500 mt-1">{completingFormNameError}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
