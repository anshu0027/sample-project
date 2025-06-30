import { Router, Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import { Quote } from "../../entities/quote.entity";
import { User } from "../../entities/user.entity";
import { Event } from "../../entities/event.entity";
import { Venue } from "../../entities/venue.entity";
import { PolicyHolder } from "../../entities/policy-holder.entity";
// import { Policy } from "../../entities/policy.entity";
import { Payment } from "../../entities/payment.entity";
import { QuoteSource, StepStatus } from "../../entities/enums";
import { createPolicyFromQuote } from "../../services/policy.service";
import { PaymentStatus } from "../../entities/enums";
import {
  generateQuoteNumber,
  calculateBasePremium,
  calculateLiabilityPremium,
  calculateLiquorLiabilityPremium,
  mapMaxGuestsToGuestRange,
  CoverageLevel,
  LiabilityOption,
} from "../../utils/quote.utils";
import { rateLimit } from "express-rate-limit";
import { createClerkClient, verifyToken } from "@clerk/backend";
import dotenv from "dotenv";
import { SentryService } from "../../services/sentry.service";
import { SentryErrorService } from "../../services/sentry-error.service";
// import { MoreThanOrEqual } from "typeorm";

dotenv.config();

// Check if Clerk secret key is configured
if (!process.env.CLERK_SECRET_KEY) {
  console.error("CLERK_SECRET_KEY is not configured in environment variables");
}

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

// ------------------------
// Authentication middleware for admin routes
// ------------------------
const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: Function
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "No authorization token provided" });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Try to verify as a session token first
    let session;
    try {
      session = await clerkClient.sessions.verifySession(token, "");
    } catch (sessionError) {
      // If session verification fails, try to verify as a JWT token
      try {
        const payload = await verifyToken(token, {
          secretKey: process.env.CLERK_SECRET_KEY,
        });
        if (payload) {
          // Token is valid, create a mock session object
          session = { id: payload.sub || "unknown" };
        } else {
          throw new Error("Invalid token");
        }
      } catch (jwtError) {
        console.error("Both session and JWT verification failed:", {
          sessionError,
          jwtError,
        });
        throw new Error("Token verification failed");
      }
    }

    if (!session) {
      res.status(401).json({ error: "Invalid authentication token" });
      return;
    }

    // Add user info to request for later use
    (req as any).user = { sessionId: session.id };
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ error: "Authentication failed" });
    return;
  }
};

// ------------------------
// Rate limiter for quote creation to prevent abuse.
// Limits each IP to 10 quote creations per hour.
// ------------------------
const quoteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 500, // limit each IP to 10 quote creations per hour
});
// import { In } from 'typeorm';

// ------------------------
// Router for handling quote-related API endpoints.
// Base path: /api/v1/quotes
// ------------------------
const router = Router();
const sentryService = SentryService.getInstance();
const sentryErrorService = SentryErrorService.getInstance();

// --- GET /api/v1/quotes ---
router.get("/", async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { quoteNumber, id, email, allQuotes, page, pageSize } = req.query;
    const quoteRepository = AppDataSource.getRepository(Quote);
    // ------------------------
    // Define relations to be loaded with the quote(s).
    // This helps in fetching related entities like event, venue, policyHolder, etc.
    // ------------------------
    const relations = [
      "event",
      "event.venue",
      "policyHolder",
      "policy",
      "payments",
    ];

    // ------------------------
    // Handle fetching a single quote by its quoteNumber.
    // ------------------------
    if (quoteNumber) {
      const quote = await quoteRepository.findOne({
        where: { quoteNumber: String(quoteNumber) },
        relations,
      });
      // ------------------------
      // If quote not found, return 404.
      // ------------------------
      if (!quote) {
        res.status(404).json({ error: "Quote not found" });
        await sentryService.logApiCall(req, res, startTime, undefined);
        return;
      }
      res.json({ quote });
      await sentryService.logApiCall(req, res, startTime, { quote });
      return;
    }

    // ------------------------
    // Handle fetching a single quote by its ID.
    // ------------------------
    if (id) {
      const quote = await quoteRepository.findOne({
        where: { id: Number(id) },
        relations,
      });
      // ------------------------
      // If quote not found, return 404.
      // ------------------------
      if (!quote) {
        res.status(404).json({ error: "Quote not found" });
        await sentryService.logApiCall(req, res, startTime, undefined);
        return;
      }
      res.json({ quote });
      await sentryService.logApiCall(req, res, startTime, { quote });
      return;
    }

    // ------------------------
    // Handle fetching the latest quote by email.
    // ------------------------
    if (email) {
      const quote = await quoteRepository.findOne({
        where: { email: String(email) },
        order: { createdAt: "DESC" },
        relations,
      });
      if (!quote) {
        // ------------------------
        // If quote not found for the email, return 404.
        // ------------------------
        res.status(404).json({ error: "Quote not found" });
        await sentryService.logApiCall(req, res, startTime, undefined);
        return;
      }
      res.json({ quote });
      await sentryService.logApiCall(req, res, startTime, { quote });
      return;
    }

    // ------------------------
    // Handle paginated quotes fetching
    // ------------------------
    if (page && pageSize) {
      const currentPage = parseInt(String(page), 10);
      const limit = parseInt(String(pageSize), 10);
      const offset = (currentPage - 1) * limit;

      const [quotes, total] = await quoteRepository.findAndCount({
        order: { createdAt: "DESC" },
        relations,
        skip: offset,
        take: limit,
      });

      res.json({
        quotes,
        total,
        currentPage,
        totalPages: Math.ceil(total / limit),
        hasNextPage: currentPage < Math.ceil(total / limit),
        hasPreviousPage: currentPage > 1,
      });
      return;
    }

    // ------------------------
    // Handle fetching all quotes if 'allQuotes' query parameter is present.
    // ------------------------
    if (allQuotes) {
      const quotes = await quoteRepository.find({
        order: { createdAt: "DESC" },
        relations,
      });
      console.log("Quotes from database:", JSON.stringify(quotes, null, 2));
      res.json({ quotes });
      await sentryService.logApiCall(req, res, startTime, { quotes });
      return;
    }

    // ------------------------
    // Default behavior: Fetch all quotes with status 'COMPLETE'.
    // This is typically used for listing policies derived from completed quotes.
    // ------------------------
    const quotes = await quoteRepository.find({
      where: { status: StepStatus.COMPLETE },
      order: { createdAt: "DESC" },
      relations,
    });
    res.json({ policies: quotes });
    await sentryService.logApiCall(req, res, startTime, { policies: quotes });
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
    // Error handling for GET /api/v1/quotes.
    // ------------------------
    console.error("GET /api/v1/quotes error:", error);
    res.status(500).json({ error: "Failed to fetch quotes/policies" });
  }
});

