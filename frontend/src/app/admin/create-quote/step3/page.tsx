'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Phone, MapPin, ChevronDown } from 'lucide-react'; // Added ChevronDown
import { useQuote } from '@/context/QuoteContext';
import { Button } from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import { US_STATES, RELATIONSHIP_OPTIONS, REFERRAL_OPTIONS } from '@/utils/constants';
import {
  isEmpty,
  isValidPhone,
  isValidZip,
  formatPhoneNumber,
  isValidName,
} from '@/utils/validators';
import { useAuth } from '@clerk/nextjs';
// import dynamic from 'next/dynamic';
// import { Toaster } from "@/components/ui/toaster";
import { toast } from '@/hooks/use-toast';

// const QuotePreview = dynamic(() => import('@/components/ui/QuotePreview'), {
//   ssr: false,
// });

// =============================
// ===== PolicyHolder Component: Step 3 of Admin Quote Creation =====
// =============================
// This component handles the collection of policyholder information.
export default function PolicyHolder() {
  const router = useRouter();
  // =============================
  // ===== State and Context Hooks =====
  // =============================
  const { state, dispatch } = useQuote();
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formattedPhone, setFormattedPhone] = useState(state.phone);
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if admin is authenticated
      if (isLoaded && !isSignedIn) {
        router.replace('/admin/login');
        return;
      }
      // =============================
      // ===== Step Completion Check =====
      // =============================
      if (!state.step2Complete) {
        toast.error('Please complete Step 2: Event & Venue Details first.');
        router.replace('/admin/create-quote/step2');
        return;
      }
      setPageReady(true);
    }, 200); // Short delay for skeleton visibility

    return () => clearTimeout(timer);
  }, [router, state.step2Complete, isLoaded, isSignedIn]);

  // ==========================================
  // ===== Phone Number Formatting Effect =====
  // ==========================================
  // Formats the phone number whenever it changes in the global state.
  useEffect(() => {
    if (state.phone) {
      setFormattedPhone(formatPhoneNumber(state.phone));
    }
  }, [state.phone]);

  // ================================
  // ===== Input Change Handler =====
  // ================================
  const handleInputChange = (field: keyof typeof state, value: string | boolean) => {
    // changed value: any to this
    dispatch({ type: 'UPDATE_FIELD', field, value });
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // =============================
  // ===== Phone Input Change Handler =====
  // =============================
  // Specifically handles changes to the phone input, stripping non-digit characters.
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '');
    handleInputChange('phone', input);
  };

  // =============================
  // ===== Name Input Keydown Handler =====
  // =============================
  // Restricts name inputs to letters and spaces only
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

  // =============================
  // ===== Form Validation =====
  // =============================
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (isEmpty(state.firstName)) newErrors.firstName = 'Please enter your first name';
    else if (!isValidName(state.firstName))
      newErrors.firstName = 'First name must contain only letters and spaces';
    if (isEmpty(state.lastName)) newErrors.lastName = 'Please enter your last name';
    else if (!isValidName(state.lastName))
      newErrors.lastName = 'Last name must contain only letters and spaces';
    if (isEmpty(state.phone)) newErrors.phone = 'Please enter your phone number';
    else if (!isValidPhone(state.phone)) newErrors.phone = 'Please enter a valid phone number';
    if (isEmpty(state.relationship))
      newErrors.relationship = 'Please select your relationship to the couple';
    if (isEmpty(state.address)) newErrors.address = 'Please enter your address';
    if (isEmpty(state.city)) newErrors.city = 'Please enter your city';
    if (isEmpty(state.state)) newErrors.state = 'Please select your state';
    if (isEmpty(state.zip)) newErrors.zip = 'Please enter your ZIP code';
    else if (!isValidZip(state.zip)) newErrors.zip = 'Please enter a valid ZIP code';
    if (!state.legalNotices)
      newErrors.legalNotices = 'You must accept the legal notices to proceed';
    if (isEmpty(state.completingFormName)) newErrors.completingFormName = 'Please enter your name';
    else if (!isValidName(state.completingFormName))
      newErrors.completingFormName = 'Name must contain only letters and spaces';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =============================
  // ===== Back Navigation Handler =====
  // =============================
  const handleBack = () => {
    router.push('/admin/create-quote/step2');
  };

  // =============================
  // ===== Continue Navigation and API Call Handler =====
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
        // =============================
        // ===== API Call: Update Quote with Policy Holder Info =====
        // =============================
        const token = await getToken();
        const res = await fetch(`${apiUrl}/quotes/${quoteNumber}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            // Policy holder fields at root level
            firstName: state.firstName,
            lastName: state.lastName,
            email: state.email,
            phone: state.phone,
            address: state.address,
            city: state.city,
            state: state.state,
            zip: state.zip,
            country: state.country,
            relationship: state.relationship,
            hearAboutUs: state.hearAboutUs,
            legalNotices: state.legalNotices,
            completingFormName: state.completingFormName,
            status: 'STEP3',
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to update quote');
        }

        // const updatedQuote = await res.json();
        // console.log('Updated quote:', updatedQuote); // Add this for debugging

        dispatch({ type: 'COMPLETE_STEP', step: 3 });
        router.push('/admin/create-quote/step4');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        toast.error(message);
      }
    } else {
      Object.entries(errors).forEach(([, msg]) => toast.error(msg));
    }
  };

  // =============================
  // ===== Skeleton Loader Component for Step 3 =====
  // =============================
  const Step3Skeleton = () => (
    <div className="w-full mx-auto pb-12 lg:mr-[28.25rem] animate-pulse">
      {/* Policyholder Information Skeleton */}
      <div className="mb-10 shadow-2xl bg-gray-100/90 p-6 sm:p-8 md:p-10 rounded-2xl w-full">
        <div className="flex items-center justify-center text-center mb-4 gap-4">
          <div className="h-9 w-9 bg-gray-300 rounded-full"></div>
          <div>
            <div className="h-7 bg-gray-300 rounded w-48 mb-1"></div>
            <div className="h-5 bg-gray-300 rounded w-56"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="mb-4">
              <div className="h-5 bg-gray-300 rounded w-1/3 mx-auto mb-2"></div>
              <div className="h-10 bg-gray-200 rounded-md"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Information Skeleton */}
      <div className="mb-8 shadow-lg bg-gray-100 p-6 sm:p-8 md:p-10 rounded-2xl w-full">
        <div className="flex items-center justify-center text-center mb-4 gap-4">
          <div className="h-7 w-7 bg-gray-300 rounded-full"></div>
          <div>
            <div className="h-7 bg-gray-300 rounded w-40 mb-1"></div>
            <div className="h-5 bg-gray-300 rounded w-52"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full px-2 sm:px-4 md:px-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="mb-4">
              <div className="h-5 bg-gray-300 rounded w-1/2 mx-auto mb-2"></div>
              <div className="h-10 bg-gray-200 rounded-md"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Mailing Address Skeleton */}
      <div className="mb-8 shadow-lg bg-gray-100 p-6 sm:p-8 md:p-10 rounded-2xl w-full">
        <div className="flex items-center justify-center text-center mb-4 gap-4">
          <div className="h-7 w-7 bg-gray-300 rounded-full"></div>
          <div>
            <div className="h-7 bg-gray-300 rounded w-36 mb-1"></div>
            <div className="h-5 bg-gray-300 rounded w-48"></div>
          </div>
        </div>
        <div className="space-y-8 w-full px-2 sm:px-4 md:px-8">
          <div className="h-10 bg-gray-200 rounded-md"></div> {/* Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {[...Array(4)].map(
              (
                _,
                i, // Country, City, State, Zip
              ) => (
                <div key={i} className="mb-4">
                  <div className="h-5 bg-gray-300 rounded w-1/3 mx-auto mb-2"></div>
                  <div className="h-10 bg-gray-200 rounded-md"></div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Legal Notices Skeleton */}
      <div className="mb-8 shadow-lg bg-gray-100 p-6 sm:p-8 md:p-10 rounded-2xl w-full">
        <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div> {/* Title */}
        <div className="h-20 bg-gray-200 rounded mb-4"></div> {/* Text block */}
        <div className="h-10 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div> {/* Checkbox */}
        <div className="h-10 bg-gray-200 rounded w-1/2 mx-auto"></div> {/* Name input */}
      </div>

      {/* Navigation Buttons Skeleton */}
      <div className="flex justify-between mt-10 gap-4 w-full">
        <div className="h-12 bg-gray-300 rounded-md w-48"></div>
        <div className="h-12 bg-gray-300 rounded-md w-48"></div>
      </div>
    </div>
  );

  // =============================
  // ===== Page Readiness Check =====
  // =============================
  if (!pageReady) {
    return <Step3Skeleton />;
  }

  // =============================
  // ===== Main Render for Step 3 =====
  // =============================
  return (
    <>
      <div className="w-full mx-auto pb-12 lg:mr-[28.25rem]">
        {' '}
        {/* Retain bottom padding, or manage spacing within sections */}
        {/* Policyholder Information Section */}
        <div className="mb-10 shadow-2xl border-0 bg-white/90 p-8 sm:p-10 md:p-12 rounded-2xl w-full">
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

          {/* =============================
          // ===== Policyholder Name Fields =====
          // ============================= */}
          <div className="space-y-10">
            {' '}
            {/* Retained space-y-10 from original admin for consistency within this card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {' '}
              {/* Matched gap from Step3Form */}
              {/* First Name */}
              <div className="mb-4">
                <label
                  htmlFor="firstName"
                  className="block font-medium text-gray-800 mb-1 text-left"
                >
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  value={state.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  onKeyDown={handleNameKeyDown}
                  className={`w-full border text-left rounded-md py-2 px-4 ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500 mt-1 text-left">{errors.firstName}</p>
                )}
              </div>
              {/* Last Name */}
              <div className="mb-4">
                <label
                  htmlFor="lastName"
                  className="block font-medium text-gray-800 mb-1 text-left"
                >
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="lastName"
                  value={state.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  onKeyDown={handleNameKeyDown}
                  className={`w-full border text-left rounded-md py-2 px-4 ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500 mt-1 text-left">{errors.lastName}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* =============================
        // ===== Contact Information Section =====
        // ============================= */}
        <div className="mb-8 shadow-lg border-0 bg-white p-4 sm:p-8 md:p-10 lg:p-12 rounded-2xl w-full">
          <div className="flex flex-col sm:flex-row items-center justify-center text-center sm:text-left mb-4 gap-2 sm:gap-4">
            <div className="flex-shrink-0 mb-2 sm:mb-0">
              <Phone size={28} className="text-blue-600" />
            </div>
            <div>
              <div className="text-lg sm:text-xl md:text-2xl font-extrabold leading-tight mb-1">
                Contact Information
              </div>
              <div className="text-sm sm:text-base text-gray-500 font-medium leading-tight">
                How we can reach you regarding your policy
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full px-2 sm:px-4 md:px-2">
            {/* Phone Number */}
            <div className="mb-4">
              <label htmlFor="phone" className="block font-medium text-gray-800 mb-1 text-left">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="phone"
                  type="tel"
                  value={formattedPhone}
                  onChange={handlePhoneChange}
                  placeholder="(123) 456-7890"
                  className={`text-left w-full border rounded-md py-2 px-3 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1 text-left">{errors.phone}</p>
              )}
            </div>

            {/* Relationship to Honorees */}
            <div className="mb-4">
              <label
                htmlFor="relationship"
                className="block font-medium text-gray-800 mb-1 text-left"
              >
                Relationship to Honorees <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="relationship"
                  value={state.relationship}
                  onChange={(e) => handleInputChange('relationship', e.target.value)}
                  className={`appearance-none w-full text-left border rounded-md py-2 pl-3 pr-10 ${
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
                <p className="text-sm text-red-500 mt-1 text-left">{errors.relationship}</p>
              )}
            </div>

            {/* How Did You Hear About Us */}
            <div className="mb-4">
              <label
                htmlFor="hearAboutUs"
                className="block font-medium text-gray-800 mb-1 text-left"
              >
                How Did You Hear About Us?
              </label>
              <div className="relative">
                <select
                  id="hearAboutUs"
                  value={state.hearAboutUs}
                  onChange={(e) => handleInputChange('hearAboutUs', e.target.value)}
                  className="appearance-none w-full text-left border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        {/* =============================
        // ===== Mailing Address Section =====
        // ============================= */}
        <div className="mb-8 shadow-lg border-0 bg-white p-8 sm:p-10 md:p-12 rounded-2xl w-full">
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

          <div className="space-y-8 w-full px-2 sm:px-4 md:px-8">
            {/* Address */}
            <div className="mb-4">
              <label htmlFor="address" className="block font-medium text-gray-800 mb-1 text-left">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                id="address"
                value={state.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Street Address"
                className={`w-full border rounded-md py-2 px-3 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 text-left`}
              />
              {errors.address && (
                <p className="text-sm text-red-500 mt-1 text-left">{errors.address}</p>
              )}
            </div>

            {/* Country + City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              <div className="mb-4">
                <label htmlFor="country" className="block font-medium text-gray-800 mb-1 text-left">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  id="country"
                  value={state.country} // Assuming state.country is pre-filled
                  disabled
                  className="w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-100 cursor-not-allowed text-left"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="city" className="block font-medium text-gray-800 mb-1 text-left">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  id="city"
                  value={state.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={`w-full border rounded-md py-2 px-3 ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 text-left`}
                />
                {errors.city && (
                  <p className="text-sm text-red-500 mt-1 text-left">{errors.city}</p>
                )}
              </div>
            </div>

            {/* State + Zip */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              <div className="mb-4">
                <label htmlFor="state" className="block font-medium text-gray-800 mb-1 text-left">
                  State <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="state"
                    value={state.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className={`appearance-none w-full text-left border rounded-md py-2 pl-3 pr-10 ${
                      errors.state ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="" disabled>
                      Select state
                    </option>
                    {US_STATES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={18}
                  />
                </div>
                {errors.state && (
                  <p className="text-sm text-red-500 mt-1 text-left">{errors.state}</p>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="zip" className="block font-medium text-gray-800 mb-1 text-left">
                  ZIP Code <span className="text-red-500">*</span>
                </label>
                <input
                  id="zip"
                  value={state.zip}
                  onChange={(e) => handleInputChange('zip', e.target.value)}
                  placeholder="12345"
                  className={`w-full border rounded-md py-2 px-3 ${
                    errors.zip ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 text-left`}
                />
                {errors.zip && <p className="text-sm text-red-500 mt-1 text-left">{errors.zip}</p>}
              </div>
            </div>
          </div>
        </div>
        {/* =============================
        // ===== Legal Notices Section =====
        // ============================= */}
        <div className="mb-8 shadow-lg border-0 bg-white p-8 sm:p-10 md:p-12 rounded-2xl w-full">
          <div className="space-y-8 w-full px-2 sm:px-4 md:px-8">
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
                  The company reserves the right to verify any information provided and may adjust
                  or deny claims based on investigation findings.
                </li>
                <li>
                  If payment is authorized, I understand the coverage begins on the specified date
                  and ends after the event date according to policy terms.
                </li>
              </ul>
            </div>
            <div className="mb-4">
              <label
                htmlFor="legalNotices"
                className="block font-medium text-gray-800 mb-1 text-left"
              >
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
                onChange={(checked) => handleInputChange('legalNotices', checked)}
                error={!!errors.legalNotices}
                className="justify-start" // Matched customer page
              />
              {errors.legalNotices && (
                <p className="text-sm text-red-500 mt-1 text-left">{errors.legalNotices}</p>
              )}
            </div>

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
                onChange={(e) => handleInputChange('completingFormName', e.target.value)}
                onKeyDown={handleNameKeyDown}
                placeholder="Full Name"
                className={`block w-[60%] text-left mx-auto rounded-md shadow-sm text-base font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border pl-4 pr-4 py-2 ${
                  // Matched customer page
                  errors.completingFormName
                    ? 'border-red-400 text-red-900 placeholder-red-300 bg-red-50'
                    : 'border-gray-200 text-gray-900 placeholder-gray-400 text-left' // Added text-left
                }`}
              />
              {errors.completingFormName && (
                <p className="text-sm text-red-500 mt-1 text-center">
                  {' '}
                  {/* Customer page has this centered */}
                  {errors.completingFormName}
                </p>
              )}
            </div>
          </div>
        </div>
        {/* =============================
        // ===== Navigation Buttons =====
        // ============================= */}
        <div className="flex justify-between mt-10 gap-4 w-full">
          <Button
            variant="secondary"
            onClick={handleBack}
            onMouseEnter={() => router.prefetch('/admin/create-quote/step2')}
            className="transition-transform duration-150 hover:scale-105"
          >
            Back to Event Details
          </Button>
          <Button
            variant="primary"
            onClick={handleContinue}
            onMouseEnter={() => router.prefetch('/admin/create-quote/step4')}
            className="transition-transform duration-150 hover:scale-105"
          >
            Continue to Review
          </Button>
        </div>
      </div>
      {/* =============================
      // ===== Quote Preview Sidebar =====
      // ============================= */}
      {/* <div className="hidden lg:block fixed w-80 right-11 mr-2 top-[260px] z-10">
        {' '}
        <QuotePreview />
      </div> */}
    </>
  );
}
