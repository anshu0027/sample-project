import nodemailer from 'nodemailer';
import { generatePolicyPdf } from './pdf.service';
import { quoteEmailTemplate, policyEmailTemplate } from '../utils/emailTemplates';



// --- TRANSPORTER CONFIG ---
const transporter = nodemailer.createTransport({
    service: 'gmail', // Or your preferred email service
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
    },
});

// --- SERVICE FUNCTIONS ---

export async function sendQuoteEmail(to: string, data: any) {
    const template = quoteEmailTemplate({
        quoteNumber: data.quoteNumber,
        firstName: data.policyHolder?.firstName || 'Customer',
        totalPremium: data.totalPremium,
    });

    await transporter.sendMail({
        from: process.env.SMTP_EMAIL,
        to,
        subject: template.subject,
        html: template.html,
    });
}

export async function sendPolicyEmail(to: string, data: any) {
    const template = policyEmailTemplate({
        quoteNumber: data.quoteNumber,
        firstName: data.policyHolder?.firstName || 'Customer',
        totalPremium: data.totalPremium,
        policyNumber: data.policy?.policyNumber,
    });

    // Generate the PDF attachment
    const pdfBuffer = await generatePolicyPdf(data);

    const attachments = [{
        filename: `policy-${data.policy?.policyNumber || data.quoteNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
    }];

    await transporter.sendMail({
        from: process.env.SMTP_EMAIL,
        to,
        subject: template.subject,
        html: template.html,
        attachments,
    });
}