// --- POST /api/v1/quotes ---
// Replace the existing POST handler in my-backend/src/routes/v1/quote.routes.ts
// ------------------------
// Handles the creation of a new quote.
// Applies rate limiting to prevent abuse.
// Applies authentication for admin requests.
// ------------------------
router.post("/", quoteLimiter, async (req: Request, res: Response) => {
  const startTime = Date.now();
  console.log("Request Body:", req.body);

  try {
    // ------------------------
    // Extract fields from the request body.
    // Determine if the request is from an admin based on 'source' or 'referer'.
    // ------------------------
    const fields = req.body;
    const { source = "CUSTOMER", paymentStatus } = fields;
    console.log("Source:", source);
    console.log("Payment Status:", paymentStatus);

    const referer = req.get("referer");
    console.log("Referer:", referer);
    const isAdminRequest =
      source === "ADMIN" || (referer && referer.includes("/admin/"));
    console.log("Is Admin Request:", isAdminRequest);

    // ------------------------
    // Apply authentication for admin requests
    // ------------------------
    if (isAdminRequest) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res
          .status(401)
          .json({ error: "No authorization token provided for admin request" });
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      try {
        // Try to verify as a session token first
        let session;
        try {
          session = await clerkClient.sessions.verifySession(token, "");
        } catch (sessionError) {
          // If session verification fails, try to verify as a JWT token
          try {
            const payload = await verifyToken(token, {
              secretKey: process.env.CLERK_SECRET_KEY,
            });
            if (payload) {
              // Token is valid, create a mock session object
              session = { id: payload.sub || "unknown" };
            } else {
              throw new Error("Invalid token");
            }
          } catch (jwtError) {
            console.error("Both session and JWT verification failed:", {
              sessionError,
              jwtError,
            });
            throw new Error("Token verification failed");
          }
        }

        if (!session) {
          res
            .status(401)
            .json({ error: "Invalid authentication token for admin request" });
          return;
        }
        // Add user info to request for later use
        (req as any).user = { sessionId: session.id };
      } catch (error) {
        console.error("Authentication error for admin request:", error);
        res
          .status(401)
          .json({ error: "Authentication failed for admin request" });
        return;
      }
    }

    const effectiveSource = isAdminRequest
      ? QuoteSource.ADMIN
      : QuoteSource.CUSTOMER;

    // ------------------------
    // Validate that email is provided.
    // ------------------------
    if (!fields.email) {
      res.status(400).json({ error: "Missing user email." });
      return;
    }

    // --- Duplicate Quote Detection ---
    // ------------------------
    // Check if a quote with identical data already exists for this user within the last 5 minutes.
    // This prevents duplicate quotes from accidental double-clicks or form resubmissions.
    // ------------------------
    const quoteRepository = AppDataSource.getRepository(Quote);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago

    // Use query builder to check both quote and event fields
    const existingQuote = await quoteRepository
      .createQueryBuilder("quote")
      .leftJoinAndSelect("quote.event", "event")
      .where("quote.email = :email", { email: fields.email })
      .andWhere("quote.createdAt >= :fiveMinutesAgo", { fiveMinutesAgo })
      .andWhere("quote.residentState = :residentState", {
        residentState: fields.residentState,
      })
      .andWhere("quote.coverageLevel = :coverageLevel", {
        coverageLevel: fields.coverageLevel,
      })
      .andWhere("quote.liabilityCoverage = :liabilityCoverage", {
        liabilityCoverage: fields.liabilityCoverage,
      })
      .andWhere("quote.liquorLiability = :liquorLiability", {
        liquorLiability: fields.liquorLiability,
      })
      .andWhere("quote.covidDisclosure = :covidDisclosure", {
        covidDisclosure: fields.covidDisclosure,
      })
      .andWhere("quote.specialActivities = :specialActivities", {
        specialActivities: fields.specialActivities,
      })
      .andWhere("quote.totalPremium = :totalPremium", {
        totalPremium: fields.totalPremium,
      })
      .andWhere("quote.basePremium = :basePremium", {
        basePremium: fields.basePremium,
      })
      .andWhere("quote.liabilityPremium = :liabilityPremium", {
        liabilityPremium: fields.liabilityPremium,
      })
      .andWhere("quote.liquorLiabilityPremium = :liquorLiabilityPremium", {
        liquorLiabilityPremium: fields.liquorLiabilityPremium,
      })
      .andWhere("quote.source = :source", { source: effectiveSource })
      .andWhere("event.eventType = :eventType", { eventType: fields.eventType })
      .andWhere("event.maxGuests = :maxGuests", { maxGuests: fields.maxGuests })
      .andWhere("event.eventDate = :eventDate", {
        eventDate: fields.eventDate ? new Date(fields.eventDate) : null,
      })
      .orderBy("quote.createdAt", "DESC")
      .getOne();

    if (existingQuote) {
      console.log(
        "Duplicate quote detected, returning existing quote:",
        existingQuote.quoteNumber
      );
      res.json({
        quote: existingQuote,
        message: "Duplicate quote detected. Returning existing quote.",
        isDuplicate: true,
      });
      await sentryService.logApiCall(req, res, startTime, {
        quote: existingQuote,
      });
      return;
    }

    // --- User Handling ---
    // ------------------------
    // Find an existing user by email or create a new one.
    // ------------------------
    const userRepository = AppDataSource.getRepository(User);
    let user = await userRepository.findOneBy({ email: fields.email });
    console.log("User:", user);
    if (!user) {
      user = userRepository.create({
        email: fields.email,
      });
      await userRepository.save(user);
    }

    // --- Create explicit data objects for each entity ---
    // ------------------------
    // Prepare data for the Quote entity.
    // ------------------------
    const quoteData = {
      residentState: fields.residentState,
      email: fields.email,
      coverageLevel: fields.coverageLevel,
      liabilityCoverage: fields.liabilityCoverage,
      liquorLiability: fields.liquorLiability,
      covidDisclosure: fields.covidDisclosure,
      specialActivities: fields.specialActivities,
      totalPremium: fields.totalPremium,
      basePremium: fields.basePremium,
      liabilityPremium: fields.liabilityPremium,
      liquorLiabilityPremium: fields.liquorLiabilityPremium,
    };
    // ------------------------
    // Create and save the new Quote entity.
    // ------------------------

    console.log("Quote Repository:", quoteRepository);
    const newQuote = quoteRepository.create({
      ...quoteData,
      quoteNumber: generateQuoteNumber(),
      status: StepStatus.STEP1,
      source: effectiveSource,
      isCustomerGenerated: effectiveSource === QuoteSource.CUSTOMER,
      user: user,
    });
    console.log("New Quote:", newQuote);
    // ------------------------
    // If event details are provided, create and associate an Event entity.
    // ------------------------
    if (fields.eventType && fields.eventDate && fields.maxGuests) {
      const eventData = {
        eventType: fields.eventType,
        eventDate: new Date(fields.eventDate),
        maxGuests: fields.maxGuests,
        honoree1FirstName: fields.honoree1FirstName,
        honoree1LastName: fields.honoree1LastName,
        honoree2FirstName: fields.honoree2FirstName,
        honoree2LastName: fields.honoree2LastName,
      };
      const eventRepository = AppDataSource.getRepository(Event);
      const newEvent = eventRepository.create(eventData);
      // ------------------------
      // If venue details are provided, create and associate a Venue entity with the event.
      // ------------------------
      if (fields.venueName) {
        const venueRepository = AppDataSource.getRepository(Venue);
        console.log("Venue Repository:", venueRepository);
        const venueData = {
          name: fields.venueName,
          address1: fields.venueAddress1,
          address2: fields.venueAddress2,
          country: fields.venueCountry,
          city: fields.venueCity,
          state: fields.venueState,
          zip: fields.venueZip,
          ceremonyLocationType: fields.ceremonyLocationType,
          indoorOutdoor: fields.indoorOutdoor,
          receptionLocationType: fields.receptionLocationType,
          receptionIndoorOutdoor: fields.receptionIndoorOutdoor,
          receptionAddress1: fields.receptionAddress1,
          receptionAddress2: fields.receptionAddress2,
          receptionCity: fields.receptionCity,
          receptionState: fields.receptionState,
          receptionZip: fields.receptionZip,
          receptionCountry: fields.receptionCountry,
          receptionVenueAsInsured: fields.receptionVenueAsInsured,
          brunchLocationType: fields.brunchLocationType,
          brunchIndoorOutdoor: fields.brunchIndoorOutdoor,
          brunchAddress1: fields.brunchAddress1,
          brunchAddress2: fields.brunchAddress2,
          brunchCity: fields.brunchCity,
          brunchState: fields.brunchState,
          brunchZip: fields.brunchZip,
          brunchCountry: fields.brunchCountry,
          brunchVenueAsInsured: fields.brunchVenueAsInsured,
          rehearsalLocationType: fields.rehearsalLocationType,
          rehearsalIndoorOutdoor: fields.rehearsalIndoorOutdoor,
          rehearsalAddress1: fields.rehearsalAddress1,
          rehearsalAddress2: fields.rehearsalAddress2,
          rehearsalCity: fields.rehearsalCity,
          rehearsalState: fields.rehearsalState,
          rehearsalZip: fields.rehearsalZip,
          rehearsalCountry: fields.rehearsalCountry,
          rehearsalVenueAsInsured: fields.rehearsalVenueAsInsured,
          rehearsalDinnerLocationType: fields.rehearsalDinnerLocationType,
          rehearsalDinnerIndoorOutdoor: fields.rehearsalDinnerIndoorOutdoor,
          rehearsalDinnerAddress1: fields.rehearsalDinnerAddress1,
          rehearsalDinnerAddress2: fields.rehearsalDinnerAddress2,
          rehearsalDinnerCity: fields.rehearsalDinnerCity,
          rehearsalDinnerState: fields.rehearsalDinnerState,
          rehearsalDinnerZip: fields.rehearsalDinnerZip,
          rehearsalDinnerCountry: fields.rehearsalDinnerCountry,
          rehearsalDinnerVenueAsInsured: fields.rehearsalDinnerVenueAsInsured,
        };
        newEvent.venue = venueRepository.create(venueData);
        // Don't save venue here - let it be saved with the event
        console.log("New Event:", newEvent);
      }
      newQuote.event = newEvent;
      console.log("New Quote:", newQuote);
    }

    // ------------------------
    // If policy holder details are provided, create and associate a PolicyHolder entity.
    // ------------------------
    if (fields.firstName && fields.lastName) {
      const policyHolderRepository = AppDataSource.getRepository(PolicyHolder);
      console.log("Policy Holder Repository:", policyHolderRepository);
      const policyHolderData = {
        firstName: fields.firstName,
        lastName: fields.lastName,
        phone: fields.phone,
        relationship: fields.relationship,
        hearAboutUs: fields.hearAboutUs,
        address: fields.address,
        country: fields.country,
        city: fields.city,
        state: fields.state,
        zip: fields.zip,
        legalNotices: fields.legalNotices,
        completingFormName: fields.completingFormName,
      };
      newQuote.policyHolder = policyHolderRepository.create(policyHolderData);
      // Explicitly save the policy holder
      await policyHolderRepository.save(newQuote.policyHolder);
      console.log("New Policy Holder:", newQuote.policyHolder);
    }

    // ------------------------
    // Save the quote and its related entities (event, policyHolder).
    // ------------------------
    // Explicitly save the event if it was created (this will also save the venue)
    if (newQuote.event) {
      await AppDataSource.getRepository(Event).save(newQuote.event);
    }
    console.log("New Quote:", newQuote);
    const savedQuote = await quoteRepository.save(newQuote);
    console.log("Saved quote:", JSON.stringify(savedQuote, null, 2));

    // --- START: AUTO-CONVERSION LOGIC ---
    // ------------------------
    // If the quote is customer-generated and payment status is 'SUCCESS',
    // automatically convert the quote to a policy and create a payment record.
    // ------------------------
    if (
      savedQuote.source === QuoteSource.CUSTOMER &&
      paymentStatus === "SUCCESS"
    ) {
      const policy = await createPolicyFromQuote(savedQuote.id);
      console.log("Policy:", policy);
      if (policy && fields.totalPremium) {
        const paymentRepository = AppDataSource.getRepository(Payment);
        const newPayment = paymentRepository.create({
          quoteId: savedQuote.id,
          policyId: policy.id,
          amount: parseFloat(fields.totalPremium.toString()),
          status: PaymentStatus.SUCCESS,
          method: "online",
          reference: `payment-${Date.now()}`,
        });
        await paymentRepository.save(newPayment);
      }
      console.log("New Payment:", Payment);
      res.status(201).json({
        quoteNumber: savedQuote.quoteNumber,
        quote: savedQuote,
        policy: policy,
        converted: true,
      });
      await sentryService.logApiCall(req, res, startTime, {
        quoteNumber: savedQuote.quoteNumber,
        quote: savedQuote,
        policy: policy,
        converted: true,
      });
      return; // End the request here
    }
    // --- END: AUTO-CONVERSION LOGIC ---

    // ------------------------
    // If auto-conversion didn't happen, send the standard success response.
    // ------------------------
    // If auto-conversion didn't happen, send the standard response
    res.status(201).json({
      message: "Quote saved successfully",
      quoteNumber: savedQuote.quoteNumber,
      quote: savedQuote,
    });
    await sentryService.logApiCall(req, res, startTime, {
      message: "Quote saved successfully",
      quoteNumber: savedQuote.quoteNumber,
      quote: savedQuote,
    });
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
    // Error handling for POST /api/v1/quotes.
    // Specifically checks for Oracle unique constraint violation (ORA-00001).
    // ------------------------
    console.error("Quote creation error:", error);
    console.error("POST /api/v1/quotes error:", error);
    const message = error instanceof Error ? error.message : "Server error";
    console.error("POST /api/v1/quotes error:", error);
    // @ts-ignore - Check for Oracle's unique constraint error code
    if (error.message && error.message.includes("ORA-00001")) {
      // ------------------------
      // Return 409 Conflict if a unique constraint is violated.
      // ------------------------
      res.status(409).json({
        error:
          "A record with this unique value already exists. Please try again.",
      });
    } else {
      res.status(500).json({ error: message });
    }
  }
});

