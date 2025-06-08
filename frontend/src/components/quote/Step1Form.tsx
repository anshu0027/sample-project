import React, { useEffect } from "react";
import { AlertCircle, DollarSign, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import DatePicker from "@/components/ui/DatePicker";
import {
    US_STATES,
    EVENT_TYPES,
    GUEST_RANGES,
    COVERAGE_LEVELS,
    LIABILITY_OPTIONS,
    // PROHIBITED_ACTIVITIES,
    LIQUOR_LIABILITY_PREMIUMS,
    LIQUOR_LIABILITY_PREMIUMS_NEW,
    CORE_COVERAGE_PREMIUMS, // Added
    LIABILITY_COVERAGE_PREMIUMS, // Added
    COVERAGE_DETAILS, // Added
} from "@/utils/constants";

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
}

export default function Step1Form({
    state,
    errors,
    onChange,
    onValidate,
    onContinue,
    showQuoteResults,
    handleCalculateQuote,
    onSave,
    isCustomerEdit = false
}: Step1FormProps) {
    const selectedDate = state.eventDate ? new Date(state.eventDate) : null;
    const minDate = new Date();
    minDate.setHours(minDate.getHours() + 48);
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 2);
    // const isLiquorLiabilityDisabled = state.liabilityCoverage === 'none';

    useEffect(() => {
      const isLiquorLiabilityDisabled = state.liabilityCoverage === 'none';
      //if liabilityCoverage is none, disable liquorLiability as well
      if (isLiquorLiabilityDisabled && state.liquorLiability) {
        onChange('liquorLiability', false);
      }
    }, [state.liabilityCoverage, onChange, state.liquorLiability]);

    return (
        // Replaced Card with div and merged styles
        <div className="w-full max-w-4xl mx-auto mb-10 text-center shadow-2xl border-0 bg-white/90 rounded-2xl p-8 sm:p-10 md:p-12">
            <div className="mb-8">
                <p className="text-3xl md:text-4xl font-extrabold text-blue-900 drop-shadow text-center">Get Your Wedding Insurance Quote</p>
                <p className="text-lg md:text-xl text-blue-700 font-medium text-center">Tell us about your event to receive an instant quote</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2 sm:px-4 md:px-2"> {/* Adjusted gap and padding */}
                {/* Resident State */}
                <div className="flex flex-col">
                    <label
                        htmlFor="residentState"
                        className="font-semibold text-gray-800 text-left mb-1"
                    >
                        Policy Holder's Resident State <span className="text-red-500">*</span>
                    </label>
                    <div className="relative w-full">
                        <select
                            id="residentState"
                            value={state.residentState}
                            onChange={e => onChange('residentState', e.target.value)}
                            className={`w-full p-2 pr-8 border rounded-xl text-left appearance-none ${errors.residentState ? "border-red-500" : "border-gray-300"
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
                        Event Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative w-full">
                        <select
                            id="eventType"
                            value={state.eventType}
                            onChange={e => onChange('eventType', e.target.value)}
                            className={`w-full p-2 pr-8 border rounded-xl text-left appearance-none ${errors.eventType ? "border-red-500" : "border-gray-300"
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

                {/* Maximum Guests */}
                <div className="flex flex-col">
                    <label htmlFor="maxGuests" className="font-semibold text-gray-800 text-left mb-1">
                        Maximum Number of Guests <span className="text-red-500">*</span>
                    </label>
                    <div className="relative w-full">
                        <select
                            id="maxGuests"
                            value={state.maxGuests}
                            onChange={e => onChange('maxGuests', e.target.value)}
                            className={`w-full p-2 pr-8 border rounded-xl text-left appearance-none ${errors.maxGuests ? "border-red-500" : "border-gray-300"
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
                        Event Date <span className="text-red-500">*</span>
                    </label>
                    <DatePicker
                        selected={selectedDate}
                        onChange={date => onChange('eventDate', date ? date.toISOString().split('T')[0] : '')}
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

                {/* Email and Coverage Level Container */}
                <div className="flex flex-col md:col-span-2 gap-6">
                    {/* Email Address */}
                    <div className="flex flex-col">
                        <label
                            htmlFor="email"
                            className="font-semibold text-gray-800 text-left mb-1"
                        >
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={state.email || ''}
                            onChange={e => onChange('email', e.target.value)}
                            placeholder="you@email.com"
                            required
                            className={`w-full text-left p-2 border rounded-xl ${errors.email ? "border-red-500" : "border-gray-300"
                                }`}
                        />
                        {errors.email && (
                            <p className="mt-1 text-xs text-red-500 text-left">{errors.email}</p>
                        )}
                    </div>

                    {/* Coverage Level */}
                    <div className="flex flex-col">
                        <label
                            htmlFor="coverageLevel"
                            className="font-semibold text-gray-800 text-left mb-1"
                        >
                            Core Coverage Level <span className="text-red-500">*</span>
                        </label>
                        <div className="relative w-full">
                            <select
                                id="coverageLevel"
                                value={state.coverageLevel?.toString() || ''}
                                onChange={e => onChange('coverageLevel', parseInt(e.target.value))}
                                className={`w-full p-2 pr-8 border rounded-xl text-left appearance-none ${errors.coverageLevel ? "border-red-500" : "border-gray-300"
                                    }`}
                            >
                                <option value="">Select coverage level</option>
                                {COVERAGE_LEVELS.map(level => {
                                    let premiumText = "";
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
                                            {level.label}{premiumText}
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
                            onChange={e => onChange('liabilityCoverage', e.target.value)}
                            className={`w-full p-2 pr-8 border rounded-xl text-left appearance-none ${errors.liabilityCoverage ? "border-red-500" : "border-gray-300"
                                }`}
                        >
                            {LIABILITY_OPTIONS.map((option) => {
                                let premiumText = "";
                                if (
                                    option.value &&
                                    state.maxGuests &&
                                    LIABILITY_COVERAGE_PREMIUMS[state.maxGuests] &&
                                    LIABILITY_COVERAGE_PREMIUMS[state.maxGuests][option.value] !== undefined
                                ) {
                                    const premium = LIABILITY_COVERAGE_PREMIUMS[state.maxGuests][option.value];
                                    if (option.value === "none" && premium === 0) {
                                        premiumText = ` (+$${premium})`;
                                    } else if (option.value !== "none" && premium >= 0) {
                                        premiumText = ` (+$${premium})`;
                                    }
                                }
                                return (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                        className={option.isNew ? "text-red-400" : ""}
                                    >{option.label}{premiumText}</option>
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

                {/* Host Liquor Liability */}
                <div className="flex flex-col items-start">
                    <label
                        htmlFor="liquorLiability"
                        className="font-semibold text-gray-800 text-left mb-1"
                    >
                        Host Liquor Liability
                    </label>
                    <Checkbox
                        id="liquorLiability"
                        label={
                            <span className={`font-medium text-left text-sm sm:text-base ${state.liabilityCoverage === 'none' ? 'text-gray-400' : ''}`}>
                                Yes, add Host Liquor Liability coverage{' '}
                                {state.liabilityCoverage !== 'none' && state.maxGuests
                                    ? `(+$${LIABILITY_OPTIONS.find(o => o.value === state.liabilityCoverage && o.isNew)
                                        ? LIQUOR_LIABILITY_PREMIUMS_NEW[state.maxGuests]
                                        : LIQUOR_LIABILITY_PREMIUMS[state.maxGuests]})`
                                    : ''}
                            </span>
                        }
                        checked={state.liquorLiability}
        onChange={checked => {
                            onChange('liquorLiability', checked);
                            // Also set liquorLiability to false if liabilityCoverage is 'none'
                            if (state.liabilityCoverage === 'none') {
                                onChange('liquorLiability', false);
                            }
                        }}
                        disabled={state.liabilityCoverage === 'none'}
                        description={<span className="text-left text-xs sm:text-base">
                            {state.liabilityCoverage === 'none'
                                ? 'You must select Liability Coverage to add Host Liquor Liability'
                                : 'Provides coverage for alcohol-related incidents if alcohol is served at your event'}
                        </span>}
                        error={!!errors.liquorLiability}
                    />
                    {errors.liquorLiability && (
                        <p className="mt-1 text-xs text-red-500 text-left">{errors.liquorLiability}</p>
                    )}
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
                        label={<span className="font-medium text-left text-sm sm:text-base">My event will include special activities or features</span>}
                        checked={state.specialActivities}
                        onChange={checked => onChange('specialActivities', checked)}
                        description={<span className="text-left text-xs sm:text-base">Examples: fireworks, bounce houses, live animals, etc.</span>}
                        disabled={isCustomerEdit}
                        error={!!errors.specialActivities}
                    />
                    {errors.specialActivities && (
                        <p className="mt-1 text-xs text-red-500 text-left">{errors.specialActivities}</p>
                    )}
                </div>
            </div>

            {/* COVID Disclosure - Full Width Block */}
            <div className="px-2 sm:px-4 md:px-8 mt-8"> {/* Added mt-8 for spacing from grid */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 mt-8 flex flex-col sm:flex-row items-start gap-3">
                    <AlertCircle size={20} className="text-yellow-500 mt-1" />
                    <div className="w-full text-left"> {/* Ensure this div takes full width and aligns text left */}
                        <h3 className="font-semibold text-yellow-800 mb-1 text-sm sm:text-base">Important Disclosures</h3>
                        <div className="mt-3"> {/* Replaces FormField */}
                            <label htmlFor="covidDisclosure" className="block font-medium text-gray-800 text-sm sm:text-base mb-1">
                                COVID-19 Exclusion Acknowledgment <span className="text-red-500">*</span>
                            </label>
                            <Checkbox
                                id="covidDisclosure"
                                label={<span className="font-medium text-sm sm:text-base">I understand that cancellations or impacts due to COVID-19, pandemics, or communicable diseases are not covered by this policy</span>}
                                checked={state.covidDisclosure}
                                onChange={checked => onChange('covidDisclosure', checked)}
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
            <div className="px-2 sm:px-4 md:px-8"> {/* Wrapper for buttons to align with padding */}
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
                    {onSave && (
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={onSave}
                            className="transition-transform duration-150 hover:scale-105"
                        >
                            Save
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
