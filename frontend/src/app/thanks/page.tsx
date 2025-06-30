/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Download, Shield, Calendar, User, MapPin, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/hooks/use-toast';
import Card from '@/components/ui/Card';
import { formatCurrency } from '@/utils/validators';

interface PolicyDetails {
  policyNumber?: string;
  totalPremium?: number;
  basePremium?: number;
  liabilityPremium?: number;
  liquorLiabilityPremium?: number;
  liabilityCoverage?: string;
  liquorLiability?: boolean;
  status?: string;
  quoteNumber?: string;
  email?: string;
  coverageLevel?: number;
  policy?: {
    policyNumber?: string;
    createdAt?: string;
  };
  event?: {
    eventType?: string;
    eventDate?: string;
    maxGuests?: string;
    coverageLevel?: string;
    liabilityCoverage?: string;
    honoree1FirstName?: string;
    honoree1LastName?: string;
    honoree2FirstName?: string;
    honoree2LastName?: string;
    venue?: {
      name?: string;
      venueType?: string;
      indoorOutdoor?: string;
      address1?: string;
      address2?: string;
      city?: string;
      state?: string;
      zip?: string;
      asInsured?: boolean;
      ceremonyLocationType?: string;
      receptionVenueName?: string;
      receptionVenueAddress1?: string;
      receptionVenueAddress2?: string;
      receptionVenueCity?: string;
      receptionVenueState?: string;
      receptionVenueZip?: string;
      rehearsalVenueName?: string;
      rehearsalVenueAddress1?: string;
      rehearsalVenueAddress2?: string;
      rehearsalVenueCity?: string;
      rehearsalVenueState?: string;
      rehearsalVenueZip?: string;
      rehearsalDinnerVenueName?: string;
      rehearsalDinnerVenueAddress1?: string;
      rehearsalDinnerVenueAddress2?: string;
      rehearsalDinnerVenueCity?: string;
      rehearsalDinnerVenueState?: string;
      rehearsalDinnerVenueZip?: string;
      brunchVenueName?: string;
      brunchVenueAddress1?: string;
      brunchVenueAddress2?: string;
      brunchVenueCity?: string;
      brunchVenueState?: string;
      brunchVenueZip?: string;
    };
  };
  policyHolder?: {
    firstName?: string;
    lastName?: string;
    relationship?: string;
    email?: string;
    phone?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
}

export default function ThanksPage() {
  const router = useRouter();
  const [policyDetails, setPolicyDetails] = useState<PolicyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    const fetchPolicyDetails = async () => {
      try {
        const policyNumber = localStorage.getItem('policyNumber');
        const policyId = localStorage.getItem('policyId');
        const quoteNumber = localStorage.getItem('quoteNumber');

        if (!policyNumber || !policyId || !quoteNumber) {
          toast({
            title: 'No policy found',
            description: 'Please complete a payment to view your policy details.',
            variant: 'destructive',
          });
          router.push('/');
          return;
        }

        console.log('Fetching policy details for:', { policyNumber, policyId, quoteNumber });

        // Fetch quote details using quoteNumber - this includes all policy data
        const quoteResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/quotes?quoteNumber=${quoteNumber}`,
          {
            cache: 'no-store',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        if (!quoteResponse.ok) {
          throw new Error(`Quote fetch failed! status: ${quoteResponse.status}`);
        }

        const quoteData = await quoteResponse.json();
        console.log('Quote API response:', quoteData);

        if (!quoteData.quote) {
          throw new Error('Quote not found');
        }

        // The quote data includes all policy information
        const policyData = quoteData.quote;
        console.log('Policy data from quote:', policyData);
        setPolicyDetails(policyData);

        // Clear quoteNumber from localStorage after successful data fetch
        localStorage.removeItem('quoteNumber');
      } catch (error) {
        console.error('Failed to fetch policy details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load policy details. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPolicyDetails();
  }, [router]);

  const generatePdf = async () => {
    if (!policyDetails) return;

    setGeneratingPdf(true);
    try {
      // Import jsPDF dynamically to avoid SSR issues
      const { default: jsPDF } = await import('jspdf');

      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      const contentWidth = pageWidth - margin * 2;
      const columnWidth = (contentWidth - 30) / 2;
      const leftColX = margin;
      const rightColX = margin + columnWidth + 30;

      // --- Colors and Fonts (matching review page) ---
      const primaryColor = '#233F96'; // Deep Blue
      const secondaryColor = '#F0F4FF'; // Light Blue background
      const textColor = '#333333';
      const labelColor = '#555555';
      const white = '#FFFFFF';
      doc.setFont('helvetica');

      // --- Header ---
      doc.setFillColor(primaryColor);
      doc.rect(0, 0, pageWidth, 60, 'F');
      doc.setTextColor(white);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Insurance Policy', margin, 38);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Policy : ${policyDetails.policy?.policyNumber}`, pageWidth - margin, 30, {
        align: 'right',
      });
      doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin, 42, {
        align: 'right',
      });

      let leftY = 90;
      let rightY = 90;

      // --- Helper Functions (matching review page) ---
      // Capitalize each word in a string
      function capitalizeWords(str: string | undefined | null): string {
        if (!str) return 'N/A';
        // Replace underscores with spaces first, then capitalize each word
        return str
          .replace(/_/g, ' ')
          .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
      }

      const drawSectionTitle = (title: string, x: number, y: number, w: number) => {
        doc.setFillColor(secondaryColor);
        doc.rect(x, y - 12, w, 18, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor);
        doc.text(title, x + 10, y);
        return y + 25;
      };

      const drawField = (
        label: string,
        value: string | undefined | null,
        x: number,
        y: number,
        w: number,
      ) => {
        if (!value) return y;
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(labelColor);
        doc.text(label, x, y);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(textColor);
        // Fixed value width (max 180px), word wrap
        const capValue = capitalizeWords(value);
        const valueLines = doc.splitTextToSize(capValue, 180);
        doc.text(valueLines, x + 140, y, { maxWidth: 180 });
        const lineCount = Array.isArray(valueLines) ? valueLines.length : 1;
        return y + lineCount * 11 + 4;
      };

      // --- Right Column: Premium & Policyholder ---
      rightY = drawSectionTitle('Premium Breakdown', rightColX, rightY, columnWidth);
      rightY = drawField(
        'Total Premium:',
        formatCurrency(policyDetails.totalPremium || 0),
        rightColX,
        rightY,
        columnWidth,
      );
      rightY = drawField(
        'Base Premium:',
        formatCurrency(policyDetails.basePremium || 0),
        rightColX,
        rightY,
        columnWidth,
      );
      if (policyDetails.liabilityCoverage && policyDetails.liabilityCoverage !== 'none') {
        rightY = drawField(
          'Liability Premium:',
          formatCurrency(policyDetails.liabilityPremium || 0),
          rightColX,
          rightY,
          columnWidth,
        );
      }
      if (policyDetails.liquorLiability) {
        rightY = drawField(
          'Host Liquor Premium:',
          formatCurrency(policyDetails.liquorLiabilityPremium || 0),
          rightColX,
          rightY,
          columnWidth,
        );
      }

      rightY += 15;
      rightY = drawSectionTitle('Policyholder Details', rightColX, rightY, columnWidth);
      const holder = policyDetails.policyHolder;
      rightY = drawField(
        'Name:',
        holder
          ? capitalizeWords(`${holder.firstName || ''} ${holder.lastName || ''}`.trim())
          : 'N/A',
        rightColX,
        rightY,
        columnWidth,
      );
      rightY = drawField(
        'Relationship:',
        capitalizeWords(holder?.relationship),
        rightColX,
        rightY,
        columnWidth,
      );
      rightY = drawField(
        'Email:',
        capitalizeWords(policyDetails.email),
        rightColX,
        rightY,
        columnWidth,
      );
      rightY = drawField('Phone:', holder?.phone, rightColX, rightY, columnWidth);
      rightY = drawField(
        'Address:',
        holder
          ? capitalizeWords(`${holder.address1 || ''} ${holder.address2 || ''}`.trim())
          : 'N/A',
        rightColX,
        rightY,
        columnWidth,
      );
      rightY = drawField(
        'Location:',
        holder
          ? capitalizeWords(
              `${holder.city || 'N/A'}, ${holder.state || 'N/A'} ${holder.zip || 'N/A'}`,
            )
          : 'N/A',
        rightColX,
        rightY,
        columnWidth,
      );

      // --- Left Column: Event & Coverage ---
      leftY = drawSectionTitle('Event & Coverage', leftColX, leftY, columnWidth);
      const event = policyDetails.event;

      // Add honorees information
      const honoree1 =
        event?.honoree1FirstName && event?.honoree1LastName
          ? capitalizeWords(`${event.honoree1FirstName} ${event.honoree1LastName}`)
          : 'N/A';
      const honoree2 =
        event?.honoree2FirstName && event?.honoree2LastName
          ? capitalizeWords(`${event.honoree2FirstName} ${event.honoree2LastName}`)
          : 'N/A';
      const honorees =
        honoree1 !== 'N/A' ? (honoree2 !== 'N/A' ? `${honoree1} & ${honoree2}` : honoree1) : 'N/A';

      leftY = drawField('Honorees:', honorees, leftColX, leftY, columnWidth);
      leftY = drawField(
        'Event Type:',
        event ? capitalizeWords(event.eventType) || 'N/A' : 'N/A',
        leftColX,
        leftY,
        columnWidth,
      );
      leftY = drawField(
        'Event Date:',
        event?.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'N/A',
        leftColX,
        leftY,
        columnWidth,
      );
      leftY = drawField(
        'Guest Count:',
        event ? event.maxGuests || 'N/A' : 'N/A',
        leftColX,
        leftY,
        columnWidth,
      );
      leftY = drawField(
        'Core Coverage:',
        event
          ? (policyDetails.coverageLevel !== undefined
              ? policyDetails.coverageLevel.toString()
              : capitalizeWords(event.coverageLevel)) || 'N/A'
          : 'N/A',
        leftColX,
        leftY,
        columnWidth,
      );
      leftY = drawField(
        'Liability Coverage:',
        event
          ? capitalizeWords(policyDetails.liabilityCoverage) ||
              capitalizeWords(event.liabilityCoverage) ||
              'N/A'
          : 'N/A',
        leftColX,
        leftY,
        columnWidth,
      );
      leftY = drawField(
        'Host Liquor:',
        policyDetails.liquorLiability ? 'Included' : 'Not Included',
        leftColX,
        leftY,
        columnWidth,
      );

      leftY += 15;
      leftY = drawSectionTitle('Ceremony Venue', leftColX, leftY, columnWidth);
      const venue = event?.venue;
      leftY = drawField('Venue Name:', capitalizeWords(venue?.name), leftColX, leftY, columnWidth);
      leftY = drawField(
        'Venue Type:',
        capitalizeWords(venue?.ceremonyLocationType),
        leftColX,
        leftY,
        columnWidth,
      );
      leftY = drawField(
        'Indoor/Outdoor:',
        capitalizeWords(venue?.indoorOutdoor),
        leftColX,
        leftY,
        columnWidth,
      );
      const venueAddress = venue
        ? capitalizeWords(`${venue.address1 || ''}${venue.address2 ? `, ${venue.address2}` : ''}`)
        : 'N/A';
      leftY = drawField('Address:', venueAddress, leftColX, leftY, columnWidth);
      leftY = drawField(
        'Location:',
        venue
          ? capitalizeWords(`${venue.city || 'N/A'}, ${venue.state || 'N/A'} ${venue.zip || 'N/A'}`)
          : 'N/A',
        leftColX,
        leftY,
        columnWidth,
      );
      leftY = drawField(
        'As Additional Insured:',
        venue?.asInsured ? 'Yes' : 'No',
        leftColX,
        leftY,
        columnWidth,
      );

      // Add additional venue information for weddings
      if (event?.eventType === 'wedding') {
        leftY += 15;
        leftY = drawSectionTitle('Additional Venues', leftColX, leftY, columnWidth);

        // Reception venue
        if (venue?.receptionVenueName) {
          leftY = drawField(
            'Reception Venue:',
            capitalizeWords(venue.receptionVenueName),
            leftColX,
            leftY,
            columnWidth,
          );
          const receptionAddress = capitalizeWords(
            `${venue.receptionVenueAddress1 || ''}${venue.receptionVenueAddress2 ? `, ${venue.receptionVenueAddress2}` : ''}`,
          );
          if (receptionAddress.trim()) {
            leftY = drawField('Reception Address:', receptionAddress, leftColX, leftY, columnWidth);
          }
          const receptionLocation = capitalizeWords(
            `${venue.receptionVenueCity || ''}, ${venue.receptionVenueState || ''} ${venue.receptionVenueZip || ''}`.trim(),
          );
          if (receptionLocation !== ',  ') {
            leftY = drawField(
              'Reception Location:',
              receptionLocation,
              leftColX,
              leftY,
              columnWidth,
            );
          }
        }

        // Rehearsal venue
        if (venue?.rehearsalVenueName) {
          leftY = drawField(
            'Rehearsal Venue:',
            capitalizeWords(venue.rehearsalVenueName),
            leftColX,
            leftY,
            columnWidth,
          );
          const rehearsalAddress = capitalizeWords(
            `${venue.rehearsalVenueAddress1 || ''}${venue.rehearsalVenueAddress2 ? `, ${venue.rehearsalVenueAddress2}` : ''}`,
          );
          if (rehearsalAddress.trim()) {
            leftY = drawField('Rehearsal Address:', rehearsalAddress, leftColX, leftY, columnWidth);
          }
          const rehearsalLocation = capitalizeWords(
            `${venue.rehearsalVenueCity || ''}, ${venue.rehearsalVenueState || ''} ${venue.rehearsalVenueZip || ''}`.trim(),
          );
          if (rehearsalLocation !== ',  ') {
            leftY = drawField(
              'Rehearsal Location:',
              rehearsalLocation,
              leftColX,
              leftY,
              columnWidth,
            );
          }
        }

        // Rehearsal dinner venue
        if (venue?.rehearsalDinnerVenueName) {
          leftY = drawField(
            'Rehearsal Dinner Venue:',
            capitalizeWords(venue.rehearsalDinnerVenueName),
            leftColX,
            leftY,
            columnWidth,
          );
          const rehearsalDinnerAddress = capitalizeWords(
            `${venue.rehearsalDinnerVenueAddress1 || ''}${venue.rehearsalDinnerVenueAddress2 ? `, ${venue.rehearsalDinnerVenueAddress2}` : ''}`,
          );
          if (rehearsalDinnerAddress.trim()) {
            leftY = drawField(
              'Rehearsal Dinner Address:',
              rehearsalDinnerAddress,
              leftColX,
              leftY,
              columnWidth,
            );
          }
          const rehearsalDinnerLocation = capitalizeWords(
            `${venue.rehearsalDinnerVenueCity || ''}, ${venue.rehearsalDinnerVenueState || ''} ${venue.rehearsalDinnerVenueZip || ''}`.trim(),
          );
          if (rehearsalDinnerLocation !== ',  ') {
            leftY = drawField(
              'Rehearsal Dinner Location:',
              rehearsalDinnerLocation,
              leftColX,
              leftY,
              columnWidth,
            );
          }
        }

        // Brunch venue
        if (venue?.brunchVenueName) {
          leftY = drawField(
            'Brunch Venue:',
            capitalizeWords(venue.brunchVenueName),
            leftColX,
            leftY,
            columnWidth,
          );
          const brunchAddress = capitalizeWords(
            `${venue.brunchVenueAddress1 || ''}${venue.brunchVenueAddress2 ? `, ${venue.brunchVenueAddress2}` : ''}`,
          );
          if (brunchAddress.trim()) {
            leftY = drawField('Brunch Address:', brunchAddress, leftColX, leftY, columnWidth);
          }
          const brunchLocation = capitalizeWords(
            `${venue.brunchVenueCity || ''}, ${venue.brunchVenueState || ''} ${venue.brunchVenueZip || ''}`.trim(),
          );
          if (brunchLocation !== ',  ') {
            leftY = drawField('Brunch Location:', brunchLocation, leftColX, leftY, columnWidth);
          }
        }
      }

      // --- Full Width Section for Policy Information ---
      let y = Math.max(leftY, rightY) + 15;

      y = drawSectionTitle('Policy Information', margin, y, contentWidth);
      y = drawField(
        'Policy Number:',
        capitalizeWords(policyDetails.policy?.policyNumber),
        margin,
        y,
        contentWidth,
      );
      y = drawField(
        'Status:',
        capitalizeWords(policyDetails.status) || 'Active',
        margin,
        y,
        contentWidth,
      );
      y = drawField(
        'Created At:',
        policyDetails.policy?.createdAt
          ? new Date(policyDetails.policy.createdAt).toLocaleDateString()
          : 'N/A',
        margin,
        y,
        contentWidth,
      );
      drawField(
        'Quote Number:',
        capitalizeWords(policyDetails.quoteNumber),
        margin,
        y,
        contentWidth,
      );

      // --- Footer (matching review page) ---
      doc.setFillColor(secondaryColor);
      doc.rect(0, pageHeight - 40, pageWidth, 40, 'F');
      doc.setFontSize(8);
      doc.setTextColor(labelColor);
      const footerText = `This policy is now active. Terms and conditions apply. | Wedevent Insurance - 1-800-555-0123`;
      doc.text(footerText, pageWidth / 2, pageHeight - 18, { align: 'center' });

      // Save the PDF
      const fileName = `Wedevent_Policy_${policyDetails.policyNumber || 'document'}.pdf`;
      doc.save(fileName);

      toast({
        title: 'PDF Downloaded',
        description: 'Your policy document has been downloaded successfully.',
        variant: 'default',
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: 'PDF Generation Failed',
        description: 'Failed to generate PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleGoHome = () => {
    // Clear localStorage
    localStorage.removeItem('policyNumber');
    localStorage.removeItem('policyId');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your policy details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-lg text-gray-600">
            Your payment has been processed successfully and your policy is now active.
          </p>
        </div>

        {/* Policy Summary Card */}
        {policyDetails && (
          <Card
            title="Policy Summary"
            subtitle={`Policy ${policyDetails.policy?.policyNumber}`}
            className="mb-8"
            icon={<Shield size={24} className="text-blue-600" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Policy Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Shield size={20} className="text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Policy Number</p>
                    <p className="font-semibold">{policyDetails.policy?.policyNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="font-semibold">
                      {policyDetails.policy?.createdAt
                        ? new Date(policyDetails.policy.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User size={20} className="text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Policy Holder</p>
                    <p className="font-semibold">
                      {policyDetails.policyHolder?.firstName} {policyDetails.policyHolder?.lastName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Event Type</p>
                    <p className="font-semibold">{policyDetails.event?.eventType || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Event Date</p>
                    <p className="font-semibold">
                      {policyDetails.event?.eventDate
                        ? new Date(policyDetails.event.eventDate).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={20} className="text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Venue</p>
                    <p className="font-semibold">{policyDetails.event?.venue?.name || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Information */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Total Premium</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(policyDetails.totalPremium || 0)}
                </p>
              </div>
            </div>

            {/* Debug Information (only show if data is missing) */}
            {(!policyDetails.policy || !policyDetails.event || !policyDetails.policyHolder) && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-yellow-600" />
                  <p className="text-sm font-medium text-yellow-800">
                    Some policy details are incomplete
                  </p>
                </div>
                <div className="text-xs text-yellow-700 space-y-1">
                  {!policyDetails.policy && <p>• Policy information is missing</p>}
                  {!policyDetails.event && <p>• Event information is missing</p>}
                  {!policyDetails.policyHolder && <p>• Policy holder information is missing</p>}
                  <p className="mt-2">The PDF will be generated with available information only.</p>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={generatePdf}
            disabled={generatingPdf}
            variant="primary"
            size="lg"
            className="flex items-center gap-2"
          >
            <Download size={20} />
            {generatingPdf ? 'Generating PDF...' : 'Download Policy PDF'}
          </Button>
          <Button onClick={handleGoHome} variant="outline" size="lg">
            Return to Home
          </Button>
        </div>

        {/* Additional Information */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>A confirmation email has been sent to your registered email address.</p>
          <p className="mt-2">
            If you have any questions about your policy, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}
