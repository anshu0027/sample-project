import nodemailer from "nodemailer";
import { generatePolicyPdf } from "./pdf.service";
import {
  quoteEmailTemplate,
  policyEmailTemplate,
} from "../utils/emailTemplates";

// ------------------------
// --- TRANSPORTER CONFIG ---
// Configures the nodemailer transporter with email service provider details.
// Uses environment variables for SMTP email and password for security.
// ------------------------
const transporter = nodemailer.createTransport({
  service: "gmail", // Or your preferred email service
  auth: {
    user: process.env.SMTP_EMAIL, // Email address for sending emails
    pass: process.env.SMTP_PASS, // Password for the sender email account
  },
});

// --- SERVICE FUNCTIONS ---

// ------------------------
// Sends a quote email to the specified recipient.
//
// Parameters:
// - to: The recipient's email address.
// - data: An object containing data for the email template, such as quoteNumber,
//         policyHolder's first name, and totalPremium.
//
// Throws:
// - An error if sending the email fails.
// ------------------------
export async function sendQuoteEmail(to: string, data: any) {
  // ------------------------
  // Generate the email content using the quoteEmailTemplate.
  // ------------------------
  const template = quoteEmailTemplate({
    quoteNumber: data.quoteNumber,
    firstName: data.policyHolder?.firstName || "Customer",
    totalPremium: data.totalPremium,
  });

  await transporter.sendMail({
    from: process.env.SMTP_EMAIL, // Sender address
    to, // List of recipients
    subject: template.subject, // Subject line
    html: template.html, // HTML body
  });
}

// ------------------------
// Sends a policy email to the specified recipient, including the policy PDF as an attachment.
//
// Parameters:
// - to: The recipient's email address.
// - data: An object containing data for the email template and PDF generation,
//         such as quoteNumber, policyHolder's first name, totalPremium, and policyNumber.
//
// Throws:
// - An error if PDF generation or sending the email fails.
// ------------------------
export async function sendPolicyEmail(to: string, data: any) {
  // ------------------------
  // Generate the email content using the policyEmailTemplate.
  // ------------------------
  const template = policyEmailTemplate({
    quoteNumber: data.quoteNumber,
    firstName: data.policyHolder?.firstName || "Customer",
    totalPremium: data.totalPremium,
    policyNumber: data.policy?.policyNumber,
  });

  // ------------------------
  // Generate the policy PDF to be attached to the email.
  // ------------------------
  const pdfBuffer = await generatePolicyPdf(data);

  // ------------------------
  // Define the attachment for the email.
  // ------------------------
  const attachments = [
    {
      filename: `policy-${data.policy?.policyNumber || data.quoteNumber}.pdf`,
      content: pdfBuffer,
      contentType: "application/pdf",
    },
  ];

  // ------------------------
  // Send the email with the generated PDF as an attachment.
  // ------------------------
  await transporter.sendMail({
    from: process.env.SMTP_EMAIL,
    to,
    subject: template.subject,
    html: template.html,
    attachments,
  });
}
