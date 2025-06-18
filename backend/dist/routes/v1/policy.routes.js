"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_source_1 = require("../../data-source");
const quote_entity_1 = require("../../entities/quote.entity");
const policy_entity_1 = require("../../entities/policy.entity");
const policy_version_entity_1 = require("../../entities/policy-version.entity");
const event_entity_1 = require("../../entities/event.entity");
const venue_entity_1 = require("../../entities/venue.entity");
const policy_holder_entity_1 = require("../../entities/policy-holder.entity");
const payment_entity_1 = require("../../entities/payment.entity");
const enums_1 = require("../../entities/enums");
const policy_service_1 = require("../../services/policy.service");
const versionPdf_service_1 = require("../../services/versionPdf.service");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Router for handling policy-related API endpoints.
// Base path: /api/v1/policies
const router = (0, express_1.Router)();
// --- GET /api/v1/policies ---
// --- GET /api/v1/policies/:id ---
// Handles fetching a single policy by its ID.
// Can optionally fetch only the versions of a policy.
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        // const { versionsOnly } = req.query;
        // // If 'versionsOnly' query parameter is true, fetch and return only policy versions.
        // if (versionsOnly === "true") {
        //   const versionRepository = AppDataSource.getRepository(PolicyVersion);
        //   const versions = await versionRepository.find({
        //     where: { policy: { id: Number(id) } },
        //     order: { createdAt: "DESC" },
        //   });
        //   res.json({ versions });
        //   return;
        // }
        // Fetch the policy with all its relations.
        const policyRepository = data_source_1.AppDataSource.getRepository(policy_entity_1.Policy);
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
                // "versions",
            ],
        });
        // If policy not found, return 404.
        if (!policy) {
            res.status(404).json({ error: "Policy not found" });
            return;
        }
        // Log the policy data for debugging
        // Log the policy data being sent for debugging purposes.
        // console.log("Policy data being sent:", JSON.stringify(policy, null, 2));
        res.json({ policy });
    }
    catch (error) {
        // Error handling for GET /api/v1/policies/:id.
        console.error("GET /api/policies/:id error:", error);
        res.status(500).json({ error: "Failed to fetch policy" });
    }
});
// --- GET /api/v1/policies ---
// Handles fetching ALL policies.
router.get("/", async (req, res) => {
    try {
        const policyRepository = data_source_1.AppDataSource.getRepository(policy_entity_1.Policy);
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
                // "versions",
            ],
        });
        res.json({ policies });
        console.log("Policies from database:", JSON.stringify(policies, null, 2));
    }
    catch (error) {
        // Error handling for GET /api/v1/policies.
        console.error("GET /api/policies error:", error);
        res.status(500).json({ error: "Failed to fetch policies" });
    }
});
// --- POST /api/v1/policies ---
// This is for creating a policy directly (customer flow)
// Handles the creation of a new policy directly (typically for customer-initiated flows where no prior quote exists or is being bypassed).
// This is distinct from creating a policy from an existing quote.
router.post("/", async (req, res) => {
    try {
        const fields = req.body;
        // Validate required fields for policy creation.
        if (!fields.policyNumber ||
            !fields.eventType ||
            !fields.firstName ||
            !fields.paymentAmount) {
            res.status(400).json({ error: "Incomplete data for policy creation." });
            return;
        }
        const policyRepository = data_source_1.AppDataSource.getRepository(policy_entity_1.Policy);
        const eventRepository = data_source_1.AppDataSource.getRepository(event_entity_1.Event);
        const policyHolderRepository = data_source_1.AppDataSource.getRepository(policy_holder_entity_1.PolicyHolder);
        const paymentRepository = data_source_1.AppDataSource.getRepository(payment_entity_1.Payment);
        // Check if a policy with the given policyNumber already exists.
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
        // Create and save the related Event entity.
        // Create and save event first
        const event = eventRepository.create({
            eventType: fields.eventType,
            eventDate: fields.eventDate,
            maxGuests: fields.maxGuests,
            venue: fields.venueId ? { id: fields.venueId } : null,
        });
        const savedEvent = await eventRepository.save(event);
        // Create and save the related PolicyHolder entity.
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
        });
        const savedPolicyHolder = await policyHolderRepository.save(policyHolder);
        // Create and save the related Payment entity.
        // Create and save payment
        const payment = paymentRepository.create({
            amount: parseFloat(fields.paymentAmount),
            status: fields.paymentStatus || "PENDING",
            method: fields.paymentMethod || "CASH",
            reference: fields.paymentReference || `PAY-${Date.now()}`,
        });
        const savedPayment = await paymentRepository.save(payment);
        // Create the main Policy entity and associate the saved related entities.
        // Create the main policy with saved relations
        const newPolicy = policyRepository.create({
            policyNumber: fields.policyNumber,
            pdfUrl: fields.pdfUrl,
            event: savedEvent,
            policyHolder: savedPolicyHolder,
            payments: [savedPayment],
        });
        const savedPolicy = await policyRepository.save(newPolicy);
        // Fetch the complete policy with all relations to return in the response.
        // Fetch the complete policy with all relations
        const completePolicy = await policyRepository.findOne({
            where: { id: savedPolicy.id },
            relations: ["event", "policyHolder", "payments"],
        });
        res.status(201).json({ policy: completePolicy });
    }
    catch (error) {
        // Error handling for POST /api/v1/policies.
        console.error("POST /api/policies error:", error);
        res.status(500).json({ error: "Server error during policy creation" });
    }
});
// --- PUT /api/v1/policies/:id ---
// Handles updating a policy and creating a version snapshot
// Handles updating an existing policy by its ID.
// Creates a version snapshot of the policy before applying updates.
// Manages and cleans up old versions if the number of versions exceeds a limit (10).
router.put("/:id", async (req, res) => {
    var _a, _b, _c, _d, _e;
    try {
        const { id } = req.params;
        const _f = req.body, { versionMetadata } = _f, fields = __rest(_f, ["versionMetadata"]);
        // Fetch the policy to be updated, including its relations.
        const policyRepository = data_source_1.AppDataSource.getRepository(policy_entity_1.Policy);
        const versionRepository = data_source_1.AppDataSource.getRepository(policy_version_entity_1.PolicyVersion);
        const policyRecord = await policyRepository.findOne({
            where: { id: Number(id) },
            relations: ["quote", "event", "event.venue", "policyHolder"],
        });
        if (!policyRecord) {
            res.status(404).json({ error: "Policy not found" });
            return;
        }
        // --- PDF Versioning Logic ---
        // Create a snapshot of the current policy data before making changes.
        const policySnapshot = {
            policy: policyRecord,
            quote: policyRecord.quote,
            event: policyRecord.event,
            venue: (_a = policyRecord.event) === null || _a === void 0 ? void 0 : _a.venue,
            policyHolder: policyRecord.policyHolder,
        };
        // Generate PDF buffer
        const pdfBuffer = await versionPdf_service_1.VersionPdfService.generateVersionPdf(policySnapshot);
        // Save PDF to /uploads with unique name
        const uploadsDir = path_1.default.join(__dirname, "../../uploads");
        if (!fs_1.default.existsSync(uploadsDir))
            fs_1.default.mkdirSync(uploadsDir);
        const versionTimestamp = Date.now();
        const fileName = `policy_${id}_version_${versionTimestamp}.pdf`;
        const filePath = path_1.default.join(uploadsDir, fileName);
        fs_1.default.writeFileSync(filePath, pdfBuffer);
        // Save PolicyVersion record
        const newVersion = versionRepository.create({
            policyId: Number(id),
            data: policySnapshot,
            // Add file path to data for reference
        });
        // Attach file path to data
        newVersion.data = Object.assign(Object.assign({}, policySnapshot), { pdfFile: fileName });
        await versionRepository.save(newVersion);
        // Keep only the latest 10 versions (and their PDFs)
        const allVersions = await versionRepository.find({
            where: { policyId: Number(id) },
            order: { createdAt: "DESC" },
        });
        if (allVersions.length > 10) {
            const versionsToDelete = allVersions.slice(10);
            for (const v of versionsToDelete) {
                const fileToDelete = (_b = v.data) === null || _b === void 0 ? void 0 : _b.pdfFile;
                if (fileToDelete) {
                    const filePathToDelete = path_1.default.join(uploadsDir, fileToDelete);
                    if (fs_1.default.existsSync(filePathToDelete)) {
                        fs_1.default.unlinkSync(filePathToDelete);
                    }
                }
                await versionRepository.delete(v.id);
            }
        }
        // --- Update Logic ---
        // Merge and update top-level policy fields.
        // Merge top-level policy fields
        // Note: status field exists in database but not in Policy entity
        // This is handled by TypeORM at runtime despite TypeScript warning
        // Using 'as any' to bypass TypeScript error for the 'status' field
        policyRepository.merge(policyRecord, {
            policyNumber: fields.policyNumber,
            pdfUrl: fields.pdfUrl,
            status: fields.status,
        });
        // Update related Event entity fields if provided.
        // Update event fields if provided
        if (fields.eventType ||
            fields.eventDate ||
            fields.maxGuests ||
            fields.honoree1FirstName ||
            fields.honoree1LastName ||
            fields.honoree2FirstName ||
            fields.honoree2LastName) {
            const eventRepository = data_source_1.AppDataSource.getRepository(event_entity_1.Event);
            const event = policyRecord.event || new event_entity_1.Event();
            eventRepository.merge(event, {
                eventType: fields.eventType,
                eventDate: fields.eventDate,
                maxGuests: (_c = fields.maxGuests) === null || _c === void 0 ? void 0 : _c.toString(), // Ensure maxGuests is saved as string
                honoree1FirstName: fields.honoree1FirstName,
                honoree1LastName: fields.honoree1LastName,
                honoree2FirstName: fields.honoree2FirstName,
                honoree2LastName: fields.honoree2LastName,
            });
            await eventRepository.save(event);
            policyRecord.event = event;
        }
        // Update related Venue entity fields if provided.
        // Update venue fields if provided
        if (fields.venueName ||
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
            fields.rehearsalDinnerVenueAsInsured) {
            console.log("=== Venue Update Debug ===");
            console.log("Fields received:", fields);
            console.log("Policy record before update:", policyRecord);
            console.log("Event before update:", policyRecord.event);
            console.log("Venue before update:", (_d = policyRecord.event) === null || _d === void 0 ? void 0 : _d.venue);
            const venueRepository = data_source_1.AppDataSource.getRepository(venue_entity_1.Venue);
            const venue = ((_e = policyRecord.event) === null || _e === void 0 ? void 0 : _e.venue) || new venue_entity_1.Venue();
            console.log("Venue entity before merge:", venue);
            venueRepository.merge(venue, {
                name: typeof fields.venueName === "object"
                    ? fields.venueName.target.value
                    : fields.venueName,
                address1: typeof fields.venueAddress1 === "object"
                    ? fields.venueAddress1.target.value
                    : fields.venueAddress1,
                address2: typeof fields.venueAddress2 === "object"
                    ? fields.venueAddress2.target.value
                    : fields.venueAddress2,
                country: typeof fields.venueCountry === "object"
                    ? fields.venueCountry.target.value
                    : fields.venueCountry,
                city: typeof fields.venueCity === "object"
                    ? fields.venueCity.target.value
                    : fields.venueCity,
                state: typeof fields.venueState === "object"
                    ? fields.venueState.target.value
                    : fields.venueState,
                zip: typeof fields.venueZip === "object"
                    ? fields.venueZip.target.value
                    : fields.venueZip,
                ceremonyLocationType: fields.ceremonyLocationType,
                indoorOutdoor: fields.indoorOutdoor,
                venueAsInsured: fields.venueAsInsured,
                // Additional venue fields for wedding events
                receptionLocationType: fields.receptionLocationType,
                receptionIndoorOutdoor: fields.receptionIndoorOutdoor,
                receptionVenueName: typeof fields.receptionVenueName === "object"
                    ? fields.receptionVenueName.target.value
                    : fields.receptionVenueName,
                receptionVenueAddress1: typeof fields.receptionVenueAddress1 === "object"
                    ? fields.receptionVenueAddress1.target.value
                    : fields.receptionVenueAddress1,
                receptionVenueAddress2: typeof fields.receptionVenueAddress2 === "object"
                    ? fields.receptionVenueAddress2.target.value
                    : fields.receptionVenueAddress2,
                receptionVenueCountry: typeof fields.receptionVenueCountry === "object"
                    ? fields.receptionVenueCountry.target.value
                    : fields.receptionVenueCountry,
                receptionVenueCity: typeof fields.receptionVenueCity === "object"
                    ? fields.receptionVenueCity.target.value
                    : fields.receptionVenueCity,
                receptionVenueState: typeof fields.receptionVenueState === "object"
                    ? fields.receptionVenueState.target.value
                    : fields.receptionVenueState,
                receptionVenueZip: typeof fields.receptionVenueZip === "object"
                    ? fields.receptionVenueZip.target.value
                    : fields.receptionVenueZip,
                receptionVenueAsInsured: fields.receptionVenueAsInsured,
                brunchLocationType: fields.brunchLocationType,
                brunchIndoorOutdoor: fields.brunchIndoorOutdoor,
                brunchVenueName: typeof fields.brunchVenueName === "object"
                    ? fields.brunchVenueName.target.value
                    : fields.brunchVenueName,
                brunchVenueAddress1: typeof fields.brunchVenueAddress1 === "object"
                    ? fields.brunchVenueAddress1.target.value
                    : fields.brunchVenueAddress1,
                brunchVenueAddress2: typeof fields.brunchVenueAddress2 === "object"
                    ? fields.brunchVenueAddress2.target.value
                    : fields.brunchVenueAddress2,
                brunchVenueCountry: typeof fields.brunchVenueCountry === "object"
                    ? fields.brunchVenueCountry.target.value
                    : fields.brunchVenueCountry,
                brunchVenueCity: typeof fields.brunchVenueCity === "object"
                    ? fields.brunchVenueCity.target.value
                    : fields.brunchVenueCity,
                brunchVenueState: typeof fields.brunchVenueState === "object"
                    ? fields.brunchVenueState.target.value
                    : fields.brunchVenueState,
                brunchVenueZip: typeof fields.brunchVenueZip === "object"
                    ? fields.brunchVenueZip.target.value
                    : fields.brunchVenueZip,
                brunchVenueAsInsured: fields.brunchVenueAsInsured,
                rehearsalLocationType: fields.rehearsalLocationType,
                rehearsalIndoorOutdoor: fields.rehearsalIndoorOutdoor,
                rehearsalVenueName: typeof fields.rehearsalVenueName === "object"
                    ? fields.rehearsalVenueName.target.value
                    : fields.rehearsalVenueName,
                rehearsalVenueAddress1: typeof fields.rehearsalVenueAddress1 === "object"
                    ? fields.rehearsalVenueAddress1.target.value
                    : fields.rehearsalVenueAddress1,
                rehearsalVenueAddress2: typeof fields.rehearsalVenueAddress2 === "object"
                    ? fields.rehearsalVenueAddress2.target.value
                    : fields.rehearsalVenueAddress2,
                rehearsalVenueCountry: typeof fields.rehearsalVenueCountry === "object"
                    ? fields.rehearsalVenueCountry.target.value
                    : fields.rehearsalVenueCountry,
                rehearsalVenueCity: typeof fields.rehearsalVenueCity === "object"
                    ? fields.rehearsalVenueCity.target.value
                    : fields.rehearsalVenueCity,
                rehearsalVenueState: typeof fields.rehearsalVenueState === "object"
                    ? fields.rehearsalVenueState.target.value
                    : fields.rehearsalVenueState,
                rehearsalVenueZip: typeof fields.rehearsalVenueZip === "object"
                    ? fields.rehearsalVenueZip.target.value
                    : fields.rehearsalVenueZip,
                rehearsalVenueAsInsured: fields.rehearsalVenueAsInsured,
                rehearsalDinnerLocationType: fields.rehearsalDinnerLocationType,
                rehearsalDinnerIndoorOutdoor: fields.rehearsalDinnerIndoorOutdoor,
                rehearsalDinnerVenueName: typeof fields.rehearsalDinnerVenueName === "object"
                    ? fields.rehearsalDinnerVenueName.target.value
                    : fields.rehearsalDinnerVenueName,
                rehearsalDinnerVenueAddress1: typeof fields.rehearsalDinnerVenueAddress1 === "object"
                    ? fields.rehearsalDinnerVenueAddress1.target.value
                    : fields.rehearsalDinnerVenueAddress1,
                rehearsalDinnerVenueAddress2: typeof fields.rehearsalDinnerVenueAddress2 === "object"
                    ? fields.rehearsalDinnerVenueAddress2.target.value
                    : fields.rehearsalDinnerVenueAddress2,
                rehearsalDinnerVenueCountry: typeof fields.rehearsalDinnerVenueCountry === "object"
                    ? fields.rehearsalDinnerVenueCountry.target.value
                    : fields.rehearsalDinnerVenueCountry,
                rehearsalDinnerVenueCity: typeof fields.rehearsalDinnerVenueCity === "object"
                    ? fields.rehearsalDinnerVenueCity.target.value
                    : fields.rehearsalDinnerVenueCity,
                rehearsalDinnerVenueState: typeof fields.rehearsalDinnerVenueState === "object"
                    ? fields.rehearsalDinnerVenueState.target.value
                    : fields.rehearsalDinnerVenueState,
                rehearsalDinnerVenueZip: typeof fields.rehearsalDinnerVenueZip === "object"
                    ? fields.rehearsalDinnerVenueZip.target.value
                    : fields.rehearsalDinnerVenueZip,
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
        // Update related PolicyHolder entity fields if provided.
        // Update policy holder fields if provided
        if (fields.firstName ||
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
            fields.completingFormName) {
            const policyHolderRepository = data_source_1.AppDataSource.getRepository(policy_holder_entity_1.PolicyHolder);
            const policyHolder = policyRecord.policyHolder || new policy_holder_entity_1.PolicyHolder();
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
        // Update related Quote entity fields if provided (if the policy originated from a quote).
        // Update quote fields if provided
        if (fields.email ||
            fields.coverageLevel ||
            fields.liabilityCoverage ||
            fields.liquorLiability ||
            fields.covidDisclosure ||
            fields.specialActivities ||
            fields.residentState ||
            fields.totalPremium ||
            fields.basePremium ||
            fields.liabilityPremium ||
            fields.liquorLiabilityPremium) {
            const quoteRepository = data_source_1.AppDataSource.getRepository(quote_entity_1.Quote);
            const quote = policyRecord.quote || new quote_entity_1.Quote();
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
        // Save the updated policy record.
        // Save the updated policy
        const updatedPolicy = await policyRepository.save(policyRecord);
        // Fetch the complete policy with all relations to return in the response.
        // Fetch the complete policy with all relations
        const completePolicy = await policyRepository.findOne({
            where: { id: updatedPolicy.id },
            relations: ["quote", "event", "event.venue", "policyHolder"],
        });
        res.json({ policy: completePolicy });
    }
    catch (error) {
        // Error handling for PUT /api/v1/policies/:id.
        console.error("PUT /api/policies error:", error);
        res.status(500).json({ error: "Failed to update policy" });
    }
});
// --- DELETE /api/v1/policies/:id ---
// Handles deleting a policy and all its related records (event, venue, policyHolder, payments, versions, and associated quote if applicable).
// Uses a transaction to ensure atomicity.
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const policyRepository = data_source_1.AppDataSource.getRepository(policy_entity_1.Policy);
        // Fetch the policy to be deleted, including all its relations.
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
                // "versions",
            ],
        });
        if (!policy) {
            res.status(404).json({ error: "Policy not found" });
            return;
        }
        // Use a database transaction to ensure all deletions are atomic.
        // Use transaction for safe deletion
        await data_source_1.AppDataSource.manager.transaction(async (transactionalEntityManager) => {
            // Delete dependent records first to avoid foreign key constraint violations.
            var _a, _b;
            // Delete all dependents first
            if (policy.payments.length > 0)
                await transactionalEntityManager.remove(policy.payments);
            // If it's a quote-based policy (admin flow)
            if (policy.quote) {
                const quote = policy.quote;
                // Delete records related to the quote.
                if ((_a = quote.event) === null || _a === void 0 ? void 0 : _a.venue)
                    await transactionalEntityManager.remove(quote.event.venue);
                if (quote.event)
                    await transactionalEntityManager.remove(quote.event);
                if (quote.policyHolder)
                    await transactionalEntityManager.remove(quote.policyHolder);
                // First remove the policy, then the quote
                await transactionalEntityManager.remove(policy);
                await transactionalEntityManager.remove(quote);
                // If it's a direct policy (customer flow), delete its direct relations.
            }
            else {
                // If it's a direct policy (customer flow)
                if ((_b = policy.event) === null || _b === void 0 ? void 0 : _b.venue)
                    await transactionalEntityManager.remove(policy.event.venue);
                if (policy.event)
                    await transactionalEntityManager.remove(policy.event);
                if (policy.policyHolder)
                    await transactionalEntityManager.remove(policy.policyHolder);
                await transactionalEntityManager.remove(policy);
            }
        });
        res.json({ message: "Policy and related records deleted successfully" });
    }
    catch (error) {
        // Error handling for DELETE /api/v1/policies/:id.
        console.error("DELETE /api/policies error:", error);
        res.status(500).json({ error: "Failed to delete policy" });
    }
});
// We still need the /from-quote route from the previous step
// Handles creating a policy from an existing quote.
// This is typically used when an admin converts a quote to a policy or a customer completes a quote process.
router.post("/from-quote", async (req, res) => {
    var _a;
    try {
        console.log("Received request body:", req.body);
        const { quoteNumber, forceConvert } = req.body;
        // Validate that quoteNumber is provided.
        if (!quoteNumber) {
            console.error("Missing quoteNumber in request");
            res.status(400).json({ error: "Missing quoteNumber" });
            return;
        }
        const quoteRepository = data_source_1.AppDataSource.getRepository(quote_entity_1.Quote);
        const policyRepository = data_source_1.AppDataSource.getRepository(policy_entity_1.Policy);
        // Fetch the quote by quoteNumber, including its relations.
        console.log("Looking up quote:", quoteNumber);
        const quote = await quoteRepository.findOne({
            where: { quoteNumber },
            relations: ["policy", "event", "event.venue", "policyHolder"],
        });
        if (!quote) {
            // If quote not found, return 404.
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
        // Check if the quote has already been converted to a policy.
        if (quote.convertedToPolicy) {
            console.error("Quote already converted:", quoteNumber);
            res.status(400).json({ error: "Quote is already converted to a policy" });
            return;
        }
        // Update the quote's status to COMPLETE.
        // Update the quote status to COMPLETE
        quote.status = enums_1.StepStatus.COMPLETE;
        await quoteRepository.save(quote);
        console.log("Updated quote status to COMPLETE");
        // For admin-generated quotes, require 'forceConvert' flag unless it's already set.
        // This acts as a confirmation step for admin conversions.
        if (quote.source === enums_1.QuoteSource.ADMIN && !forceConvert) {
            console.log("Admin quote requires manual conversion");
            res.status(400).json({
                error: "Admin-generated quotes require manual conversion confirmation",
                requiresManualConversion: true,
            });
            return;
        }
        // Call the service function to create a policy from the quote.
        console.log("Creating policy from quote");
        const policy = await (0, policy_service_1.createPolicyFromQuote)(quote.id);
        console.log("Created policy:", {
            id: policy.id,
            policyNumber: policy.policyNumber,
        });
        // For admin-generated quotes, create a payment record with SUCCESS status
        // and ensure the quote relation is properly maintained
        if (quote.source === enums_1.QuoteSource.ADMIN) {
            const paymentRepository = data_source_1.AppDataSource.getRepository(payment_entity_1.Payment);
            const newPayment = paymentRepository.create({
                quoteId: quote.id,
                policyId: policy.id,
                amount: quote.totalPremium,
                status: enums_1.PaymentStatus.SUCCESS,
                method: "admin",
                reference: `admin-payment-${Date.now()}`,
            });
            await paymentRepository.save(newPayment);
            // Ensure the quote relation is properly maintained
            policy.quote = quote;
            policy.quoteId = quote.id;
            // Ensure venue locationType is properly set
            if ((_a = policy.event) === null || _a === void 0 ? void 0 : _a.venue) {
                policy.event.venue.locationType =
                    policy.event.venue.ceremonyLocationType ||
                        policy.event.venue.locationType;
                await data_source_1.AppDataSource.manager
                    .getRepository(venue_entity_1.Venue)
                    .save(policy.event.venue);
            }
            await data_source_1.AppDataSource.manager.getRepository(policy_entity_1.Policy).save(policy);
        }
        // Fetch the complete policy with all relations to return in the response.
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
    }
    catch (error) {
        // Error handling for POST /api/v1/policies/from-quote.
        console.error("POST /from-quote error:", error);
        console.error("Error details:", {
            name: error.name,
            message: error.message,
            stack: error.stack,
        });
        const message = error instanceof Error ? error.message : "Server error";
        res.status(500).json({ error: message });
    }
});
// --- GET /api/v1/policies/:id/versions ---
// Handles fetching all versions for a specific policy ID.
router.get("/:id/versions", async (req, res) => {
    try {
        const { id } = req.params;
        const versionRepository = data_source_1.AppDataSource.getRepository(policy_version_entity_1.PolicyVersion);
        const versions = await versionRepository.find({
            where: { policyId: Number(id) },
            order: { createdAt: "DESC" },
        });
        res.json({ versions });
    }
    catch (error) {
        console.error("GET /api/policies/:id/versions error:", error);
        res.status(500).json({ error: "Failed to fetch policy versions" });
    }
});
// --- GET /api/v1/policies/:id/versions/:versionId/download ---
// Handles downloading the PDF for a specific version.
router.get("/:id/versions/:versionId/download", async (req, res) => {
    var _a;
    try {
        const { id, versionId } = req.params;
        const versionRepository = data_source_1.AppDataSource.getRepository(policy_version_entity_1.PolicyVersion);
        const version = await versionRepository.findOne({
            where: { id: Number(versionId), policyId: Number(id) },
        });
        if (!version) {
            res.status(404).json({ error: "Policy version not found" });
            return;
        }
        const pdfFile = (_a = version.data) === null || _a === void 0 ? void 0 : _a.pdfFile;
        if (!pdfFile) {
            res.status(404).json({ error: "PDF file not found for this version" });
            return;
        }
        const filePath = path_1.default.join(__dirname, "../../uploads", pdfFile);
        if (!fs_1.default.existsSync(filePath)) {
            res.status(404).json({ error: "PDF file missing on server" });
            return;
        }
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=\"${pdfFile}\"`);
        fs_1.default.createReadStream(filePath).pipe(res);
    }
    catch (error) {
        console.error("GET /api/policies/:id/versions/:versionId/download error:", error);
        res.status(500).json({ error: "Failed to download policy version PDF" });
    }
});
// Endpoint to fetch event data for a policy
// Handles fetching the event data associated with a specific policy ID.
router.get("/:id/event", async (req, res) => {
    try {
        const { id } = req.params;
        const policyRepository = data_source_1.AppDataSource.getRepository(policy_entity_1.Policy);
        const policy = await policyRepository.findOne({
            where: { id: Number(id) },
            relations: ["event", "event.venue"],
        });
        if (!policy || !policy.event) {
            // If policy or its event not found, return 404.
            res.status(404).json({ error: "Event not found" });
            return;
        }
        res.json({ event: policy.event });
    }
    catch (error) {
        // Error handling for GET /api/v1/policies/:id/event.
        console.error("GET /api/policies/:id/event error:", error);
        res.status(500).json({ error: "Failed to fetch event data" });
    }
});
// Endpoint to fetch policy holder data for a policy
// Handles fetching the policy holder data associated with a specific policy ID.
router.get("/:id/policy-holder", async (req, res) => {
    try {
        const { id } = req.params;
        const policyRepository = data_source_1.AppDataSource.getRepository(policy_entity_1.Policy);
        const policy = await policyRepository.findOne({
            where: { id: Number(id) },
            relations: ["policyHolder"],
        });
        if (!policy || !policy.policyHolder) {
            // If policy or its policy holder not found, return 404.
            res.status(404).json({ error: "Policy holder not found" });
            return;
        }
        res.json({ policyHolder: policy.policyHolder });
    }
    catch (error) {
        // Error handling for GET /api/v1/policies/:id/policy-holder.
        console.error("GET /api/policies/:id/policy-holder error:", error);
        res.status(500).json({ error: "Failed to fetch policy holder data" });
    }
});
// Endpoint to fetch payments data for a policy
// Handles fetching the payments data associated with a specific policy ID.
router.get("/:id/payments", async (req, res) => {
    try {
        const { id } = req.params;
        const policyRepository = data_source_1.AppDataSource.getRepository(policy_entity_1.Policy);
        const policy = await policyRepository.findOne({
            where: { id: Number(id) },
            relations: ["payments"],
        });
        if (!policy || !policy.payments) {
            // If policy or its payments not found, return 404.
            res.status(404).json({ error: "Payments not found" });
            return;
        }
        res.json({ payments: policy.payments });
    }
    catch (error) {
        // Error handling for GET /api/v1/policies/:id/payments.
        console.error("GET /api/policies/:id/payments error:", error);
        res.status(500).json({ error: "Failed to fetch payments data" });
    }
});
// Add this new endpoint before the export
router.get("/:id/version-pdf", async (req, res) => {
    var _a;
    try {
        const { id } = req.params;
        const policyRepository = data_source_1.AppDataSource.getRepository(policy_entity_1.Policy);
        // Fetch the policy with all its relations
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
            ],
        });
        if (!policy) {
            res.status(404).json({ error: "Policy not found" });
            return;
        }
        // Generate PDF using the VersionPdfService
        const pdfBuffer = await versionPdf_service_1.VersionPdfService.generateVersionPdf({
            policy,
            event: policy.event,
            venue: (_a = policy.event) === null || _a === void 0 ? void 0 : _a.venue,
            policyHolder: policy.policyHolder,
            quote: policy.quote,
        });
        // Set response headers for PDF download
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=policy-version-${policy.policyNumber}-${new Date().toISOString()}.pdf`);
        // Send the PDF buffer
        res.send(pdfBuffer);
    }
    catch (error) {
        console.error("GET /api/policies/:id/version-pdf error:", error);
        res.status(500).json({ error: "Failed to generate version PDF" });
    }
});
exports.default = router;
