// my-backend/src/routes/v1/policy-list.routes.ts
import { Router, Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import { Policy } from "../../entities/policy.entity";
import { QuoteSource, PaymentStatus } from "../../entities/enums";
import { SentryService } from "../../services/sentry.service";
import { SentryErrorService } from "../../services/sentry-error.service";
import { createClerkClient, verifyToken } from "@clerk/backend";
import dotenv from "dotenv";

dotenv.config();

// ------------------------
// Router for handling policy list related API endpoints.
// Base path: /api/v1/policy-list
// This router is specifically for fetching a paginated list of policies,
// formatted for display in a list or table in the frontend.
// ------------------------
const router = Router();
const sentryService = SentryService.getInstance();
const sentryErrorService = SentryErrorService.getInstance();

// --- GET /api/v1/policy-list --- Handles fetching a paginated list of policies.
router.get("/", async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    // 1. Parse pagination parameters from the query string
    const page = parseInt((req.query.page as string) || "1", 10);
    const pageSize = parseInt((req.query.pageSize as string) || "10", 10);
    const skip = (page - 1) * pageSize;

    const policyRepository = AppDataSource.getRepository(Policy);

    // ------------------------
    // 2. Use TypeORM's findAndCount method for efficient pagination.
    // It fetches the policies for the current page and the total count of policies.
    // Relations are loaded to ensure all necessary data for formatting is available.
    // ------------------------
    const [policies, total] = await policyRepository.findAndCount({
      relations: [
        "quote",
        "quote.policyHolder",
        "quote.event",
        "event",
        "policyHolder",
        "payments",
      ],
      order: { createdAt: "DESC" },
      skip: skip,
      take: pageSize,
    });

    // ------------------------
    // Log raw policies data for debugging.
    // ------------------------
    // console.log("Raw policies data:", JSON.stringify(policies, null, 2));

    // ------------------------
    // 3. Map and format the fetched policies to match the structure expected by the frontend.
    // This involves extracting data from related entities (quote, event, policyHolder, payments)
    // and determining the correct payment status.
    // ------------------------
    const formattedPolicies = policies.map((policy) => {
      // Log individual policy data for debugging during mapping.
      // console.log("Processing policy:", policy.id);
      // console.log("Policy quote:", policy.quote);
      // console.log("Policy event:", policy.event);
      // console.log("Policy holder:", policy.policyHolder);
      // console.log("Policy payments:", policy.payments);

      // Get the relevant data from either quote or direct policy
      // A policy might be directly created or created from a quote.
      // This logic ensures data is sourced correctly.
      const source = policy.quote || policy;
      const event = policy.quote?.event || policy.event;
      const policyHolder = policy.quote?.policyHolder || policy.policyHolder;
      const payment = policy.payments?.[0];

      // ------------------------
      // Log extracted data for debugging.
      // ------------------------
      // console.log("Extracted data:", {
      //   source,
      //   event,
      //   policyHolder,
      //   payment,
      // });

      // ------------------------
      // Determine the payment status.
      // If the policy originated from an admin-created quote, assume payment is successful.
      // Otherwise, use the status from the payment record or default to 'PENDING'.
      // ------------------------
      let paymentStatus = payment?.status || "PENDING";
      if (policy.quote?.source === QuoteSource.ADMIN) {
        paymentStatus = PaymentStatus.SUCCESS;
      }

      // ------------------------
      // Get the total premium from either the quote or the first payment
      // For admin quotes, prioritize the quote's total premium
      // ------------------------
      const totalPremium = policy.quote?.totalPremium || 0;

      // ------------------------
      // Construct the formatted policy object.
      // ------------------------
      const formattedPolicy = {
        id: policy.id,
        policyId: policy.id,
        policyNumber: policy.policyNumber,
        quoteNumber: policy.quote?.quoteNumber,
        email: policy.quote?.email,
        customer: policyHolder
          ? `${policyHolder.firstName || ""} ${
              policyHolder.lastName || ""
            }`.trim()
          : null,
        policyHolder: {
          firstName: policyHolder?.firstName || null,
          lastName: policyHolder?.lastName || null,
        },
        event: {
          eventType: event?.eventType || null,
          eventDate: event?.eventDate || null,
          maxGuests: event?.maxGuests || null,
        },
        eventType: event?.eventType || null,
        eventDate: event?.eventDate || null,
        totalPremium: totalPremium,
        status: paymentStatus,
        createdAt: policy.createdAt,
        updatedAt: policy.updatedAt,
        payments:
          policy.payments?.map((p) => ({
            amount: p.amount,
            status: p.status,
            method: p.method,
            reference: p.reference,
          })) || [],
      };

      // ------------------------
      // Log the formatted policy for debugging.
      // ------------------------
      // console.log("Formatted policy:", formattedPolicy);
      return formattedPolicy;
    });

    // ------------------------
    // 4. Construct and send the paginated response.
    // Includes the list of formatted policies, total count, current page, page size, and total pages.
    // ------------------------
    const response = {
      policies: formattedPolicies,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };

    // ------------------------
    // Log the final response for debugging.
    // ------------------------
    // console.log("Final response:", JSON.stringify(response, null, 2));
    await sentryService.logApiCall(req, res, startTime, response);
    res.json(response);
  } catch (error) {
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
    // ------------------------
    // Error handling for GET /api/v1/policy-list.
    // ------------------------
    console.error("GET /api/v1/policy-list error:", error);
    res.status(500).json({ error: "Failed to fetch policies" });
  }
});

// ------------------------
// The DELETE logic from the old file seems out of place for a "list" route.
// It more logically belongs in the main policy.routes.ts file, which we have already done.
// Therefore, we will NOT include the DELETE handler here to maintain a clean API design.
// ------------------------

export default router;
