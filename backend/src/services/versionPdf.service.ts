import { PDFDocument, rgb } from "pdf-lib";
// import { jsPDF } from "jspdf";

export class VersionPdfService {
  static async generateVersionPdf(policyData: any): Promise<Buffer> {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]);
      const { width, height } = page.getSize();

      const helveticaBold = await pdfDoc.embedFont("Helvetica-Bold");
      const helveticaNormal = await pdfDoc.embedFont("Helvetica");

      const MARGIN = 40;
      const COLUMN_GAP = 20;
      const COLUMN_WIDTH = (width - MARGIN * 2 - COLUMN_GAP) / 2;
      const LINE_HEIGHT = 16;
      const SECTION_SPACING = 18;
      const HEADER_FONT_SIZE = 13;
      const LABEL_FONT_SIZE = 10;
      const VALUE_FONT_SIZE = 10;
      const TITLE_FONT_SIZE = 20;
      // const FOOTER_FONT_SIZE = 9;

      // Draw header bar
      page.drawRectangle({
        x: 0,
        y: height - 60,
        width: width,
        height: 60,
        color: rgb(0.1, 0.3, 0.6),
      });

      page.drawText("Policy Version Summary", {
        x: MARGIN,
        y: height - 35,
        size: TITLE_FONT_SIZE,
        font: helveticaBold,
        color: rgb(1, 1, 1),
      });

      const currentDate = new Date().toLocaleDateString();
      page.drawText(`Generated on: ${currentDate}`, {
        x: width - MARGIN - 120,
        y: height - 50,
        size: LABEL_FONT_SIZE,
        font: helveticaNormal,
        color: rgb(1, 1, 1),
      });

      let leftY = height - 80;
      let rightY = height - 80;

      const drawSection = (title: string, column: "left" | "right") => {
        const x =
          column === "left" ? MARGIN : MARGIN + COLUMN_WIDTH + COLUMN_GAP;
        let y = column === "left" ? leftY : rightY;

        y -= SECTION_SPACING;

        page.drawText(title, {
          x,
          y,
          size: HEADER_FONT_SIZE,
          font: helveticaBold,
          color: rgb(0.1, 0.1, 0.1),
        });

        page.drawLine({
          start: { x, y: y - 2 },
          end: { x: x + COLUMN_WIDTH, y: y - 2 },
          thickness: 1,
          color: rgb(0.2, 0.4, 0.6),
        });

        y -= LINE_HEIGHT;
        if (column === "left") leftY = y;
        else rightY = y;
      };

      // Utility to capitalize the first letter
      const capitalizeFirst = (str: string) =>
        str.length > 0 ? str.charAt(0).toUpperCase() + str.slice(1) : str;

      const drawField = (
        label: string,
        value: any,
        column: "left" | "right"
      ) => {
        if (value === undefined || value === null) return;

        const x =
          column === "left" ? MARGIN : MARGIN + COLUMN_WIDTH + COLUMN_GAP;
        let y = column === "left" ? leftY : rightY;

        let display = value;
        let color = rgb(0, 0, 0);
        let font = helveticaNormal;

        // Convert snake_case to Title Case for specific fields
        if (
          typeof value === "string" &&
          (label === "Type" ||
            label === "Ceremony Type" ||
            label === "Event Type")
        ) {
          display = value
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());
        }

        // Capitalize first letter for all string fields except email
        if (typeof display === "string" && label.toLowerCase() !== "email") {
          display = capitalizeFirst(display);
        }

        if (typeof value === "boolean") {
          display = value ? "Yes" : "No";
          color = value ? rgb(0.1, 0.5, 0.1) : rgb(0.8, 0.2, 0.2);
          font = helveticaBold;
        } else if (typeof value === "number" && label.includes("Premium")) {
          display = `$${value.toFixed(2)}`;
        } else if (label.includes("Date") && value instanceof Date) {
          display = value.toLocaleDateString();
        }

        // Draw the label
        page.drawText(`${label}:`, {
          x,
          y,
          size: LABEL_FONT_SIZE,
          font: helveticaBold,
          color: rgb(0.25, 0.25, 0.25),
        });

        // Word wrap for value
        const valueX = x + 100;
        const maxValueWidth = COLUMN_WIDTH - 110; // leave space for label and some padding
        const valueText = `${display}`;
        const words = valueText.split(" ");
        let line = "";
        let lines: string[] = [];
        for (let i = 0; i < words.length; i++) {
          const testLine = line ? line + " " + words[i] : words[i];
          const testWidth = font.widthOfTextAtSize(testLine, VALUE_FONT_SIZE);
          if (testWidth > maxValueWidth && line) {
            lines.push(line);
            line = words[i];
          } else {
            line = testLine;
          }
        }
        if (line) lines.push(line);

        // Draw each line of the value, wrapping as needed
        let valueY = y;
        for (let i = 0; i < lines.length; i++) {
          page.drawText(lines[i], {
            x: valueX,
            y: valueY,
            size: VALUE_FONT_SIZE,
            font,
            color,
            maxWidth: maxValueWidth,
          });
          valueY -= LINE_HEIGHT * 0.9; // slightly less than full line height for compactness
        }

        // Move y down by the number of lines
        y -= LINE_HEIGHT * lines.length;
        if (column === "left") leftY = y;
        else rightY = y;
      };

      drawSection("Policy Info", "left");
      drawField("Policy", policyData.policy?.policyNumber, "left");
      drawField("Status", policyData.policy?.status, "left");
      drawField("PDF URL", policyData.policy?.pdfUrl, "left");

      if (policyData.event) {
        drawSection("Event Info", "left");
        drawField("Event Type", policyData.event.eventType, "left");
        let formattedEventDate = policyData.event.eventDate;
        const dateObj = new Date(formattedEventDate);
        if (!isNaN(dateObj.getTime()))
          formattedEventDate = dateObj.toDateString();
        drawField("Event Date", formattedEventDate, "left");
        drawField("Max Guests", policyData.event.maxGuests, "left");
        drawField(
          "Honoree 1",
          `${policyData.event.honoree1FirstName || ""} ${
            policyData.event.honoree1LastName || ""
          }`.trim(),
          "left"
        );
        if (
          policyData.event.honoree2FirstName ||
          policyData.event.honoree2LastName
        ) {
          drawField(
            "Honoree 2",
            `${policyData.event.honoree2FirstName || ""} ${
              policyData.event.honoree2LastName || ""
            }`.trim(),
            "left"
          );
        }
      }

      if (policyData.venue) {
        drawSection("Venue Info", "left");
        drawField("Name", policyData.venue.name, "left");
        drawField(
          "Address",
          `${policyData.venue.address1 || ""}${
            policyData.venue.address2 ? ", " + policyData.venue.address2 : ""
          }`,
          "left"
        );

        // Only show location fields if not a cruise ship
        if (policyData.venue.ceremonyLocationType !== "cruise_ship") {
          drawField(
            "Location",
            `${policyData.venue.city || ""}, ${policyData.venue.state || ""} ${
              policyData.venue.zip || ""
            }`,
            "left"
          );
          drawField("Country", policyData.venue.country, "left");
        }

        drawField("Type", policyData.venue.locationType, "left");
        drawField(
          "Ceremony Type",
          policyData.venue.ceremonyLocationType,
          "left"
        );
        drawField("Setting", policyData.venue.indoorOutdoor, "left");
        drawField("As Insured", policyData.venue.venueAsInsured, "left");
      }

      // Additional venues for weddings
      if (policyData.event?.eventType === "wedding") {
        // Reception Venue
        if (policyData.venue?.receptionVenueName) {
          drawSection("Reception Venue", "left");
          drawField("Name", policyData.venue.receptionVenueName, "left");
          drawField(
            "Address",
            `${policyData.venue.receptionVenueAddress1 || ""}${
              policyData.venue.receptionVenueAddress2
                ? ", " + policyData.venue.receptionVenueAddress2
                : ""
            }`,
            "left"
          );

          if (policyData.venue.receptionLocationType !== "cruise_ship") {
            drawField(
              "Location",
              `${policyData.venue.receptionVenueCity || ""}, ${
                policyData.venue.receptionVenueState || ""
              } ${policyData.venue.receptionVenueZip || ""}`,
              "left"
            );
            drawField(
              "Country",
              policyData.venue.receptionVenueCountry,
              "left"
            );
          }

          drawField("Type", policyData.venue.receptionLocationType, "left");
          drawField("Setting", policyData.venue.receptionIndoorOutdoor, "left");
          drawField(
            "As Insured",
            policyData.venue.receptionVenueAsInsured,
            "left"
          );
        }

        // Brunch Venue
        if (policyData.venue?.brunchVenueName) {
          drawSection("Brunch Venue", "left");
          drawField("Name", policyData.venue.brunchVenueName, "left");
          drawField(
            "Address",
            `${policyData.venue.brunchVenueAddress1 || ""}${
              policyData.venue.brunchVenueAddress2
                ? ", " + policyData.venue.brunchVenueAddress2
                : ""
            }`,
            "left"
          );

          if (policyData.venue.brunchLocationType !== "cruise_ship") {
            drawField(
              "Location",
              `${policyData.venue.brunchVenueCity || ""}, ${
                policyData.venue.brunchVenueState || ""
              } ${policyData.venue.brunchVenueZip || ""}`,
              "left"
            );
            drawField("Country", policyData.venue.brunchVenueCountry, "left");
          }

          drawField("Type", policyData.venue.brunchLocationType, "left");
          drawField("Setting", policyData.venue.brunchIndoorOutdoor, "left");
          drawField(
            "As Insured",
            policyData.venue.brunchVenueAsInsured,
            "left"
          );
        }

        // Rehearsal Venue
        if (policyData.venue?.rehearsalVenueName) {
          drawSection("Rehearsal Venue", "right");
          drawField("Name", policyData.venue.rehearsalVenueName, "right");
          drawField(
            "Address",
            `${policyData.venue.rehearsalVenueAddress1 || ""}${
              policyData.venue.rehearsalVenueAddress2
                ? ", " + policyData.venue.rehearsalVenueAddress2
                : ""
            }`,
            "right"
          );

          if (policyData.venue.rehearsalLocationType !== "cruise_ship") {
            drawField(
              "Location",
              `${policyData.venue.rehearsalVenueCity || ""}, ${
                policyData.venue.rehearsalVenueState || ""
              } ${policyData.venue.rehearsalVenueZip || ""}`,
              "right"
            );
            drawField(
              "Country",
              policyData.venue.rehearsalVenueCountry,
              "right"
            );
          }

          drawField("Type", policyData.venue.rehearsalLocationType, "right");
          drawField(
            "Setting",
            policyData.venue.rehearsalIndoorOutdoor,
            "right"
          );
          drawField(
            "As Insured",
            policyData.venue.rehearsalVenueAsInsured,
            "right"
          );
        }

        // Rehearsal Dinner Venue
        if (policyData.venue?.rehearsalDinnerVenueName) {
          drawSection("Rehearsal Dinner Venue", "right");
          drawField("Name", policyData.venue.rehearsalDinnerVenueName, "right");
          drawField(
            "Address",
            `${policyData.venue.rehearsalDinnerVenueAddress1 || ""}${
              policyData.venue.rehearsalDinnerVenueAddress2
                ? ", " + policyData.venue.rehearsalDinnerVenueAddress2
                : ""
            }`,
            "right"
          );

          if (policyData.venue.rehearsalDinnerLocationType !== "cruise_ship") {
            drawField(
              "Location",
              `${policyData.venue.rehearsalDinnerVenueCity || ""}, ${
                policyData.venue.rehearsalDinnerVenueState || ""
              } ${policyData.venue.rehearsalDinnerVenueZip || ""}`,
              "right"
            );
            drawField(
              "Country",
              policyData.venue.rehearsalDinnerVenueCountry,
              "right"
            );
          }

          drawField(
            "Type",
            policyData.venue.rehearsalDinnerLocationType,
            "right"
          );
          drawField(
            "Setting",
            policyData.venue.rehearsalDinnerIndoorOutdoor,
            "right"
          );
          drawField(
            "As Insured",
            policyData.venue.rehearsalDinnerVenueAsInsured,
            "right"
          );
        }
      }

      if (policyData.policyHolder) {
        drawSection("Policy Holder", "right");
        drawField(
          "Name",
          `${policyData.policyHolder.firstName || ""} ${
            policyData.policyHolder.lastName || ""
          }`.trim(),
          "right"
        );
        drawField("Email", policyData.policyHolder.email, "right");
        drawField("Phone", policyData.policyHolder.phone, "right");
        drawField(
          "Relationship",
          policyData.policyHolder.relationship,
          "right"
        );
        drawField("Address", policyData.policyHolder.address, "right");
        drawField(
          "Location",
          `${policyData.policyHolder.city || ""}, ${
            policyData.policyHolder.state || ""
          } ${policyData.policyHolder.zip || ""}`,
          "right"
        );
        drawField("Country", policyData.policyHolder.country, "right");
        drawField(
          "Legal Notices",
          policyData.policyHolder.legalNotices,
          "right"
        );
        drawField(
          "Form Completed By",
          policyData.policyHolder.completingFormName,
          "right"
        );
        drawField(
          "Referral Source",
          policyData.policyHolder.hearAboutUs,
          "right"
        );
      }

      if (policyData.quote) {
        drawSection("Quote Info", "right");
        drawField("Quote Number", policyData.quote.quoteNumber, "right");
        drawField("Email", policyData.quote.email, "right");
        drawField("State", policyData.quote.residentState, "right");
        drawField("Coverage", policyData.quote.coverageLevel, "right");
        drawField("Liability", policyData.quote.liabilityCoverage, "right");
        drawField(
          "Liquor Liability",
          policyData.quote.liquorLiability,
          "right"
        );
        drawField(
          "COVID Disclosure",
          policyData.quote.covidDisclosure,
          "right"
        );
        drawField(
          "Special Activities",
          policyData.quote.specialActivities,
          "right"
        );
        drawField("Total Premium", policyData.quote.totalPremium, "right");
        drawField("Base Premium", policyData.quote.basePremium, "right");
        drawField(
          "Liability Premium",
          policyData.quote.liabilityPremium,
          "right"
        );
        drawField(
          "Liquor Premium",
          policyData.quote.liquorLiabilityPremium,
          "right"
        );
        drawField("Status", policyData.quote.status, "right");
      }

      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      console.error("Error generating version PDF:", error);
      throw new Error("Failed to generate version PDF");
    }
  }
}
