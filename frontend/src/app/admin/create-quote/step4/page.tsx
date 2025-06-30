'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuote, QuoteState } from '@/context/QuoteContext';
import { Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { formatCurrency } from '@/utils/validators';
import { Mail, ChevronDown } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { toast } from '@/hooks/use-toast';

// ------------------------
// Component for Step 4 of the admin quote creation process: Review and Save/Email.
// This step displays a summary of the quote and allows the admin to save it
// or email it to the customer.
// ------------------------
export default function Step4() {
  const { state } = useQuote();
  const router = useRouter();
  const { isSignedIn, isLoaded, getToken } = useAuth();
  // State to track if the email has been successfully sent, for UI feedback.
  const [emailSent, setEmailSent] = useState(false);
  // State to manage page readiness, primarily for showing a skeleton loader.
  const [pageReady, setPageReady] = useState(false);
  // State to hold any validation errors.
  const [errors, setErrors] = useState({});
  // State to track the selected action (submit or payment link)
  const [selectedAction, setSelectedAction] = useState('submit');
  // State to track if payment link is being generated
  const [generatingPaymentLink, setGeneratingPaymentLink] = useState(false);
  // State to track dropdown open/close
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // ------------------------
  // useEffect hook to handle page initialization, authentication, and step completion checks.
  // Redirects to login if not authenticated or to previous steps if they are not complete.
  // ------------------------
  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if admin is authenticated
      if (isLoaded && !isSignedIn) {
        router.replace('/admin/login');
        return;
      }
      if (!state.step3Complete) {
        toast.error('Please complete Step 3: Policyholder Information first.');
        router.replace('/admin/create-quote/step3');
        return;
      }
      setPageReady(true);
    }, 200);
    return () => clearTimeout(timer);
  }, [router, state.step3Complete, isLoaded, isSignedIn]);

  // ------------------------
  // useEffect to handle clicking outside dropdown to close it
  // ------------------------
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (dropdownOpen && !target.closest('.dropdown-container')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // ------------------------
  // Navigates back to Step 3 (Policyholder Information).
  // ------------------------
  const handleBack = () => {
    router.push('/admin/create-quote/step3');
  };

  // ------------------------
  // Validates that all essential fields in the quote state are filled.
  // ------------------------
  function validateAllFields(state: QuoteState): boolean {
    const requiredFields: (keyof QuoteState)[] = [
      'eventType',
      'eventDate',
      'maxGuests',
      'coverageLevel',
      'liabilityCoverage',
      'venueName',
      'venueAddress1',
      'venueCity',
      'firstName',
      'lastName',
      'email',
    ];

    // Check if it's a cruise ship venue
    const isCruiseShip = state.ceremonyLocationType === 'cruise_ship';

    // Only require country, state, zip if it's not a cruise ship
    if (!isCruiseShip) {
      requiredFields.push('venueCountry', 'venueState', 'venueZip');
    }

    for (const field of requiredFields) {
      if (!state[field]) {
        toast.error(`${field} is missing`);
        return false;
      }
    }
    return true;
  }

  // ------------------------
  // Main form validation function, currently just calls validateAllFields.
  // ------------------------
  function validateForm(): boolean {
    const errors = {};
    if (!validateAllFields(state)) {
      return false;
    }
    setErrors(errors);
    return true;
  }

  // ------------------------
  // Handles saving the quote by making a PUT request to the API.
  // Updates the quote status to 'COMPLETE'.
  // ------------------------
  // ==================================================================
  // ===== API CHANGE #1: Saving the quote ==========================
  // ==================================================================
  const handleSave = async () => {
    if (validateForm()) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const quoteNumber = localStorage.getItem('quoteNumber');

      // Ensure quoteNumber is available from localStorage
      if (!quoteNumber) {
        toast.error('Quote number not found. Please start over.');
        router.push('/admin/create-quote/step1');
        return;
      }

      try {
        console.log('Saving quote with state:', state);
        // Update quote with final information
        const token = await getToken();
        const res = await fetch(`${apiUrl}/quotes/${quoteNumber}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...state, // Send all fields from state
            status: 'COMPLETE', // Ensure status is set to COMPLETE
          }),
        });

        // Handle API response
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to update quote');
        }

        toast.success('Quote saved successfully!');
        router.push('/admin/quotes');
        // Navigate to the admin quotes list page after successful save
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        toast.error(message);
      }
    } else {
      // Display validation errors if form is not valid
      Object.entries(errors).forEach(([, msg]) => toast.error(msg as string));
    }
  };

  // ------------------------
  // Handles sending the quote details via email by making a POST request to the email API.
  // Sends the entire quote state as data for the email template.
  // ------------------------
  // ==================================================================
  // ===== API CHANGE #2: Sending the email =========================
  // ==================================================================
  const handleEmail = async () => {
    // Validate fields before attempting to send email
    if (!validateAllFields(state)) {
      return;
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      const token = await getToken();
      const res = await fetch(`${apiUrl}/email/send`, {
        // UPDATED PATH
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: state.email,
          type: 'quote',
          data: state, // Send the entire state object
        }),
      });

      // Handle API response for email sending
      if (res.ok) {
        setEmailSent(true);
        toast.success('Quote emailed successfully!');
        setTimeout(() => setEmailSent(false), 3000);
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send email');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      toast.error(message);
    }
  };

  // ------------------------
  // Handles generating a payment link for the quote.
  // First saves the quote, then generates a payment link.
  // ------------------------
  const handleGetPaymentLink = async () => {
    if (!validateForm()) {
      return;
    }

    setGeneratingPaymentLink(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const quoteNumber = localStorage.getItem('quoteNumber');

    // Ensure quoteNumber is available from localStorage
    if (!quoteNumber) {
      toast.error('Quote number not found. Please start over.');
      router.push('/admin/create-quote/step1');
      return;
    }

    try {
      console.log('Saving quote and generating payment link with state:', state);
      // Update quote with final information
      const token = await getToken();
      const res = await fetch(`${apiUrl}/quotes/${quoteNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...state, // Send all fields from state
          status: 'PENDING_PAYMENT', // Set status to PENDING_PAYMENT
        }),
      });

      // Handle API response
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update quote');
      }

      // Generate payment link
      const paymentLink = `${window.location.origin}/checkout?quoteNumber=${quoteNumber}`;

      toast.success('Payment link generated successfully!');

      // Copy payment link to clipboard
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(paymentLink);
        } else {
          // Fallback for environments where clipboard API is not available
          const textArea = document.createElement('textarea');
          textArea.value = paymentLink;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          textArea.remove();
        }
        toast.success('Payment link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Failed to copy to clipboard:', clipboardError);
        // Show the link in a toast if clipboard fails
        toast.success(`Payment link: ${paymentLink}`);
      }

      // Navigate to quotes list
      router.push('/admin/quotes');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(message);
    } finally {
      setGeneratingPaymentLink(false);
    }
  };

  // ------------------------
  // Skeleton loader component for Step 4.
  // Provides a visual placeholder while page data is loading or checks are being performed.
  // ------------------------
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

  // ------------------------
  // Conditional rendering: Show skeleton if page is not ready, otherwise render the full Step 4 content.
  // ------------------------
  if (!pageReady) {
    return <Step4Skeleton />;
  }

  // ------------------------
  // Main render for Step 4. Displays the quote summary in a Card component
  // with options to email or save the quote, and a button to go back.
  // ------------------------
  return (
    <>
      <div className="space-y-8">
        <Card
          title="Quote Summary"
          subtitle={`Quote #${state.quoteNumber || '(New Quote)'}`}
          className="mb-6 border-blue-100 bg-blue-50"
          footer={
            // ------------------------
            // Footer of the card containing action buttons: Email Quote and Save Quote.
            // ------------------------
            <div className="flex justify-end gap-4">
              <Button variant="outline" size="lg" onClick={handleEmail}>
                <Mail size={18} />
                {emailSent ? 'Email Sent!' : 'Email Quote'}
              </Button>

              {/* Action Dropdown */}
              <div className="relative dropdown-container">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center justify-between w-48 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <span>{selectedAction === 'submit' ? 'Submit' : 'Pay Later'}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 z-10 w-48 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setSelectedAction('submit');
                          setDropdownOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                          selectedAction === 'submit' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        Submit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAction('payment-link');
                          setDropdownOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                          selectedAction === 'payment-link'
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700'
                        }`}
                      >
                        Pay Later
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Button
                // variant="primary"
                className="px-7 py-2 rounded-full font-bold bg-blue-500 text-white shadow-sm hover:bg-green-600 transition-all"
                size="lg"
                onClick={selectedAction === 'submit' ? handleSave : handleGetPaymentLink}
                disabled={generatingPaymentLink}
                onMouseEnter={() => router.prefetch('/admin/quotes')}
              >
                {generatingPaymentLink ? 'Generating...' : 'Proceed'}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {/* // ------------------------
            // Section displaying the total premium and a breakdown of costs.
            // ------------------------ */}
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-1">Total Premium</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrency(state.totalPremium)}
                </p>
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
                      <span className="font-medium">
                        {formatCurrency(state.liquorLiabilityPremium)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
        {/* // ------------------------
        // Navigation button to go back to the previous step.
        // ------------------------ */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            onMouseEnter={() => router.prefetch('/admin/create-quote/step3')}
          >
            Back
          </Button>
        </div>
      </div>
    </>
  );
}
