// my-backend/src/routes/v1/policy.routes.ts
import { Router, Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import { Quote } from "../../entities/quote.entity";
import { Policy } from "../../entities/policy.entity";
import { PolicyVersion } from "../../entities/policy-version.entity";
import { Event } from "../../entities/event.entity";
import { Venue } from "../../entities/venue.entity";
import { PolicyHolder } from "../../entities/policy-holder.entity";
import { Payment } from "../../entities/payment.entity";
import { QuoteSource, StepStatus, PaymentStatus } from "../../entities/enums";
import { createPolicyFromQuote } from "../../services/policy.service";

// ------------------------
// Router for handling policy-related API endpoints.
// Base path: /api/v1/policies
// ------------------------
const router = Router();

// --- GET /api/v1/policies ---
// --- GET /api/v1/policies/:id ---
// ------------------------
// Handles fetching a single policy by its ID.
// Can optionally fetch only the versions of a policy.
// ------------------------
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { versionsOnly } = req.query;
    // ------------------------
    // If 'versionsOnly' query parameter is true, fetch and return only policy versions.
    // ------------------------
    if (versionsOnly === "true") {
      const versionRepository = AppDataSource.getRepository(PolicyVersion);
      const versions = await versionRepository.find({
        where: { policy: { id: Number(id) } },
        order: { createdAt: "DESC" },
      });
      res.json({ versions });
      return;
    }
    // ------------------------
    // Fetch the policy with all its relations.
    // ------------------------
    const policyRepository = AppDataSource.getRepository(Policy);
    const policy = await policyRepository.findOne({
      where: { id: Number(id) },
      relations: [
        "quote",
        "quote.event",
        "quote.event.venue",
        "quote.policyHolder",
        "event",
        "event.venue",
        "policyHolder",
        "payments",
        "versions",
      ],
    });

    // ------------------------
    // If policy not found, return 404.
    // ------------------------
    if (!policy) {
      res.status(404).json({ error: "Policy not found" });
      return;
    }

    // Log the policy data for debugging
    // ------------------------
    // Log the policy data being sent for debugging purposes.
    // ------------------------
    console.log("Policy data being sent:", JSON.stringify(policy, null, 2));

    res.json({ policy });
  } catch (error) {
    // ------------------------
    // Error handling for GET /api/v1/policies/:id.
    // ------------------------
    console.error("GET /api/policies/:id error:", error);
    res.status(500).json({ error: "Failed to fetch policy" });
  }
});

// --- GET /api/v1/policies ---
// Handles fetching ALL policies.
router.get("/", async (req: Request, res: Response) => {
  try {
    const policyRepository = AppDataSource.getRepository(Policy);
    const policies = await policyRepository.find({
      order: { createdAt: "DESC" },
      relations: [
        "quote",
        "quote.event",
        "quote.event.venue",
        "quote.policyHolder",
        "event",
        "event.venue",
        "policyHolder",
        "payments",
        "versions",
      ],
    });
    res.json({ policies });
  } catch (error) {
    // ------------------------
    // Error handling for GET /api/v1/policies.
    // ------------------------
    console.error("GET /api/policies error:", error);
    res.status(500).json({ error: "Failed to fetch policies" });
  }
});

