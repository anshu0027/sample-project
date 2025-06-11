"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { toast } from "@/hooks/use-toast";
import dynamic from 'next/dynamic';
import { PolicyVersion, PolicyVersionData } from "@/types/policy";
import { EditPolicySkeleton } from "@/components/ui/EditPolicySkeleton";
import { ChevronDown, History } from 'lucide-react';

const StepFormLoading = () => <div className="p-8 text-center text-gray-500">Loading form...</div>;
const Step1Form = dynamic(() => import('@/components/quote/Step1Form'), { ssr: false, loading: StepFormLoading });
const Step2Form = dynamic(() => import('@/components/quote/Step2Form'), { ssr: false, loading: StepFormLoading });
const Step3Form = dynamic(() => import('@/components/quote/Step3Form'), { ssr: false, loading: StepFormLoading });
const Step4Form = dynamic(() => import('@/components/quote/Step4Form'), { ssr: false, loading: StepFormLoading });

function flattenPolicy(policy: any): PolicyVersionData | null {
    if (!policy) return null;

    // Get the data from either the policy directly or from its quote
    const data = policy.quote || policy;

    return {
        residentState: data.residentState || data.policyHolder?.state || '',
        eventType: data.event?.eventType || '',
        eventDate: data.event?.eventDate || '',
        maxGuests: String(data.event?.maxGuests || ''),
        email: data.email || '',
        coverageLevel: data.coverageLevel ?? null,
        liabilityCoverage: data.liabilityCoverage ?? '',
        liquorLiability: data.liquorLiability ?? false,
        covidDisclosure: data.covidDisclosure ?? false,
        specialActivities: data.specialActivities ?? false,
        honoree1FirstName: data.event?.honoree1FirstName || '',
        honoree1LastName: data.event?.honoree1LastName || '',
        honoree2FirstName: data.event?.honoree2FirstName || '',
        honoree2LastName: data.event?.honoree2LastName || '',
        ceremonyLocationType: data.event?.venue?.ceremonyLocationType || '',
        indoorOutdoor: data.event?.venue?.indoorOutdoor || '',
        venueName: data.event?.venue?.name || '',
        venueAddress1: data.event?.venue?.address1 || '',
        venueAddress2: data.event?.venue?.address2 || '',
        venueCountry: data.event?.venue?.country || '',
        venueCity: data.event?.venue?.city || '',
        venueState: data.event?.venue?.state || '',
        venueZip: data.event?.venue?.zip || '',
        venueAsInsured: data.event?.venue?.venueAsInsured || false,
        // Additional venue fields
        receptionLocationType: data.event?.venue?.receptionLocationType || '',
        receptionIndoorOutdoor: data.event?.venue?.receptionIndoorOutdoor || '',
        receptionVenueName: data.event?.venue?.receptionVenueName || '',
        receptionVenueAddress1: data.event?.venue?.receptionVenueAddress1 || '',
        receptionVenueAddress2: data.event?.venue?.receptionVenueAddress2 || '',
        receptionVenueCountry: data.event?.venue?.receptionVenueCountry || '',
        receptionVenueCity: data.event?.venue?.receptionVenueCity || '',
        receptionVenueState: data.event?.venue?.receptionVenueState || '',
        receptionVenueZip: data.event?.venue?.receptionVenueZip || '',
        receptionVenueAsInsured: data.event?.venue?.receptionVenueAsInsured || false,
        brunchLocationType: data.event?.venue?.brunchLocationType || '',
        brunchIndoorOutdoor: data.event?.venue?.brunchIndoorOutdoor || '',
        brunchVenueName: data.event?.venue?.brunchVenueName || '',
        brunchVenueAddress1: data.event?.venue?.brunchVenueAddress1 || '',
        brunchVenueAddress2: data.event?.venue?.brunchVenueAddress2 || '',
        brunchVenueCountry: data.event?.venue?.brunchVenueCountry || '',
        brunchVenueCity: data.event?.venue?.brunchVenueCity || '',
        brunchVenueState: data.event?.venue?.brunchVenueState || '',
        brunchVenueZip: data.event?.venue?.brunchVenueZip || '',
        brunchVenueAsInsured: data.event?.venue?.brunchVenueAsInsured || false,
        rehearsalLocationType: data.event?.venue?.rehearsalLocationType || '',
        rehearsalIndoorOutdoor: data.event?.venue?.rehearsalIndoorOutdoor || '',
        rehearsalVenueName: data.event?.venue?.rehearsalVenueName || '',
        rehearsalVenueAddress1: data.event?.venue?.rehearsalVenueAddress1 || '',
        rehearsalVenueAddress2: data.event?.venue?.rehearsalVenueAddress2 || '',
        rehearsalVenueCountry: data.event?.venue?.rehearsalVenueCountry || '',
        rehearsalVenueCity: data.event?.venue?.rehearsalVenueCity || '',
        rehearsalVenueState: data.event?.venue?.rehearsalVenueState || '',
        rehearsalVenueZip: data.event?.venue?.rehearsalVenueZip || '',
        rehearsalVenueAsInsured: data.event?.venue?.rehearsalVenueAsInsured || false,
        rehearsalDinnerLocationType: data.event?.venue?.rehearsalDinnerLocationType || '',
        rehearsalDinnerIndoorOutdoor: data.event?.venue?.rehearsalDinnerIndoorOutdoor || '',
        rehearsalDinnerVenueName: data.event?.venue?.rehearsalDinnerVenueName || '',
        rehearsalDinnerVenueAddress1: data.event?.venue?.rehearsalDinnerVenueAddress1 || '',
        rehearsalDinnerVenueAddress2: data.event?.venue?.rehearsalDinnerVenueAddress2 || '',
        rehearsalDinnerVenueCountry: data.event?.venue?.rehearsalDinnerVenueCountry || '',
        rehearsalDinnerVenueCity: data.event?.venue?.rehearsalDinnerVenueCity || '',
        rehearsalDinnerVenueState: data.event?.venue?.rehearsalDinnerVenueState || '',
        rehearsalDinnerVenueZip: data.event?.venue?.rehearsalDinnerVenueZip || '',
        rehearsalDinnerVenueAsInsured: data.event?.venue?.rehearsalDinnerVenueAsInsured || false,
        firstName: data.policyHolder?.firstName || '',
        lastName: data.policyHolder?.lastName || '',
        phone: data.policyHolder?.phone || '',
        relationship: data.policyHolder?.relationship || '',
        hearAboutUs: data.policyHolder?.hearAboutUs || '',
        address: data.policyHolder?.address || '',
        country: data.policyHolder?.country || '',
        city: data.policyHolder?.city || '',
        state: data.policyHolder?.state || '',
        zip: data.policyHolder?.zip || '',
        legalNotices: data.policyHolder?.legalNotices || false,
        completingFormName: data.policyHolder?.completingFormName || '',
        quoteNumber: data.quoteNumber || policy.quote?.quoteNumber || '',
        totalPremium: data.totalPremium || policy.quote?.totalPremium || 0,
        basePremium: data.basePremium || policy.quote?.basePremium || 0,
        liabilityPremium: data.liabilityPremium || policy.quote?.liabilityPremium || 0,
        liquorLiabilityPremium: data.liquorLiabilityPremium || policy.quote?.liquorLiabilityPremium || 0,
        status: data.status || policy.quote?.status || '',
        policyId: policy.id,
        policyNumber: policy.policyNumber,
        pdfUrl: policy.pdfUrl,
    };
}
// Validation functions
const validateStep1 = (formState: PolicyVersionData) => {
    const newErrors: Record<string, string> = {};
    if (!formState.residentState) newErrors.residentState = 'Required';
    if (!formState.eventType) newErrors.eventType = 'Required';
    if (!formState.maxGuests) newErrors.maxGuests = 'Required';
    if (!formState.eventDate) newErrors.eventDate = 'Required';
    if (!formState.coverageLevel) newErrors.coverageLevel = 'Required';
    if (!formState.covidDisclosure) newErrors.covidDisclosure = 'Required';
    return newErrors;
};

