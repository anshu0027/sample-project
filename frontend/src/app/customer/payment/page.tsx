"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { CreditCard, Banknote, QrCode } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/hooks/use-toast";

const paymentOptions = [
  { label: "Net Banking", value: "netbanking", icon: <Banknote size={20} /> },
  { label: "UPI", value: "upi", icon: <QrCode size={20} /> },
  { label: "Credit Card", value: "card", icon: <CreditCard size={20} /> },
];

export default function Payment() {
  const router = useRouter();
  const [selected, setSelected] = useState("netbanking");
  const [processing, setProcessing] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isRetrieved, setIsRetrieved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsRetrieved(localStorage.getItem("retrievedQuote") === "true");
    }
    const timer = setTimeout(() => setPageLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  // ==================================================================
  // ===== THE ONLY CHANGES ARE IN THIS FUNCTION ======================
  // ==================================================================
  const handlePay = async () => {
    setProcessing(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    try {
          let quoteNumberForRedirect: string | null = null; 
      const quoteNumber = localStorage.getItem("quoteNumber");
      if (!quoteNumber) {
        throw new Error("Missing quote number. Please start a new quote.");
      }
      
      if (!selected) {
        throw new Error("Please select a payment method.");
      }
            quoteNumberForRedirect = quoteNumber; 
      
      // 1. Get the latest quote details from the new backend
      const quoteRes = await fetch(`${apiUrl}/quotes?quoteNumber=${quoteNumber}`);
      const quoteData = await quoteRes.json();
      
      if (!quoteRes.ok || !quoteData.quote) {
        throw new Error(quoteData.error || "Failed to fetch quote details.");
      }

      console.log('Quote data:', quoteData);
      
      // Extract the quote from the response
      const quote = quoteData.quote;
      if (!quote || !quote.id) {
        throw new Error("Invalid quote data received");
      }

      // Get the total premium from the quote
      const totalPremium = quote.TOTALPREMIUM || quote.totalPremium;
      if (!totalPremium || totalPremium <= 0) {
        throw new Error("Invalid total premium amount. Please contact support.");
      }
      console.log('Total premium:', totalPremium);
      
      // 2. Create the payment record via the new backend
      const paymentRes = await fetch(`${apiUrl}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalPremium,
          quoteId: quote.id,
          method: selected,
          status: "SUCCESS",
          reference: `PAY-${Date.now()}`
        })
      });
  
      if (!paymentRes.ok) {
        const paymentErrorData = await paymentRes.json();
        console.error('Payment error response:', paymentErrorData);
        throw new Error(paymentErrorData.error || "Payment failed.");
      }

      const paymentData = await paymentRes.json();
      console.log('Payment successful:', paymentData);
  
      // 3. Show success message
      toast.success("Payment successful!");
      
      // 4. Clear any stored data
      localStorage.removeItem("quoteNumber");
      if (isRetrieved) {
        localStorage.removeItem("retrievedQuote");
      }
      
      // 5. Redirect to the review page with success parameters
      const redirectUrl = isRetrieved 
        ? `/customer/review?payment=success&method=${selected}&retrieved=true&qn=${quoteNumberForRedirect}`
        : `/customer/review?payment=success&method=${selected}&qn=${quoteNumberForRedirect}`;
      
      console.log('Redirecting to:', redirectUrl);
      router.push(redirectUrl);
    } catch (error) {
      console.error('Payment error:', error);
      const message = error instanceof Error ? error.message : "Payment failed. Please try again.";
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };
  // ==================================================================
  // ==================================================================
  // ==================================================================

  const PaymentPageSkeleton = () => (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-2xl border border-blue-100 flex flex-col items-center animate-pulse">
      <div className="h-10 bg-gray-300 rounded w-3/4 mb-8"></div>
      <div className="space-y-4 w-full mb-10">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl">
            <div className="h-6 w-6 bg-gray-300 rounded"></div>
            <div className="h-6 bg-gray-300 rounded w-1/2"></div>
          </div>
        ))}
      </div>
      <div className="h-12 bg-blue-300 rounded-md w-full text-lg py-3 mt-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mt-6"></div>
    </div>
  );

  if (pageLoading || processing) {
    return <PaymentPageSkeleton />;
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-2xl border border-blue-100 flex flex-col items-center">
      <h2 className="text-3xl font-extrabold text-blue-900 mb-8 text-center drop-shadow">
        Dummy Payment Gateway
      </h2>
      <div className="space-y-4 w-full mb-10">
        {paymentOptions.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all duration-150 ${
              selected === opt.value
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-gray-200 bg-white"
            } focus-within:ring-2 focus-within:ring-blue-400`}
            tabIndex={0}
            aria-checked={selected === opt.value}
            role="radio"
          >
            <input
              type="radio"
              name="payment"
              value={opt.value}
              checked={selected === opt.value}
              onChange={() => setSelected(opt.value)}
              className="accent-blue-600 focus:ring-2 focus:ring-blue-400"
            />
            {opt.icon}
            <span className="font-semibold text-gray-800 text-lg">
              {opt.label}
            </span>
          </label>
        ))}
      </div>
      <Button
        variant="primary"
        size="lg"
        onClick={handlePay}
        disabled={processing}
        className="w-full text-lg py-3 mt-2"
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              ></path>
            </svg>
            Processing...
          </span>
        ) : (
          "Pay Now"
        )}
      </Button>
      <p className="text-xs text-gray-500 mt-6 text-center">
        This is a demo payment page. No real transaction will occur.
      </p>
    </div>
  );
}