// --- POST /api/v1/policies ---
// This is for creating a policy directly (customer flow)
// ------------------------
// Handles the creation of a new policy directly (typically for customer-initiated flows where no prior quote exists or is being bypassed).
// This is distinct from creating a policy from an existing quote.
// ------------------------
router.post("/", async (req: Request, res: Response) => {
  try {
    const fields = req.body;
    // ------------------------
    // Validate required fields for policy creation.
    // ------------------------
    if (
      !fields.policyNumber ||
      !fields.eventType ||
      !fields.firstName ||
      !fields.paymentAmount
    ) {
      res.status(400).json({ error: "Incomplete data for policy creation." });
      return;
    }

    const policyRepository = AppDataSource.getRepository(Policy);
    const eventRepository = AppDataSource.getRepository(Event);
    const policyHolderRepository = AppDataSource.getRepository(PolicyHolder);
    const paymentRepository = AppDataSource.getRepository(Payment);

    // ------------------------
    // Check if a policy with the given policyNumber already exists.
    // ------------------------
    // Check if policy already exists
    const existingPolicy = await policyRepository.findOne({
      where: { policyNumber: fields.policyNumber },
    });

    if (existingPolicy) {
      res
        .status(400)
        .json({ error: "Policy with this number already exists." });
      return;
    }

    // ------------------------
    // Create and save the related Event entity.
    // ------------------------
    // Create and save event first
    const event = eventRepository.create({
      eventType: fields.eventType,
      eventDate: fields.eventDate,
      maxGuests: fields.maxGuests,
      venue: fields.venueId ? { id: fields.venueId } : null,
    } as unknown as Event);

    const savedEvent = await eventRepository.save(event);

    // ------------------------
    // Create and save the related PolicyHolder entity.
    // ------------------------
    // Create and save policy holder
    const policyHolder = policyHolderRepository.create({
      firstName: fields.firstName,
      lastName: fields.lastName,
      email: fields.email,
      phone: fields.phone,
      address: fields.address,
      city: fields.city,
      state: fields.state,
      zipCode: fields.zipCode,
      country: fields.country,
    } as unknown as PolicyHolder);

    const savedPolicyHolder = await policyHolderRepository.save(policyHolder);

    // ------------------------
    // Create and save the related Payment entity.
    // ------------------------
    // Create and save payment
    const payment = paymentRepository.create({
      amount: parseFloat(fields.paymentAmount),
      status: fields.paymentStatus || "PENDING",
      method: fields.paymentMethod || "CASH",
      reference: fields.paymentReference || `PAY-${Date.now()}`,
    });
    const savedPayment = await paymentRepository.save(payment);

    // ------------------------
    // Create the main Policy entity and associate the saved related entities.
    // ------------------------
    // Create the main policy with saved relations
    const newPolicy = policyRepository.create({
      policyNumber: fields.policyNumber,
      pdfUrl: fields.pdfUrl,
      event: savedEvent,
      policyHolder: savedPolicyHolder,
      payments: [savedPayment],
    } as unknown as Policy);

    const savedPolicy = await policyRepository.save(newPolicy);

    // ------------------------
    // Fetch the complete policy with all relations to return in the response.
    // ------------------------
    // Fetch the complete policy with all relations
    const completePolicy = await policyRepository.findOne({
      where: { id: savedPolicy.id },
      relations: ["event", "policyHolder", "payments"],
    });

    res.status(201).json({ policy: completePolicy });
  } catch (error) {
    // ------------------------
    // Error handling for POST /api/v1/policies.
    // ------------------------
    console.error("POST /api/policies error:", error);
    res.status(500).json({ error: "Server error during policy creation" });
  }
});

