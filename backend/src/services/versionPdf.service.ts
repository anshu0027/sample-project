import { PDFDocument, rgb } from "pdf-lib";
import { jsPDF } from "jspdf";

export class VersionPdfService {
  static async generateVersionPdf(policyData: any): Promise<Buffer> {
    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
      const { width, height } = page.getSize();

      // Constants for layout
      const MARGIN = 40;
      const COLUMN_WIDTH = (width - MARGIN * 3) / 2; // Two columns with margin between
      const LINE_HEIGHT = 15;
      const SECTION_SPACING = 25;
      const TITLE_SIZE = 16;
      const HEADER_SIZE = 12;
      const TEXT_SIZE = 10;
      const FOOTER_SIZE = 8;

      // Add title
      page.drawText("Policy Version Details", {
        x: MARGIN,
        y: height - MARGIN,
        size: TITLE_SIZE,
        color: rgb(0.1, 0.1, 0.1),
      });

      // Add policy number and date
      const currentDate = new Date().toLocaleDateString();
      page.drawText(`Policy #${policyData.policy?.policyNumber}`, {
        x: width - MARGIN - 150,
        y: height - MARGIN,
        size: HEADER_SIZE,
        color: rgb(0.2, 0.2, 0.2),
      });

      let leftColumnY = height - MARGIN - 40;
      let rightColumnY = height - MARGIN - 40;

      // Helper function to add text with proper spacing
      const addText = (text: string, value: any, column: "left" | "right") => {
        if (value !== undefined && value !== null) {
          const x = column === "left" ? MARGIN : MARGIN * 2 + COLUMN_WIDTH;
          const y = column === "left" ? leftColumnY : rightColumnY;

          // Draw label
          page.drawText(`${text}:`, {
            x,
            y,
            size: TEXT_SIZE,
            color: rgb(0.3, 0.3, 0.3),
          });

          // Draw value
          page.drawText(`${value}`, {
            x: x + 100,
            y,
            size: TEXT_SIZE,
            color: rgb(0, 0, 0),
          });

          if (column === "left") {
            leftColumnY -= LINE_HEIGHT;
          } else {
            rightColumnY -= LINE_HEIGHT;
          }
        }
      };

      // Helper function to add section header
      const addSectionHeader = (text: string, column: "left" | "right") => {
        const x = column === "left" ? MARGIN : MARGIN * 2 + COLUMN_WIDTH;
        const y = column === "left" ? leftColumnY : rightColumnY;

        // Add spacing before section
        if (column === "left") {
          leftColumnY -= SECTION_SPACING;
        } else {
          rightColumnY -= SECTION_SPACING;
        }

        // Draw section header
        page.drawText(text, {
          x,
          y: column === "left" ? leftColumnY : rightColumnY,
          size: HEADER_SIZE,
          color: rgb(0.1, 0.1, 0.1),
        });

        // Add underline
        page.drawLine({
          start: { x, y: (column === "left" ? leftColumnY : rightColumnY) - 2 },
          end: {
            x: x + 200,
            y: (column === "left" ? leftColumnY : rightColumnY) - 2,
          },
          thickness: 1,
          color: rgb(0.8, 0.8, 0.8),
        });

        if (column === "left") {
          leftColumnY -= LINE_HEIGHT * 1.5;
        } else {
          rightColumnY -= LINE_HEIGHT * 1.5;
        }
      };

      // Left Column Content
      addSectionHeader("Policy Information", "left");
      addText("Status", policyData.policy?.status, "left");
      addText("PDF URL", policyData.policy?.pdfUrl, "left");

      if (policyData.event) {
        addSectionHeader("Event Information", "left");
        addText("Event Type", policyData.event.eventType, "left");
        // Format event date to a readable string
        let formattedEventDate = policyData.event.eventDate;
        if (formattedEventDate) {
          const dateObj = new Date(formattedEventDate);
          if (!isNaN(dateObj.getTime())) {
            formattedEventDate = dateObj.toDateString();
          }
        }
        addText("Event Date", formattedEventDate, "left");
        addText("Max Guests", policyData.event.maxGuests, "left");
        addText(
          "Honoree 1",
          `${policyData.event.honoree1FirstName} ${policyData.event.honoree1LastName}`,
          "left"
        );
        if (policyData.event.honoree2FirstName) {
          addText(
            "Honoree 2",
            `${policyData.event.honoree2FirstName} ${policyData.event.honoree2LastName}`,
            "left"
          );
        }
      }

      if (policyData.venue) {
        addSectionHeader("Main Venue", "left");
        addText("Name", policyData.venue.name, "left");
        addText(
          "Address",
          `${policyData.venue.address1}${
            policyData.venue.address2 ? ", " + policyData.venue.address2 : ""
          }`,
          "left"
        );
        addText(
          "Location",
          `${policyData.venue.city}, ${policyData.venue.state} ${policyData.venue.zip}`,
          "left"
        );
        addText("Country", policyData.venue.country, "left");
        addText("Type", policyData.venue.locationType, "left");
        addText("Ceremony Type", policyData.venue.ceremonyLocationType, "left");
        addText("Setting", policyData.venue.indoorOutdoor, "left");
        addText(
          "As Insured",
          policyData.venue.venueAsInsured ? "Yes" : "No",
          "left"
        );
      }

      // Right Column Content
      if (policyData.policyHolder) {
        addSectionHeader("Policy Holder", "right");
        addText(
          "Name",
          `${policyData.policyHolder.firstName} ${policyData.policyHolder.lastName}`,
          "right"
        );
        addText("Email", policyData.policyHolder.email, "right");
        addText("Phone", policyData.policyHolder.phone, "right");
        addText("Relationship", policyData.policyHolder.relationship, "right");
        addText("Address", `${policyData.policyHolder.address}`, "right");
        addText(
          "Location",
          `${policyData.policyHolder.city}, ${policyData.policyHolder.state} ${policyData.policyHolder.zip}`,
          "right"
        );
        addText("Country", policyData.policyHolder.country, "right");
        addText(
          "Legal Notices",
          policyData.policyHolder.legalNotices ? "Accepted" : "Not Accepted",
          "right"
        );
        addText(
          "Form Completed By",
          policyData.policyHolder.completingFormName,
          "right"
        );
        addText(
          "Referral Source",
          policyData.policyHolder.hearAboutUs,
          "right"
        );
      }

      if (policyData.quote) {
        addSectionHeader("Quote Details", "right");
        addText("Quote Number", policyData.quote.quoteNumber, "right");
        addText("Email", policyData.quote.email, "right");
        addText("State", policyData.quote.residentState, "right");
        addText("Coverage", policyData.quote.coverageLevel, "right");
        addText("Liability", policyData.quote.liabilityCoverage, "right");
        addText(
          "Liquor Liability",
          policyData.quote.liquorLiability ? "Yes" : "No",
          "right"
        );
        addText(
          "COVID Disclosure",
          policyData.quote.covidDisclosure ? "Yes" : "No",
          "right"
        );
        addText(
          "Special Activities",
          policyData.quote.specialActivities ? "Yes" : "No",
          "right"
        );
        addText("Total Premium", `$${policyData.quote.totalPremium}`, "right");
        addText("Base Premium", `$${policyData.quote.basePremium}`, "right");
        addText(
          "Liability Premium",
          `$${policyData.quote.liabilityPremium}`,
          "right"
        );
        addText(
          "Liquor Premium",
          `$${policyData.quote.liquorLiabilityPremium}`,
          "right"
        );
        addText("Status", policyData.quote.status, "right");
      }

      // Add footer with version date and page number
      const footerText = `Version generated on ${currentDate}`;
      page.drawText(footerText, {
        x: MARGIN,
        y: MARGIN,
        size: FOOTER_SIZE,
        color: rgb(0.5, 0.5, 0.5),
      });

      // Add a subtle border around the page
      page.drawRectangle({
        x: MARGIN - 5,
        y: MARGIN - 5,
        width: width - MARGIN * 2 + 10,
        height: height - MARGIN * 2 + 10,
        borderColor: rgb(0.9, 0.9, 0.9),
        borderWidth: 1,
      });

      // Convert to buffer
      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      console.error("Error generating version PDF:", error);
      throw new Error("Failed to generate version PDF");
    }
  }
}
