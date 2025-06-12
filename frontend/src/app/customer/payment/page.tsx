/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { CreditCard, Banknote, QrCode } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/hooks/use-toast";
import Input from "@/components/ui/Input";

// Declare window.Accept for TypeScript
declare global {
  interface Window {
    Accept: any;
  }
}

const paymentOptions = [
  { label: "Credit Card", value: "card", icon: <CreditCard size={20} /> },
  { label: "Net Banking", value: "netbanking", icon: <Banknote size={20} /> },
  { label: "UPI", value: "upi", icon: <QrCode size={20} /> },
];

export default function Payment() {
  const router = useRouter();
  const [selected, setSelected] = useState("card");
  const [processing, setProcessing] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [quoteDetails, setQuoteDetails] = useState<any>(null);
  const [cardData, setCardData] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });

  useEffect(() => {
    const fetchQuoteDetails = async () => {
      try {
        const quoteNumber = localStorage.getItem("quoteNumber");
        if (!quoteNumber) {
          toast({
            title: "No quote found",
            description: "Please start a new quote to proceed with payment.",
            variant: "destructive",
          });
          router.push("/");
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quotes?quoteNumber=${quoteNumber}`);
        const data = await response.json();
        
        if (response.ok && data.quote) {
          setQuoteDetails(data.quote);
          localStorage.setItem("retrievedQuote", "true");
        } else {
          throw new Error(data.error || "Failed to fetch quote details");
        }
      } catch (error) {
        console.error("Failed to fetch quote details:", error);
        toast({
          title: "Error",
          description: "Failed to load quote details. Please try again.",
          variant: "destructive",
        });
        router.push("/");
      } finally {
        setPageLoading(false);
      }
    };

    // Load Authorize.Net Accept.js script
    const script = document.createElement("script");
    script.src = "https://jstest.authorize.net/v1/Accept.js";
    script.async = true;
    script.charset = "utf-8";
    script.onload = () => console.log("Authorize.Net Accept.js loaded successfully");
    script.onerror = () => {
      console.error("Failed to load Authorize.Net Accept.js");
      toast({
        title: "Payment gateway script failed to load",
        description: "Please refresh or try again later.",
        variant: "destructive",
      });
    };
    document.body.appendChild(script);

    fetchQuoteDetails();
  }, [router]);

  const handlePay = async () => {
    if (processing) return; // Prevent double submission
    setProcessing(true);

    try {
      if (!quoteDetails) {
        throw new Error("Quote details not loaded. Please refresh the page.");
      }

      if (!selected) {
        throw new Error("Please select a payment method.");
      }

      if (selected === "card") {
        if (!window.Accept) {
          throw new Error("Payment gateway not loaded. Please wait a moment and try again.");
        }

        if (!cardData.cardNumber || !cardData.expiryMonth || !cardData.expiryYear || !cardData.cvv) {
          throw new Error("Please fill in all card details.");
        }

        // Ensure API Login ID and Client Key are available
        const apiLoginId = process.env.NEXT_PUBLIC_AUTHORIZE_NET_API_LOGIN_ID;
        const clientKey = process.env.NEXT_PUBLIC_AUTHORIZE_NET_CLIENT_KEY;

        if (!apiLoginId || !clientKey) {
          console.error("Authorize.Net API Login ID or Client Key is missing from environment variables.");
          throw new Error("Payment gateway configuration error. Please contact support.");
        }

        // Prepare card data with correct formatting
        const formattedCardNumber = cardData.cardNumber.replace(/\s/g, "");
        const formattedMonth = cardData.expiryMonth.padStart(2, '0'); // Ensure MM format (e.g., "01", "07", "12")
        const formattedYear = `20${cardData.expiryYear}`; // Convert YY to YYYY (e.g., "24" to "2024")

        // Get the secure payment data from Accept.js
        const secureData = {
          authData: {
            apiLoginID: apiLoginId,
            clientKey: clientKey,
          },
          cardData: {
            cardNumber: formattedCardNumber,
            month: formattedMonth,
            year: formattedYear,
            cardCode: cardData.cvv,
          },
        };
        console.log("Dispatching data to Authorize.Net:", JSON.stringify(secureData, null, 2)); // For debugging

        // Get the secure payment data using Promise
        const opaqueData = await new Promise((resolve, reject) => {
          window.Accept.dispatchData(secureData, (response: any) => {
            if (response.messages.resultCode === "Error") {
              const errorMessage = response.messages.message[0].text;
              console.error("Authorize.Net error:", errorMessage);
              reject(new Error(errorMessage));
              return;
            }
            resolve(response.opaqueData);
          });
        });

        // Process the payment with the secure data
        await processPayment(opaqueData);
      } else {
        // Handle other payment methods (netbanking, UPI)
        toast({
          title: "Coming soon",
          description: "This payment method is not yet available.",
          variant: "default",
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      toast({
        title: "Payment failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const processPayment = async (opaqueData: any) => {
    try {
      console.log('Sending payment request with data:', {
        quoteId: quoteDetails.id,
        amount: quoteDetails.totalPremium,
        opaqueData
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/authorize-net`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quoteId: quoteDetails.id,
          amount: quoteDetails.totalPremium,
          opaqueData,
        }),
      });

      const data = await response.json();
      console.log('Payment response:', data);

      if (response.ok) {
        // Store policy information in localStorage
        if (data.payment?.policy) {
          localStorage.setItem("policyNumber", data.payment.policy.policyNumber);
          localStorage.setItem("policyId", data.payment.policy.id.toString());
        }

        toast({
          title: "Payment successful",
          description: "Your payment has been processed successfully.",
          variant: "default",
        });

        // Clear quote data from localStorage
        localStorage.removeItem("quoteNumber");
        localStorage.removeItem("retrievedQuote");

        // Check if this is a retrieved quote
        const isRetrieved = localStorage.getItem("retrievedQuote") === "true";
        
        // Redirect to review page with payment success parameters
        router.push(`/customer/review?payment=success&method=card&qn=${quoteDetails.quoteNumber}${isRetrieved ? '&retrieved=true' : ''}`);
      } else {
        console.error('Payment failed with status:', response.status);
        console.error('Error details:', data);
        throw new Error(data.message || data.error || "Payment failed");
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      const message = error instanceof Error ? error.message : "Payment processing failed";
      toast({
        title: "Payment failed",
        description: message,
        variant: "destructive",
      });
      throw error; // Re-throw to be caught by the main try-catch
    }
  };

  if (pageLoading) {
    return <div className="p-8 text-center">Loading payment page...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Payment Details</h1>

        {quoteDetails && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Quote Summary</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Quote Number:</span> {quoteDetails.quoteNumber}</p>
              <p><span className="font-medium">Total Premium:</span> ${quoteDetails.totalPremium}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Select Payment Method</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {paymentOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelected(option.value)}
                className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                  selected === option.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                {option.icon}
                <span>{option.label}</span>
              </button>
            ))}
          </div>

          {selected === "card" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <Input
                  type="text"
                  value={cardData.cardNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    const formatted = value.replace(/(\d{4})/g, "$1 ").trim();
                    setCardData({ ...cardData, cardNumber: formatted });
                  }}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="text"
                      value={cardData.expiryMonth}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 2 && parseInt(value) <= 12) {
                          setCardData({ ...cardData, expiryMonth: value });
                        }
                      }}
                      placeholder="MM"
                      maxLength={2}
                      className="w-full"
                    />
                    <Input
                      type="text"
                      value={cardData.expiryYear}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 2) {
                          setCardData({ ...cardData, expiryYear: value });
                        }
                      }}
                      placeholder="YY"
                      maxLength={2}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <Input
                    type="text"
                    value={cardData.cvv}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 4) {
                        setCardData({ ...cardData, cvv: value });
                      }
                    }}
                    placeholder="123"
                    maxLength={4}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-8">
            <Button
              onClick={handlePay}
              disabled={processing}
              className="w-full"
            >
              {processing ? "Processing..." : `Pay $${quoteDetails?.totalPremium || 0}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}