// --- PUT /api/v1/policies/:id ---
// Handles updating a policy and creating a version snapshot
// ------------------------
// Handles updating an existing policy by its ID.
// Creates a version snapshot of the policy before applying updates.
// Manages and cleans up old versions if the number of versions exceeds a limit (10).
// ------------------------
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { versionMetadata, ...fields } = req.body;
    // ------------------------
    // Fetch the policy to be updated, including its relations.
    // ------------------------
    const policyRepository = AppDataSource.getRepository(Policy);
    const versionRepository = AppDataSource.getRepository(PolicyVersion);
    const policyRecord = await policyRepository.findOne({
      where: { id: Number(id) },
      relations: ["quote", "event", "event.venue", "policyHolder", "versions"],
    });

    // ------------------------
    // If policy not found, return 404.
    // ------------------------
    if (!policyRecord) {
      res.status(404).json({ error: "Policy not found" });
      return;
    }

    // ------------------------
    // Create a snapshot of the current policy data before making changes.
    // ------------------------
    // Create snapshot of current policy data
    const policySnapshot = {
      policy: policyRecord,
      quote: policyRecord.quote,
      event: policyRecord.event,
      venue: policyRecord.event?.venue,
      policyHolder: policyRecord.policyHolder,
      versionMetadata,
    };

    // ------------------------
    // Create and save a new PolicyVersion entity with the snapshot.
    // ------------------------
    // Create new version
    const newVersion = versionRepository.create({
      policy: policyRecord,
      data: policySnapshot,
    });
    await versionRepository.save(newVersion);

    // ------------------------
    // Check if the number of versions exceeds the limit (10).
    // If so, delete the oldest versions.
    // ------------------------
    // Check and cleanup old versions if needed
    const versions = await versionRepository.find({
      where: { policy: { id: Number(id) } },
      order: { createdAt: "DESC" },
    });

    if (versions.length > 10) {
      // Delete oldest versions beyond the limit
      const versionsToDelete = versions.slice(10);
      await versionRepository.remove(versionsToDelete);
    }

    // --- Update Logic ---
    // ------------------------
    // Merge and update top-level policy fields.
    // ------------------------
    // Merge top-level policy fields
    // Note: status field exists in database but not in Policy entity
    // This is handled by TypeORM at runtime despite TypeScript warning
    policyRepository.merge(policyRecord, {
      policyNumber: fields.policyNumber,
      pdfUrl: fields.pdfUrl,
      status: fields.status,
    });

    // ------------------------
    // Update related Event entity fields if provided.
    // ------------------------
    // Update event fields if provided
    if (
      fields.eventType ||
      fields.eventDate ||
      fields.maxGuests ||
      fields.honoree1FirstName ||
      fields.honoree1LastName ||
      fields.honoree2FirstName ||
      fields.honoree2LastName
    ) {
      const eventRepository = AppDataSource.getRepository(Event);
      const event = policyRecord.event || new Event();

      eventRepository.merge(event, {
        eventType: fields.eventType,
        eventDate: fields.eventDate,
        maxGuests: fields.maxGuests?.toString(), // Ensure maxGuests is saved as string
        honoree1FirstName: fields.honoree1FirstName,
        honoree1LastName: fields.honoree1LastName,
        honoree2FirstName: fields.honoree2FirstName,
        honoree2LastName: fields.honoree2LastName,
      });

      await eventRepository.save(event);
      policyRecord.event = event;
    }

    // ------------------------
    // Update related Venue entity fields if provided.
    // ------------------------
    // Update venue fields if provided
    if (
      fields.venueName ||
      fields.venueAddress1 ||
      fields.venueAddress2 ||
      fields.venueCountry ||
      fields.venueCity ||
      fields.venueState ||
      fields.venueZip ||
      fields.ceremonyLocationType ||
      fields.indoorOutdoor ||
      fields.venueAsInsured ||
      // Additional venue fields for wedding events
      fields.receptionVenueName ||
      fields.receptionVenueAddress1 ||
      fields.receptionVenueAddress2 ||
      fields.receptionVenueCountry ||
      fields.receptionVenueCity ||
      fields.receptionVenueState ||
      fields.receptionVenueZip ||
      fields.receptionVenueAsInsured ||
      fields.brunchVenueName ||
      fields.brunchVenueAddress1 ||
      fields.brunchVenueAddress2 ||
      fields.brunchVenueCountry ||
      fields.brunchVenueCity ||
      fields.brunchVenueState ||
      fields.brunchVenueZip ||
      fields.brunchVenueAsInsured ||
      fields.rehearsalVenueName ||
      fields.rehearsalVenueAddress1 ||
      fields.rehearsalVenueAddress2 ||
      fields.rehearsalVenueCountry ||
      fields.rehearsalVenueCity ||
      fields.rehearsalVenueState ||
      fields.rehearsalVenueZip ||
      fields.rehearsalVenueAsInsured ||
      fields.rehearsalDinnerVenueName ||
      fields.rehearsalDinnerVenueAddress1 ||
      fields.rehearsalDinnerVenueAddress2 ||
      fields.rehearsalDinnerVenueCountry ||
      fields.rehearsalDinnerVenueCity ||
      fields.rehearsalDinnerVenueState ||
      fields.rehearsalDinnerVenueZip ||
      fields.rehearsalDinnerVenueAsInsured
    ) {
      console.log("=== Venue Update Debug ===");
      console.log("Fields received:", fields);
      console.log("Policy record before update:", policyRecord);
      console.log("Event before update:", policyRecord.event);
      console.log("Venue before update:", policyRecord.event?.venue);

      const venueRepository = AppDataSource.getRepository(Venue);
      const venue = policyRecord.event?.venue || new Venue();

      console.log("Venue entity before merge:", venue);

      venueRepository.merge(venue, {
        name: fields.venueName,
        address1: fields.venueAddress1,
        address2: fields.venueAddress2,
        country: fields.venueCountry,
        city: fields.venueCity,
        state: fields.venueState,
        zip: fields.venueZip,
        ceremonyLocationType: fields.ceremonyLocationType,
        indoorOutdoor: fields.indoorOutdoor,
        venueAsInsured: fields.venueAsInsured,
        // Additional venue fields for wedding events
        receptionLocationType: fields.receptionLocationType,
        receptionIndoorOutdoor: fields.receptionIndoorOutdoor,
        receptionVenueName: fields.receptionVenueName,
        receptionVenueAddress1: fields.receptionVenueAddress1,
        receptionVenueAddress2: fields.receptionVenueAddress2,
        receptionVenueCountry: fields.receptionVenueCountry,
        receptionVenueCity: fields.receptionVenueCity,
        receptionVenueState: fields.receptionVenueState,
        receptionVenueZip: fields.receptionVenueZip,
        receptionVenueAsInsured: fields.receptionVenueAsInsured,
        brunchLocationType: fields.brunchLocationType,
        brunchIndoorOutdoor: fields.brunchIndoorOutdoor,
        brunchVenueName: fields.brunchVenueName,
        brunchVenueAddress1: fields.brunchVenueAddress1,
        brunchVenueAddress2: fields.brunchVenueAddress2,
        brunchVenueCountry: fields.brunchVenueCountry,
        brunchVenueCity: fields.brunchVenueCity,
        brunchVenueState: fields.brunchVenueState,
        brunchVenueZip: fields.brunchVenueZip,
        brunchVenueAsInsured: fields.brunchVenueAsInsured,
        rehearsalLocationType: fields.rehearsalLocationType,
        rehearsalIndoorOutdoor: fields.rehearsalIndoorOutdoor,
        rehearsalVenueName: fields.rehearsalVenueName,
        rehearsalVenueAddress1: fields.rehearsalVenueAddress1,
        rehearsalVenueAddress2: fields.rehearsalVenueAddress2,
        rehearsalVenueCountry: fields.rehearsalVenueCountry,
        rehearsalVenueCity: fields.rehearsalVenueCity,
        rehearsalVenueState: fields.rehearsalVenueState,
        rehearsalVenueZip: fields.rehearsalVenueZip,
        rehearsalVenueAsInsured: fields.rehearsalVenueAsInsured,
        rehearsalDinnerLocationType: fields.rehearsalDinnerLocationType,
        rehearsalDinnerIndoorOutdoor: fields.rehearsalDinnerIndoorOutdoor,
        rehearsalDinnerVenueName: fields.rehearsalDinnerVenueName,
        rehearsalDinnerVenueAddress1: fields.rehearsalDinnerVenueAddress1,
        rehearsalDinnerVenueAddress2: fields.rehearsalDinnerVenueAddress2,
        rehearsalDinnerVenueCountry: fields.rehearsalDinnerVenueCountry,
        rehearsalDinnerVenueCity: fields.rehearsalDinnerVenueCity,
        rehearsalDinnerVenueState: fields.rehearsalDinnerVenueState,
        rehearsalDinnerVenueZip: fields.rehearsalDinnerVenueZip,
        rehearsalDinnerVenueAsInsured: fields.rehearsalDinnerVenueAsInsured,
      });

      console.log("Venue entity after merge:", venue);

      await venueRepository.save(venue);
      console.log("Venue saved successfully:", venue);

      if (policyRecord.event) {
        policyRecord.event.venue = venue;
        console.log("Venue attached to event:", policyRecord.event.venue);
      }
    }

    // ------------------------
    // Update related PolicyHolder entity fields if provided.
    // ------------------------
    // Update policy holder fields if provided
    if (
      fields.firstName ||
      fields.lastName ||
      fields.phone ||
      fields.relationship ||
      fields.hearAboutUs ||
      fields.address ||
      fields.country ||
      fields.city ||
      fields.state ||
      fields.zip ||
      fields.legalNotices ||
      fields.completingFormName
    ) {
      const policyHolderRepository = AppDataSource.getRepository(PolicyHolder);
      const policyHolder = policyRecord.policyHolder || new PolicyHolder();

      policyHolderRepository.merge(policyHolder, {
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
      });

      await policyHolderRepository.save(policyHolder);
      policyRecord.policyHolder = policyHolder;
    }

    // ------------------------
    // Update related Quote entity fields if provided (if the policy originated from a quote).
    // ------------------------
    // Update quote fields if provided
    if (
      fields.email ||
      fields.coverageLevel ||
      fields.liabilityCoverage ||
      fields.liquorLiability ||
      fields.covidDisclosure ||
      fields.specialActivities ||
      fields.residentState ||
      fields.totalPremium ||
      fields.basePremium ||
      fields.liabilityPremium ||
      fields.liquorLiabilityPremium
    ) {
      const quoteRepository = AppDataSource.getRepository(Quote);
      const quote = policyRecord.quote || new Quote();

      quoteRepository.merge(quote, {
        email: fields.email,
        coverageLevel: fields.coverageLevel,
        liabilityCoverage: fields.liabilityCoverage,
        liquorLiability: fields.liquorLiability,
        covidDisclosure: fields.covidDisclosure,
        specialActivities: fields.specialActivities,
        residentState: fields.residentState,
        totalPremium: fields.totalPremium,
        basePremium: fields.basePremium,
        liabilityPremium: fields.liabilityPremium,
        liquorLiabilityPremium: fields.liquorLiabilityPremium,
      });

      await quoteRepository.save(quote);
      policyRecord.quote = quote;
    }

    // ------------------------
    // Save the updated policy record.
    // ------------------------
    // Save the updated policy
    const updatedPolicy = await policyRepository.save(policyRecord);

    // ------------------------
    // Fetch the complete policy with all relations to return in the response.
    // ------------------------
    // Fetch the complete policy with all relations
    const completePolicy = await policyRepository.findOne({
      where: { id: updatedPolicy.id },
      relations: ["quote", "event", "event.venue", "policyHolder", "versions"],
    });

    res.json({ policy: completePolicy });
  } catch (error) {
    // ------------------------
    // Error handling for PUT /api/v1/policies/:id.
    // ------------------------
    console.error("PUT /api/policies error:", error);
    res.status(500).json({ error: "Failed to update policy" });
  }
});

