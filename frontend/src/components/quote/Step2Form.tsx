import React from "react";
import { MapPin, CalendarCheck, ChevronDown } from "lucide-react";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Checkbox from "@/components/ui/Checkbox";
import { VENUE_TYPES, INDOOR_OUTDOOR_OPTIONS, COUNTRIES, US_STATES } from "@/utils/constants";
import { QuoteState } from "@/context/QuoteContext";

type Step2FormProps = {
    state: QuoteState;
    errors: Record<keyof QuoteState, string | undefined>;
    onChange: (field: keyof QuoteState, value: any) => void;
    onValidate?: () => void;
    onContinue?: () => void;
    onSave?: () => void;
};

export default function Step2Form({ state, errors, onChange, onValidate, onContinue, onSave }: Step2FormProps) {
    const isCruiseShip = state.ceremonyLocationType === 'cruise_ship';
    const isWedding = state.eventType === 'wedding';

    const renderVenueSection = (
        title: string,
        nameField: keyof QuoteState,
        address1Field: keyof QuoteState,
        address2Field: keyof QuoteState,
        countryField: keyof QuoteState,
        cityField: keyof QuoteState,
        stateField: keyof QuoteState,
        zipField: keyof QuoteState,
        asInsuredField: keyof QuoteState
    ) => (
        <div className="mb-8 shadow-lg border-0 bg-white p-8 sm:p-10 md:p-12 rounded-2xl w-full max-w-4xl mx-auto">
            <div className="flex items-center justify-center text-center mb-4 gap-4">
                <div className="flex-shrink-0">
                    <MapPin size={28} className="text-blue-600" />
                </div>
                <div>
                    <div className="text-xl md:text-2xl font-extrabold leading-tight mb-1">{title}</div>
                    <div className="text-base text-gray-500 font-medium leading-tight">Details about where this portion of your event will be held</div>
                </div>
            </div>
            <div className="space-y-8 w-full px-2 sm:px-4 md:px-2">
                {/* Venue Name */}
                <FormField
                    label="Venue Name"
                    htmlFor={String(nameField)}
                    error={errors[nameField] ? 'true' : undefined}
                >
                    <Input
                        id={String(nameField)}
                        value={state[nameField] as string}
                        onChange={e => onChange(nameField, e.target.value)}
                        placeholder="Venue Name"
                    />
                </FormField>

                {/* Address Line 1 */}
                <FormField
                    label="Address Line 1"
                    htmlFor={String(address1Field)}
                    error={errors[address1Field] ? 'true' : undefined}
                >
                    <Input
                        id={String(address1Field)}
                        value={state[address1Field] as string}
                        onChange={e => onChange(address1Field, e.target.value)}
                        placeholder="Street Address"
                    />
                </FormField>

                {/* Address Line 2 */}
                <FormField
                    label="Address Line 2"
                    htmlFor={String(address2Field)}
                >
                    <Input
                        id={String(address2Field)}
                        value={state[address2Field] as string}
                        onChange={e => onChange(address2Field, e.target.value)}
                        placeholder="Apt, Suite, Building (optional)"
                    />
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    {/* Country */}
                    <FormField
                        label="Country"
                        htmlFor={String(countryField)}
                        error={errors[countryField] ? 'true' : undefined}
                    >
                        <Select
                            id={String(countryField)}
                            value={state[countryField] as string}
                            onChange={(value) => onChange(countryField, value)}
                            options={[{ value: '', label: 'Select country' }, ...COUNTRIES]}
                        />
                    </FormField>

                    {/* City */}
                    <FormField
                        label="City"
                        htmlFor={String(cityField)}
                        error={errors[cityField] ? 'true' : undefined}
                    >
                        <Input
                            id={String(cityField)}
                            value={state[cityField] as string}
                            onChange={e => onChange(cityField, e.target.value)}
                        />
                    </FormField>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    {/* State */}
                    <FormField
                        label="State"
                        htmlFor={String(stateField)}
                        error={errors[stateField] ? 'true' : undefined}
                    >
                        <Select
                            id={String(stateField)}
                            value={state[stateField] as string}
                            onChange={(value) => onChange(stateField, value)}
                            options={[{ value: '', label: 'Select state' }, ...US_STATES]}
                        />
                    </FormField>
                    {/* ZIP Code */}
                    <FormField
                        label="ZIP Code"
                        htmlFor={String(zipField)}
                        error={errors[zipField] ? 'true' : undefined}
                    >
                        <Input
                            id={String(zipField)}
                            value={state[zipField] as string}
                            onChange={e => onChange(zipField, e.target.value)}
                        />
                    </FormField>
                </div>

                {/* Add venue as Additional Insured */}
                <div className="mb-4 text-left">
                    <Checkbox
                        id={String(asInsuredField)}
                        label="Add this venue as an Additional Insured on my policy"
                        checked={state[asInsuredField] as boolean}
                        onChange={checked => onChange(asInsuredField, checked)}
                    />
                </div>
            </div>
        </div>
    );

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
                            <FormField
                                label="First Name *"
                                htmlFor="honoree1FirstName"
                                error={errors.honoree1FirstName ? 'true' : undefined}
                            >
                                <Input
                                    id="honoree1FirstName"
                                    value={state.honoree1FirstName}
                                    onChange={e => onChange('honoree1FirstName', e.target.value)}
                                />
                            </FormField>
                        </div>
                        <FormField
                            label="Last Name *"
                            htmlFor="honoree1LastName"
                            error={errors.honoree1LastName ? 'true' : undefined}
                        >
                            <Input
                                id="honoree1LastName"
                                value={state.honoree1LastName}
                                onChange={e => onChange('honoree1LastName', e.target.value)}
                            />
                        </FormField>
                    </div>
                    <div>
                        <h3 className="font-bold text-left text-gray-700 mb-4 text-lg">Honoree #2 <span className="text-semibold text-sm text-gray-400">(if applicable)</span></h3>
                        <FormField
                            label="First Name"
                            htmlFor="honoree2FirstName"
                        >
                            <Input
                                id="honoree2FirstName"
                                value={state.honoree2FirstName}
                                onChange={e => onChange('honoree2FirstName', e.target.value)}
                                placeholder="John"
                            />
                        </FormField>
                        <FormField
                            label="Last Name"
                            htmlFor="honoree2LastName"
                        >
                            <Input
                                id="honoree2LastName"
                                value={state.honoree2LastName}
                                onChange={e => onChange('honoree2LastName', e.target.value)}
                                placeholder="Doe"
                            />
                        </FormField>
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
                        <FormField
                            label="Venue Type *"
                            htmlFor="ceremonyLocationType"
                            error={errors.ceremonyLocationType ? 'true' : undefined}
                        >
                            <Select
                                id="ceremonyLocationType"
                                value={state.ceremonyLocationType}
                                onChange={(value) => onChange('ceremonyLocationType', value)}
                                options={[{ value: '', label: 'Select venue type' }, ...VENUE_TYPES]}
                            />
                        </FormField>

                        {/* Indoor/Outdoor */}
                        <FormField
                            label="Indoor/Outdoor *"
                            htmlFor="indoorOutdoor"
                            error={errors.indoorOutdoor ? 'true' : undefined}
                        >
                            <Select
                                id="indoorOutdoor"
                                value={state.indoorOutdoor}
                                onChange={(value) => onChange('indoorOutdoor', value)}
                                options={[{ value: '', label: 'Select option' }, ...INDOOR_OUTDOOR_OPTIONS]}
                            />
                        </FormField>
                    </div>
                    {/* Venue Name */}
                    <FormField
                        label={`Venue Name${isCruiseShip ? '' : ' *'}`}
                        htmlFor="venueName"
                        error={errors.venueName ? 'true' : undefined}
                    >
                        <Input
                            id="venueName"
                            value={state.venueName}
                            onChange={(value) => onChange('venueName', value)}
                            placeholder={isCruiseShip ? "Cruise Ship Name" : "Venue Name"}
                        />
                    </FormField>

                    {/* Different fields for cruise ship */}
                    {isCruiseShip ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                            {/* Cruise Line Name */}
                            <FormField
                                label="Cruise Line Name *"
                                htmlFor="venueAddress1"
                                error={errors.venueAddress1 ? 'true' : undefined}
                            >
                                <Input
                                    id="venueAddress1"
                                    value={state.venueAddress1}
                                    onChange={(value) => onChange('venueAddress1', value)}
                                    placeholder="e.g., Royal Caribbean"
                                />
                            </FormField>
                            {/* Departure Port / City */}
                            <FormField
                                label="Departure Port / City *"
                                htmlFor="venueCity"
                                error={errors.venueCity ? 'true' : undefined}
                            >
                                <Input
                                    id="venueCity"
                                    value={state.venueCity}
                                    onChange={(value) => onChange('venueCity', value)}
                                    placeholder="e.g., Miami, Florida"
                                />
                            </FormField>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                            {/* Address Line 1 */}
                            <FormField
                                label="Address Line 1 *"
                                htmlFor="venueAddress1"
                                error={errors.venueAddress1 ? 'true' : undefined}
                            >
                                <Input
                                    id="venueAddress1"
                                    value={state.venueAddress1}
                                    onChange={(value) => onChange('venueAddress1', value)}
                                    placeholder="Street Address"
                                />
                            </FormField>
                            {/* Address Line 2 */}
                            <FormField
                                label="Address Line 2"
                                htmlFor="venueAddress2"
                            >
                                <Input
                                    id="venueAddress2"
                                    value={state.venueAddress2}
                                    onChange={(value) => onChange('venueAddress2', value)}
                                    placeholder="Apt, Suite, Building (optional)"
                                />
                            </FormField>
                        </div>
                    )}
                    {/* Country, City, State, Zip are only relevant if not a cruise ship */}
                    {!isCruiseShip && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                {/* Country */}
                                <FormField
                                    label="Country *"
                                    htmlFor="venueCountry"
                                    error={errors.venueCountry ? 'true' : undefined}
                                >
                                    <Select
                                        id="venueCountry"
                                        value={state.venueCountry}
                                        onChange={(value) => onChange('venueCountry', value)}
                                        options={[{ value: '', label: 'Select country' }, ...COUNTRIES]}
                                    />
                                </FormField>
                                {/* City */}
                                <FormField
                                    label="City *"
                                    htmlFor="venueCity"
                                    error={errors.venueCity ? 'true' : undefined}
                                >
                                    <Input
                                        id="venueCity"
                                        value={state.venueCity}
                                        onChange={(value) => onChange('venueCity', value)}
                                    />
                                </FormField>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                {/* State */}
                                <FormField
                                    label="State *"
                                    htmlFor="venueState"
                                    error={errors.venueState ? 'true' : undefined}
                                >
                                    <Select
                                        id="venueState"
                                        value={state.venueState}
                                        onChange={(value) => onChange('venueState', value)}
                                        options={[{ value: '', label: 'Select state' }, ...US_STATES]}
                                    />
                                </FormField>
                                {/* ZIP Code */}
                                <FormField
                                    label="ZIP Code *"
                                    htmlFor="venueZip"
                                    error={errors.venueZip ? 'true' : undefined}
                                >
                                    <Input
                                        id="venueZip"
                                        value={state.venueZip}
                                        onChange={(value) => onChange('venueZip', value)}
                                    />
                                </FormField>
                            </div>
                        </>
                    )}

                    {/* Add venue as Additional Insured */}
                    <div className="mb-4 text-left">
                        <Checkbox
                            id="venueAsInsured"
                            label="Add this venue as an Additional Insured on my policy"
                            checked={state.venueAsInsured}
                            onChange={checked => onChange('venueAsInsured', checked)}
                        />
                    </div>
                </div>
            </div>

            {/* Additional Venue Sections for Weddings */}
            {isWedding && (
                <>
                    {/* Reception Venue */}
                    {renderVenueSection(
                        "Reception Venue Information",
                        "receptionVenueName",
                        "receptionVenueAddress1",
                        "receptionVenueAddress2",
                        "receptionVenueCountry",
                        "receptionVenueCity",
                        "receptionVenueState",
                        "receptionVenueZip",
                        "receptionVenueAsInsured"
                    )}

                    {/* Brunch Venue */}
                    {renderVenueSection(
                        "Brunch Venue Information",
                        "brunchVenueName",
                        "brunchVenueAddress1",
                        "brunchVenueAddress2",
                        "brunchVenueCountry",
                        "brunchVenueCity",
                        "brunchVenueState",
                        "brunchVenueZip",
                        "brunchVenueAsInsured"
                    )}

                    {/* Rehearsal Venue */}
                    {renderVenueSection(
                        "Rehearsal Venue Information",
                        "rehearsalVenueName",
                        "rehearsalVenueAddress1",
                        "rehearsalVenueAddress2",
                        "rehearsalVenueCountry",
                        "rehearsalVenueCity",
                        "rehearsalVenueState",
                        "rehearsalVenueZip",
                        "rehearsalVenueAsInsured"
                    )}

                    {/* Rehearsal Dinner Venue */}
                    {renderVenueSection(
                        "Rehearsal Dinner Venue Information",
                        "rehearsalDinnerVenueName",
                        "rehearsalDinnerVenueAddress1",
                        "rehearsalDinnerVenueAddress2",
                        "rehearsalDinnerVenueCountry",
                        "rehearsalDinnerVenueCity",
                        "rehearsalDinnerVenueState",
                        "rehearsalDinnerVenueZip",
                        "rehearsalDinnerVenueAsInsured"
                    )}
                </>
            )}

            <div className="flex flex-col md:flex-row justify-between mt-8 gap-4 w-full max-w-4xl mx-auto">
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