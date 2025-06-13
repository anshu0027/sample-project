import path from "path";
import fs from "fs/promises";
import { PDFDocument } from "pdf-lib";
import { jsPDF } from "jspdf";

// ------------------------
// Cache for base PDF
// Stores the bytes of the base PDF file to avoid reading it from disk multiple times.
// ------------------------
let basePdfBytesCache: Uint8Array | null = null;
const basePdfPath = path.join(process.cwd(), "public", "base.pdf");
// ------------------------
// Cache for logo image
// Stores the base64 encoded logo image to avoid reading and converting it multiple times.
// ------------------------
let logoImageDataBase64Cache: string | null = null;
const logoImagePath = path.join(process.cwd(), "public", "logo.png");

// ------------------------
// IMPORTANT: Create a 'public' folder in the root of 'my-backend'
// and place your 'base.pdf' and 'logo.png' files inside it.
// ------------------------

// ------------------------
// Asynchronously reads the base PDF file from the specified path.
// Uses a cache to avoid redundant file reads.
// Throws an error if the file is not found or not accessible.
//
// Returns:
// - A Promise that resolves to a Uint8Array containing the base PDF bytes.
// ------------------------
async function getBasePdfBytes(): Promise<Uint8Array> {
  if (basePdfBytesCache) {
    return basePdfBytesCache;
  }
  try {
    basePdfBytesCache = await fs.readFile(basePdfPath);
    return basePdfBytesCache;
  } catch (error) {
    console.error(
      "Base PDF file not found or not accessible:",
      basePdfPath,
      error
    );
    throw new Error("Base PDF not found or not accessible.");
  }
}

// ------------------------
// Asynchronously reads the logo image file from the specified path and converts it to a base64 data URL.
// Uses a cache to avoid redundant file reads and conversions.
// Throws an error if the file is not found or not accessible.
//
// Returns:
// - A Promise that resolves to a string containing the base64 encoded logo image data URL.
// ------------------------
async function getLogoImageData(): Promise<string> {
  if (logoImageDataBase64Cache) {
    return logoImageDataBase64Cache;
  }
  try {
    const imageBytes = await fs.readFile(logoImagePath);
    logoImageDataBase64Cache = `data:image/png;base64,${imageBytes.toString(
      "base64"
    )}`;
    return logoImageDataBase64Cache;
  } catch (error) {
    console.error(
      "Logo image file not found or not accessible:",
      logoImagePath,
      error
    );
    throw new Error("Logo image not found or not accessible.");
  }
}

