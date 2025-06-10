import React from "react";
import { User, Phone, MapPin, ChevronDown, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import { US_STATES, RELATIONSHIP_OPTIONS, REFERRAL_OPTIONS } from "@/utils/constants";

type Step3FormProps = {
    state: Record<string, any>;
    errors: Record<string, string>;
    onChange: (field: string, value: any) => void;
    onSave?: () => void;
    isRestored?: boolean;
};

export default function Step3Form({ state, errors, onChange, onSave, isRestored = false }: Step3FormProps) {
    return (
        <>
            {isRestored && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center text-blue-800">
                        <AlertCircle size={20} className="mr-2" />
                        <span className="font-medium">This form has been restored from a previous version. Review the changes before saving.</span>
                    </div>
                </div>
            )}
            {/* Policyholder Information Section */}
            <div className="mb-10 shadow-2xl border-0 bg-white/90 p-8 sm:p-10 md:p-12 rounded-2xl w-full max-w-4xl mx-auto">
                <div className="flex items-center justify-center text-left mb-4 gap-4">
                    <div className="flex-shrink-0">
                        <User size={36} className="text-indigo-600" />
                    </div>
                    <div>
                        <div className="text-xl md:text-2xl font-extrabold leading-tight mb-1">Policyholder Information</div>
                        <div className="text-base text-gray-500 font-medium leading-tight">
                            Enter the policyholder&apos;s details
                        </div>
                    </div>
                </div>

                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                        {/* First Name */}
                        <div className="mb-4">
                            <label htmlFor="firstName" className="block font-medium text-gray-800 mb-1">
                                First Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="firstName"
                                value={state.firstName}
                                onChange={e => onChange('firstName', e.target.value)}
                                className={`w-full border rounded-md py-2 px-4 mx-auto ${errors.firstName ? 'border-red-500' : 'border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                            />
                            {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
                        </div>

                        {/* Last Name */}
                        <div className="mb-4">
                            <label htmlFor="lastName" className="block font-medium text-gray-800 mb-1">
                                Last Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="lastName"
                                value={state.lastName}
                                onChange={e => onChange('lastName', e.target.value)}
                                className={`w-full border rounded-md py-2 px-4 mx-auto ${errors.lastName ? 'border-red-500' : 'border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                            />
                            {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Information Section */}
            <div className="mb-8 shadow-lg border-0 bg-white p-8 sm:p-10 md:p-12 rounded-2xl w-full max-w-4xl mx-auto">
                <div className="flex items-center justify-center text-left mb-4 gap-4">
                    <div className="flex-shrink-0">
                        <Phone size={28} className="text-blue-600" />
                    </div>
                    <div>
                        <div className="text-xl md:text-2xl font-extrabold leading-tight mb-1">Contact Information</div>
                        <div className="text-base text-gray-500 font-medium leading-tight">How we can reach you regarding your policy</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full px-2 sm:px-4 md:px-2">

                    {/* Phone Number */}
                    <div className="mb-4">
                        <label htmlFor="phone" className="block font-medium text-gray-800 mb-1">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                id="phone"
                                type="tel"
                                value={state.phone}
                                onChange={e => onChange('phone', e.target.value)}
                                placeholder="(123) 456-7890"
                                className={`text-center w-full border rounded-md py-2 pr-2 ${errors.phone ? 'border-red-500' : 'border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                        </div>
                        {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                    </div>

                    {/* Relationship to Honorees */}
                    <div className="mb-4">
                        <label htmlFor="relationship" className="block font-medium text-gray-800 mb-1">
                            Relationship to Honorees <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                id="relationship"
                                value={state.relationship}
                                onChange={e => onChange('relationship', e.target.value)}
                                className={`appearance-none w-full text-center border rounded-md py-2 pl-3 pr-10 ${errors.relationship ? 'border-red-500' : 'border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            >
                                <option value="" disabled>Select relationship</option>
                                {RELATIONSHIP_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        </div>
                        {errors.relationship && <p className="text-sm text-red-500 mt-1">{errors.relationship}</p>}
                    </div>

                    {/* How Did You Hear About Us */}
                    <div className="mb-4">
                        <label htmlFor="hearAboutUs" className="block font-medium text-gray-800 mb-1">
                            How Did You Hear About Us?
                        </label>
                        <div className="relative">
                            <select
                                id="hearAboutUs"
                                value={state.hearAboutUs}
                                onChange={e => onChange('hearAboutUs', e.target.value)}
                                className="appearance-none w-full text-center border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select option (optional)</option>
                                {REFERRAL_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        </div>
                    </div>

                </div>
            </div>

            {/* Mailing Address Section */}
            <div className="mb-8 shadow-lg border-0 bg-white p-8 sm:p-10 md:p-12 rounded-2xl w-full max-w-4xl mx-auto">
                <div className="flex items-center justify-center text-left mb-4 gap-4">
                    <div className="flex-shrink-0">
                        <MapPin size={28} className="text-blue-600" />
                    </div>
                    <div>
                        <div className="text-xl md:text-2xl font-extrabold leading-tight mb-1">Mailing Address</div>
                        <div className="text-base text-gray-500 font-medium leading-tight">
                            Where should we send physical policy documents?
                        </div>
                    </div>
                </div>

                <div className="space-y-8 w-full px-2 sm:px-4 md:px-8">
                    {/* Address */}
                    <div className="mb-4">
                        <label htmlFor="address" className="block font-medium text-gray-800 mb-1">
                            Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="address"
                            value={state.address}
                            onChange={e => onChange('address', e.target.value)}
                            placeholder="Street Address"
                            className={`w-full border rounded-md py-2 px-3 ${errors.address ? 'border-red-500' : 'border-gray-300'
                                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
                    </div>

                    {/* Country + City */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                        {/* Country */}
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

                        {/* City */}
                        <div className="mb-4">
                            <label htmlFor="city" className="block font-medium text-gray-800 mb-1">
                                City <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="city"
                                value={state.city}
                                onChange={e => onChange('city', e.target.value)}
                                className={`w-full border rounded-md py-2 px-3 ${errors.city ? 'border-red-500' : 'border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                            {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
                        </div>
                    </div>

                    {/* State + Zip */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                        {/* State */}
                        <div className="mb-4">
                            <label htmlFor="state" className="block font-medium text-gray-800 mb-1">
                                State <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    id="state"
                                    value={state.state}
                                    onChange={e => onChange('state', e.target.value)}
                                    className={`appearance-none w-full border rounded-md py-2 pl-3 pr-10 ${errors.state ? 'border-red-500' : 'border-gray-300'
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                >
                                    <option value="" disabled>Select state</option>
                                    {US_STATES.map(state => (
                                        <option key={state.value} value={state.value}>{state.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            </div>
                            {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state}</p>}
                        </div>

                        {/* ZIP Code */}
                        <div className="mb-4">
                            <label htmlFor="zip" className="block font-medium text-gray-800 mb-1">
                                ZIP Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="zip"
                                value={state.zip}
                                onChange={e => onChange('zip', e.target.value)}
                                placeholder="12345"
                                className={`w-full border rounded-md py-2 px-3 ${errors.zip ? 'border-red-500' : 'border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                            {errors.zip && <p className="text-sm text-red-500 mt-1">{errors.zip}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Legal Notices Section */}
            <div className="mb-8 shadow-lg border-0 bg-white p-8 sm:p-10 md:p-12 rounded-2xl w-full max-w-4xl mx-auto">
                {/* This card did not have a title, subtitle, or icon, so we don't need to recreate that header structure */}
                <div className="space-y-8 w-full px-2 sm:px-4 md:px-8">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 mb-4">
                        <h3 className="font-semibold text-yellow-800 mb-2">Legal Notices</h3>
                        <p className="text-sm text-gray-700 mb-4">
                            By proceeding with this insurance application, I understand and agree to the following:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                            <li>All information I have provided is accurate and complete to the best of my knowledge.</li>
                            <li>Coverage is subject to the terms, conditions, and exclusions of the policy.</li>
                            <li>This insurance does not cover cancellations or impacts due to COVID-19, pandemics, or communicable diseases.</li>
                            <li>The company reserves the right to verify any information provided and may adjust or deny claims based on investigation findings.</li>
                            <li>If payment is authorized, I understand the coverage begins on the specified date and ends after the event date according to policy terms.</li>
                        </ul>
                    </div>
                    {/* Legal Acceptance */}
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
                            onChange={checked => onChange('legalNotices', checked)}
                            error={!!errors.legalNotices}
                        />
                        {errors.legalNotices && <p className="text-sm text-red-500 mt-1">{errors.legalNotices}</p>}
                    </div>

                    {/* Name of Person Completing Form */}
                    <div className="mb-4">
                        <label htmlFor="completingFormName" className="block text-center font-medium text-gray-800 mb-1">
                            Name of person completing this form <span className="text-red-500">*</span>
                            <span className="ml-2 text-gray-400" title="Please enter your full name to verify your acceptance">
                                ⓘ
                            </span>
                        </label>
                        <input
                            id="completingFormName"
                            type="text"
                            value={state.completingFormName}
                            onChange={e => onChange('completingFormName', e.target.value)}
                            placeholder="Full Name"
                            className={`block w-[60%] text-center mx-auto rounded-md shadow-sm text-base font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border pl-4 pr-4 py-2 ${
                                errors.completingFormName
                                    ? 'border-red-400 text-red-900 placeholder-red-300 bg-red-50'
                                    : 'border-gray-200 text-gray-900 placeholder-gray-400'
                            }`}
                        />
                        {errors.completingFormName && (
                            <p className="text-sm text-red-500 mt-1">{errors.completingFormName}</p>
                        )}
                    </div>
                </div>
            </div>
            
            
            <div className="flex flex-col md:flex-row justify-end mt-8 gap-4 w-full">
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
        </>
    );
} 