// --- DELETE /api/v1/policies/:id ---
// ------------------------
// Handles deleting a policy and all its related records (event, venue, policyHolder, payments, versions, and associated quote if applicable).
// Uses a transaction to ensure atomicity.
// ------------------------
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const policyRepository = AppDataSource.getRepository(Policy);
    // ------------------------
    // Fetch the policy to be deleted, including all its relations.
    // ------------------------
    const policy = await policyRepository.findOne({
      where: { id: Number(id) },
      relations: [
        "quote",
        "quote.event",
        "quote.event.venue",
        "quote.policyHolder",
        "event",
        "event.venue",
        "policyHolder",
        "payments",
        "versions",
      ],
    });

    if (!policy) {
      res.status(404).json({ error: "Policy not found" });
      return;
    }

    // ------------------------
    // Use a database transaction to ensure all deletions are atomic.
    // ------------------------
    // Use transaction for safe deletion
    await AppDataSource.manager.transaction(
      async (transactionalEntityManager) => {
        // ------------------------
        // Delete dependent records first to avoid foreign key constraint violations.
        // ------------------------
        // Delete all dependents first
        if (policy.versions.length > 0)
          await transactionalEntityManager.remove(policy.versions);
        if (policy.payments.length > 0)
          await transactionalEntityManager.remove(policy.payments);

        // If it's a quote-based policy (admin flow)
        if (policy.quote) {
          const quote = policy.quote;
          // ------------------------
          // Delete records related to the quote.
          // ------------------------
          if (quote.event?.venue)
            await transactionalEntityManager.remove(quote.event.venue);
          if (quote.event) await transactionalEntityManager.remove(quote.event);
          if (quote.policyHolder)
            await transactionalEntityManager.remove(quote.policyHolder);
          // First remove the policy, then the quote
          await transactionalEntityManager.remove(policy);
          await transactionalEntityManager.remove(quote);
          // ------------------------
          // If it's a direct policy (customer flow), delete its direct relations.
          // ------------------------
        } else {
          // If it's a direct policy (customer flow)
          if (policy.event?.venue)
            await transactionalEntityManager.remove(policy.event.venue);
          if (policy.event)
            await transactionalEntityManager.remove(policy.event);
          if (policy.policyHolder)
            await transactionalEntityManager.remove(policy.policyHolder);
          await transactionalEntityManager.remove(policy);
        }
      }
    );

    res.json({ message: "Policy and related records deleted successfully" });
  } catch (error) {
    // ------------------------
    // Error handling for DELETE /api/v1/policies/:id.
    // ------------------------
    console.error("DELETE /api/policies error:", error);
    res.status(500).json({ error: "Failed to delete policy" });
  }
});

