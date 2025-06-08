"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/Button";

const RetrieveQuote = () => {
    const [input, setInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => setPageLoading(false), 200);
        return () => clearTimeout(timer);
    }, []);

    const RetrieveQuoteSkeleton = () => (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 animate-pulse">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow">
                <div className="space-y-4">
                    <div className="h-5 bg-gray-300 rounded w-1/3"></div>
                    <div className="h-10 bg-gray-200 rounded-lg"></div>
                    <div className="h-12 bg-blue-300 rounded-md"></div>
                </div>
            </div>
        </div>
    );

    if (pageLoading || isSubmitting) {
        return <RetrieveQuoteSkeleton />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow">
                <form
                    className="space-y-4"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        if (!input.trim()) {
                            toast.error("Please enter a Quote or Policy ID");
                            return;
                        }
                        setIsSubmitting(true);
                        
                        // ==================================================================
                        // ===== THE ONLY CHANGE IS HERE ====================================
                        // ==================================================================
                        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                        try {
                            // Use the new backend endpoint to fetch the quote
                            const res = await fetch(`${apiUrl}/quotes?quoteNumber=${input.trim()}`); // UPDATED PATH
                            
                            if (!res.ok) {
                                toast.error("No quote or policy found with that ID");
                                return;
                            }
                            const data = await res.json();

                            // Check if the quote has been converted to a policy
                            if (data.quote && data.quote.convertedToPolicy) {
                                toast.error("This quote has been converted to a policy and can no longer be edited.");
                                alert("This quote has been converted to a policy and can no longer be edited. You'll be redirected to the Generate Quote page.");
                                router.push(`/customer/quote-generator`);
                                return;
                            }

                            // The original logic for navigation is fine
                            if (input.startsWith("WI") || input.startsWith("POC") || input.startsWith("QI-")) {
                                router.push(`/customer/edit/${input}`);
                            } else {
                                toast.error("Invalid ID format or quote cannot be edited.");
                            }
                        } catch (error) {
                            toast.error("Error retrieving quote or policy");
                        } finally {
                            setIsSubmitting(false);
                        }
                        // ==================================================================
                        // ==================================================================
                        // ==================================================================
                    }}
                >
                    <label className="block text-sm font-medium text-blue-700">
                        Quote or Policy ID
                    </label>
                    <input
                        type="text"
                        placeholder="Enter quote or policy ID"
                        className="w-full mt-1 px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        disabled={isSubmitting}
                        autoFocus
                    />
                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Retrieving..." : "Retrieve"}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default RetrieveQuote;