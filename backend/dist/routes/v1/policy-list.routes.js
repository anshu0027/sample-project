"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// my-backend/src/routes/v1/policy-list.routes.ts
const express_1 = require("express");
const data_source_1 = require("../../data-source");
const policy_entity_1 = require("../../entities/policy.entity");
const enums_1 = require("../../entities/enums");
const event_logger_service_1 = require("../../services/event-logger.service");
const sentry_error_service_1 = require("../../services/sentry-error.service");
// ------------------------
// Router for handling policy list related API endpoints.
// Base path: /api/v1/policy-list
// This router is specifically for fetching a paginated list of policies,
// formatted for display in a list or table in the frontend.
// ------------------------
const router = (0, express_1.Router)();
const eventLogger = event_logger_service_1.EventLoggerService.getInstance();
const sentryErrorService = sentry_error_service_1.SentryErrorService.getInstance();
// --- GET /api/v1/policy-list --- Handles fetching a paginated list of policies.
router.get("/", async (req, res) => {
    const startTime = Date.now();
    try {
        // 1. Parse pagination parameters from the query string
        const page = parseInt(req.query.page || "1", 10);
        const pageSize = parseInt(req.query.pageSize || "10", 10);
        const skip = (page - 1) * pageSize;
        const policyRepository = data_source_1.AppDataSource.getRepository(policy_entity_1.Policy);
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
            var _a, _b, _c, _d, _e, _f, _g, _h;
            // Get the relevant data from either quote or direct policy
            // A policy might be directly created or created from a quote.
            // This logic ensures data is sourced correctly.
            const source = policy.quote || policy;
            const event = ((_a = policy.quote) === null || _a === void 0 ? void 0 : _a.event) || policy.event;
            const policyHolder = ((_b = policy.quote) === null || _b === void 0 ? void 0 : _b.policyHolder) || policy.policyHolder;
            const payment = (_c = policy.payments) === null || _c === void 0 ? void 0 : _c[0];
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
            let paymentStatus = (payment === null || payment === void 0 ? void 0 : payment.status) || "PENDING";
            if (((_d = policy.quote) === null || _d === void 0 ? void 0 : _d.source) === enums_1.QuoteSource.ADMIN) {
                paymentStatus = enums_1.PaymentStatus.SUCCESS;
            }
            // ------------------------
            // Get the total premium from either the quote or the first payment
            // For admin quotes, prioritize the quote's total premium
            // ------------------------
            const totalPremium = ((_e = policy.quote) === null || _e === void 0 ? void 0 : _e.totalPremium) || 0;
            // ------------------------
            // Construct the formatted policy object.
            // ------------------------
            const formattedPolicy = {
                id: policy.id,
                policyId: policy.id,
                policyNumber: policy.policyNumber,
                quoteNumber: (_f = policy.quote) === null || _f === void 0 ? void 0 : _f.quoteNumber,
                email: (_g = policy.quote) === null || _g === void 0 ? void 0 : _g.email,
                customer: policyHolder
                    ? `${policyHolder.firstName || ""} ${policyHolder.lastName || ""}`.trim()
                    : null,
                policyHolder: {
                    firstName: (policyHolder === null || policyHolder === void 0 ? void 0 : policyHolder.firstName) || null,
                    lastName: (policyHolder === null || policyHolder === void 0 ? void 0 : policyHolder.lastName) || null,
                },
                event: {
                    eventType: (event === null || event === void 0 ? void 0 : event.eventType) || null,
                    eventDate: (event === null || event === void 0 ? void 0 : event.eventDate) || null,
                    maxGuests: (event === null || event === void 0 ? void 0 : event.maxGuests) || null,
                },
                eventType: (event === null || event === void 0 ? void 0 : event.eventType) || null,
                eventDate: (event === null || event === void 0 ? void 0 : event.eventDate) || null,
                totalPremium: totalPremium,
                status: paymentStatus,
                createdAt: policy.createdAt,
                updatedAt: policy.updatedAt,
                payments: ((_h = policy.payments) === null || _h === void 0 ? void 0 : _h.map((p) => ({
                    amount: p.amount,
                    status: p.status,
                    method: p.method,
                    reference: p.reference,
                }))) || [],
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
        await eventLogger.logApiCall(req, res, startTime, response);
        res.json(response);
    }
    catch (error) {
        await sentryErrorService.captureRequestError(req, res, error, res.statusCode || 500);
        await eventLogger.logApiCall(req, res, startTime, undefined, error);
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
exports.default = router;
//# sourceMappingURL=policy-list.routes.js.map