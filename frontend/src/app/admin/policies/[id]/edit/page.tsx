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
    const quoteData = policy.quote || policy; // Handle both direct policy and policy-with-quote structures
    return {
        residentState: quoteData.residentState || quoteData.policyHolder?.state || '',
        eventType: quoteData.event?.eventType || '',
        eventDate: quoteData.event?.eventDate || '',
        maxGuests: String(quoteData.event?.maxGuests || ''),
        email: quoteData.email || '',
        coverageLevel: quoteData.coverageLevel ?? null,
        liabilityCoverage: quoteData.liabilityCoverage ?? '',
        liquorLiability: quoteData.liquorLiability ?? false,
        covidDisclosure: quoteData.covidDisclosure ?? false,
        specialActivities: quoteData.specialActivities ?? false,
        honoree1FirstName: quoteData.event?.honoree1FirstName || '',
        honoree1LastName: quoteData.event?.honoree1LastName || '',
        honoree2FirstName: quoteData.event?.honoree2FirstName || '',
        honoree2LastName: quoteData.event?.honoree2LastName || '',
        ceremonyLocationType: quoteData.event?.venue?.ceremonyLocationType || '',
        indoorOutdoor: quoteData.event?.venue?.indoorOutdoor || '',
        venueName: quoteData.event?.venue?.name || '',
        venueAddress1: quoteData.event?.venue?.address1 || '',
        venueAddress2: quoteData.event?.venue?.address2 || '',
        venueCountry: quoteData.event?.venue?.country || '',
        venueCity: quoteData.event?.venue?.city || '',
        venueState: quoteData.event?.venue?.state || '',
        venueZip: quoteData.event?.venue?.zip || '',
        venueAsInsured: quoteData.event?.venue?.venueAsInsured || false,
        firstName: quoteData.policyHolder?.firstName || '',
        lastName: quoteData.policyHolder?.lastName || '',
        phone: quoteData.policyHolder?.phone || '',
        relationship: quoteData.policyHolder?.relationship || '',
        hearAboutUs: quoteData.policyHolder?.hearAboutUs || '',
        address: quoteData.policyHolder?.address || '',
        country: quoteData.policyHolder?.country || '',
        city: quoteData.policyHolder?.city || '',
        state: quoteData.policyHolder?.state || '',
        zip: quoteData.policyHolder?.zip || '',
        legalNotices: quoteData.policyHolder?.legalNotices || false,
        completingFormName: quoteData.policyHolder?.completingFormName || '',
        quoteNumber: quoteData.quoteNumber,
        totalPremium: quoteData.totalPremium,
        basePremium: quoteData.basePremium,
        liabilityPremium: quoteData.liabilityPremium,
        liquorLiabilityPremium: quoteData.liquorLiabilityPremium,
        status: quoteData.status,
        policyId: policy.id, // Always use the top-level policy ID
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
    const [isVersionDropdownOpen, setIsVersionDropdownOpen] = useState(false);
    const versionDropdownRef = useRef<HTMLDivElement>(null);
    const [restoredFromVersion, setRestoredFromVersion] = useState<PolicyVersion | null>(null);
    const [showQuoteResults, setShowQuoteResults] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (versionDropdownRef.current && !versionDropdownRef.current.contains(event.target as Node)) {
                setIsVersionDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ==================================================================
    // ===== API CHANGE #1: Fetching the initial policy data ==========
    // ==================================================================
    useEffect(() => {
        async function fetchPolicyAndVersions() {
            setIsLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            try {
                // Use the single, more powerful endpoint we updated on the backend
                const res = await fetch(`${apiUrl}/policies/${id}`);
                if (!res.ok) {
                    throw new Error("Policy not found.");
                }
                const data = await res.json();
                
                // The backend now sends the data in a `quote` property
                const policyData = data.quote;
                setFormState(flattenPolicy(policyData));
                
                // The versions are now part of the main policy object
                setPolicyVersions(policyData.versions || []);

            } catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error";
                toast({ title: "Failed to fetch policy data", description: message, variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        }
        if (id) {
            fetchPolicyAndVersions();
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
            const historicalData = JSON.parse(version.data);
            // Ensure we keep the current policyId
            setFormState({
                ...historicalData,
                policyId: historicalData.id || historicalData.policyId // Handle both cases
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
            const payload = {
                ...formState,
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

    if (isLoading) return <EditPolicySkeleton />;

    return (
        <div className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-6 gap-4">
                <h1 className="text-2xl text-center sm:text-left font-bold text-gray-900 order-1 sm:order-none w-full sm:w-auto">Edit Policy</h1>
                <div className="flex flex-col-reverse items-center w-full sm:flex-row sm:items-center sm:w-auto gap-2 order-2 sm:order-none">
                    {policyVersions.length > 0 && (
                        <div className="relative inline-block w-full sm:w-auto" ref={versionDropdownRef}>
                            <Button
                                variant="outline"
                                onClick={() => setIsVersionDropdownOpen(!isVersionDropdownOpen)}
                                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 w-full justify-center sm:w-auto"
                            >
                                <History size={16} />
                                <span className="hidden sm:inline">
                                    {restoredFromVersion ? 'Working with Restored Version' : 'Version History'}
                                </span>
                                <ChevronDown size={16} className={`transform transition-transform ${isVersionDropdownOpen ? 'rotate-180' : ''}`} />
                            </Button>
                            {isVersionDropdownOpen && (
                                <div className="absolute mt-2 w-72 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto left-1/2 -translate-x-1/2">
                                    <div className="p-2">
                                        <h3 className="text-sm font-medium text-gray-500 px-3 py-2">Version History</h3>
                                        <div className="space-y-1">
                                            {policyVersions.map((version) => {
                                                const versionData = JSON.parse(version.data);
                                                const isRestored = versionData.versionMetadata?.isRestored;
                                                return (
                                                    <button
                                                        key={version.id}
                                                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                                                            selectedVersion?.id === version.id 
                                                            ? 'bg-blue-50 text-blue-700' 
                                                            : 'hover:bg-gray-50'
                                                        }`}
                                                        onClick={() => {
                                                            handleRestoreVersion(version);
                                                            setIsVersionDropdownOpen(false);
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
        // The 'showQuoteResults' prop is now correctly passed from the state we just added.
        showQuoteResults={showQuoteResults}
        // The 'handleCalculateQuote' prop is not needed in the edit flow, so it's removed.
        // We pass a simple function to satisfy the prop requirement if Step1Form needs it.
        handleCalculateQuote={() => setShowQuoteResults(true)}
        onSave={handleSave}
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
    />
)}
{step === 3 && (
    <Step3Form
        state={formState as any}
        errors={errors}
        onChange={handleInputChange}
        onSave={handleSave}
    />
)}
{step === 4 && (
    <Step4Form
        state={formState as any}
        onSave={handleSave}
        onBack={() => setStep(3)}
        // The 'emailSent' prop is now correctly passed from the state we added.
        emailSent={emailSent}
        // The 'onEmail' prop now correctly updates the state.
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
