"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const email_service_1 = require("../../services/email.service");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// ------------------------
// Rate limiter for email sending to prevent abuse.
// ------------------------
const emailLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 45, // limit each IP to 25 emails per hour
});
// ------------------------
// Router for handling email-related API endpoints.
// Base path: /api/v1/email
// ------------------------
const router = (0, express_1.Router)();
// ------------------------
// POST /api/v1/email/send - Handles sending emails (quote or policy).
// Applies rate limiting.
// Expects 'to' (recipient email), 'type' ('quote' or 'policy'), and 'data' (email content specific to the type).
// ------------------------
router.post("/send", emailLimiter, async (req, res) => {
    try {
        const { to, type = "quote", data } = req.body;
        // ------------------------
        // Validate that recipient email ('to') and email data ('data') are provided.
        // ------------------------
        if (!to || !data) {
            res.status(400).json({ error: "Missing recipient or data." });
            return;
        }
        // ------------------------
        // Determine the type of email to send and call the appropriate service function.
        // ------------------------
        if (type === "quote") {
            await (0, email_service_1.sendQuoteEmail)(to, data);
        }
        else if (type === "policy") {
            await (0, email_service_1.sendPolicyEmail)(to, data);
        }
        else {
            res.status(400).json({ error: "Invalid email type specified." });
            return;
        }
        // ------------------------
        // If email sending is successful, return a success response.
        // ------------------------
        res
            .status(200)
            .json({ success: true, message: "Email sent successfully." });
    }
    catch (error) {
        // ------------------------
        // Error handling for POST /api/v1/email/send.
        // ------------------------
        console.error("Email send error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to send email.";
        res.status(500).json({ error: errorMessage });
    }
});
exports.default = router;
