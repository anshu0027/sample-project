import nodemailer from "nodemailer";
import { generatePolicyPdf } from "./pdf.service";
import {
  quoteEmailTemplate,
  policyEmailTemplate,
} from "../utils/emailTemplates";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: any[];
}

export class EmailService {
  private static instance: EmailService;
  private transporter: nodemailer.Transporter;

  private constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      service: "office365",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
      },
      secure: false,
    });
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  public async sendEmail(options: EmailOptions) {
    await this.transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    });
  }

  public async sendQuoteEmail(to: string, data: any) {
    const template = quoteEmailTemplate({
      quoteNumber: data.quoteNumber,
      firstName: data.policyHolder?.firstName || "Customer",
      totalPremium: data.totalPremium,
    });

    await this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
    });
  }

  public async sendPolicyEmail(to: string, data: any) {
    const template = policyEmailTemplate({
      quoteNumber: data.quoteNumber,
      firstName: data.policyHolder?.firstName || "Customer",
      totalPremium: data.totalPremium,
      policyNumber: data.policy?.policyNumber,
    });

    const pdfBuffer = await generatePolicyPdf(data);

    const attachments = [
      {
        filename: `policy-${data.policy?.policyNumber || data.quoteNumber}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ];

    await this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      attachments,
    });
  }
}

const emailService = EmailService.getInstance();
export const sendQuoteEmail = emailService.sendQuoteEmail.bind(emailService);
export const sendPolicyEmail = emailService.sendPolicyEmail.bind(emailService);