// ------------------------
// Define coverage details based on levels
// A constant object mapping coverage level strings (e.g., "Level 1") to an array of coverage details.
// Each detail is an array: [Coverage Name, Limit, Premium].
// ------------------------
const COVERAGE_LEVEL_DETAILS: {
  [key: string]: Array<[string, string, string]>;
} = {
  "Level 1": [
    ["Cancellation/postponement", "$7,500", "$160"],
    ["Additional Expense", "$1,500", "$0"],
    ["Event Photographs/Video", "$1,500", "$0"],
    ["Event Gifts", "$1,000", "$0"],
    ["Special Attire", "$1,500", "$0"],
    ["Special Jewelry", "$1,000", "$0"],
    ["Lost Deposit", "$1,000", "$0"],
  ],
  "Level 2": [
    ["Cancellation/postponement", "$15,000", "$210"],
    ["Additional Expense", "$3,000", "$0"],
    ["Event Photographs/Video", "$2,000", "$0"],
    ["Event Gifts", "$1,500", "$0"],
    ["Special Attire", "$2,000", "$0"],
    ["Special Jewelry", "$1,500", "$0"],
    ["Lost Deposit", "$1,500", "$0"],
  ],
  "Level 3": [
    ["Cancellation/postponement", "$25,000", "$255"],
    ["Additional Expense", "$5,000", "$0"],
    ["Event Photographs/Video", "$2,500", "$0"],
    ["Event Gifts", "$2,000", "$0"],
    ["Special Attire", "$2,500", "$0"],
    ["Special Jewelry", "$2,000", "$0"],
    ["Lost Deposit", "$2,000", "$0"],
  ],
  "Level 4": [
    ["Cancellation/postponement", "$35,000", "$300"],
    ["Additional Expense", "$7,000", "$0"],
    ["Event Photographs/Video", "$3,000", "$0"],
    ["Event Gifts", "$2,500", "$0"],
    ["Special Attire", "$3,000", "$0"],
    ["Special Jewelry", "$2,500", "$0"],
    ["Lost Deposit", "$2,500", "$0"],
  ],
  "Level 5": [
    ["Cancellation/postponement", "$50,000", "$355"],
    ["Additional Expense", "$10,000", "$0"],
    ["Event Photographs/Video", "$3,500", "$0"],
    ["Event Gifts", "$3,000", "$0"],
    ["Special Attire", "$3,500", "$0"],
    ["Special Jewelry", "$3,000", "$0"],
    ["Lost Deposit", "$3,000", "$0"],
  ],
  "Level 6": [
    ["Cancellation/postponement", "$75,000", "$500"],
    ["Additional Expense", "$15,000", "$0"],
    ["Event Photographs/Video", "$4,500", "$0"],
    ["Event Gifts", "$4,000", "$0"],
    ["Special Attire", "$4,500", "$0"],
    ["Special Jewelry", "$4,000", "$0"],
    ["Lost Deposit", "$4,000", "$0"],
  ],
  "Level 7": [
    ["Cancellation/postponement", "$100,000", "$615"],
    ["Additional Expense", "$20,000", "$0"],
    ["Event Photographs/Video", "$6,000", "$0"],
    ["Event Gifts", "$5,500", "$0"],
    ["Special Attire", "$6,000", "$0"],
    ["Special Jewelry", "$5,500", "$0"],
    ["Lost Deposit", "$5,500", "$0"],
  ],
  "Level 8": [
    ["Cancellation/postponement", "$125,000", "$735"],
    ["Additional Expense", "$25,000", "$0"],
    ["Event Photographs/Video", "$7,500", "$0"],
    ["Event Gifts", "$7,000", "$0"],
    ["Special Attire", "$7,500", "$0"],
    ["Special Jewelry", "$7,000", "$0"],
    ["Lost Deposit", "$7,000", "$0"],
  ],
  "Level 9": [
    ["Cancellation/postponement", "$150,000", "$870"],
    ["Additional Expense", "$30,000", "$0"],
    ["Event Photographs/Video", "$9,000", "$0"],
    ["Event Gifts", "$8,500", "$0"],
    ["Special Attire", "$9,000", "$0"],
    ["Special Jewelry", "$8,500", "$0"],
    ["Lost Deposit", "$8,500", "$0"],
  ],
  "Level 10": [
    ["Cancellation/postponement", "$175,000", "$1025"],
    ["Additional Expense", "$35,000", "$0"],
    ["Event Photographs/Video", "$10,500", "$0"],
    ["Event Gifts", "$10,000", "$0"],
    ["Special Attire", "$10,500", "$0"],
    ["Special Jewelry", "$10,000", "$0"],
    ["Lost Deposit", "$10,000", "$0"],
  ],
  Default: [
    ["Cancellation/postponement", "$25,000", "$400"],
    ["Additional Expense", "$5,000", "$50"],
    ["Event Photography/Video", "$5,000", "$50"],
    ["Event Gifts", "$5,000", "$100"],
    ["Special Attire", "$10,000", "$50"],
    ["Special Jewelry", "$25,000", "$150"],
    ["Lost Deposit", "$5,000", "$100"],
  ],
};

// ------------------------
// Helper function to get guest range string from maxGuests integer value
// Converts a numerical maximum guest count into a predefined string range (e.g., "1-50").
//
// Parameters:
// - maxGuestsValue: The maximum number of guests as a number, or null/undefined.
// ------------------------
function getGuestRangeStringFromMaxValue(
  maxGuestsValue: number | null | undefined
): string {
  if (maxGuestsValue === undefined || maxGuestsValue === null) return "N/A";

  if (maxGuestsValue <= 50) return "1-50";
  if (maxGuestsValue <= 100) return "51-100";
  if (maxGuestsValue <= 150) return "101-150";
  if (maxGuestsValue <= 200) return "151-200";
  if (maxGuestsValue <= 250) return "201-250";
  if (maxGuestsValue <= 300) return "251-300";
  if (maxGuestsValue <= 350) return "301-350";
  if (maxGuestsValue <= 400) return "351-400";
  return String(maxGuestsValue);
}

// ------------------------
// --- PDF GENERATION LOGIC ---
// ------------------------

