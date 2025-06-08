"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, CalendarCheck, ChevronDown } from "lucide-react"; // Added ChevronDown
import { useQuote } from "@/context/QuoteContext";
import type { QuoteState } from "@/context/QuoteContext";
import { Button } from "@/components/ui/Button";
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
// import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";

const QuotePreview = dynamic(() => import("@/components/ui/QuotePreview"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 flex items-center justify-center bg-gray-100 rounded-lg shadow">
      <p className="text-gray-500">Loading Preview...</p>
    </div>
  ),
});

// Skeleton Component for Step 2
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
          {[...Array(4)].map((_, i) => ( // For Address, City, State, Zip pairs
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-1/4 mx-auto"></div> {/* Label */}
              <div className="h-10 bg-gray-200 rounded w-72 mx-auto"></div> {/* Input/Select */}
            </div>
          ))}
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

export default function EventInformation() {
  const router = useRouter();
  const { state, dispatch } = useQuote();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    // Replace with real admin auth check
    const isAdminAuthenticated = () => {
      // Use the same key as AdminLayout
      return (
        typeof window !== "undefined" &&
        localStorage.getItem("admin_logged_in") === "true"
      );
    };

    // Simulate page readiness and perform checks
    const timer = setTimeout(() => {
      if (!isAdminAuthenticated()) {
        router.replace("/admin/login");
        return; // Stop further execution if redirecting
      }
      if (!state.step1Complete) {
        router.replace("/admin/create-quote/step1");
        return; // Stop further execution if redirecting
      }
      setPageReady(true); // Page is ready to be displayed
    }, 300); // Short delay to make skeleton visible for demo purposes

    return () => clearTimeout(timer);
  }, [router, state.step1Complete]); // state.step1Complete is a dependency

  const handleInputChange = (
    field: keyof QuoteState,
    value: string | boolean
  ) => {
    // Ensure pageReady is true before allowing input changes if needed,
    // though typically inputs would be disabled or not present if !pageReady
    // For this setup, direct interaction implies pageReady is true.
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
    if (isEmpty(state.honoree1FirstName))
      newErrors.honoree1FirstName = "Please enter the first name";
    if (isEmpty(state.honoree1LastName))
      newErrors.honoree1LastName = "Please enter the last name";
    if (isEmpty(state.ceremonyLocationType))
      newErrors.ceremonyLocationType = "Please select a venue type";
    if (isEmpty(state.indoorOutdoor))
      newErrors.indoorOutdoor = "Please select indoor/outdoor option";
    if (isEmpty(state.venueName))
      newErrors.venueName = "Please enter the venue name";
    if (isEmpty(state.venueAddress1))
      newErrors.venueAddress1 = "Please enter the venue address";
    if (isEmpty(state.venueCity)) newErrors.venueCity = "Please enter the city";
    if (isEmpty(state.venueState))
      newErrors.venueState = "Please select a state";
    if (isEmpty(state.venueZip))
      newErrors.venueZip = "Please enter the ZIP code";
    else if (!isValidZip(state.venueZip))
      newErrors.venueZip = "Please enter a valid ZIP code";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBack = () => {
    router.push("/admin/create-quote/step1");
  };

  const handleContinue = () => {
    if (validateForm()) {
      dispatch({ type: "COMPLETE_STEP", step: 2 });
      router.push("/admin/create-quote/step3");
    } else {
      // Show toast for each missing field
      Object.entries(errors).forEach(([field, message]) => {
        toast.error(message);
      });
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  };

  const isCruiseShip = state.ceremonyLocationType === "cruise_ship";

  if (!pageReady) {
    return <EventInformationSkeleton />;
  }

  return (
    <>
      {/* Outermost div simplified: max-width, margins, horizontal padding, and top margin are now handled by CreateQuoteLayout.tsx */}
      <div className="w-full pb-12">
        {" "}
        {/* Retain bottom padding, or manage spacing within sections */}
        {/* Honoree Information */}
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
                    onChange={(e) =>
                      handleInputChange("honoree1FirstName", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleInputChange("honoree1LastName", e.target.value)
                    }
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
                Honoree #2{" "}
                <span className="text-semibold text-sm text-gray-400">
                  (if applicable)
                </span>
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
                    onChange={(e) =>
                      handleInputChange("honoree2FirstName", e.target.value)
                    }
                    placeholder="Jane"
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
                    onChange={(e) =>
                      handleInputChange("honoree2LastName", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleInputChange("ceremonyLocationType", e.target.value)
                    }
                    className={`block w-full rounded-md shadow-sm pl-3 pr-10 py-2 text-base border appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.ceremonyLocationType
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

              {/* Indoor/Outdoor */}
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
                    className={`block w-full rounded-md shadow-sm pl-3 pr-10 py-2 text-base border appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.indoorOutdoor
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
              <div className="w-full">
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

            {/* Cruise ship conditionals */}
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
                      className="text-left w-full"
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
                      className="text-left w-full"
                    />
                  </div>
                  {errors.venueAddress1 && (
                    <p className="text-sm text-red-500 mt-1">{errors.venueAddress1}</p>
                  )}
                </div>
                <div className="mb-4 text-left">
                  <label htmlFor="venueAddress2" className="block mb-1 font-medium text-gray-800">Address Line 2</label>
                  <div className="w-full">
                    <Input
                      id="venueAddress2"
                      value={state.venueAddress2}
                      onChange={(e) =>
                        handleInputChange("venueAddress2", e.target.value)
                      }
                      placeholder="Apt, Suite, Building (optional)"
                      className="text-left w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Country, City, State are only relevant if not a cruise ship */}
            {!isCruiseShip && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  {/* Country */}
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
                        className={`block w-full rounded-md shadow-sm pl-3 pr-10 py-2 text-base border appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.venueCountry
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

                  {/* City */}
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
                        className="text-left w-full"
                      />
                    </div>
                    {errors.venueCity && (
                      <p className="text-sm text-red-500 mt-1">{errors.venueCity}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  {/* State */}
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
                        className={`block w-full rounded-md shadow-sm pl-3 pr-10 py-2 text-base border appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.venueState
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
                  {/* ZIP Code */}
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
            <div className="mb-4 text-left">
              <div className="w-full flex justify-start"> {/* Align checkbox to the left */}
              <Checkbox
                id="venueAsInsured"
                label={<span className="font-medium text-left">Add this venue as an Additional Insured on my policy</span>}
                checked={state.venueAsInsured}
                onChange={(checked) =>
                  handleInputChange("venueAsInsured", checked)
                }
              />
            </div>
            </div>
          </div>
        </div>
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
