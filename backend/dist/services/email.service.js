"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendQuoteEmail = sendQuoteEmail;
exports.sendPolicyEmail = sendPolicyEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const pdf_service_1 = require("./pdf.service");
const emailTemplates_1 = require("../utils/emailTemplates");
// ------------------------
// --- TRANSPORTER CONFIG ---
// Configures the nodemailer transporter with email service provider details.
// Uses environment variables for SMTP email and password for security.
// ------------------------
const transporter = nodemailer_1.default.createTransport({
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
async function sendQuoteEmail(to, data) {
    var _a;
    // ------------------------
    // Generate the email content using the quoteEmailTemplate.
    // ------------------------
    const template = (0, emailTemplates_1.quoteEmailTemplate)({
        quoteNumber: data.quoteNumber,
        firstName: ((_a = data.policyHolder) === null || _a === void 0 ? void 0 : _a.firstName) || "Customer",
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
async function sendPolicyEmail(to, data) {
    var _a, _b, _c;
    // ------------------------
    // Generate the email content using the policyEmailTemplate.
    // ------------------------
    const template = (0, emailTemplates_1.policyEmailTemplate)({
        quoteNumber: data.quoteNumber,
        firstName: ((_a = data.policyHolder) === null || _a === void 0 ? void 0 : _a.firstName) || "Customer",
        totalPremium: data.totalPremium,
        policyNumber: (_b = data.policy) === null || _b === void 0 ? void 0 : _b.policyNumber,
    });
    // ------------------------
    // Generate the policy PDF to be attached to the email.
    // ------------------------
    const pdfBuffer = await (0, pdf_service_1.generatePolicyPdf)(data);
    // ------------------------
    // Define the attachment for the email.
    // ------------------------
    const attachments = [
        {
            filename: `policy-${((_c = data.policy) === null || _c === void 0 ? void 0 : _c.policyNumber) || data.quoteNumber}.pdf`,
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
