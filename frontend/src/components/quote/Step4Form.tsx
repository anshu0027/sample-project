import React from "react";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/utils/validators";
import { Mail } from "lucide-react";

type Step4FormProps = {
  state: {
    quoteNumber: string | number;
    totalPremium: number;
    basePremium: number;
    liabilityCoverage: string;
    liabilityPremium: number;
    liquorLiability?: boolean;
    liquorLiabilityPremium?: number;
  };
  onSave: () => void;
  onBack: () => void;
  emailSent: boolean;
  onEmail: () => void;
  isRetrievedQuote: boolean;
  isAdmin: boolean;
};

export default function Step4Form(props: Step4FormProps) {
  const { state, onSave, onBack, emailSent, onEmail, isRetrievedQuote, isAdmin } = props;
  const handlePayment = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("retrievedQuote", "true");
      window.location.href = "/customer/payment";
    }
  };
  return (
    <div className="space-y-8">
      {/* Replaced Card with div and merged styles */}
      <div className="w-full max-w-4xl mx-auto mb-6 border-gray-200 border rounded-2xl shadow-lg p-8 sm:p-10 md:p-12">
        {/* Manually recreated header structure */}
        <div className="flex items-center justify-center text-center mb-4 gap-4">
          <div>
            <div className="text-xl md:text-2xl font-extrabold leading-tight mb-1">
              Quote Summary
            </div>
            <div className="text-base text-gray-500 font-medium leading-tight">{`Quote #${state.quoteNumber}`}</div>
          </div>
        </div>
        {/* Content of the card */}
        <div>
          <div className="space-y-4 px-2 sm:px-4 md:px-8">
            <div className="bg-white rounded-lg p-4 borde">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-1">
                  Total Premium
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrency(state.totalPremium)}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Premium Breakdown:
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Core Coverage:</span>
                    <span className="font-medium">
                      {formatCurrency(state.basePremium)}
                    </span>
                  </div>
                  {state.liabilityCoverage !== "none" && (
                    <div className="flex justify-between text-sm">
                      <span>Liability Coverage:</span>
                      <span className="font-medium">
                        {formatCurrency(state.liabilityPremium ?? 0)}
                      </span>
                    </div>
                  )}
                  {state.liquorLiability && (
                    <div className="flex justify-between text-sm">
                      <span>Host Liquor Liability:</span>
                      <span className="font-medium">
                        {formatCurrency(state.liquorLiabilityPremium ?? 0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Manually recreated footer structure */}
        <div className="mt-8">
          <div className="flex flex-col md:flex-row justify-end gap-4 w-full">
            <Button
              variant="outline"
              size="lg"
              onClick={onEmail}
              className="w-full md:w-auto"
            >
              <Mail size={18} className="mr-2" />
              {emailSent ? "Email Sent!" : "Email Quote"}
            </Button>
            {isAdmin ? (
              <Button
                variant="primary"
                size="lg"
                onClick={onSave}
                className="w-full md:w-auto"
              >
                Save Quote
              </Button>
            ) : (isRetrievedQuote || state.quoteNumber) ? (
              <Button
                variant="primary"
                size="lg"
                onClick={handlePayment}
                className="w-full md:w-auto"
              >
                Payment
              </Button>
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between gap-4 ml-10 w-full mt-4 px-5">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="w-48 py-5"
        >
          Back
        </Button>
      </div>
    </div>
  );
}