// --- PUT /api/v1/quotes/:quoteNumber ---
// ------------------------
// Handles updating an existing quote by its quoteNumber.
// ------------------------
router.put("/:quoteNumber", async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { quoteNumber } = req.params;
    const fields = req.body;

    console.log("Updating quote:", quoteNumber, "with fields:", fields);

    // ------------------------
    // Fetch the quote to be updated, including its relations.
    // ------------------------
    const quoteRepository = AppDataSource.getRepository(Quote);
    const quoteToUpdate = await quoteRepository.findOne({
      where: { quoteNumber },
      relations: ["event", "event.venue", "policyHolder", "user"],
    });

    if (!quoteToUpdate) {
      // ------------------------
      // If quote not found, return 404.
      // ------------------------
      res
        .status(404)
        .json({ error: `Quote with number ${quoteNumber} not found.` });
      return;
    }

    // Handle premium recalculation if needed
    // ------------------------
    // If coverage-related fields are changed, recalculate premiums.
    // ------------------------
    const needsPremiumRecalculation =
      fields.coverageLevel !== undefined ||
      fields.liabilityCoverage !== undefined ||
      fields.liquorLiability !== undefined ||
      fields.maxGuests !== undefined;

    if (needsPremiumRecalculation) {
      const coverageLevel = fields.coverageLevel ?? quoteToUpdate.coverageLevel;
      const liabilityCoverage =
        fields.liabilityCoverage ?? quoteToUpdate.liabilityCoverage;
      const liquorLiability =
        fields.liquorLiability ?? quoteToUpdate.liquorLiability;
      const maxGuests = fields.maxGuests ?? quoteToUpdate.event?.maxGuests;

      const guestRange = mapMaxGuestsToGuestRange(maxGuests);

      fields.basePremium = calculateBasePremium(coverageLevel as CoverageLevel);
      fields.liabilityPremium = calculateLiabilityPremium(
        liabilityCoverage as LiabilityOption
      );
      fields.liquorLiabilityPremium = calculateLiquorLiabilityPremium(
        liquorLiability,
        guestRange,
        liabilityCoverage as LiabilityOption // Use the correct liabilityCoverage variable
      );
      fields.totalPremium =
        fields.basePremium +
        fields.liabilityPremium +
        fields.liquorLiabilityPremium;
    }

    // ------------------------
    // Merge the updated fields into the quote entity.
    // ------------------------
    // Update quote fields
    quoteRepository.merge(quoteToUpdate, fields);

    // Update step status based on what data is being updated
    // Only auto-determine status if no explicit status is provided
    if (!fields.status) {
      if (fields.firstName || fields.lastName) {
        // If policy holder data is being updated, move to STEP3
        quoteToUpdate.status = StepStatus.STEP3;
      } else if (fields.eventType || fields.venueName) {
        // If event/venue data is being updated, move to STEP2
        quoteToUpdate.status = StepStatus.STEP2;
      } else {
        quoteToUpdate.status = StepStatus.STEP1;
      }
    }
    // If fields.status is provided, it will be used as-is from the merge above

    // ------------------------
    // Handle updates to the related Event entity.
    // ------------------------
    // Handle event updates
    const eventRepository = AppDataSource.getRepository(Event);
    if (
      fields.eventType ||
      fields.eventDate ||
      fields.maxGuests ||
      fields.honoree1FirstName ||
      fields.honoree1LastName ||
      fields.honoree2FirstName ||
      fields.honoree2LastName
    ) {
      let event = quoteToUpdate.event;
      if (!event) {
        event = eventRepository.create();
        quoteToUpdate.event = event;
      }

      // Ensure required fields are present
      if (!fields.eventType) {
        throw new Error("Event type is required");
      }

      const eventFields = {
        eventType: fields.eventType,
        eventDate: fields.eventDate ? new Date(fields.eventDate) : new Date(), // Default to current date if not provided
        maxGuests: fields.maxGuests || 0, // Default to 0 if not provided
        honoree1FirstName: fields.honoree1FirstName || "",
        honoree1LastName: fields.honoree1LastName || "",
        honoree2FirstName: fields.honoree2FirstName || "",
        honoree2LastName: fields.honoree2LastName || "",
        quoteId: quoteToUpdate.id,
      };

      console.log("Creating/updating event with fields:", eventFields);
      eventRepository.merge(event, eventFields);
      await eventRepository.save(event);
    }

    // ------------------------
    // Handle updates to the related Venue entity (associated with the event).
    // ------------------------
    // Handle venue updates
    const venueRepository = AppDataSource.getRepository(Venue);
    if (
      quoteToUpdate.event &&
      (fields.venueName ||
        fields.venueAddress1 ||
        fields.venueAddress2 ||
        fields.venueCity ||
        fields.venueState ||
        fields.venueZip ||
        fields.venueCountry ||
        fields.ceremonyLocationType ||
        fields.indoorOutdoor ||
        fields.receptionLocationType ||
        fields.receptionIndoorOutdoor ||
        fields.receptionVenueName ||
        fields.receptionVenueAddress1 ||
        fields.receptionVenueAddress2 ||
        fields.receptionVenueCountry ||
        fields.receptionVenueCity ||
        fields.receptionVenueState ||
        fields.receptionVenueZip ||
        fields.receptionVenueAsInsured ||
        fields.brunchLocationType ||
        fields.brunchIndoorOutdoor ||
        fields.brunchVenueName ||
        fields.brunchVenueAddress1 ||
        fields.brunchVenueAddress2 ||
        fields.brunchVenueCountry ||
        fields.brunchVenueCity ||
        fields.brunchVenueState ||
        fields.brunchVenueZip ||
        fields.brunchVenueAsInsured ||
        fields.rehearsalLocationType ||
        fields.rehearsalIndoorOutdoor ||
        fields.rehearsalVenueName ||
        fields.rehearsalVenueAddress1 ||
        fields.rehearsalVenueAddress2 ||
        fields.rehearsalVenueCountry ||
        fields.rehearsalVenueCity ||
        fields.rehearsalVenueState ||
        fields.rehearsalVenueZip ||
        fields.rehearsalVenueAsInsured ||
        fields.rehearsalDinnerLocationType ||
        fields.rehearsalDinnerIndoorOutdoor ||
        fields.rehearsalDinnerVenueName ||
        fields.rehearsalDinnerVenueAddress1 ||
        fields.rehearsalDinnerVenueAddress2 ||
        fields.rehearsalDinnerVenueCountry ||
        fields.rehearsalDinnerVenueCity ||
        fields.rehearsalDinnerVenueState ||
        fields.rehearsalDinnerVenueZip ||
        fields.rehearsalDinnerVenueAsInsured)
    ) {
      let venue = quoteToUpdate.event.venue;
      if (!venue) {
        venue = venueRepository.create();
        quoteToUpdate.event.venue = venue;
      }

      // Ensure required fields are present
      if (!fields.venueName || !fields.venueAddress1) {
        throw new Error("Venue name and address are required");
      }

      // Helper function to handle venue fields based on venue type
      const getVenueFieldValue = (
        fieldValue: any,
        isCruiseShip: boolean,
        fieldName: string
      ) => {
        const value =
          typeof fieldValue === "object" ? fieldValue.target.value : fieldValue;

        // For cruise ships, set country, state, zip to default values instead of null
        if (
          isCruiseShip &&
          (fieldName === "country" ||
            fieldName === "state" ||
            fieldName === "zip")
        ) {
          if (fieldName === "country") return "Country";
          if (fieldName === "state") return "State";
          if (fieldName === "zip") return "Zip";
        }

        return value || "";
      };

      const isCruiseShip = fields.ceremonyLocationType === "cruise_ship";

      const venueFields = {
        name:
          typeof fields.venueName === "object"
            ? fields.venueName.target.value
            : fields.venueName,
        address1:
          typeof fields.venueAddress1 === "object"
            ? fields.venueAddress1.target.value
            : fields.venueAddress1,
        address2:
          typeof fields.venueAddress2 === "object"
            ? fields.venueAddress2.target.value
            : fields.venueAddress2 || "",
        city:
          typeof fields.venueCity === "object"
            ? fields.venueCity.target.value
            : fields.venueCity || "",
        state: getVenueFieldValue(fields.venueState, isCruiseShip, "state"),
        zip: getVenueFieldValue(fields.venueZip, isCruiseShip, "zip"),
        country: getVenueFieldValue(
          fields.venueCountry,
          isCruiseShip,
          "country"
        ),
        ceremonyLocationType: fields.ceremonyLocationType || "",
        indoorOutdoor: fields.indoorOutdoor || "",
        receptionLocationType: fields.receptionLocationType || "",
        receptionIndoorOutdoor: fields.receptionIndoorOutdoor || "",
        receptionVenueName:
          typeof fields.receptionVenueName === "object"
            ? fields.receptionVenueName.target.value
            : fields.receptionVenueName || "",
        receptionVenueAddress1:
          typeof fields.receptionVenueAddress1 === "object"
            ? fields.receptionVenueAddress1.target.value
            : fields.receptionVenueAddress1 || "",
        receptionVenueAddress2:
          typeof fields.receptionVenueAddress2 === "object"
            ? fields.receptionVenueAddress2.target.value
            : fields.receptionVenueAddress2 || "",
        receptionVenueCountry: getVenueFieldValue(
          fields.receptionVenueCountry,
          fields.receptionLocationType === "cruise_ship",
          "country"
        ),
        receptionVenueCity:
          typeof fields.receptionVenueCity === "object"
            ? fields.receptionVenueCity.target.value
            : fields.receptionVenueCity || "",
        receptionVenueState: getVenueFieldValue(
          fields.receptionVenueState,
          fields.receptionLocationType === "cruise_ship",
          "state"
        ),
        receptionVenueZip: getVenueFieldValue(
          fields.receptionVenueZip,
          fields.receptionLocationType === "cruise_ship",
          "zip"
        ),
        receptionVenueAsInsured: fields.receptionVenueAsInsured || false,
        brunchLocationType: fields.brunchLocationType || "",
        brunchIndoorOutdoor: fields.brunchIndoorOutdoor || "",
        brunchVenueName:
          typeof fields.brunchVenueName === "object"
            ? fields.brunchVenueName.target.value
            : fields.brunchVenueName || "",
        brunchVenueAddress1:
          typeof fields.brunchVenueAddress1 === "object"
            ? fields.brunchVenueAddress1.target.value
            : fields.brunchVenueAddress1 || "",
        brunchVenueAddress2:
          typeof fields.brunchVenueAddress2 === "object"
            ? fields.brunchVenueAddress2.target.value
            : fields.brunchVenueAddress2 || "",
        brunchVenueCountry: getVenueFieldValue(
          fields.brunchVenueCountry,
          fields.brunchLocationType === "cruise_ship",
          "country"
        ),
        brunchVenueCity:
          typeof fields.brunchVenueCity === "object"
            ? fields.brunchVenueCity.target.value
            : fields.brunchVenueCity || "",
        brunchVenueState: getVenueFieldValue(
          fields.brunchVenueState,
          fields.brunchLocationType === "cruise_ship",
          "state"
        ),
        brunchVenueZip: getVenueFieldValue(
          fields.brunchVenueZip,
          fields.brunchLocationType === "cruise_ship",
          "zip"
        ),
        brunchVenueAsInsured: fields.brunchVenueAsInsured || false,
        rehearsalLocationType: fields.rehearsalLocationType || "",
        rehearsalIndoorOutdoor: fields.rehearsalIndoorOutdoor || "",
        rehearsalVenueName:
          typeof fields.rehearsalVenueName === "object"
            ? fields.rehearsalVenueName.target.value
            : fields.rehearsalVenueName || "",
        rehearsalVenueAddress1:
          typeof fields.rehearsalVenueAddress1 === "object"
            ? fields.rehearsalVenueAddress1.target.value
            : fields.rehearsalVenueAddress1 || "",
        rehearsalVenueAddress2:
          typeof fields.rehearsalVenueAddress2 === "object"
            ? fields.rehearsalVenueAddress2.target.value
            : fields.rehearsalVenueAddress2 || "",
        rehearsalVenueCountry: getVenueFieldValue(
          fields.rehearsalVenueCountry,
          fields.rehearsalLocationType === "cruise_ship",
          "country"
        ),
        rehearsalVenueCity:
          typeof fields.rehearsalVenueCity === "object"
            ? fields.rehearsalVenueCity.target.value
            : fields.rehearsalVenueCity || "",
        rehearsalVenueState: getVenueFieldValue(
          fields.rehearsalVenueState,
          fields.rehearsalLocationType === "cruise_ship",
          "state"
        ),
        rehearsalVenueZip: getVenueFieldValue(
          fields.rehearsalVenueZip,
          fields.rehearsalLocationType === "cruise_ship",
          "zip"
        ),
        rehearsalVenueAsInsured: fields.rehearsalVenueAsInsured || false,
        rehearsalDinnerLocationType: fields.rehearsalDinnerLocationType || "",
        rehearsalDinnerIndoorOutdoor: fields.rehearsalDinnerIndoorOutdoor || "",
        rehearsalDinnerVenueName:
          typeof fields.rehearsalDinnerVenueName === "object"
            ? fields.rehearsalDinnerVenueName.target.value
            : fields.rehearsalDinnerVenueName || "",
        rehearsalDinnerVenueAddress1:
          typeof fields.rehearsalDinnerVenueAddress1 === "object"
            ? fields.rehearsalDinnerVenueAddress1.target.value
            : fields.rehearsalDinnerVenueAddress1 || "",
        rehearsalDinnerVenueAddress2:
          typeof fields.rehearsalDinnerVenueAddress2 === "object"
            ? fields.rehearsalDinnerVenueAddress2.target.value
            : fields.rehearsalDinnerVenueAddress2 || "",
        rehearsalDinnerVenueCountry: getVenueFieldValue(
          fields.rehearsalDinnerVenueCountry,
          fields.rehearsalDinnerLocationType === "cruise_ship",
          "country"
        ),
        rehearsalDinnerVenueCity:
          typeof fields.rehearsalDinnerVenueCity === "object"
            ? fields.rehearsalDinnerVenueCity.target.value
            : fields.rehearsalDinnerVenueCity || "",
        rehearsalDinnerVenueState: getVenueFieldValue(
          fields.rehearsalDinnerVenueState,
          fields.rehearsalDinnerLocationType === "cruise_ship",
          "state"
        ),
        rehearsalDinnerVenueZip: getVenueFieldValue(
          fields.rehearsalDinnerVenueZip,
          fields.rehearsalDinnerLocationType === "cruise_ship",
          "zip"
        ),
        rehearsalDinnerVenueAsInsured:
          fields.rehearsalDinnerVenueAsInsured || false,
      };

      console.log("Updating venue with fields:", venueFields);
      venueRepository.merge(venue, venueFields);
      await venueRepository.save(venue);

      // Ensure venue is properly associated with the event
      if (quoteToUpdate.event) {
        console.log("Before association - Event:", quoteToUpdate.event);
        console.log("Before association - Venue:", venue);

        quoteToUpdate.event.venue = venue;
        await eventRepository.save(quoteToUpdate.event);

        console.log("After association - Event:", quoteToUpdate.event);
        console.log("After association - Venue:", venue);

        // Verify the relationship
        const savedEvent = await eventRepository.findOne({
          where: { id: quoteToUpdate.event.id },
          relations: ["venue"],
        });
        console.log("Verified event-venue relationship:", savedEvent);
      }
    }

    // ------------------------
    // Handle updates to the related PolicyHolder entity.
    // ------------------------
    // Handle policy holder updates
    const policyHolderRepository = AppDataSource.getRepository(PolicyHolder);
    if (
      fields.firstName ||
      fields.lastName ||
      fields.phone ||
      fields.address ||
      fields.city ||
      fields.state ||
      fields.zip ||
      fields.country ||
      fields.relationship ||
      fields.completingFormName ||
      fields.hearAboutUs ||
      fields.legalNotices
    ) {
      let policyHolder = quoteToUpdate.policyHolder;
      if (!policyHolder) {
        policyHolder = policyHolderRepository.create();
        quoteToUpdate.policyHolder = policyHolder;
      }

      // Ensure required fields are present
      if (!fields.firstName || !fields.lastName) {
        throw new Error(
          "First name and last name are required for policy holder"
        );
      }

      const policyHolderFields = {
        firstName: fields.firstName,
        lastName: fields.lastName,
        phone: fields.phone || "",
        address: fields.address || "",
        city: fields.city || "",
        state: fields.state || "",
        zip: fields.zip || "",
        country: fields.country || "United States",
        relationship: fields.relationship || "",
        completingFormName: fields.completingFormName || "",
        hearAboutUs: fields.hearAboutUs || "",
        legalNotices: fields.legalNotices || false,
        quoteId: quoteToUpdate.id,
      };

      // console.log(
      //   "Creating/updating policy holder with fields:",
      //   policyHolderFields
      // );
      policyHolderRepository.merge(policyHolder, policyHolderFields);
      await policyHolderRepository.save(policyHolder);
    }

    // ------------------------
    // Save the updated quote entity.
    // ------------------------
    // Save the updated quote
    const updatedQuote = await quoteRepository.save(quoteToUpdate);
    // ------------------------
    // Fetch the complete quote with all relations to return in the response.
    // ------------------------

    // Fetch the complete quote with all relations
    const completeQuote = await quoteRepository.findOne({
      where: { id: updatedQuote.id },
      relations: ["event", "event.venue", "policyHolder", "user", "payments"],
    });

    console.log("Quote updated successfully:", completeQuote);

    res.json({
      message: "Quote updated successfully",
      quote: completeQuote,
    });
    await sentryService.logApiCall(req, res, startTime, {
      message: "Quote updated successfully",
      quote: completeQuote,
    });
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
    // Error handling for PUT /api/v1/quotes/:quoteNumber.
    // ------------------------
    console.error("PUT /api/v1/quotes error:", error);
    res.status(500).json({ error: "Server error during quote update" });
  }
});

