// my-backend/src/utils/emailTemplates.ts

interface EmailTemplateParams {
    quoteNumber: string;
    firstName: string;
    totalPremium: number;
    policyNumber?: string;
}

export const quoteEmailTemplate = ({ quoteNumber, firstName, totalPremium }: EmailTemplateParams) => {
    // ... your existing quote template logic ...
    return {
        subject: `Your Quote ${quoteNumber} is Ready`,
        html: `<h1>Hello ${firstName}</h1><p>Your quote is ready. Total premium: $${totalPremium}</p>`,
    };
};

export const policyEmailTemplate = ({ policyNumber, firstName }: EmailTemplateParams) => {
    // ... your existing policy template logic ...
    return {
        subject: `Your Policy ${policyNumber} is Attached`,
        html: `<h1>Hello ${firstName}</h1><p>Your policy document is attached.</p>`,
    };
};