// ------------------------
// Generates the first page of the insurance declaration PDF (Declaration Page).
// This function uses jsPDF to construct the page layout, add text, shapes, and images.
//
// Parameters:
// - quoteData: An object containing all necessary data for the PDF, including policy holder,
//              event details, coverage levels, and premiums.
//
// Returns:
// - A Promise that resolves to a Uint8Array containing the bytes of the generated PDF page.
// ------------------------
async function generateInsuranceDeclarationPDFBuffer(
  quoteData: any
): Promise<Uint8Array> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let logoImageData: string;
  try {
    logoImageData = await getLogoImageData();
  } catch (error) {
    console.warn(
      "Logo image not found, falling back to drawn logo or erroring. Error:",
      (error as Error).message
    );
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(2);
    doc.circle(30, 25, 12);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("W&F", 30, 22, { align: "center" });
    doc.text("ROYCE", 30, 28, { align: "center" });
  }

  // ------------------------
  // Add logo to the PDF if available.
  // ------------------------
  if (logoImageData!) {
    const logoWidth = 24;
    const logoHeight = 24;
    doc.addImage(logoImageData, "PNG", 18, 13, logoWidth, logoHeight);
  }

  // Main Title
  // ------------------------
  // Add main title and "Declaration" subtitle.
  // ------------------------
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  const titleText = "Special Event Insurance";
  const titleWidth = doc.getTextWidth(titleText);
  const titleX = (pageWidth - titleWidth) / 2;
  const titleY = 20;
  doc.text(titleText, titleX, titleY);

  // ------------------------
  // Underline for "Special Event Insurance"
  // ------------------------
  const underlineY = titleY + 2;
  doc.setLineWidth(0.5);
  doc.line(titleX, underlineY, titleX + titleWidth, underlineY);

  doc.text("Declaration", pageWidth / 2, 30, { align: "center" });

  // ------------------------
  // Named Insured & Agent Information boxes
  // ------------------------
  let yPos = 45;

  // ------------------------
  // Named Insured box
  // ------------------------
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(15, yPos, 85, 25);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Named Insured & Address", 17, yPos + 5);

  // ------------------------
  // Yellow highlight for insured info
  // ------------------------
  doc.setFillColor(255, 255, 255);
  doc.rect(17, yPos + 7, 81, 15, "F");
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(
    (quoteData.policyHolder?.firstName || "") +
      " " +
      (quoteData.policyHolder?.lastName || "") || "N/A",
    19,
    yPos + 12
  );
  doc.setFont("helvetica", "normal");
  doc.text(quoteData.policyHolder?.address || "N/A", 19, yPos + 16);
  doc.text(
    (quoteData.policyHolder?.city || "N/A") +
      ", " +
      (quoteData.policyHolder?.state || "N/A") +
      " " +
      (quoteData.policyHolder?.zip || "N/A"),
    19,
    yPos + 20
  );

  // ------------------------
  // Agent Information box
  // ------------------------
  doc.setDrawColor(0, 0, 0);
  doc.rect(105, yPos, 85, 25);
  doc.setFont("helvetica", "bold");
  doc.text("Agent Information", 107, yPos + 5);

  // ------------------------
  // Yellow highlight for agent info
  // ------------------------
  doc.setFillColor(255, 255, 255);
  doc.rect(107, yPos + 7, 81, 15, "F");
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("Aura Risk Management", 109, yPos + 12);
  doc.setFont("helvetica", "normal");
  doc.text("904 W. Chapman Ave.", 109, yPos + 16);
  doc.text("Orange, CA 94025", 109, yPos + 20);

  yPos += 35;

  // ------------------------
  // Policy Information Header
  // ------------------------
  doc.setFillColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.rect(15, yPos, pageWidth - 30, 8, "F");
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  const policyInfoHeaderText = "POLICY INFORMATION";
  doc.text(policyInfoHeaderText, 17, yPos + 5);

  // ------------------------
  // Underline for "POLICY INFORMATION" header
  // ------------------------
  const policyInfoUnderlineY = yPos + 5 + 2;
  doc.setLineWidth(1.0);
  doc.setDrawColor(39, 108, 140);
  doc.line(15, policyInfoUnderlineY, pageWidth - 15, policyInfoUnderlineY);

  yPos += 8;

  // ------------------------
  // Policy Information Content
  // ------------------------
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("Policy Number:", 17, yPos + 8);

  doc.setFillColor(255, 255, 255);
  doc.rect(52, yPos + 5, 55, 5, "F");
  doc.setTextColor(0, 0, 0);
  doc.text(quoteData.policy?.policyNumber || "99/99/9999", 54, yPos + 8);

  doc.text("Policy Period:", 120, yPos + 8);

  doc.text("Issue Date:", 120, yPos + 14);
  doc.setFillColor(255, 255, 255);
  doc.rect(145, yPos + 11, 25, 5, "F");
  doc.text(
    quoteData.createdAt
      ? new Date(quoteData.createdAt).toLocaleDateString()
      : new Date().toLocaleDateString(),
    147,
    yPos + 14
  );

  doc.text("Event Date:", 120, yPos + 20);
  doc.setFillColor(255, 255, 255);
  doc.rect(145, yPos + 17, 25, 5, "F");
  doc.text(
    quoteData.event?.eventDate
      ? new Date(quoteData.event.eventDate).toLocaleDateString()
      : quoteData.quote?.event?.eventDate
      ? new Date(quoteData.quote.event.eventDate).toLocaleDateString()
      : "N/A",
    147,
    yPos + 20
  );

  doc.setTextColor(0, 0, 0);
  doc.text("Insurance Company:", 17, yPos + 26);
  doc.setFont("helvetica", "normal");
  doc.text("Certain Underwriters At Lloyd's", 17, yPos + 30);

  doc.setFont("helvetica", "bold");
  doc.text("Customer Service: 1-888-888-0888", 120, yPos + 26);
  doc.text("Claims Service: 1-888-888-0889", 120, yPos + 30);

  // ------------------------
  // Total Premium
  // ------------------------
  doc.setDrawColor(0, 0, 0);
  doc.setFontSize(12);
  const totalPremiumText = `Total Policy Premium: $${
    quoteData.totalPremium?.toFixed(2) || "0.00"
  } (EXCLUDING ANY FEES OR TAXES)`;
  const totalPremiumTextWidth = doc.getTextWidth(totalPremiumText);
  const totalPremiumTextX = (pageWidth - totalPremiumTextWidth) / 2;
  const totalPremiumTextY = yPos + 40;
  doc.text(totalPremiumText, totalPremiumTextX, totalPremiumTextY);

  // ------------------------
  // Underline for "Total Policy Premium"
  // ------------------------
  const totalPremiumUnderlineY = totalPremiumTextY + 2;
  doc.setLineWidth(0.5);
  doc.line(
    totalPremiumTextX,
    totalPremiumUnderlineY,
    totalPremiumTextX + totalPremiumTextWidth,
    totalPremiumUnderlineY
  );

  yPos += 49;

  // ------------------------
  // Policy Limits of Liability Header
  // ------------------------
  doc.setFillColor(255, 255, 255);
  doc.rect(15, yPos, pageWidth - 30, 8, "F");
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("POLICY LIMITS OF LIABILITY", 17, yPos + 5);

  const policyLimitsUnderlineY = yPos + 5 + 2;
  doc.setDrawColor(39, 108, 140);
  doc.setLineWidth(1.0);
  doc.line(15, policyLimitsUnderlineY, pageWidth - 15, policyLimitsUnderlineY);
  doc.setLineWidth(0.5);

  yPos += 10;

  // ------------------------
  // Table headers
  // ------------------------
  doc.setDrawColor(128, 128, 128);
  doc.rect(15, yPos, pageWidth - 30, 6);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("EVENT CANCELLATION COVERAGE", 17, yPos + 4);
  doc.text("LIMITS OF LIABILITY", 120, yPos + 4, { align: "center" });
  doc.text("PREMIUM", 170, yPos + 4, { align: "center" });
  yPos += 6;

  // ------------------------
  // Get coverage level and table data
  // ------------------------
  const coverageLevelInt = quoteData.coverageLevel;
  let coverageLevelStringKey = null;

  if (typeof coverageLevelInt === "number" && coverageLevelInt > 0) {
    coverageLevelStringKey = `Level ${coverageLevelInt}`;
  }

  const currentCoverageLevel =
    coverageLevelStringKey && COVERAGE_LEVEL_DETAILS[coverageLevelStringKey]
      ? coverageLevelStringKey
      : "Default";
  let tableDataForLevel =
    COVERAGE_LEVEL_DETAILS[currentCoverageLevel] ||
    COVERAGE_LEVEL_DETAILS["Default"];

  // ------------------------
  // Calculate total premium for this section
  // ------------------------
  let eventCoveragePremium = 0;
  tableDataForLevel.forEach((row) => {
    const premiumValue = parseFloat(row[2].replace("$", ""));
    if (!isNaN(premiumValue)) {
      eventCoveragePremium += premiumValue;
    }
  });

  const finalTableData = [
    ...tableDataForLevel,
    ["Event Coverage Premium", "", `$${eventCoveragePremium.toFixed(2)}`],
  ];

  // ------------------------
  // Draw table rows
  // ------------------------
  finalTableData.forEach((row, index) => {
    doc.setDrawColor(128, 128, 128);
    doc.rect(15, yPos, pageWidth - 30, 6);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(row[0], 17, yPos + 4);

    if (row[1]) {
      doc.setFillColor(255, 255, 255);
      doc.rect(110, yPos + 1, 30, 4, "F");
      doc.text(row[1], 125, yPos + 4, { align: "center" });
    }

    doc.setFillColor(255, 255, 255);
    doc.rect(160, yPos + 1, 30, 4, "F");
    doc.setFont(
      "helvetica",
      index === finalTableData.length - 1 ? "bold" : "normal"
    );
    doc.text(row[2], 175, yPos + 4, { align: "center" });

    yPos += 6;
  });

  yPos += 7;

  // ------------------------
  // Optional Endorsements Header
  // ------------------------
  doc.setFillColor(255, 255, 255);
  doc.rect(15, yPos, pageWidth - 30, 8, "F");
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("OPTIONAL ENDORSEMENTS & COVERAGES", 17, yPos + 5);

  const endorsementsHeaderUnderlineY = yPos + 5 + 2;
  doc.setDrawColor(39, 108, 140);
  doc.setLineWidth(1.0);
  doc.line(
    15,
    endorsementsHeaderUnderlineY,
    pageWidth - 15,
    endorsementsHeaderUnderlineY
  );
  doc.setLineWidth(0.5);

  yPos += 10;

  // ------------------------
  // Endorsements table headers
  // ------------------------
  doc.setDrawColor(128, 128, 128);
  doc.rect(15, yPos, pageWidth - 30, 6);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("ENDORSEMENTS", 17, yPos + 4);
  doc.text("LIMITS OF LIABILITY", 120, yPos + 4, { align: "center" });
  doc.text("PREMIUM", 170, yPos + 4, { align: "center" });
  yPos += 6;

  // ------------------------
  // Endorsements content
  // ------------------------
  doc.setDrawColor(128, 128, 128);
  doc.rect(15, yPos, pageWidth - 30, 27);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("Special Event Liability: Effective 12:01 AM", 17, yPos + 4);
  doc.setFont("helvetica", "normal");
  const eventDate = quoteData.event?.eventDate
    ? new Date(quoteData.event.eventDate).toLocaleDateString()
    : "N/A";
  doc.text(`standard time on the Event Date: ${eventDate}`, 17, yPos + 8);

  let eventEndDateString = "N/A";
  if (quoteData.event?.eventDate) {
    const eventStartDate = new Date(quoteData.event.eventDate);
    const eventEndDate = new Date(eventStartDate);
    eventEndDate.setDate(eventStartDate.getDate() + 2);
    eventEndDateString = eventEndDate.toLocaleDateString();
  }
  doc.text(
    `until 2:00 AM standard time on ${eventEndDateString}`,
    17,
    yPos + 12
  );
  doc.setFont("helvetica", "bold");
  doc.text("Property Damage Liability Sublimit", 17, yPos + 16);
  doc.text("Liquor Liability Coverage", 17, yPos + 20);
  doc.text("Number of Guest", 17, yPos + 24);

  // ------------------------
  // Liability limits
  // ------------------------
  const liabilityData = [
    "$1M per Occurrence",
    "$1M General Aggregate",
    "",
    `$${quoteData.liabilityPremium?.toFixed(2) || "0.00"}`,
    `$${quoteData.liquorLiabilityPremium?.toFixed(2) || "0.00"}`,
    `${getGuestRangeStringFromMaxValue(quoteData.event?.maxGuests)}`,
  ];

  liabilityData.forEach((item, index) => {
    doc.setFillColor(255, 255, 255);
    doc.rect(110, yPos + index * 4 + 1, 30, 4, "F");
    doc.setTextColor(0, 0, 0);
    doc.text(item, 125, yPos + index * 4 + 4, { align: "center" });
  });

  // ------------------------
  // Calculate and display premium for endorsements
  // ------------------------
  const endorsementsPremium =
    (quoteData.liabilityPremium || 0) + (quoteData.liquorLiabilityPremium || 0);

  doc.setFillColor(255, 255, 255);
  doc.rect(160, yPos + 10, 30, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.text(`$${endorsementsPremium.toFixed(2)}`, 175, yPos + 13, {
    align: "center",
  });

  yPos += 32;

  // ------------------------
  // Coverages Header
  // ------------------------
  doc.setFillColor(255, 255, 255);
  doc.rect(15, yPos, pageWidth - 30, 8, "F");
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("COVERAGES", 17, yPos + 5);

  yPos += 8;

  // ------------------------
  // Extended Territory row
  // ------------------------
  doc.setDrawColor(128, 128, 128);
  doc.rect(15, yPos, pageWidth - 30, 6);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("Extended Territory", 17, yPos + 4);
  doc.setFont("helvetica", "normal");
  doc.text("Not Applicable", 125, yPos + 4, { align: "center" });
  doc.text("Included", 175, yPos + 4, { align: "center" });

  // ------------------------
  // Footer
  // ------------------------
  const pageHeight = doc.internal.pageSize.getHeight(); // Get page height for footer positioning
  doc.setDrawColor(128, 128, 128);
  doc.setLineWidth(0.5);
  doc.line(15, pageHeight - 14, pageWidth - 15, pageHeight - 14);

  doc.setTextColor(128, 128, 128);
  doc.setFontSize(8);
  doc.text("AU -DEC (08-24)", 15, pageHeight - 10);
  doc.text("1", pageWidth - 15, pageHeight - 10, { align: "right" });

  return new Uint8Array(doc.output("arraybuffer") as ArrayBuffer);
}