// --- DELETE /api/v1/quotes/:quoteNumber ---
// ------------------------
// Handles deleting a quote and all its related records (event, venue, policyHolder, policy, payments, versions).
// Uses a transaction to ensure atomicity.
// ------------------------
router.delete("/:quoteNumber", async (req: Request, res: Response) => {
  const startTime = Date.now();
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const { quoteNumber } = req.params;
    // console.log("Attempting to delete quote:", quoteNumber);

    // ------------------------
    // Fetch the quote to be deleted, including all its relations.
    // ------------------------
    const quoteRepository = queryRunner.manager.getRepository(Quote);

    const quote = await quoteRepository.findOne({
      where: { quoteNumber },
      relations: [
        "event",
        "event.venue",
        "policyHolder",
        "policy",
        "policy.versions",
        "payments",
      ],
    });

    if (!quote) {
      // ------------------------
      // If quote not found, rollback transaction and return 404.
      // ------------------------
      await queryRunner.rollbackTransaction();
      // console.log("Quote not found:", quoteNumber);
      res.status(404).json({ error: "Quote not found" });
      return;
    }

    // console.log("Found quote with ID:", quote.id);
    // console.log("Policy ID:", quote.policy?.id);
    // console.log("Event ID:", quote.event?.id);
    // console.log("Policy Holder ID:", quote.policyHolder?.id);

    try {
      // ------------------------
      // Delete related records in the correct order to avoid foreign key constraints.
      // ------------------------
      // 1. Delete payments first (they reference the quote)
      if (quote.payments?.length) {
        // console.log("Deleting payments for quote:", quote.id);
        await queryRunner.manager.delete("PAYMENTS", { quoteId: quote.id });
      }

      // 2. Delete policy versions (they reference the policy)
      if (quote.policy?.versions?.length) {
        // console.log("Deleting policy versions for policy:", quote.policy.id);
        await queryRunner.manager.delete("POLICY_VERSIONS", {
          policyId: quote.policy.id,
        });
      }

      // 3. Delete policy holder (it references the policy)
      if (quote.policyHolder) {
        // console.log("Deleting policy holder:", quote.policyHolder.id);
        await queryRunner.manager.delete("POLICY_HOLDERS", {
          id: quote.policyHolder.id,
        });
      }

      // 4. Delete venue (it's referenced by the event)
      if (quote.event?.venue) {
        // console.log("Deleting venue:", quote.event.venue.id);
        await queryRunner.manager.delete("VENUES", {
          id: quote.event.venue.id,
        });
      }

      // 5. Delete event (it references the policy)
      if (quote.event) {
        // console.log("Deleting event:", quote.event.id);
        await queryRunner.manager.delete("EVENTS", { id: quote.event.id });
      }

      // 6. Delete policy (after all its references are removed)
      if (quote.policy) {
        // console.log("Deleting policy:", quote.policy.id);
        await queryRunner.manager.delete("POLICIES", { id: quote.policy.id });
      }

      // 7. Finally delete the quote
      // console.log("Deleting quote:", quote.id);
      await quoteRepository.remove(quote);

      // ------------------------
      // Commit the transaction if all deletions are successful.
      // ------------------------
      await queryRunner.commitTransaction();
      // console.log("Successfully deleted quote and all related records");
      res.json({
        message: "Quote and all related records deleted successfully",
      });
      await sentryService.logApiCall(req, res, startTime, {
        message: "Quote and all related records deleted successfully",
      });
    } catch (deleteError) {
      console.error("Error during deletion:", deleteError);
      // ------------------------
      // Rollback the transaction if any deletion fails.
      // ------------------------
      await queryRunner.rollbackTransaction();
      throw deleteError;
    }
  } catch (error) {
    await queryRunner.rollbackTransaction();
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
    // Error handling for DELETE /api/v1/quotes/:quoteNumber.
    // ------------------------
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      code: error instanceof Error ? (error as any).code : undefined,
    });
    res.status(500).json({
      error: "Failed to delete quote",
      details: error instanceof Error ? error.message : "Unknown error",
      code: error instanceof Error ? (error as any).code : undefined,
    });
  } finally {
    await queryRunner.release();
    // ------------------------
    // Release the query runner in the finally block.
    // ------------------------
  }
});

// Error handling middleware
// ------------------------
// Generic error handling middleware for the router.
// ------------------------
router.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error("Unhandled express error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

export default router;
