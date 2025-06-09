"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuote, QuoteState } from "@/context/QuoteContext";
import { Button } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { formatCurrency } from "@/utils/validators";
import { Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Step4() {
    const { state } = useQuote();
    const router = useRouter();
    const [emailSent, setEmailSent] = useState(false);
    const [pageReady, setPageReady] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const isAdminAuthenticated = () => {
            return typeof window !== 'undefined' && localStorage.getItem('admin_logged_in') === 'true';
        };

        const timer = setTimeout(() => {
            if (!isAdminAuthenticated()) {
                router.replace('/admin/login');
                return;
            }
            if (!state.step3Complete) {
                toast.error("Please complete Step 3: Policyholder Information first.");
                router.replace('/admin/create-quote/step3');
                return;
            }
            setPageReady(true);
        }, 200);
        return () => clearTimeout(timer);
    }, [router, state.step3Complete]);

    const handleBack = () => {
        router.push('/admin/create-quote/step3');
    };

    function validateAllFields(state: QuoteState): boolean {
        const requiredFields: (keyof QuoteState)[] = [
            "eventType", "eventDate", "maxGuests", "coverageLevel", "liabilityCoverage",
            "venueName", "venueAddress1", "venueCountry", "venueCity", "venueState", "venueZip",
            "firstName", "lastName", "email"
        ];
        for (const field of requiredFields) {
            if (!state[field]) {
                toast.error(`${field} is missing`);
                return false;
            }
        }
        return true;
    }

    function validateForm(): boolean {
        const errors = {};
        if (!validateAllFields(state)) {
            return false;
        }
        setErrors(errors);
        return true;
    }

    // ==================================================================
    // ===== API CHANGE #1: Saving the quote ==========================
    // ==================================================================
    const handleSave = async () => {
        if (validateForm()) {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const quoteNumber = localStorage.getItem("quoteNumber");
            
            if (!quoteNumber) {
                toast.error("Quote number not found. Please start over.");
                router.push("/admin/create-quote/step1");
                return;
            }

            try {
                // Update quote with final information
                const res = await fetch(`${apiUrl}/quotes/${quoteNumber}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        coverageLevel: state.coverageLevel,
                        liabilityCoverage: state.liabilityCoverage,
                        liquorLiability: state.liquorLiability,
                        covidDisclosure: state.covidDisclosure,
                        specialActivities: state.specialActivities,
                        totalPremium: state.totalPremium,
                        basePremium: state.basePremium,
                        liabilityPremium: state.liabilityPremium,
                        liquorLiabilityPremium: state.liquorLiabilityPremium,
                        status: "COMPLETE"
                    }),
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Failed to update quote');
                }

                toast.success("Quote saved successfully!");
                router.push("/admin/quotes");
            } catch (error) {
                const message = error instanceof Error ? error.message : "An unknown error occurred.";
                toast.error(message);
            }
        } else {
            Object.entries(errors).forEach(([, msg]) => toast.error(msg));
        }
    };

    // ==================================================================
    // ===== API CHANGE #2: Sending the email =========================
    // ==================================================================
    const handleEmail = async () => {
        if (!validateAllFields(state)) {
            return;
        }
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        try {
            const res = await fetch(`${apiUrl}/email/send`, { // UPDATED PATH
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: state.email,
                    type: 'quote',
                    data: state // Send the entire state object
                })
            });

            if (res.ok) {
                setEmailSent(true);
                toast.success('Quote emailed successfully!');
                setTimeout(() => setEmailSent(false), 3000);
            } else {
                const data = await res.json();
                throw new Error(data.error || 'Failed to send email');
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "An unknown error occurred.";
            toast.error(message);
        }
    };

    const Step4Skeleton = () => (
        <div className="space-y-8 animate-pulse">
            <div className="bg-gray-100 rounded-lg shadow-md p-6">
                <div className="mb-4">
                    <div className="h-7 bg-gray-300 rounded w-3/5 mb-2"></div>
                    <div className="h-5 bg-gray-300 rounded w-2/5"></div>
                </div>
                <div className="space-y-4">
                    <div className="bg-gray-200 rounded-lg p-4">
                        <div className="text-center">
                            <div className="h-6 bg-gray-300 rounded w-1/3 mx-auto mb-2"></div>
                            <div className="h-10 bg-gray-300 rounded w-1/2 mx-auto"></div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-300">
                            <div className="h-5 bg-gray-300 rounded w-1/4 mb-3"></div>
                            <div className="space-y-2">
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className="flex justify-between">
                                        <div className="h-4 bg-gray-300 rounded w-2/5"></div>
                                        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <div className="h-12 bg-gray-300 rounded-md w-36"></div>
                    <div className="h-12 bg-gray-300 rounded-md w-32"></div>
                </div>
            </div>
            <div className="flex justify-between">
                <div className="h-10 bg-gray-200 rounded-md w-24"></div>
            </div>
        </div>
    );

    if (!pageReady) {
        return <Step4Skeleton />;
    }

    return (
        <>
            <div className="space-y-8">
                <Card
                    title="Quote Summary"
                    subtitle={`Quote #${state.quoteNumber || '(New Quote)'}`}
                    className="mb-6 border-blue-100 bg-blue-50"
                    footer={
                        <div className="flex justify-end gap-4">
                            <Button variant="outline" size="lg" onClick={handleEmail}>
                                <Mail size={18} />
                                {emailSent ? 'Email Sent!' : 'Email Quote'}
                            </Button>
                            <Button variant="primary" size="lg" onClick={handleSave}>
                                Save Quote
                            </Button>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 border border-blue-100">
                            <div className="text-center">
                                <h3 className="text-xl font-semibold text-gray-800 mb-1">Total Premium</h3>
                                <p className="text-3xl font-bold text-blue-600">{formatCurrency(state.totalPremium)}</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Premium Breakdown:</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Core Coverage:</span>
                                        <span className="font-medium">{formatCurrency(state.basePremium)}</span>
                                    </div>
                                    {state.liabilityCoverage !== 'none' && (
                                        <div className="flex justify-between text-sm">
                                            <span>Liability Coverage:</span>
                                            <span className="font-medium">{formatCurrency(state.liabilityPremium)}</span>
                                        </div>
                                    )}
                                    {state.liquorLiability && (
                                        <div className="flex justify-between text-sm">
                                            <span>Host Liquor Liability:</span>
                                            <span className="font-medium">{formatCurrency(state.liquorLiabilityPremium)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
                <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={handleBack}>Back</Button>
                </div>
            </div>
        </>
    );
}