const validateStep2 = (formState: PolicyVersionData) => {
    const newErrors: Record<string, string> = {};
    if (!formState.honoree1FirstName) newErrors.honoree1FirstName = 'Required';
    if (!formState.honoree1LastName) newErrors.honoree1LastName = 'Required';
    if (!formState.ceremonyLocationType) newErrors.ceremonyLocationType = 'Required';
    if (!formState.indoorOutdoor) newErrors.indoorOutdoor = 'Required';
    if (!formState.venueName) newErrors.venueName = 'Required';
    if (!formState.venueAddress1) newErrors.venueAddress1 = 'Required';
    if (!formState.venueCountry) newErrors.venueCountry = 'Required';
    if (!formState.venueCity) newErrors.venueCity = 'Required';
    if (!formState.venueState) newErrors.venueState = 'Required';
    if (!formState.venueZip) newErrors.venueZip = 'Required';
    return newErrors;
};

const validateStep3 = (formState: PolicyVersionData) => {
    const newErrors: Record<string, string> = {};
    if (!formState.firstName) newErrors.firstName = 'Required';
    if (!formState.lastName) newErrors.lastName = 'Required';
    if (!formState.email) newErrors.email = 'Required';
    if (!formState.phone) newErrors.phone = 'Required';
    if (!formState.relationship) newErrors.relationship = 'Required';
    if (!formState.address) newErrors.address = 'Required';
    if (!formState.city) newErrors.city = 'Required';
    if (!formState.state) newErrors.state = 'Required';
    if (!formState.zip) newErrors.zip = 'Required';
    if (!formState.legalNotices) newErrors.legalNotices = 'Required';
    if (!formState.completingFormName) newErrors.completingFormName = 'Required';
    return newErrors;
};

