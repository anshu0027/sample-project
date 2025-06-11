// my-backend/src/utils/emailTemplates.ts

interface EmailTemplateParams {
    quoteNumber: string;
    firstName: string; // Provided by email.service.ts, defaults to 'Customer' if not available
    totalPremium?: number | null;
    policyNumber?: string;
}
// It's good practice to define your company's details in one place
const companyDetails = {
    name: "Aura Risk Management",
    address: "904 W. Chapman Ave., Orange, CA 94025",
    phone: "1-888-888-0888",
    email: "support@aurarisk.com", // Replace with actual support email
    website: "https://www.aurarisk.com" // Replace with actual website
};

const emailStyles = `
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f0f2f5; color: #333333; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        .email-wrapper { background-color: #f0f2f5; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border: 1px solid #e0e0e0; }
        .header { text-align: center; padding-bottom: 25px; border-bottom: 2px solid #276C8C; /* Aura Risk Blue */ }
        .header .company-name { font-size: 28px; font-weight: bold; color: #276C8C; /* Aura Risk Blue */ margin-bottom: 5px; }
        .header .tagline { font-size: 14px; color: #555555; margin-top: 0; }
        .content { padding: 25px 0; line-height: 1.7; color: #333333; font-size: 16px; }
        .content h1 { color: #276C8C; /* Aura Risk Blue */ font-size: 24px; margin-bottom: 20px; text-align: center; }
        .content p { margin-bottom: 15px; }
        .button-container { text-align: center; margin: 25px 0; }
        .button { display: inline-block; background-color: #276C8C; /* Aura Risk Blue */ color: #ffffff !important; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; transition: background-color 0.3s ease; }
        .button:hover { background-color: #1e5269; /* Darker Aura Risk Blue */ }
        .highlight { color: #276C8C; /* Aura Risk Blue */ font-weight: bold; }
        .signature-section { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 14px; color: #555555; }
        .signature-section p { margin-bottom: 5px; }
        .footer { text-align: center; padding-top: 25px; border-top: 1px solid #e0e0e0; font-size: 13px; color: #777777; }
        .footer p { margin: 5px 0; }
        .footer a { color: #276C8C; text-decoration: none; }
        .footer a:hover { text-decoration: underline; }
    </style>
`;

export const quoteEmailTemplate = ({ quoteNumber, firstName, totalPremium }: EmailTemplateParams) => {
    return {
        subject: `Your Quote ${quoteNumber} is Ready`,
        html: `
            <html>
            <head>${emailStyles}</head>
            <body>
                <div class="email-wrapper">
                    <div class="container">
                        <div class="header">
                            <div class="company-name">${companyDetails.name}</div>
                            <p class="tagline">Protecting Your Special Moments</p>
                        </div>
                        <div class="content">
                            <h1>Your Special Event Insurance Quote is Ready!</h1>
                            <p>Dear ${firstName},</p>
                            <p>Thank you for choosing ${companyDetails.name}. We're pleased to provide you with your personalized quote for special event insurance.</p>
                            <p><strong>Quote Number:</strong> <span class="highlight">${quoteNumber}</span></p>
                            <p><strong>Total Estimated Premium:</strong> <span class="highlight">$${totalPremium != null ? totalPremium.toFixed(2) : 'N/A'}</span></p>
                            <p>This quote outlines the coverage options available for your event. To review the full details and proceed, please click the button below:</p>
                            <div class="button-container">
                                <a href="${companyDetails.website}/quote/${quoteNumber}" class="button">View Your Quote</a>
                            </div>
                            <p>If you have any questions or need assistance, please don't hesitate to contact us by replying to this email or calling us at ${companyDetails.phone}.</p>
                            
                            <div class="signature-section">
                                <p>Sincerely,</p>
                                <p>The Team at ${companyDetails.name}</p>
                                <p><a href="mailto:${companyDetails.email}">${companyDetails.email}</a></p>
                                <p>${companyDetails.phone}</p>
                                <p><a href="${companyDetails.website}">${companyDetails.website}</a></p>
                            </div>
                        </div>
                        <div class="footer">
                            <p>&copy; ${new Date().getFullYear()} ${companyDetails.name}. All rights reserved.</p>
                            <p>${companyDetails.address}</p>
                            <p><a href="${companyDetails.website}/privacy-policy">Privacy Policy</a> | <a href="${companyDetails.website}/terms-of-service">Terms of Service</a></p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `,
    };
};

export const policyEmailTemplate = ({ policyNumber, firstName, quoteNumber, totalPremium }: EmailTemplateParams) => {
    return {
        subject: `Your Policy ${policyNumber} is Attached`,
        html: `
            <html>
            <head>${emailStyles}</head>
            <body>
                <div class="email-wrapper">
                    <div class="container">
                        <div class="header">
                            <div class="company-name">${companyDetails.name}</div>
                            <p class="tagline">Protecting Your Special Moments</p>
                        </div>
                        <div class="content">
                            <h1>Your Insurance Policy is Confirmed!</h1>
                            <p>Dear ${firstName},</p>
                            <p>Congratulations! Your special event insurance policy is now active. We've attached your policy documents to this email for your records.</p>
                            <p><strong>Policy Number:</strong> <span class="highlight">${policyNumber || 'N/A'}</span></p>
                            ${quoteNumber ? `<p><strong>Original Quote Number:</strong> ${quoteNumber}</p>` : ''}
                            ${totalPremium != null ? `<p><strong>Total Premium Paid:</strong> $${totalPremium.toFixed(2)}</p>` : ''}
                            <p>Please review the attached documents carefully to ensure all details are correct and that you understand your coverage. If you have any questions or require any changes, please contact us immediately by replying to this email or calling us at ${companyDetails.phone}.</p>
                            <p>We're here to help ensure your event is protected.</p>

                            <div class="signature-section">
                                <p>Best regards,</p>
                                <p>The ${companyDetails.name} Team</p>
                                <p><a href="mailto:${companyDetails.email}">${companyDetails.email}</a></p>
                                <p>${companyDetails.phone}</p>
                                <p><a href="${companyDetails.website}">${companyDetails.website}</a></p>
                            </div>
                        </div>
                        <div class="footer">
                            <p>&copy; ${new Date().getFullYear()} ${companyDetails.name}. All rights reserved.</p>
                            <p>${companyDetails.address}</p>
                            <p><a href="${companyDetails.website}/privacy-policy">Privacy Policy</a> | <a href="${companyDetails.website}/terms-of-service">Terms of Service</a></p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `,
    };
};