// We still need the /from-quote route from the previous step
// ------------------------
// Handles creating a policy from an existing quote.
// This is typically used when an admin converts a quote to a policy or a customer completes a quote process.
// ------------------------
router.post("/from-quote", async (req: Request, res: Response) => {
  try {
    console.log("Received request body:", req.body);
    const { quoteNumber, forceConvert } = req.body;
    // ------------------------
    // Validate that quoteNumber is provided.
    // ------------------------
    if (!quoteNumber) {
      console.error("Missing quoteNumber in request");
      res.status(400).json({ error: "Missing quoteNumber" });
      return;
    }

    const quoteRepository = AppDataSource.getRepository(Quote);
    const policyRepository = AppDataSource.getRepository(Policy);

    // ------------------------
    // Fetch the quote by quoteNumber, including its relations.
    // ------------------------
    console.log("Looking up quote:", quoteNumber);
    const quote = await quoteRepository.findOne({
      where: { quoteNumber },
      relations: ["policy", "event", "event.venue", "policyHolder"],
    });

    if (!quote) {
      // ------------------------
      // If quote not found, return 404.
      // ------------------------
      console.error("Quote not found:", quoteNumber);
      res.status(404).json({ error: "Quote not found" });
      return;
    }

    console.log("Found quote:", {
      id: quote.id,
      quoteNumber: quote.quoteNumber,
      source: quote.source,
      convertedToPolicy: quote.convertedToPolicy,
      hasEvent: !!quote.event,
      hasPolicyHolder: !!quote.policyHolder,
    });

    // ------------------------
    // Check if the quote has already been converted to a policy.
    // ------------------------
    if (quote.convertedToPolicy) {
      console.error("Quote already converted:", quoteNumber);
      res.status(400).json({ error: "Quote is already converted to a policy" });
      return;
    }

    // ------------------------
    // Update the quote's status to COMPLETE.
    // ------------------------
    // Update the quote status to COMPLETE
    quote.status = StepStatus.COMPLETE;
    await quoteRepository.save(quote);
    console.log("Updated quote status to COMPLETE");

    // ------------------------
    // For admin-generated quotes, require 'forceConvert' flag unless it's already set.
    // This acts as a confirmation step for admin conversions.
    // ------------------------
    if (quote.source === QuoteSource.ADMIN && !forceConvert) {
      console.log("Admin quote requires manual conversion");
      res.status(400).json({
        error: "Admin-generated quotes require manual conversion confirmation",
        requiresManualConversion: true,
      });
      return;
    }

    // ------------------------
    // Call the service function to create a policy from the quote.
    // ------------------------
    console.log("Creating policy from quote");
    const policy = await createPolicyFromQuote(quote.id);
    console.log("Created policy:", {
      id: policy.id,
      policyNumber: policy.policyNumber,
    });

    // ------------------------
    // For admin-generated quotes, create a payment record with SUCCESS status
    // and ensure the quote relation is properly maintained
    // ------------------------
    if (quote.source === QuoteSource.ADMIN) {
      const paymentRepository = AppDataSource.getRepository(Payment);
      const newPayment = paymentRepository.create({
        quoteId: quote.id,
        policyId: policy.id,
        amount: quote.totalPremium,
        status: PaymentStatus.SUCCESS,
        method: "admin",
        reference: `admin-payment-${Date.now()}`,
      });
      await paymentRepository.save(newPayment);

      // Ensure the quote relation is properly maintained
      policy.quote = quote;
      policy.quoteId = quote.id;

      // Ensure venue locationType is properly set
      if (policy.event?.venue) {
        policy.event.venue.locationType = policy.event.venue.ceremonyLocationType || policy.event.venue.locationType;
        await AppDataSource.manager.getRepository(Venue).save(policy.event.venue);
      }

      await AppDataSource.manager.getRepository(Policy).save(policy);
    }

    // ------------------------
    // Fetch the complete policy with all relations to return in the response.
    // ------------------------
    // Fetch the complete policy with all relations
    const completePolicy = await policyRepository.findOne({
      where: { id: policy.id },
      relations: ["quote", "event", "event.venue", "policyHolder"],
    });

    console.log("Sending success response");
    res.status(201).json({
      message: "Quote converted to policy successfully",
      policyNumber: policy.policyNumber,
      policy: completePolicy || policy,
    });
  } catch (error) {
    // ------------------------
    // Error handling for POST /api/v1/policies/from-quote.
    // ------------------------
    console.error("POST /from-quote error:", error);
    console.error("Error details:", {
      name: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    const message = error instanceof Error ? error.message : "Server error";
    res.status(500).json({ error: message });
  }
});

// --- GET /api/v1/policies/:id/versions ---
// ------------------------
// Handles fetching all versions for a specific policy ID.
// ------------------------
router.get("/:id/versions", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const versionRepository = AppDataSource.getRepository(PolicyVersion);

    const versions = await versionRepository.find({
      where: { policy: { id: Number(id) } },
      order: { createdAt: "DESC" },
    });

    res.json({ versions });
  } catch (error) {
    // ------------------------
    // Error handling for GET /api/v1/policies/:id/versions.
    // ------------------------
    console.error("GET /api/policies/:id/versions error:", error);
    res.status(500).json({ error: "Failed to fetch policy versions" });
  }
});