export default function EditPolicy() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string; // This can be a quoteNumber or policyId
    const [step, setStep] = useState(1);
    const [formState, setFormState] = useState<PolicyVersionData | null>(null);
    const [policyVersions, setPolicyVersions] = useState<PolicyVersion[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVersion, setSelectedVersion] = useState<PolicyVersion | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const versionDropdownRef = useRef<HTMLDivElement>(null);
    const [restoredFromVersion, setRestoredFromVersion] = useState<PolicyVersion | null>(null);
    const [showQuoteResults, setShowQuoteResults] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [isLoadingVersion, setIsLoadingVersion] = useState(false);

    const handleDropdownToggle = () => {
        setIsDropdownOpen((prev) => !prev);
    };

    const handleClickOutside = (event: MouseEvent) => {
        const dropdownElement = document.getElementById('version-dropdown');
        if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
            setIsDropdownOpen(false);
        }
    };

    useEffect(() => {
        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    // ==================================================================
    // ===== API CHANGE #1: Fetching the initial policy data ==========
    // ==================================================================
    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;

            try {
                // Phase 1: Fetch policy (fast render)
                const res = await fetch(`${apiUrl}/policies/${id}`);
                if (!res.ok) throw new Error("Policy not found");
                const data = await res.json();
                setFormState(flattenPolicy(data.policy)); // 👈 Show form after this

                // Phase 2: Fetch versions (background)
                fetch(`${apiUrl}/policies/${id}/versions`)
                    .then((vRes) => vRes.json())
                    .then((vData) => {
                        console.log("Fetched versions 👀", vData); // 🔍 This line right here
                        setPolicyVersions(vData.versions || []);
                    })
                    .catch((err) => {
                        console.warn("Versions fetch failed:", err);
                    });
            } catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error";
                toast({
                    title: "Failed to fetch policy data",
                    description: message,
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        }

        if (id) {
            fetchData();
        }
    }, [id]);



    const handleInputChange = (field: string, value: any) => {
        setFormState((prev) => ({ ...(prev as PolicyVersionData), [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // Function to restore a previous version
    const handleRestoreVersion = (version: PolicyVersion) => {
        try {
            // Check if data is already an object or needs parsing
            const versionData = typeof version.data === 'string' ? JSON.parse(version.data) : version.data;

            // Ensure we keep the current policyId and policyNumber
            setFormState({
                ...versionData,
                policyId: formState?.policyId,
                policyNumber: formState?.policyNumber
            });
            setSelectedVersion(version);
            setRestoredFromVersion(version);
            toast({
                title: "Version restored",
                description: `Loaded version from ${new Date(version.createdAt).toLocaleString()}. Save to keep changes.`,
                variant: "default"
            });
        } catch (error) {
            console.error("Error parsing version data:", error);
            toast({
                title: "Failed to restore version",
                description: "Invalid version data format.",
                variant: "destructive"
            });
        }
    };

    // ==================================================================
    // ===== API CHANGE #2: Saving the updated policy =================
    // ==================================================================
    const handleSave = async () => {
        if (!formState) return;
        const currentPolicyId = formState.policyId;
        if (!currentPolicyId) {
            toast({ title: "Cannot save.", description: "Policy ID is missing.", variant: "destructive" });
            return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        try {
            // Structure the data according to the backend's expectations
            const payload = {
                policyNumber: formState.policyNumber,
                pdfUrl: formState.pdfUrl,
                // Event fields
                eventType: formState.eventType,
                eventDate: formState.eventDate,
                maxGuests: formState.maxGuests,
                honoree1FirstName: formState.honoree1FirstName,
                honoree1LastName: formState.honoree1LastName,
                honoree2FirstName: formState.honoree2FirstName,
                honoree2LastName: formState.honoree2LastName,
                // Venue fields
                venueName: formState.venueName,
                venueAddress1: formState.venueAddress1,
                venueAddress2: formState.venueAddress2,
                venueCountry: formState.venueCountry,
                venueCity: formState.venueCity,
                venueState: formState.venueState,
                venueZip: formState.venueZip,
                ceremonyLocationType: formState.ceremonyLocationType,
                indoorOutdoor: formState.indoorOutdoor,
                venueAsInsured: formState.venueAsInsured,
                // Policy holder fields
                firstName: formState.firstName,
                lastName: formState.lastName,
                phone: formState.phone,
                relationship: formState.relationship,
                hearAboutUs: formState.hearAboutUs,
                address: formState.address,
                country: formState.country,
                city: formState.city,
                state: formState.state,
                zip: formState.zip,
                legalNotices: formState.legalNotices,
                completingFormName: formState.completingFormName,
                // Quote fields
                email: formState.email,
                coverageLevel: formState.coverageLevel,
                liabilityCoverage: formState.liabilityCoverage,
                liquorLiability: formState.liquorLiability,
                covidDisclosure: formState.covidDisclosure,
                specialActivities: formState.specialActivities,
                residentState: formState.residentState,
                totalPremium: formState.totalPremium,
                basePremium: formState.basePremium,
                liabilityPremium: formState.liabilityPremium,
                liquorLiabilityPremium: formState.liquorLiabilityPremium,
                status: formState.status,
                // Version metadata
                versionMetadata: restoredFromVersion ? {
                    restoredFromVersionId: restoredFromVersion.id,
                    restoredFromVersionDate: restoredFromVersion.createdAt,
                    isRestored: true,
                } : undefined
            };

            const response = await fetch(`${apiUrl}/policies/${currentPolicyId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update policy');
            }

            setRestoredFromVersion(null);
            setSelectedVersion(null);

            // Re-fetch versions to show the newly created one
            const versionsRes = await fetch(`${apiUrl}/policies/${currentPolicyId}?versionsOnly=true`);
            if (versionsRes.ok) {
                const versionsData = await versionsRes.json();
                setPolicyVersions(versionsData.versions);
            }

            toast({ title: "Policy updated successfully!", variant: "default" });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            toast({ title: "Failed to update policy", description: message, variant: "destructive" });
        }
    };

    const handleValidateStep1 = () => {
        if (!formState) return false;
        const newErrors = validateStep1(formState);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleValidateStep2 = () => {
        if (!formState) return false;
        const newErrors = validateStep2(formState);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleValidateStep3 = () => {
        if (!formState) return false;
        const newErrors = validateStep3(formState);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // const fetchEventData = async () => {
    //     const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    //     try {
    //         const res = await fetch(`${apiUrl}/policies/${id}/event`);
    //         if (!res.ok) {
    //             throw new Error("Failed to fetch event data");
    //         }
    //         const data = await res.json();
    //         // Update state with event data
    //         setFormState((prev) => ({ ...prev, ...data.event }));
    //     } catch (error) {
    //         console.error("Error fetching event data:", error);
    //         toast({ title: "Failed to fetch event data", description: error.message, variant: "destructive" });
    //     }
    // };

    // const fetchPolicyHolderData = async () => {
    //     const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    //     try {
    //         const res = await fetch(`${apiUrl}/policies/${id}/policy-holder`);
    //         if (!res.ok) {
    //             throw new Error("Failed to fetch policy holder data");
    //         }
    //         const data = await res.json();
    //         // Update state with policy holder data
    //         setFormState((prev) => ({ ...prev, ...data.policyHolder }));
    //     } catch (error) {
    //         console.error("Error fetching policy holder data:", error);
    //         toast({ title: "Failed to fetch policy holder data", description: error.message, variant: "destructive" });
    //     }
    // };

    // const fetchPaymentsData = async () => {
    //     const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    //     try {
    //         const res = await fetch(`${apiUrl}/policies/${id}/payments`);
    //         if (!res.ok) {
    //             throw new Error("Failed to fetch payments data");
    //         }
    //         const data = await res.json();
    //         // Update state with payments data
    //         setFormState((prev) => ({ ...prev, payments: data.payments }));
    //     } catch (error) {
    //         console.error("Error fetching payments data:", error);
    //         toast({ title: "Failed to fetch payments data", description: error.message, variant: "destructive" });
    //     }
    // };

    // useEffect(() => {
    //     async function fetchPolicy() {
    //         setIsLoading(true);
    //         const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    //         try {
    //             // Fetch the main policy data
    //             const res = await fetch(`${apiUrl}/policies/${id}`);
    //             if (!res.ok) {
    //                 throw new Error("Policy not found.");
    //             }
    //             const data = await res.json();
    //             setFormState(flattenPolicy(data.policy));
    //         } catch (error) {
    //             const message = error instanceof Error ? error.message : "Unknown error";
    //             toast({ title: "Failed to fetch policy data", description: message, variant: "destructive" });
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     }
    //     if (id) {
    //         fetchPolicy();
    //     }
    // }, [id]);

    const handleVersionClick = async (versionId: number) => {
        setIsLoadingVersion(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        try {
            const res = await fetch(`${apiUrl}/policies/${id}/versions/${versionId}`);
            if (!res.ok) {
                throw new Error("Failed to fetch version data");
            }
            const data = await res.json();
            console.log('Fetched version data:', data);
            const versionData = data.version;
            // Update form state with the version data
            setFormState((prev) => ({ ...prev, ...versionData }));
            toast({ title: "Version loaded", description: `Version from ${new Date(versionData.createdAt).toLocaleString()} loaded.`, variant: "default" });
        } catch (error) {
            console.error("Error fetching version data:", error);
        } finally {
            setIsLoadingVersion(false);
        }
    };

    // Example component to display versions with dropdown
    const VersionDropdown = () => (
        <div>
            <button onClick={handleDropdownToggle}>Toggle Versions</button>
            {isDropdownOpen && (
                <div id="version-dropdown">
                    {policyVersions.map((version) => (
                        <div key={version.id} onClick={() => handleVersionClick(version.id)}>
                            <span>Version ID: {version.id}</span>
                            <span>Created At: {new Date(version.createdAt).toLocaleString()}</span>
                        </div>
                    ))}
                    {isLoadingVersion && <div>Loading version data...</div>}
                </div>
            )}
        </div>
    );

    if (isLoading) return <EditPolicySkeleton />;

    return (
        <div className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-6 gap-4">
                <h1 className="text-2xl text-center sm:text-left font-bold text-gray-900 order-1 sm:order-none w-full sm:w-auto">Edit Policy</h1>
                <div className="flex flex-col-reverse items-center w-full sm:flex-row sm:items-center sm:w-auto gap-2 order-2 sm:order-none">
                    {policyVersions.length > 0 && (
                        <div
                            className="relative inline-block w-full sm:w-auto"
                            ref={versionDropdownRef}
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                        >
                            <Button
                                variant="outline"
                                onClick={handleDropdownToggle}
                                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 w-full justify-center sm:w-auto"
                            >
                                <History size={16} />
                                <span className="hidden sm:inline">
                                    {restoredFromVersion ? 'Working with Restored Version' : 'Version History'}
                                </span>
                                <ChevronDown size={16} className={`transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </Button>
                            {isDropdownOpen && (
                                <div className="absolute mt-2 w-72 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto left-1/2 -translate-x-1/2">
                                    <div className="p-2">
                                        <h3 className="text-sm font-medium text-gray-500 px-3 py-2">Version History</h3>
                                        <div className="space-y-1">
                                            {policyVersions.map((version) => {
                                                // Check if data is already an object or needs parsing
                                                const versionData = typeof version.data === 'string' ? JSON.parse(version.data) : version.data;
                                                const isRestored = versionData.versionMetadata?.isRestored;
                                                return (
                                                    <button
                                                        key={version.id}
                                                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${selectedVersion?.id === version.id
                                                                ? 'bg-blue-50 text-blue-700'
                                                                : 'hover:bg-gray-50'
                                                            }`}
                                                        onClick={() => {
                                                            handleRestoreVersion(version);
                                                            if (!isHovering) {
                                                                setIsDropdownOpen(false);
                                                            }
                                                        }}
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className="font-medium flex items-center gap-2">
                                                                {new Date(version.createdAt).toLocaleDateString()} {new Date(version.createdAt).toLocaleTimeString([], {
                                                                    hour: 'numeric',
                                                                    minute: '2-digit',
                                                                    hour12: true
                                                                })}
                                                                {isRestored && (
                                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                                                        Restored Version
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <Button variant="outline" size="sm" className="w-full justify-center sm:w-auto" onClick={() => router.push('/admin/policies')}>
                        Back to Policies
                    </Button>
                </div>
            </div>

            {/* Form Steps */}
            <div className="mb-8 flex flex-row max-w-4xl justify-center mx-auto items-center gap-2 sm:gap-3 md:gap-10">
                {[1, 2, 3, 4].map(s => (
                    <Button
                        key={s}
                        className="flex-1 min-w-0 text-center rounded-full md:flex-initial md:w-48"
                        variant={step === s ? 'primary' : 'outline'}
                        onClick={() => setStep(s)}
                    >
                        {`Step ${s}`}
                    </Button>
                ))}
            </div>

            {/* Form Steps Content */}
            {formState && (
                <>
                    {step === 1 && (
                        <Step1Form
                            state={formState as any}
                            errors={errors}
                            onChange={handleInputChange}
                            onValidate={handleValidateStep1}
                            onContinue={() => setStep(2)}
                            showQuoteResults={showQuoteResults}
                            handleCalculateQuote={() => setShowQuoteResults(true)}
                            onSave={handleSave}
                            isRestored={!!restoredFromVersion}
                        />
                    )}
                    {step === 2 && (
                        <Step2Form
                            state={formState as any}
                            errors={errors}
                            onChange={handleInputChange}
                            onValidate={handleValidateStep2}
                            onContinue={() => setStep(3)}
                            onSave={handleSave}
                            isRestored={!!restoredFromVersion}
                        />
                    )}
                    {step === 3 && (
                        <Step3Form
                            state={formState as any}
                            errors={errors}
                            onChange={handleInputChange}
                            onSave={handleSave}
                            isRestored={!!restoredFromVersion}
                        />
                    )}
                    {step === 4 && (
                        <Step4Form
                            state={formState as any}
                            onSave={handleSave}
                            onBack={() => setStep(3)}
                            emailSent={emailSent}
                            onEmail={() => setEmailSent(true)}
                            isRetrievedQuote={!!formState?.quoteNumber}
                            isAdmin={true}
                        />
                    )}
                </>
            )}
        </div>
    );
}
