"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPolicyEmail = exports.sendQuoteEmail = exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const pdf_service_1 = require("./pdf.service");
const emailTemplates_1 = require("../utils/emailTemplates");
class EmailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
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
    static getInstance() {
        if (!EmailService.instance) {
            EmailService.instance = new EmailService();
        }
        return EmailService.instance;
    }
    async sendEmail(options) {
        await this.transporter.sendMail({
            from: process.env.SMTP_EMAIL,
            to: options.to,
            subject: options.subject,
            html: options.html,
            attachments: options.attachments,
        });
    }
    async sendQuoteEmail(to, data) {
        var _a;
        const template = (0, emailTemplates_1.quoteEmailTemplate)({
            quoteNumber: data.quoteNumber,
            firstName: ((_a = data.policyHolder) === null || _a === void 0 ? void 0 : _a.firstName) || "Customer",
            totalPremium: data.totalPremium,
        });
        await this.sendEmail({
            to,
            subject: template.subject,
            html: template.html,
        });
    }
    async sendPolicyEmail(to, data) {
        var _a, _b, _c;
        const template = (0, emailTemplates_1.policyEmailTemplate)({
            quoteNumber: data.quoteNumber,
            firstName: ((_a = data.policyHolder) === null || _a === void 0 ? void 0 : _a.firstName) || "Customer",
            totalPremium: data.totalPremium,
            policyNumber: (_b = data.policy) === null || _b === void 0 ? void 0 : _b.policyNumber,
        });
        const pdfBuffer = await (0, pdf_service_1.generatePolicyPdf)(data);
        const attachments = [
            {
                filename: `policy-${((_c = data.policy) === null || _c === void 0 ? void 0 : _c.policyNumber) || data.quoteNumber}.pdf`,
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
exports.EmailService = EmailService;
const emailService = EmailService.getInstance();
exports.sendQuoteEmail = emailService.sendQuoteEmail.bind(emailService);
exports.sendPolicyEmail = emailService.sendPolicyEmail.bind(emailService);
//# sourceMappingURL=email.service.js.map