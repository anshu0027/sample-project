import { Router, Request, Response } from "express";
import { sendQuoteEmail, sendPolicyEmail } from "../../services/email.service";
import rateLimit from "express-rate-limit";
import { SentryService } from "../../services/sentry.service";
import { SentryErrorService } from "../../services/sentry-error.service";
import { EmailService } from "../../services/email.service";
// import { createClerkClient, verifyToken } from "@clerk/backend";
import dotenv from "dotenv";

dotenv.config();

// ------------------------
// Rate limiter for email sending to prevent abuse.
// ------------------------
const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // limit each IP to 100 emails per hour
});

// ------------------------
// Router for handling email-related API endpoints.
// Base path: /api/v1/email
// ------------------------
const router = Router();
const sentryService = SentryService.getInstance();
const sentryErrorService = SentryErrorService.getInstance();
const emailService = EmailService.getInstance();

// ------------------------
// POST /api/v1/email/send - Handles sending emails (quote or policy).
// Applies rate limiting.
// Expects 'to' (recipient email), 'type' ('quote' or 'policy'), and 'data' (email content specific to the type).
// ------------------------
router.post("/send", emailLimiter, async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { to, type = "quote", data } = req.body;

    // ------------------------
    // Validate that recipient email ('to') and email data ('data') are provided.
    // ------------------------
    if (!to || !data) {
      res.status(400).json({ error: "Missing recipient or data." });
      await sentryService.logApiCall(req, res, startTime, undefined);
      return;
    }

    // ------------------------
    // Determine the type of email to send and call the appropriate service function.
    // ------------------------
    if (type === "quote") {
      await sendQuoteEmail(to, data);
    } else if (type === "policy") {
      await sendPolicyEmail(to, data);
    } else {
      res.status(400).json({ error: "Invalid email type specified." });
      await sentryService.logApiCall(req, res, startTime, undefined);
      return;
    }

    // ------------------------
    // If email sending is successful, return a success response.
    // ------------------------
    res
      .status(200)
      .json({ success: true, message: "Email sent successfully." });
    await sentryService.logApiCall(req, res, startTime, {
      success: true,
      message: "Email sent successfully.",
    });
  } catch (error) {
    // ------------------------
    // Error handling for POST /api/v1/email/send.
    // ------------------------
    await sentryErrorService.captureRequestError(
      req,
      res,
      error as Error,
      res.statusCode || 500
    );
    await sentryService.logApiCall(
      req,
      res,
      startTime,
      undefined,
      error as Error
    );
    const errorMessage =
      error instanceof Error ? error.message : "Failed to send email.";
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