// ------------------------
// Generates the second page of the insurance declaration PDF.
// This page includes policy forms, endorsements, event information, and additional insured details.
//
// Parameters:
// - quoteData: An object containing all necessary data for the PDF.
//
// Returns:
// - A Promise that resolves to a Uint8Array containing the bytes of the generated PDF page.
// ------------------------
async function generateInsuranceDeclarationPage2PDFBuffer(
  quoteData: any
): Promise<Uint8Array> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let logoImageData: string;
  try {
    logoImageData = await getLogoImageData();
  } catch (error) {
    console.warn(
      "Logo image not found for page 2, falling back to drawn logo or erroring. Error:",
      (error as Error).message
    );
    // Fallback for page 2 as well
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(2);
    doc.circle(30, 25, 12);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("W&F", 30, 22, { align: "center" });
    doc.text("ROYCE", 30, 28, { align: "center" });
  }

  // ------------------------
  // Add logo to page 2 if available.
  // ------------------------
  if (logoImageData!) {
    const logoWidth = 24;
    const logoHeight = 24;
    doc.addImage(logoImageData, "PNG", 18, 13, logoWidth, logoHeight);
  }

  let yPos = 50;

  // ------------------------
  // Policy Forms and Endorsements Header
  // ------------------------
  doc.setFillColor(255, 255, 255);
  doc.rect(15, yPos, pageWidth - 30, 8, "F");
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("POLICY FORMS AND ENDORSEMENTS", 17, yPos + 5);
  // Add underline for "POLICY FORMS AND ENDORSEMENTS"
  const formsHeaderUnderlineY = yPos + 5 + 2;
  doc.setDrawColor(39, 108, 140); // #276C8C
  doc.setLineWidth(1.0);
  doc.line(15, formsHeaderUnderlineY, pageWidth - 15, formsHeaderUnderlineY);
  doc.setLineWidth(0.5);

  yPos += 9;

  // ------------------------
  // Policy Forms and Endorsements Table
  // ------------------------
  const policyForms = [
    ["AU - 1 (08-24)", "Special Event Insurance"],
    ["AU - 200 (08-24)", "Special Event Liability"],
    ["AU - 200LL (08-24)", "Special Event Liquor Liability"],
    ["AU - 400FL (08-24)", "Special Event Liability FL Provision"],
    ["AU - 201 (08-24)", "Additional Insured"],
  ];

  policyForms.forEach((row) => {
    doc.setDrawColor(128, 128, 128);
    doc.rect(15, yPos, 60, 6);
    doc.rect(75, yPos, pageWidth - 90, 6);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(row[0], 17, yPos + 4);
    doc.setFont("helvetica", "normal");
    doc.text(row[1], 77, yPos + 4);
    yPos += 6;
  });

  yPos += 10;

  // ------------------------
  // Event Information Header
  // ------------------------
  doc.setFillColor(255, 255, 255);
  doc.rect(15, yPos, pageWidth - 30, 8, "F");
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("EVENT INFORMATION", 17, yPos + 5);
  // Add underline for "EVENT INFORMATION" (first occurrence)
  const eventInfoHeaderUnderlineY1 = yPos + 5 + 2;
  doc.setDrawColor(39, 108, 140); // #276C8C
  doc.setLineWidth(1.0);
  doc.line(
    15,
    eventInfoHeaderUnderlineY1,
    pageWidth - 15,
    eventInfoHeaderUnderlineY1
  );
  doc.setLineWidth(0.5);

  yPos += 9;

  // ------------------------
  // Event Information Table Headers
  // ------------------------
  doc.setDrawColor(128, 128, 128);
  doc.rect(15, yPos, (pageWidth - 30) / 2, 6);
  doc.rect(15 + (pageWidth - 30) / 2, yPos, (pageWidth - 30) / 2, 6);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("INSURED EVENT", 17, yPos + 4);
  doc.text("HONOREE(S)", 17 + (pageWidth - 30) / 2 + 2, yPos + 4);

  yPos += 6;

  // ------------------------
  // Event Information Table Content
  // ------------------------
  doc.setDrawColor(128, 128, 128);
  doc.rect(15, yPos, (pageWidth - 30) / 2, 6);
  doc.rect(15 + (pageWidth - 30) / 2, yPos, (pageWidth - 30) / 2, 6);

  // ------------------------
  // Yellow highlight for event and honorees
  // ------------------------
  doc.setFillColor(255, 255, 255);
  doc.rect(15 + 1, yPos + 1, (pageWidth - 30) / 2 - 2, 4, "F");
  doc.rect(
    15 + (pageWidth - 30) / 2 + 1,
    yPos + 1,
    (pageWidth - 30) / 2 - 2,
    4,
    "F"
  );

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(quoteData.event?.eventType || "N/A", 17, yPos + 4);
  doc.text(
    (quoteData.event?.honoree1FirstName || "") +
      " " +
      (quoteData.event?.honoree1LastName || "") +
      (quoteData.event?.honoree2FirstName
        ? " & " +
          quoteData.event?.honoree2FirstName +
          " " +
          quoteData.event?.honoree2LastName
        : ""),
    17 + (pageWidth - 30) / 2 + 2,
    yPos + 4
  );

  yPos += 15;

  // ------------------------
  // Event Location(s) Header
  // ------------------------
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("EVENT LOCATION(S)", 15, yPos);
  doc.setLineWidth(0.5);
  doc.line(15, yPos + 1, 60, yPos + 1);

  yPos += 5;

  // ------------------------
  // Event Location Table
  // ------------------------
  let venueCount = 1;

  // ------------------------
  // Main Ceremony Venue
  // ------------------------
  doc.setDrawColor(128, 128, 128);
  doc.rect(15, yPos, 10, 6);
  doc.rect(25, yPos, pageWidth - 40, 6);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(`${venueCount}.`, 17, yPos + 4);

  // ------------------------
  // Yellow highlight for venue
  // ------------------------
  doc.setFillColor(255, 255, 255);
  doc.rect(26, yPos + 1, pageWidth - 42, 4, "F");
  doc.setFont("helvetica", "normal");
  doc.text(
    (quoteData.event?.venue?.address1 || "N/A") +
      ", " +
      (quoteData.event?.venue?.city || "N/A") +
      ", " +
      (quoteData.event?.venue?.state || "N/A") +
      " " +
      (quoteData.event?.venue?.zip || "N/A"),
    27,
    yPos + 4
  );
  yPos += 6;

  yPos += 10;

  // ------------------------
  // Additional Insured(s) Header
  // ------------------------
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("ADDITIONAL INSURED(S)", 15, yPos);
  doc.setLineWidth(0.5);
  doc.line(15, yPos + 1, 70, yPos + 1);

  yPos += 5;

  // ------------------------
  // Additional Venues for Wedding Events
  // ------------------------
  const eventType =
    quoteData.event?.eventType ||
    quoteData.quote?.event?.eventType ||
    quoteData.policy?.event?.eventType;
  const venueData =
    quoteData.event?.venue ||
    quoteData.quote?.event?.venue ||
    quoteData.policy?.event?.venue;

  if (eventType && eventType.toLowerCase() === "wedding") {
    const additionalVenues = [
      { name: "Reception Venue", value: venueData?.receptionVenueName },
      { name: "Rehearsal Venue", value: venueData?.rehearsalVenueName },
      {
        name: "Rehearsal Dinner Venue",
        value: venueData?.rehearsalDinnerVenueName,
      },
      { name: "Brunch Venue", value: venueData?.brunchVenueName },
    ];

    for (const venue of additionalVenues) {
      if (venue.value) {
        doc.setDrawColor(128, 128, 128);
        doc.rect(15, yPos, 10, 6);
        doc.rect(25, yPos, pageWidth - 40, 6);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text(`${venueCount}.`, 17, yPos + 4);

        doc.setFillColor(255, 255, 255);
        doc.rect(26, yPos + 1, pageWidth - 42, 4, "F");
        doc.setFont("helvetica", "normal");
        doc.text(`${venue.name}: ${venue.value}`, 27, yPos + 4);
        yPos += 6;
        venueCount++;
      }
    }
  }

  // ------------------------
  // Fill remaining additional insured slots
  // ------------------------
  while (venueCount <= 4) {
    doc.setDrawColor(128, 128, 128);
    doc.rect(15, yPos, 10, 6);
    doc.rect(25, yPos, pageWidth - 40, 6);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(`${venueCount}.`, 17, yPos + 4);
    yPos += 6;
    venueCount++;
  }

  yPos += 10;

  // ------------------------
  // Event Information Header (second occurrence)
  // ------------------------
  doc.setFillColor(255, 255, 255);
  doc.rect(15, yPos, pageWidth - 30, 8, "F");
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("EVENT INFORMATION", 17, yPos + 5);
  // Add underline for "EVENT INFORMATION" (second occurrence)
  const eventInfoHeaderUnderlineY2 = yPos + 5 + 2;
  doc.setDrawColor(39, 108, 140); // #276C8C
  doc.setLineWidth(1.0);
  doc.line(
    15,
    eventInfoHeaderUnderlineY2,
    pageWidth - 15,
    eventInfoHeaderUnderlineY2
  );
  doc.setLineWidth(0.5);

  yPos += 9;

  // ------------------------
  // Event Information Fees Table
  // ------------------------
  const feeData = [
    ["Policy Fee", "$50.00"],
    ["Surplus Lines Taxes", "$48.00"],
    ["Stamping Fee", "$5.00"],
    ["Total Premium", `$${quoteData.totalPremium?.toFixed(2) || "0.00"}`],
  ];

  feeData.forEach((row, index) => {
    doc.setDrawColor(128, 128, 128);
    doc.rect(15, yPos, (pageWidth - 30) * 0.7, 6);
    doc.rect(15 + (pageWidth - 30) * 0.7, yPos, (pageWidth - 30) * 0.3, 6);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(row[0], 17, yPos + 4);

    // ------------------------
    // Yellow highlight for fee amounts
    // ------------------------
    doc.setFillColor(255, 255, 255);
    doc.rect(
      15 + (pageWidth - 30) * 0.7 + 1,
      yPos + 1,
      (pageWidth - 30) * 0.3 - 2,
      4,
      "F"
    );
    doc.text(
      row[1],
      15 + (pageWidth - 30) * 0.7 + (pageWidth - 30) * 0.3 - 5,
      yPos + 4,
      { align: "right" }
    );

    yPos += 6;
  });

  // ------------------------
  // Footer
  // ------------------------
  const pageHeight = doc.internal.pageSize.getHeight(); // Get page height for footer positioning
  // Line above footer text
  doc.setDrawColor(128, 128, 128);
  doc.setLineWidth(0.5);
  doc.line(15, pageHeight - 14, pageWidth - 15, pageHeight - 14); // Moved line up by 2 points

  doc.setTextColor(128, 128, 128);
  doc.setFontSize(8);
  doc.text("AU -DEC (08-24)", 15, pageHeight - 10);
  doc.text("2", pageWidth - 15, pageHeight - 10, { align: "right" });

  return new Uint8Array(doc.output("arraybuffer") as ArrayBuffer);
}

