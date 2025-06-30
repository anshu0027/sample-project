import React from 'react';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils/validators';
import { Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// ------------------------
// Type definition for the props of Step4Form component.
// ------------------------
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
  onSave: () => void; // Callback function to save the quote.
  onBack: () => void; // Callback function to go back to the previous step.
  emailSent: boolean; // Flag indicating if the quote email has been sent.
  onEmail: () => void; // Callback function to send the quote email.
  isRetrievedQuote: boolean; // Flag indicating if the current quote was retrieved from storage.
  isAdmin: boolean; // Flag indicating if the current user is an admin.
  // Validation functions for admin validation
  onValidateStep1?: () => boolean;
  onValidateStep2?: () => boolean;
  onValidateStep3?: () => boolean;
  onSetStep?: (step: number) => void; // Function to navigate to specific step
};

// ------------------------
// Step4Form component: Handles the fourth and final step of the quote generation process.
// It displays a summary of the quote, including premium breakdown, and provides options
// to email the quote, save it (for admins), or proceed to payment (for customers).
// ------------------------
export default function Step4Form(props: Step4FormProps) {
  const {
    state,
    onSave,
    onBack,
    emailSent,
    onEmail,
    isRetrievedQuote,
    isAdmin,
    onValidateStep1,
    onValidateStep2,
    onValidateStep3,
    onSetStep,
  } = props;

  // ------------------------
  // Handles the navigation to the payment page.
  // Sets a flag in localStorage to indicate that a quote is being retrieved for payment.
  // ------------------------
  const handlePayment = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('retrievedQuote', 'true');
      window.location.href = '/customer/payment';
    }
  };

  // ------------------------
  // Handles admin save with validation check.
  // Validates all steps and redirects to first error if validation fails.
  // ------------------------
  const handleAdminSave = () => {
    if (!isAdmin) {
      onSave();
      return;
    }

    // Validate all steps
    const step1Valid = onValidateStep1 ? onValidateStep1() : true;
    const step2Valid = onValidateStep2 ? onValidateStep2() : true;
    const step3Valid = onValidateStep3 ? onValidateStep3() : true;

    if (!step1Valid) {
      toast({
        title: 'Validation Error',
        description: 'Please complete Step 1 correctly before saving.',
        variant: 'destructive',
      });
      onSetStep?.(1);
      // Add a small delay to ensure errors are properly displayed
      setTimeout(() => {
        // Force a re-render by triggering validation again
        onValidateStep1?.();
      }, 100);
      return;
    }

    if (!step2Valid) {
      toast({
        title: 'Validation Error',
        description: 'Please complete Step 2 correctly before saving.',
        variant: 'destructive',
      });
      onSetStep?.(2);
      // Add a small delay to ensure errors are properly displayed
      setTimeout(() => {
        // Force a re-render by triggering validation again
        onValidateStep2?.();
      }, 100);
      return;
    }

    if (!step3Valid) {
      toast({
        title: 'Validation Error',
        description: 'Please complete Step 3 correctly before saving.',
        variant: 'destructive',
      });
      onSetStep?.(3);
      // Add a small delay to ensure errors are properly displayed
      setTimeout(() => {
        // Force a re-render by triggering validation again
        onValidateStep3?.();
      }, 100);
      return;
    }

    // All validations passed, proceed with save
    onSave();
  };

  return (
    <div className="space-y-8">
      {/* ------------------------ */}
      {/* Main container for the quote summary card. */}
      {/* ------------------------ */}
      {/* Replaced Card with div and merged styles */}
      <div className="w-full max-w-4xl mx-auto mb-6 border-gray-200 border rounded-2xl shadow-lg p-8 sm:p-10 md:p-12">
        {/* ------------------------ */}
        {/* Card Header: Title and Quote Number. */}
        {/* ------------------------ */}
        {/* Manually recreated header structure */}
        <div className="flex items-center justify-center text-center mb-4 gap-4">
          <div>
            <div className="text-xl md:text-2xl font-extrabold leading-tight mb-1">
              Quote Summary
            </div>
            <div className="text-base text-gray-500 font-medium leading-tight">{`Quote #${state.quoteNumber}`}</div>
          </div>
        </div>
        {/* ------------------------ */}
        {/* Card Content: Total Premium and Premium Breakdown. */}
        {/* ------------------------ */}
        {/* Content of the card */}
        <div>
          <div className="space-y-4 px-2 sm:px-4 md:px-8">
            <div className="bg-white rounded-lg p-4 borde">
              {/* ------------------------ */}
              {/* Total Premium Display. */}
              {/* ------------------------ */}
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-1">Total Premium</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrency(state.totalPremium)}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                {/* ------------------------ */}
                {/* Premium Breakdown Section. */}
                {/* ------------------------ */}
                <h4 className="text-sm font-medium text-gray-700 mb-2">Premium Breakdown:</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Core Coverage:</span>
                    <span className="font-medium">{formatCurrency(state.basePremium)}</span>
                  </div>
                  {state.liabilityCoverage !== 'none' && (
                    // ------------------------
                    // Display Liability Coverage premium if applicable.
                    // ------------------------
                    <div className="flex justify-between text-sm">
                      <span>Liability Coverage:</span>
                      <span className="font-medium">
                        {formatCurrency(state.liabilityPremium ?? 0)}
                      </span>
                    </div>
                  )}
                  {state.liquorLiability && (
                    // ------------------------
                    // Display Host Liquor Liability premium if applicable.
                    // ------------------------
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
        {/* ------------------------ */}
        {/* Card Footer: Action Buttons (Email Quote, Save Quote/Payment). */}
        {/* ------------------------ */}
        {/* Manually recreated footer structure */}
        <div className="mt-8">
          <div className="flex flex-col md:flex-row justify-end gap-4 w-full">
            {/* ------------------------ */}
            {/* Email Quote Button. */}
            {/* ------------------------ */}
            <Button variant="outline" size="lg" onClick={onEmail} className="w-full md:w-auto">
              <Mail size={18} className="mr-2" />
              {emailSent ? 'Email Sent!' : 'Email Quote'}
            </Button>
            {isAdmin ? (
              // ------------------------
              // Save Quote Button (Visible for Admins).
              // ------------------------
              <Button
                variant="primary"
                size="lg"
                onClick={handleAdminSave}
                className="w-full md:w-auto"
              >
                Save Quote
              </Button>
            ) : isRetrievedQuote || state.quoteNumber ? (
              // ------------------------
              // Payment Button (Visible for Customers if quote is retrieved or has a number).
              // ------------------------
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
      {/* ------------------------ */}
      {/* Back Button Container. */}
      {/* ------------------------ */}
      <div className="flex flex-col md:flex-row justify-between gap-4 ml-10 w-full mt-4 px-5">
        <Button type="button" variant="outline" onClick={onBack} className="w-48 py-5">
          {/* ------------------------ */}
          {/* Back Button. */}
          {/* ------------------------ */}
          Back
        </Button>
      </div>
    </div>
  );
}
