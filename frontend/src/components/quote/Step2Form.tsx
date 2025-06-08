import React from "react";
import { MapPin, CalendarCheck, ChevronDown } from "lucide-react";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
// import Select from "@/components/ui/Select";
import Checkbox from "@/components/ui/Checkbox";
import { VENUE_TYPES, INDOOR_OUTDOOR_OPTIONS, COUNTRIES, US_STATES } from "@/utils/constants";

type Step2FormProps = {
    state: Record<string, any>;
    errors: Record<string, string | undefined>;
    onChange: (field: string, value: any) => void;
    onValidate?: () => void;
    onContinue?: () => void;
    onSave?: () => void;
};

export default function Step2Form({ state, errors, onChange, onValidate, onContinue, onSave }: Step2FormProps) {
    const isCruiseShip = state.ceremonyLocationType === 'cruise_ship';
    return (
        <>
            {/* Honoree Information Section */}
            <div className="mb-10 shadow-2xl border-0 bg-white/90 p-8 sm:p-10 md:p-12 rounded-2xl w-full max-w-4xl mx-auto">
                <div className="flex items-center justify-center text-center mb-4 gap-4">
                    <div className="flex-shrink-0">
                        <CalendarCheck size={36} className="text-indigo-600" />
                    </div>
                    <div>
                        <div className="text-xl md:text-2xl font-extrabold leading-tight mb-1">Honoree Information</div>
                        <div className="text-base text-gray-500 font-medium leading-tight">Tell us who is being celebrated</div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    <div>
                        <h3 className="font-bold text-gray-700 mb-4 text-left text-lg">Honoree #1</h3>
                        <div className="mb-4">
                            <label htmlFor="honoree1FirstName" className="block mb-1">
                                <span className="font-medium text-gray-800">First Name</span>
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="w-full mx-auto">
                                <Input
                                    id="honoree1FirstName"
                                    value={state.honoree1FirstName}
                                    onChange={e => onChange('honoree1FirstName', e.target.value)}
                                    error={!!errors.honoree1FirstName}
                                    className={`w-full text-left border rounded-md py-2 px-3 ${errors.honoree1FirstName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                />
                            </div>
                            {errors.honoree1FirstName && <p className="text-sm text-red-500 mt-1 text-center">{errors.honoree1FirstName}</p>}
                        </div>
                        <div className="mb-4">
                            <label htmlFor="honoree1LastName" className="block mb-1">
                                <span className="font-medium text-gray-800">Last Name</span>
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="w-full mx-auto">
                                <Input
                                    id="honoree1LastName"
                                    value={state.honoree1LastName}
                                    onChange={e => onChange('honoree1LastName', e.target.value)}
                                    error={!!errors.honoree1LastName}
                                    className={`w-full text-left border rounded-md py-2 px-3 ${errors.honoree1LastName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                />
                            </div>
                            {errors.honoree1LastName && <p className="text-sm text-red-500 mt-1 text-center">{errors.honoree1LastName}</p>}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-left text-gray-700 mb-4 text-lg">Honoree #2 <span className="text-semibold text-sm text-gray-400">(if applicable)</span></h3>
                        <div className="mb-4">
                            <label htmlFor="honoree2FirstName" className="block mb-1">
                                <span className="font-medium text-gray-800">First Name</span>
                            </label>
                            <div className="w-full">
                                <Input
                                    id="honoree2FirstName"
                                    value={state.honoree2FirstName}
                                    onChange={e => onChange('honoree2FirstName', e.target.value)}
                                    className="w-full text-left border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            {/* Optional: Add error display if honoree2FirstName can have errors */}
                        </div>
                        <div className="mb-4">
                            <label htmlFor="honoree2LastName" className="block mb-1">
                                <span className="font-medium text-gray-800">Last Name</span>
                            </label>
                            <div className="w-full">
                                <Input
                                    id="honoree2LastName"
                                    value={state.honoree2LastName}
                                    onChange={e => onChange('honoree2LastName', e.target.value)}
                                    className="w-full text-left border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            {/* Optional: Add error display if honoree2LastName can have errors */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Ceremony Venue Information Section */}
            <div className="mb-8 shadow-lg border-0 bg-white p-8 sm:p-10 md:p-12 rounded-2xl w-full max-w-4xl mx-auto">
                <div className="flex items-center justify-center text-center mb-4 gap-4">
                    <div className="flex-shrink-0">
                        <MapPin size={28} className="text-blue-600" />
                    </div>
                    <div>
                        <div className="text-xl md:text-2xl font-extrabold leading-tight mb-1">Ceremony Venue Information</div>
                        <div className="text-base text-gray-500 font-medium leading-tight">Details about where your event will be held</div>
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
                                <span className="ml-1 text-gray-400" title="The type of location where your event will be held">
                                    ⓘ
                                </span>
                            </label>
                            <div className="relative w-full">
                                <select
                                    id="ceremonyLocationType"
                                    value={state.ceremonyLocationType}
                                    onChange={e => onChange('ceremonyLocationType', e.target.value)}
                                    className={`block w-full rounded-xl shadow-sm border pl-3 pr-10 py-2 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.ceremonyLocationType ? 'border-red-500 text-red-900' : 'border-gray-300 text-gray-900'} text-left`}
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
                                    size={16} />
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
                                    onChange={e => onChange('indoorOutdoor', e.target.value)}
                                    className={`block w-full rounded-xl shadow-sm border pl-3 pr-10 py-2 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.indoorOutdoor ? 'border-red-500 text-red-900' : 'border-gray-300 text-gray-900'} text-left`}
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
                                    size={16} />
                            </div>
                            {errors.indoorOutdoor && (
                                <p className="text-sm text-red-500 mt-1">{errors.indoorOutdoor}</p>
                            )}
                        </div>
                    </div>
                    {/* Venue Name */}
                    <div className="mb-4 text-left">
                        <label
                            htmlFor="venueName"
                            className="block mb-1 font-medium text-gray-800"
                        >
                            Venue Name <span className="text-red-500">*</span>
                        </label>
                        <div className="w-full"> {/* Input container */}
                            <Input
                                id="venueName"
                                value={state.venueName}
                                onChange={e => onChange('venueName', e.target.value)}
                                error={!!errors.venueName}
                                placeholder={isCruiseShip ? "Cruise Ship Name" : "Venue Name"}
                                className={`w-full text-left border rounded-xl py-2 px-3 ${errors.venueName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                            />
                        </div>
                        {errors.venueName && <p className="text-sm text-red-500 mt-1">{errors.venueName}</p>}
                    </div>
                    {/* Different fields for cruise ship */}
                    {isCruiseShip ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                            {/* Cruise Line Name */}
                            <div className="mb-4 text-left">
                                <label htmlFor="venueAddress1" className="block mb-1 font-medium text-gray-800">
                                    Cruise Line Name <span className="text-red-500">*</span>
                                </label>
                                <div className="w-full">
                                    <Input
                                        id="venueAddress1"
                                        value={state.venueAddress1}
                                        onChange={e => onChange('venueAddress1', e.target.value)}
                                        error={!!errors.venueAddress1}
                                        placeholder="e.g., Royal Caribbean"
                                        className={`w-full text-left border rounded-md py-2 px-3 ${errors.venueAddress1 ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    />
                                </div>
                                {errors.venueAddress1 && <p className="text-sm text-red-500 mt-1">{errors.venueAddress1}</p>}
                            </div>
                            {/* Departure Port / City */}
                            <div className="mb-4 text-left">
                                <label htmlFor="venueCity" className="block mb-1 font-medium text-gray-800">
                                    Departure Port / City <span className="text-red-500">*</span>
                                </label>
                                <div className="w-full">
                                    <Input
                                        id="venueCity"
                                        value={state.venueCity}
                                        onChange={e => onChange('venueCity', e.target.value)}
                                        error={!!errors.venueCity}
                                        placeholder="e.g., Miami, Florida"
                                        className={`w-full text-left border rounded-md py-2 px-3 ${errors.venueCity ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    />
                                </div>
                                {errors.venueCity && <p className="text-sm text-red-500 mt-1">{errors.venueCity}</p>}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                            {/* Address Line 1 */}
                            <div className="mb-4 text-left">
                                <label htmlFor="venueAddress1" className="block mb-1 font-medium text-gray-800">
                                    Address Line 1 <span className="text-red-500">*</span>
                                </label>
                                <div className="w-full">
                                    <Input
                                        id="venueAddress1"
                                        value={state.venueAddress1}
                                        onChange={e => onChange('venueAddress1', e.target.value)}
                                        error={!!errors.venueAddress1}
                                        placeholder="Street Address"
                                        className={`w-full text-left border rounded-md py-2 px-3 ${errors.venueAddress1 ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    />
                                </div>
                                {errors.venueAddress1 && <p className="text-sm text-red-500 mt-1">{errors.venueAddress1}</p>}
                            </div>
                            {/* Address Line 2 */}
                            <div className="mb-4 text-left">
                                <label htmlFor="venueAddress2" className="block mb-1 font-medium text-gray-800">
                                    Address Line 2
                                </label>
                                <div className="w-full">
                                    <Input
                                        id="venueAddress2"
                                        value={state.venueAddress2}
                                        onChange={e => onChange('venueAddress2', e.target.value)}
                                        placeholder="Apt, Suite, Building (optional)"
                                        className="w-full text-left border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                {/* Optional: Add error display if venueAddress2 can have errors */}
                            </div>
                        </div>
                    )}
                    {/* Country, City, State are only relevant if not a cruise ship */}
                    {!isCruiseShip && (
                        <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                            {/* Country */}
                            <div className="mb-4 text-left">
                                <label htmlFor="venueCountry" className="block mb-1 font-medium text-gray-800">
                                    Country <span className="text-red-500">*</span>
                                </label>
                                <div className="relative w-full">
                                    <select
                                        id="venueCountry"
                                        value={state.venueCountry}
                                        onChange={e => onChange('venueCountry', e.target.value)}
                                        className={`block w-full rounded-xl shadow-sm border pl-3 pr-10 py-2 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.venueCountry ? 'border-red-500 text-red-900' : 'border-gray-300 text-gray-900'} text-left`}
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
                                        size={16} />
                                </div>
                                {errors.venueCountry && <p className="text-sm text-red-500 mt-1">{errors.venueCountry}</p>}
                            </div>
                            {/* City */}
                            <div className="mb-4 text-left">
                                <label htmlFor="venueCity" className="block mb-1 font-medium text-gray-800">
                                    City <span className="text-red-500">*</span>
                                </label>
                                <div className="w-full">
                                    <Input
                                        id="venueCity"
                                        value={state.venueCity}
                                        onChange={e => onChange('venueCity', e.target.value)}
                                        error={!!errors.venueCity}
                                        className={`w-full text-left border rounded-md py-2 px-3 ${errors.venueCity ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    />
                                </div>
                                {errors.venueCity && <p className="text-sm text-red-500 mt-1">{errors.venueCity}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                            {/* State */}
                            <div className="mb-4 text-left">
                                <label htmlFor="venueState" className="block mb-1 font-medium text-gray-800">
                                    State <span className="text-red-500">*</span>
                                </label>
                                <div className="relative w-full">
                                    <select
                                        id="venueState"
                                        value={state.venueState}
                                        onChange={e => onChange('venueState', e.target.value)}
                                        className={`block w-full rounded-xl shadow-sm border pl-3 pr-10 py-2 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.venueState ? 'border-red-500 text-red-900' : 'border-gray-300 text-gray-900'} text-left`}
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
                                        size={16} />
                                </div>
                                {errors.venueState && <p className="text-sm text-red-500 mt-1">{errors.venueState}</p>}
                            </div>
                            {/* ZIP Code */}
                            <div className="mb-4 text-left">
                                <label htmlFor="venueZip" className="block mb-1 font-medium text-gray-800">
                                    ZIP Code <span className="text-red-500">*</span>
                                </label>
                                <div className="w-full">
                                    <Input
                                        id="venueZip"
                                        value={state.venueZip}
                                        onChange={e => onChange('venueZip', e.target.value)}
                                        error={!!errors.venueZip}
                                        className={`w-full text-left rounded-md py-2 px-3 ${errors.venueZip ? 'border-red-500' : ''} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    />
                                </div>
                                {errors.venueZip && <p className="text-sm text-red-500 mt-1">{errors.venueZip}</p>}
                            </div>
                        </div>
                        </>
                    )}
                    {/* Add venue as Additional Insured */}
                    <div className="mb-4 text-left">
                        {/* The Checkbox component includes its own label structure */}
                        <Checkbox
                            id="venueAsInsured"
                            label={<span className="font-medium">Add this venue as an Additional Insured on my policy</span>}
                            checked={state.venueAsInsured}
                            onChange={checked => onChange('venueAsInsured', checked)}
                            className="" // Removed w-full justify-center, default Checkbox alignment should be sufficient
                        />
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