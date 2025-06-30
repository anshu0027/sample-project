"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// my-backend/src/routes/v1/payment.routes.ts
const express_1 = require("express");
const data_source_1 = require("../../data-source");
const payment_entity_1 = require("../../entities/payment.entity");
const enums_1 = require("../../entities/enums");
const quote_entity_1 = require("../../entities/quote.entity");
const policy_entity_1 = require("../../entities/policy.entity");
const enums_2 = require("../../entities/enums");
const authorizenet_1 = require("authorizenet"); // Removed "Constants" as it was not used.
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const event_logger_service_1 = require("../../services/event-logger.service");
const sentry_error_service_1 = require("../../services/sentry-error.service");
// ------------------------
// Router for handling payment-related API endpoints.
// Base path: /api/v1/payment
// ------------------------
const router = (0, express_1.Router)();
const eventLogger = event_logger_service_1.EventLoggerService.getInstance();
const sentryErrorService = sentry_error_service_1.SentryErrorService.getInstance();
// ------------------------
// Rate limiter for manual payment creation endpoint.
// Limits each IP to 10 manual payment creations per hour.
// ------------------------
const manualPaymentLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 30, // Limit each IP to 10 manual payment creations per hour
    message: "Too many payment creation attempts, please try again later.",
});
// ------------------------
// Stricter rate limiter for the Authorize.Net payment gateway endpoint.
// Limits each IP to 5 Authorize.Net attempts per 15 minutes.
// ------------------------
const authorizeNetLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 Authorize.Net attempts per 15 minutes
    message: "Too many payment attempts with gateway, please try again later.",
});
// ------------------------
// Authorize.Net API credentials.
// These should be stored securely, typically as environment variables.
// ------------------------
const apiLoginId = process.env.AUTHORIZE_NET_API_LOGIN_ID_SANDBOX;
const transactionKey = process.env.AUTHORIZE_NET_TRANSACTION_KEY_SANDBOX;
if (!apiLoginId || !transactionKey) {
    const errorMsg = "CRITICAL CONFIGURATION ERROR: AUTHORIZE_NET_API_LOGIN_ID_SANDBOX and/or AUTHORIZE_NET_TRANSACTION_KEY_SANDBOX environment variables are not set. Authorize.Net payments will fail.";
    console.error(errorMsg);
    // For a production system, consider throwing an error here to halt application startup
    // to ensure this critical configuration issue is addressed immediately.
    // Example: throw new Error(errorMsg);
}
// ------------------------
// Merchant authentication type for Authorize.Net API calls.
// ------------------------
const merchantAuthenticationType = new authorizenet_1.APIContracts.MerchantAuthenticationType();
merchantAuthenticationType.setName(apiLoginId);
merchantAuthenticationType.setTransactionKey(transactionKey);
// ------------------------
// Helper function to map internal payment status enums to more user-friendly strings
// for display on the frontend.
// ------------------------
const mapPaymentStatus = (payment) => {
    if (!payment)
        return null;
    return Object.assign(Object.assign({}, payment), { status: payment.status === enums_1.PaymentStatus.SUCCESS
            ? "Completed"
            : payment.status === enums_1.PaymentStatus.FAILED
                ? "Failed"
                : payment.status });
};
// --- GET /api/v1/payment ---
// --- GET /api/v1/payment/:id ---
// ------------------------
// Handles fetching a single payment by its ID.
// ------------------------
router.get("/:id", async (req, res) => {
    const startTime = Date.now();
    try {
        const { id } = req.params;
        const paymentRepository = data_source_1.AppDataSource.getRepository(payment_entity_1.Payment);
        // ------------------------
        // Fetch the payment with its relations to provide comprehensive data.
        // ------------------------
        const payment = await paymentRepository.findOne({
            where: { id: Number(id) },
            relations: [
                "policy",
                "policy.quote",
                "quote",
                "quote.policyHolder",
                "quote.event",
                "quote.event.venue",
            ],
        });
        // ------------------------
        // If payment not found, return 404.
        // ------------------------
        if (!payment) {
            res.status(404).json({ error: "Payment not found" });
            await eventLogger.logApiCall(req, res, startTime, undefined);
            return;
        }
        res.json({ payment: mapPaymentStatus(payment) });
        await eventLogger.logApiCall(req, res, startTime, {
            payment: mapPaymentStatus(payment),
        });
    }
    catch (error) {
        await sentryErrorService.captureRequestError(req, res, error, res.statusCode || 500);
        await eventLogger.logApiCall(req, res, startTime, undefined, error);
        // ------------------------
        // Error handling for GET /api/v1/payment/:id.
        // ------------------------
        console.error("GET /api/payment/:id error:", error);
        res.status(500).json({ error: "Failed to fetch payment" });
    }
});
// --- GET /api/v1/payment ---
// Handles fetching a LIST of payments, with optional filters.
// ------------------------
// Handles fetching a list of payments.
// Supports optional filtering by policyId or quoteId.
// ------------------------
router.get("/", async (req, res) => {
    const startTime = Date.now();
    try {
        const { policyId, quoteId } = req.query;
        const paymentRepository = data_source_1.AppDataSource.getRepository(payment_entity_1.Payment);
        // ------------------------
        // Build the 'where' clause for filtering based on query parameters.
        // ------------------------
        const where = {};
        if (policyId)
            where.policyId = Number(policyId);
        if (quoteId)
            where.quoteId = Number(quoteId);
        // ------------------------
        // Fetch payments with relations, ordered by creation date.
        // ------------------------
        const payments = await paymentRepository.find({
            where,
            relations: [
                "policy",
                "policy.quote",
                "quote",
                "quote.policyHolder",
                "quote.event",
                "quote.event.venue",
            ],
            order: { createdAt: "DESC" },
        });
        const mappedPayments = payments.map(mapPaymentStatus);
        res.json({ payments: mappedPayments });
        await eventLogger.logApiCall(req, res, startTime, {
            payments: mappedPayments,
        });
    }
    catch (error) {
        await sentryErrorService.captureRequestError(req, res, error, res.statusCode || 500);
        await eventLogger.logApiCall(req, res, startTime, undefined, error);
        // ------------------------
        // Error handling for GET /api/v1/payment.
        // ------------------------
        console.error("GET /api/payment error:", error);
        res.status(500).json({ error: "Failed to fetch payments" });
    }
});
// --- POST /api/v1/payment ---
router.post("/", manualPaymentLimiter, async (req, res) => {
    // ------------------------
    // Handles manual creation of a payment record.
    // This is typically used for offline payments or admin-initiated payment entries.
    // Uses a transaction to ensure atomicity, especially if a quote needs to be converted to a policy.
    // Applies rate limiting.
    // ------------------------
    const startTime = Date.now();
    const queryRunner = data_source_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const { amount, quoteId, policyId, method, status, reference } = req.body;
        // console.log("Received payment request:", {
        //   amount,
        //   quoteId,
        //   policyId,
        //   method,
        //   status,
        //   reference,
        // });
        // ------------------------
        // Validate required fields for payment creation.
        // Amount, status, and either quoteId or policyId are mandatory.
        // ------------------------
        // Check if either quoteId or policyId is provided.
        // Amount and status are always required.
        // ------------------------
        if (!amount || (!quoteId && !policyId) || !status) {
            res.status(400).json({
                error: "Missing required fields. Need amount, status, and either quoteId or policyId",
                received: { amount, quoteId, policyId, status },
            });
            return;
        }
        // ------------------------
        // Validate that the provided status is a valid PaymentStatus enum value.
        // ------------------------
        const validStatuses = Object.values(enums_1.PaymentStatus);
        if (!validStatuses.includes(status)) {
            res.status(400).json({
                error: `Invalid payment status: ${status}`,
                validStatuses,
                received: status,
            });
            return;
        }
        const paymentRepository = queryRunner.manager.getRepository(payment_entity_1.Payment);
        const quoteRepository = queryRunner.manager.getRepository(quote_entity_1.Quote);
        // ------------------------
        // Create a new Payment entity with the provided data.
        // ------------------------
        const newPayment = paymentRepository.create({
            amount: parseFloat(amount),
            quoteId: quoteId ? parseInt(quoteId) : undefined,
            policyId: policyId ? parseInt(policyId) : undefined,
            method: method || "Online",
            status: status,
            reference: reference || `PAY-${Date.now()}`,
        });
        // console.log("Creating payment:", newPayment);
        const savedPayment = await paymentRepository.save(newPayment);
        // console.log("Saved payment:", savedPayment);
        // ------------------------
        // If the payment status is SUCCESS and a quoteId is provided,
        // attempt to convert the associated quote to a policy.
        // This involves updating the quote status and creating a new policy record.
        // ------------------------
        if (status === enums_1.PaymentStatus.SUCCESS && quoteId) {
            const quote = await quoteRepository.findOne({
                where: { id: parseInt(quoteId) },
                relations: ["event", "event.venue", "policyHolder"],
            });
            if (quote) {
                // ------------------------
                // Update the quote's status to COMPLETE.
                // ------------------------
                quote.status = enums_2.StepStatus.COMPLETE;
                await quoteRepository.save(quote);
                // ------------------------
                // Create a new Policy entity from the quote details.
                // The policy number is derived from the quote number.
                // ------------------------
                const policyRepository = queryRunner.manager.getRepository(policy_entity_1.Policy);
                // Extract the last part of the quote number (after the last hyphen)
                const quoteNumberParts = quote.quoteNumber.split("-");
                // ------------------------
                // Generate policy number based on the quote number.
                // ------------------------
                const lastPart = quoteNumberParts[quoteNumberParts.length - 1];
                const newPolicy = policyRepository.create({
                    policyNumber: `PI-${lastPart}`,
                    event: quote.event,
                    policyHolder: quote.policyHolder,
                    payments: [savedPayment],
                    quote: quote,
                });
                const savedPolicy = await policyRepository.save(newPolicy);
                // console.log("Created policy from quote:", savedPolicy);
                // ------------------------
                // Update the payment record with the ID of the newly created policy.
                // ------------------------
                savedPayment.policyId = savedPolicy.id;
                await paymentRepository.save(savedPayment);
            }
        }
        // ------------------------
        // Commit the transaction if all operations were successful.
        // ------------------------
        await queryRunner.commitTransaction();
        // ------------------------
        // Fetch the complete payment record with all its relations to return in the response.
        // This ensures the frontend receives the most up-to-date and comprehensive data.
        // ------------------------
        // Fetch the complete payment with relations.
        // ------------------------
        const completePayment = await paymentRepository.findOne({
            where: { id: savedPayment.id },
            relations: [
                "policy",
                "policy.quote",
                "quote",
                "quote.policyHolder",
                "quote.event",
                "quote.event.venue",
            ],
        });
        res.status(201).json({
            message: "Payment processed successfully",
            payment: completePayment,
        });
        await eventLogger.logApiCall(req, res, startTime, {
            payment: completePayment,
        });
    }
    catch (error) {
        // ------------------------
        // Rollback the transaction in case of any error and return a 500 response.
        // ------------------------
        await queryRunner.rollbackTransaction();
        console.error("POST /api/v1/payment error:", error);
        res.status(500).json({
            error: "Failed to process payment",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
    finally {
        await queryRunner.release();
        // ------------------------
        // Release the query runner in the finally block.
        // ------------------------
    }
});
// --- POST /api/v1/payment/authorize-net ---
router.post("/authorize-net", authorizeNetLimiter, async (req, res) => {
    // ------------------------
    // Handles payment processing via the Authorize.Net payment gateway.
    // Expects quoteId, amount, and opaqueData (containing card details from Authorize.Net's Accept.js).
    // Uses a transaction for atomicity.
    // Applies stricter rate limiting.
    // ------------------------
    const queryRunner = data_source_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const { quoteId, amount, opaqueData } = req.body;
        //   console.log("Received payment request:", { quoteId, amount, opaqueData });
        // ------------------------
        // Validate required fields: quoteId, amount, and opaqueData.
        // ------------------------
        if (!quoteId || !amount || !opaqueData) {
            console.error("Missing required fields:", {
                quoteId,
                amount,
                opaqueData,
            });
            res.status(400).json({
                error: "Missing required fields. Need quoteId, amount, and opaqueData",
                received: { quoteId, amount, opaqueData },
            });
            return;
        }
        // ------------------------
        // Validate the structure of opaqueData.
        // ------------------------
        if (!opaqueData.dataDescriptor || !opaqueData.dataValue) {
            console.error("Invalid opaqueData format:", opaqueData);
            res.status(400).json({
                error: "Invalid opaqueData format. Need dataDescriptor and dataValue",
                received: opaqueData,
            });
            return;
        }
        // ------------------------
        // Format the amount to two decimal places, as required by Authorize.Net.
        // ------------------------
        const formattedAmount = parseFloat(amount).toFixed(2);
        // console.log("Formatted amount:", formattedAmount);
        // ------------------------
        // Create an OpaqueDataType object using the dataDescriptor and dataValue from opaqueData.
        // This represents the encrypted card information.
        // ------------------------
        const creditCard = new authorizenet_1.APIContracts.OpaqueDataType();
        creditCard.setDataDescriptor(opaqueData.dataDescriptor);
        creditCard.setDataValue(opaqueData.dataValue);
        // ------------------------
        // Set the payment type to OpaqueData (for credit card payments using Accept.js).
        // ------------------------
        const paymentType = new authorizenet_1.APIContracts.PaymentType();
        paymentType.setOpaqueData(creditCard);
        // ------------------------
        // Create the transaction request details.
        // Set transaction type to AuthCapture (authorize and capture in one step).
        // Set the payment details and amount.
        // ------------------------
        const transactionRequestType = new authorizenet_1.APIContracts.TransactionRequestType();
        transactionRequestType.setTransactionType(authorizenet_1.APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
        transactionRequestType.setPayment(paymentType);
        transactionRequestType.setAmount(formattedAmount);
        // ------------------------
        // Assemble the complete transaction request, including merchant authentication.
        // ------------------------
        const createRequest = new authorizenet_1.APIContracts.CreateTransactionRequest();
        createRequest.setMerchantAuthentication(merchantAuthenticationType);
        createRequest.setTransactionRequest(transactionRequestType);
        // console.log("Sending request to Authorize.Net...");
        // ------------------------
        // Create the controller for executing the Authorize.Net API call.
        // ------------------------
        const ctrl = new authorizenet_1.APIControllers.CreateTransactionController(createRequest.getJSON());
        // ------------------------
        // Execute the API call to Authorize.Net.
        // This is wrapped in a Promise to handle the asynchronous nature of the SDK's execute method.
        // ------------------------
        const response = await new Promise((resolve, reject) => {
            ctrl.execute(() => {
                const apiResponse = ctrl.getResponse();
                if (apiResponse) {
                    resolve(new authorizenet_1.APIContracts.CreateTransactionResponse(apiResponse));
                }
                else {
                    reject(new Error("No response from payment gateway"));
                }
            });
        });
        // ------------------------
        // Log the response from Authorize.Net for debugging.
        // ------------------------
        // console.log("Authorize.Net response:", {
        //   resultCode: response.getMessages().getResultCode(),
        //   responseCode: response.getTransactionResponse()?.getResponseCode(),
        //   message: response.getMessages().getMessage()[0]?.getText(),
        // });
        // Handle the response
        // ------------------------
        // Process the Authorize.Net response.
        // Check if the API call itself was successful (resultCode === OK).
        // Then check if the transaction was approved (responseCode === "1").
        // ------------------------
        if (response.getMessages().getResultCode() ===
            authorizenet_1.APIContracts.MessageTypeEnum.OK) {
            if (response.getTransactionResponse().getResponseCode() === "1") {
                // ------------------------
                // Transaction was successful.
                // Create a payment record in the database.
                // Convert the associated quote to a policy.
                // ------------------------
                const paymentRepository = queryRunner.manager.getRepository(payment_entity_1.Payment);
                const quoteRepository = queryRunner.manager.getRepository(quote_entity_1.Quote);
                // Create payment record
                // ------------------------
                // Create and save the Payment entity.
                // ------------------------
                const newPayment = paymentRepository.create({
                    amount: parseFloat(formattedAmount),
                    quoteId: parseInt(quoteId),
                    method: "Credit Card",
                    status: enums_1.PaymentStatus.SUCCESS,
                    reference: response.getTransactionResponse().getTransId(),
                });
                const savedPayment = await paymentRepository.save(newPayment);
                // Convert quote to policy
                // ------------------------
                // Fetch the associated quote.
                // ------------------------
                const quote = await quoteRepository.findOne({
                    where: { id: parseInt(quoteId) },
                    relations: ["event", "event.venue", "policyHolder"],
                });
                if (quote) {
                    // ------------------------
                    // Update the quote's status to COMPLETE.
                    // ------------------------
                    quote.status = enums_2.StepStatus.COMPLETE;
                    await quoteRepository.save(quote);
                    // ------------------------
                    // Create a new Policy entity from the quote.
                    // ------------------------
                    const policyRepository = queryRunner.manager.getRepository(policy_entity_1.Policy);
                    const quoteNumberParts = quote.quoteNumber.split("-");
                    const lastPart = quoteNumberParts[quoteNumberParts.length - 1];
                    // ------------------------
                    // Generate policy number.
                    // ------------------------
                    const newPolicy = policyRepository.create({
                        policyNumber: `PI-${lastPart}`,
                        event: quote.event,
                        policyHolder: quote.policyHolder,
                        payments: [savedPayment],
                        quote: quote,
                    });
                    const savedPolicy = await policyRepository.save(newPolicy);
                    // Update payment with policy ID
                    // ------------------------
                    // Link the payment to the newly created policy.
                    // ------------------------
                    savedPayment.policyId = savedPolicy.id;
                    await paymentRepository.save(savedPayment);
                }
                // ------------------------
                // Commit the transaction.
                // ------------------------
                await queryRunner.commitTransaction();
                // ------------------------
                // Fetch the complete payment record with relations for the response.
                // ------------------------
                // Fetch the complete payment with relations.
                // ------------------------
                const completePayment = await paymentRepository.findOne({
                    where: { id: savedPayment.id },
                    relations: [
                        "policy",
                        "policy.quote",
                        "quote",
                        "quote.policyHolder",
                        "quote.event",
                        "quote.event.venue",
                    ],
                });
                res.status(201).json({
                    message: "Payment processed successfully",
                    payment: completePayment,
                    transactionId: response.getTransactionResponse().getTransId(),
                });
            }
            else {
                // ------------------------
                // Transaction was declined by Authorize.Net.
                // Rollback the transaction and return an error response.
                // ------------------------
                const errorMessage = response
                    .getTransactionResponse()
                    .getErrors()[0]
                    .getErrorText();
                await queryRunner.rollbackTransaction();
                res.status(400).json({
                    error: "Payment failed",
                    message: errorMessage,
                    responseCode: response.getTransactionResponse().getResponseCode(),
                });
            }
        }
        else {
            // ------------------------
            // The API call to Authorize.Net itself failed (e.g., authentication error).
            // Rollback the transaction and return an error response.
            // ------------------------
            const errorMessage = response.getMessages().getMessage()[0].getText();
            await queryRunner.rollbackTransaction();
            res.status(400).json({
                error: "Payment processing failed",
                message: errorMessage,
                resultCode: response.getMessages().getResultCode(),
            });
        }
    }
    catch (error) {
        // ------------------------
        // Catch any other unexpected errors, rollback the transaction, and return a 500 response.
        // ------------------------
        await queryRunner.rollbackTransaction();
        console.error("POST /api/v1/payment/authorize-net error:", error);
        res.status(500).json({
            error: "Failed to process payment",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
    finally {
        await queryRunner.release();
        // ------------------------
        // Release the query runner.
        // ------------------------
    }
});
exports.default = router;
//# sourceMappingURL=payment.routes.js.map