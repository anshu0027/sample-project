// my-backend/src/routes/v1/payment.routes.ts
import { Router, Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import { Payment } from "../../entities/payment.entity";
import { PaymentStatus } from "../../entities/enums";
import { FindOptionsWhere } from "typeorm";
import { Quote } from "../../entities/quote.entity";
import { Policy } from "../../entities/policy.entity";
import { StepStatus } from "../../entities/enums";
import { APIContracts, APIControllers } from "authorizenet"; // Removed "Constants" as it was not used.
import rateLimit from "express-rate-limit";

// ------------------------
// Router for handling payment-related API endpoints.
// Base path: /api/v1/payment
// ------------------------
const router = Router();

// ------------------------
// Rate limiter for manual payment creation endpoint.
// Limits each IP to 10 manual payment creations per hour.
// ------------------------
const manualPaymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // Limit each IP to 10 manual payment creations per hour
  message: "Too many payment creation attempts, please try again later.",
});

// ------------------------
// Stricter rate limiter for the Authorize.Net payment gateway endpoint.
// Limits each IP to 5 Authorize.Net attempts per 15 minutes.
// ------------------------
const authorizeNetLimiter = rateLimit({
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
const merchantAuthenticationType =
  new APIContracts.MerchantAuthenticationType();
merchantAuthenticationType.setName(apiLoginId!);
merchantAuthenticationType.setTransactionKey(transactionKey!);
// ------------------------
// Helper function to map internal payment status enums to more user-friendly strings
// for display on the frontend.
// ------------------------
const mapPaymentStatus = (payment: Payment) => {
  if (!payment) return null;
  return {
    ...payment,
    status:
      payment.status === PaymentStatus.SUCCESS
        ? "Completed"
        : payment.status === PaymentStatus.FAILED
        ? "Failed"
        : payment.status,
  };
};

// --- GET /api/v1/payment ---
// --- GET /api/v1/payment/:id ---
// ------------------------
// Handles fetching a single payment by its ID.
// ------------------------
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const paymentRepository = AppDataSource.getRepository(Payment);

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
      return;
    }
    res.json({ payment: mapPaymentStatus(payment) });
  } catch (error) {
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
router.get("/", async (req: Request, res: Response) => {
  try {
    const { policyId, quoteId } = req.query;
    const paymentRepository = AppDataSource.getRepository(Payment);

    // ------------------------
    // Build the 'where' clause for filtering based on query parameters.
    // ------------------------
    const where: FindOptionsWhere<Payment> = {};
    if (policyId) where.policyId = Number(policyId);
    if (quoteId) where.quoteId = Number(quoteId);

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
  } catch (error) {
    // ------------------------
    // Error handling for GET /api/v1/payment.
    // ------------------------
    console.error("GET /api/payment error:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

// --- POST /api/v1/payment ---
router.post("/", manualPaymentLimiter, async (req: Request, res: Response) => {
  // ------------------------
  // Handles manual creation of a payment record.
  // This is typically used for offline payments or admin-initiated payment entries.
  // Uses a transaction to ensure atomicity, especially if a quote needs to be converted to a policy.
  // Applies rate limiting.
  // ------------------------
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const { amount, quoteId, policyId, method, status, reference } = req.body;
    console.log("Received payment request:", {
      amount,
      quoteId,
      policyId,
      method,
      status,
      reference,
    });

    // ------------------------
    // Validate required fields for payment creation.
    // Amount, status, and either quoteId or policyId are mandatory.
    // ------------------------
    // Check if either quoteId or policyId is provided.
    // Amount and status are always required.
    // ------------------------
    if (!amount || (!quoteId && !policyId) || !status) {
      res.status(400).json({
        error:
          "Missing required fields. Need amount, status, and either quoteId or policyId",
        received: { amount, quoteId, policyId, status },
      });
      return;
    }

    // ------------------------
    // Validate that the provided status is a valid PaymentStatus enum value.
    // ------------------------
    const validStatuses = Object.values(PaymentStatus);
    if (!validStatuses.includes(status as PaymentStatus)) {
      res.status(400).json({
        error: `Invalid payment status: ${status}`,
        validStatuses,
        received: status,
      });
      return;
    }

    const paymentRepository = queryRunner.manager.getRepository(Payment);
    const quoteRepository = queryRunner.manager.getRepository(Quote);

    // ------------------------
    // Create a new Payment entity with the provided data.
    // ------------------------
    const newPayment = paymentRepository.create({
      amount: parseFloat(amount),
      quoteId: quoteId ? parseInt(quoteId) : undefined,
      policyId: policyId ? parseInt(policyId) : undefined,
      method: method || "Online",
      status: status as PaymentStatus,
      reference: reference || `PAY-${Date.now()}`,
    });

    console.log("Creating payment:", newPayment);
    const savedPayment = await paymentRepository.save(newPayment);
    console.log("Saved payment:", savedPayment);

    // ------------------------
    // If the payment status is SUCCESS and a quoteId is provided,
    // attempt to convert the associated quote to a policy.
    // This involves updating the quote status and creating a new policy record.
    // ------------------------
    if (status === PaymentStatus.SUCCESS && quoteId) {
      const quote = await quoteRepository.findOne({
        where: { id: parseInt(quoteId) },
        relations: ["event", "event.venue", "policyHolder"],
      });

      if (quote) {
        // ------------------------
        // Update the quote's status to COMPLETE.
        // ------------------------
        quote.status = StepStatus.COMPLETE;
        await quoteRepository.save(quote);

        // ------------------------
        // Create a new Policy entity from the quote details.
        // The policy number is derived from the quote number.
        // ------------------------
        const policyRepository = queryRunner.manager.getRepository(Policy);
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
        console.log("Created policy from quote:", savedPolicy);

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
  } catch (error) {
    // ------------------------
    // Rollback the transaction in case of any error and return a 500 response.
    // ------------------------
    await queryRunner.rollbackTransaction();
    console.error("POST /api/v1/payment error:", error);
    res.status(500).json({
      error: "Failed to process payment",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  } finally {
    await queryRunner.release();
    // ------------------------
    // Release the query runner in the finally block.
    // ------------------------
  }
});

// --- POST /api/v1/payment/authorize-net ---
router.post(
  "/authorize-net",
  authorizeNetLimiter,
  async (req: Request, res: Response) => {
    // ------------------------
    // Handles payment processing via the Authorize.Net payment gateway.
    // Expects quoteId, amount, and opaqueData (containing card details from Authorize.Net's Accept.js).
    // Uses a transaction for atomicity.
    // Applies stricter rate limiting.
    // ------------------------
    const queryRunner = AppDataSource.createQueryRunner();
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
          error:
            "Missing required fields. Need quoteId, amount, and opaqueData",
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
      console.log("Formatted amount:", formattedAmount);

      // ------------------------
      // Create an OpaqueDataType object using the dataDescriptor and dataValue from opaqueData.
      // This represents the encrypted card information.
      // ------------------------
      const creditCard = new APIContracts.OpaqueDataType();
      creditCard.setDataDescriptor(opaqueData.dataDescriptor);
      creditCard.setDataValue(opaqueData.dataValue);

      // ------------------------
      // Set the payment type to OpaqueData (for credit card payments using Accept.js).
      // ------------------------
      const paymentType = new APIContracts.PaymentType();
      paymentType.setOpaqueData(creditCard);

      // ------------------------
      // Create the transaction request details.
      // Set transaction type to AuthCapture (authorize and capture in one step).
      // Set the payment details and amount.
      // ------------------------
      const transactionRequestType = new APIContracts.TransactionRequestType();
      transactionRequestType.setTransactionType(
        APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION
      );
      transactionRequestType.setPayment(paymentType);
      transactionRequestType.setAmount(formattedAmount);

      // ------------------------
      // Assemble the complete transaction request, including merchant authentication.
      // ------------------------
      const createRequest = new APIContracts.CreateTransactionRequest();
      createRequest.setMerchantAuthentication(merchantAuthenticationType);
      createRequest.setTransactionRequest(transactionRequestType);

      console.log("Sending request to Authorize.Net...");
      // ------------------------
      // Create the controller for executing the Authorize.Net API call.
      // ------------------------
      const ctrl = new APIControllers.CreateTransactionController(
        createRequest.getJSON()
      );

      // ------------------------
      // Execute the API call to Authorize.Net.
      // This is wrapped in a Promise to handle the asynchronous nature of the SDK's execute method.
      // ------------------------
      const response =
        await new Promise<APIContracts.CreateTransactionResponse>(
          (resolve, reject) => {
            ctrl.execute(() => {
              const apiResponse = ctrl.getResponse();
              if (apiResponse) {
                resolve(
                  new APIContracts.CreateTransactionResponse(apiResponse)
                );
              } else {
                reject(new Error("No response from payment gateway"));
              }
            });
          }
        );

      // ------------------------
      // Log the response from Authorize.Net for debugging.
      // ------------------------
      console.log("Authorize.Net response:", {
        resultCode: response.getMessages().getResultCode(),
        responseCode: response.getTransactionResponse()?.getResponseCode(),
        message: response.getMessages().getMessage()[0]?.getText(),
      });

      // Handle the response
      // ------------------------
      // Process the Authorize.Net response.
      // Check if the API call itself was successful (resultCode === OK).
      // Then check if the transaction was approved (responseCode === "1").
      // ------------------------
      if (
        response.getMessages().getResultCode() ===
        APIContracts.MessageTypeEnum.OK
      ) {
        if (response.getTransactionResponse().getResponseCode() === "1") {
          // ------------------------
          // Transaction was successful.
          // Create a payment record in the database.
          // Convert the associated quote to a policy.
          // ------------------------
          const paymentRepository = queryRunner.manager.getRepository(Payment);
          const quoteRepository = queryRunner.manager.getRepository(Quote);

          // Create payment record
          // ------------------------
          // Create and save the Payment entity.
          // ------------------------
          const newPayment = paymentRepository.create({
            amount: parseFloat(formattedAmount),
            quoteId: parseInt(quoteId),
            method: "Credit Card",
            status: PaymentStatus.SUCCESS,
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
            quote.status = StepStatus.COMPLETE;
            await quoteRepository.save(quote);

            // ------------------------
            // Create a new Policy entity from the quote.
            // ------------------------
            const policyRepository = queryRunner.manager.getRepository(Policy);
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
        } else {
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
      } else {
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
    } catch (error) {
      // ------------------------
      // Catch any other unexpected errors, rollback the transaction, and return a 500 response.
      // ------------------------
      await queryRunner.rollbackTransaction();
      console.error("POST /api/v1/payment/authorize-net error:", error);
      res.status(500).json({
        error: "Failed to process payment",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      await queryRunner.release();
      // ------------------------
      // Release the query runner.
      // ------------------------
    }
  }
);

export default router;