// --- GET /api/v1/policies/:id/versions/:versionId ---
// ------------------------
// Handles fetching a specific version by its ID, for a given policy ID.
// ------------------------
router.get("/:id/versions/:versionId", async (req: Request, res: Response) => {
  try {
    const { id, versionId } = req.params;
    const versionRepository = AppDataSource.getRepository(PolicyVersion);

    const version = await versionRepository.findOne({
      where: {
        id: Number(versionId),
        policy: { id: Number(id) },
      },
    });

    if (!version) {
      // ------------------------
      // If policy version not found, return 404.
      // ------------------------
      res.status(404).json({ error: "Policy version not found" });
      return;
    }

    res.json({ version });
  } catch (error) {
    // ------------------------
    // Error handling for GET /api/v1/policies/:id/versions/:versionId.
    // ------------------------
    console.error("GET /api/policies/:id/versions/:versionId error:", error);
    res.status(500).json({ error: "Failed to fetch policy version" });
  }
});

// Endpoint to fetch event data for a policy
// ------------------------
// Handles fetching the event data associated with a specific policy ID.
// ------------------------
router.get("/:id/event", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const policyRepository = AppDataSource.getRepository(Policy);
    const policy = await policyRepository.findOne({
      where: { id: Number(id) },
      relations: ["event", "event.venue"],
    });

    if (!policy || !policy.event) {
      // ------------------------
      // If policy or its event not found, return 404.
      // ------------------------
      res.status(404).json({ error: "Event not found" });
      return;
    }

    res.json({ event: policy.event });
  } catch (error) {
    // ------------------------
    // Error handling for GET /api/v1/policies/:id/event.
    // ------------------------
    console.error("GET /api/policies/:id/event error:", error);
    res.status(500).json({ error: "Failed to fetch event data" });
  }
});