// ------------------------
// --- MAIN EXPORTED FUNCTION ---
// ------------------------

// ------------------------
// Generates a complete policy PDF by merging a base PDF with newly generated declaration pages.
//
// Parameters:
// - quoteData: An object containing all necessary data for the PDF generation,
//              passed to `generateInsuranceDeclarationPDFBuffer` and `generateInsuranceDeclarationPage2PDFBuffer`.
//
// Returns:
// - A Promise that resolves to a Buffer containing the bytes of the final merged PDF.
// ------------------------
export async function generatePolicyPdf(quoteData: any): Promise<Buffer> {
  const basePdfBytes = await getBasePdfBytes();
  const declarationPdfBytes = await generateInsuranceDeclarationPDFBuffer(
    quoteData
  );
  const page2PdfBytes = await generateInsuranceDeclarationPage2PDFBuffer(
    quoteData
  );

  const mergedPdf = await PDFDocument.create();

  // ------------------------
  // Load all PDF documents (declaration page 1, declaration page 2, and base PDF).
  // ------------------------
  const [declarationDoc, page2Doc, baseDoc] = await Promise.all([
    PDFDocument.load(declarationPdfBytes),
    PDFDocument.load(page2PdfBytes),
    PDFDocument.load(basePdfBytes),
  ]);

  const declarationPages = await mergedPdf.copyPages(
    declarationDoc,
    declarationDoc.getPageIndices()
  );
  // ------------------------
  // Add the first declaration page to the merged PDF.
  // ------------------------
  mergedPdf.addPage(declarationPages[0]);

  const page2Pages = await mergedPdf.copyPages(
    page2Doc,
    page2Doc.getPageIndices()
  );
  // ------------------------
  // Add the second declaration page to the merged PDF.
  // ------------------------
  mergedPdf.addPage(page2Pages[0]);

  const basePages = await mergedPdf.copyPages(
    baseDoc,
    baseDoc.getPageIndices()
  );
  // ------------------------
  // Add all pages from the base PDF to the merged PDF.
  // ------------------------
  for (const page of basePages) {
    mergedPdf.addPage(page);
  }

  const mergedPdfBytes = await mergedPdf.save();
  // ------------------------
  // Convert the final PDF bytes to a Buffer and return.
  // ------------------------
  return Buffer.from(mergedPdfBytes);
}
