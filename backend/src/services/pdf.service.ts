// my-backend/src/services/pdf.service.ts
import path from "path";
import fs from "fs/promises";
import { PDFDocument } from "pdf-lib";
import jsPDF from "jspdf";

// Cache for base PDF and logo
let basePdfBytesCache: Uint8Array | null = null;
const basePdfPath = path.join(process.cwd(), "public", "base.pdf");
let logoImageDataBase64Cache: string | null = null;
const logoImagePath = path.join(process.cwd(), "public", "logo.png");

// IMPORTANT: Create a 'public' folder in the root of 'my-backend'
// and place your 'base.pdf' and 'logo.png' files inside it.

async function getBasePdfBytes(): Promise<Uint8Array> {
  if (basePdfBytesCache) return basePdfBytesCache;
  try {
    basePdfBytesCache = await fs.readFile(basePdfPath);
    return basePdfBytesCache;
  } catch (error) {
    console.error("Base PDF file not found:", basePdfPath, error);
    throw new Error("Base PDF not found.");
  }
}

async function getLogoImageData(): Promise<string> {
  if (logoImageDataBase64Cache) return logoImageDataBase64Cache;
  try {
    const imageBytes = await fs.readFile(logoImagePath);
    logoImageDataBase64Cache = `data:image/png;base64,${imageBytes.toString("base64")}`;
    return logoImageDataBase64Cache;
  } catch (error) {
    console.error("Logo image file not found:", logoImagePath, error);
    throw new Error("Logo image not found.");
  }
}

const COVERAGE_LEVEL_DETAILS: { [key: string]: Array<[string, string, string]> } = {
  "Level 1": [["Cancellation/postponement", "$7,500", "$160"]],
  "Level 2": [["Cancellation/postponement", "$15,000", "$210"]],
  // ... (add all your other levels here)
  "Default": [["Cancellation/postponement", "$25,000", "$400"]],
};

function getGuestRangeStringFromMaxValue(maxGuestsValue: number | null | undefined): string {
  if (maxGuestsValue === undefined || maxGuestsValue === null) return "N/A";
  if (maxGuestsValue <= 50) return "1-50";
  // ... (add all your other ranges here)
  return String(maxGuestsValue);
}

// --- PDF GENERATION LOGIC ---

async function generateInsuranceDeclarationPDFBuffer(quoteData: any): Promise<Uint8Array> {
  const doc = new jsPDF();
  // ... (Paste the ENTIRE content of your generateInsuranceDeclarationPDFBuffer function here)
  // No changes are needed inside this function itself.
  doc.text("Hello from Page 1", 10, 10); // Placeholder
  return new Uint8Array(doc.output("arraybuffer") as ArrayBuffer);
}

async function generateInsuranceDeclarationPage2PDFBuffer(quoteData: any): Promise<Uint8Array> {
  const doc = new jsPDF();
  // ... (Paste the ENTIRE content of your generateInsuranceDeclarationPage2PDFBuffer function here)
  // No changes are needed inside this function itself.
  doc.text("Hello from Page 2", 10, 10); // Placeholder
  return new Uint8Array(doc.output("arraybuffer") as ArrayBuffer);
}


// --- MAIN EXPORTED FUNCTION ---

export async function generatePolicyPdf(quoteData: any): Promise<Buffer> {
  const basePdfBytes = await getBasePdfBytes();
  const declarationPdfBytes = await generateInsuranceDeclarationPDFBuffer(quoteData);
  const page2PdfBytes = await generateInsuranceDeclarationPage2PDFBuffer(quoteData);

  const mergedPdf = await PDFDocument.create();

  const [declarationDoc, page2Doc, baseDoc] = await Promise.all([
    PDFDocument.load(declarationPdfBytes),
    PDFDocument.load(page2PdfBytes),
    PDFDocument.load(basePdfBytes),
  ]);

  const declarationPages = await mergedPdf.copyPages(declarationDoc, declarationDoc.getPageIndices());
  mergedPdf.addPage(declarationPages[0]);

  const page2Pages = await mergedPdf.copyPages(page2Doc, page2Doc.getPageIndices());
  mergedPdf.addPage(page2Pages[0]);

  const basePages = await mergedPdf.copyPages(baseDoc, baseDoc.getPageIndices());
  for (const page of basePages) {
    mergedPdf.addPage(page);
  }

  const mergedPdfBytes = await mergedPdf.save();
  return Buffer.from(mergedPdfBytes);
}