// Endpoint to fetch policy holder data for a policy
// ------------------------
// Handles fetching the policy holder data associated with a specific policy ID.
// ------------------------
router.get("/:id/policy-holder", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const policyRepository = AppDataSource.getRepository(Policy);
    const policy = await policyRepository.findOne({
      where: { id: Number(id) },
      relations: ["policyHolder"],
    });

    if (!policy || !policy.policyHolder) {
      // ------------------------
      // If policy or its policy holder not found, return 404.
      // ------------------------
      res.status(404).json({ error: "Policy holder not found" });
      return;
    }

    res.json({ policyHolder: policy.policyHolder });
  } catch (error) {
    // ------------------------
    // Error handling for GET /api/v1/policies/:id/policy-holder.
    // ------------------------
    console.error("GET /api/policies/:id/policy-holder error:", error);
    res.status(500).json({ error: "Failed to fetch policy holder data" });
  }
});

// Endpoint to fetch payments data for a policy
// ------------------------
// Handles fetching the payments data associated with a specific policy ID.
// ------------------------
router.get("/:id/payments", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const policyRepository = AppDataSource.getRepository(Policy);
    const policy = await policyRepository.findOne({
      where: { id: Number(id) },
      relations: ["payments"],
    });

    if (!policy || !policy.payments) {
      // ------------------------
      // If policy or its payments not found, return 404.
      // ------------------------
      res.status(404).json({ error: "Payments not found" });
      return;
    }

    res.json({ payments: policy.payments });
  } catch (error) {
    // ------------------------
    // Error handling for GET /api/v1/policies/:id/payments.
    // ------------------------
    console.error("GET /api/policies/:id/payments error:", error);
    res.status(500).json({ error: "Failed to fetch payments data" });
  }
});
export default router;
