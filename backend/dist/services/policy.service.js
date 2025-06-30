"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPolicyFromQuote = createPolicyFromQuote;
// my-backend/src/services/policy.service.ts
const data_source_1 = require("../data-source");
const quote_entity_1 = require("../entities/quote.entity");
const policy_entity_1 = require("../entities/policy.entity");
// import { generateUniqueId } from "../utils/helpers";
// ------------------------
async function createPolicyFromQuote(quoteId) {
    // ------------------------
    // Start a database transaction.
    // ------------------------
    return data_source_1.AppDataSource.manager.transaction(async (transactionalEntityManager) => {
        const quoteRepository = transactionalEntityManager.getRepository(quote_entity_1.Quote);
        const policyRepository = transactionalEntityManager.getRepository(policy_entity_1.Policy);
        // ------------------------
        // Fetch the quote by its ID, including necessary relations like 'policy', 'event', and 'policyHolder'.
        // ------------------------
        const quote = await quoteRepository.findOne({
            where: { id: quoteId },
            relations: ["policy", "event", "event.venue", "policyHolder"], // Include all necessary relations
        });
        // ------------------------
        // If the quote is not found, throw an error.
        // ------------------------
        if (!quote) {
            throw new Error("Quote not found");
        }
        // ------------------------
        // If the quote already has an associated policy (i.e., it has already been converted),
        // return the existing policy to prevent duplicate creation.
        // ------------------------
        if (quote.policy) {
            return quote.policy;
        }
        // ------------------------
        // 1. Create a new Policy entity.
        //    - Generate a unique policy number.
        //    - Associate the quote, event, and policyHolder from the fetched quote.
        // ------------------------
        const quoteNumberParts = quote.quoteNumber.split("-");
        const policyIdentifier = quoteNumberParts[quoteNumberParts.length - 1];
        const policyNumber = `PI-${policyIdentifier}`;
        const newPolicy = policyRepository.create({
            policyNumber,
            quote: quote,
            event: quote.event,
            policyHolder: quote.policyHolder,
        });
        // ------------------------
        // 2. Save the newly created policy to the database.
        //    This establishes the relationship between the policy and the quote.
        // ------------------------
        const savedPolicy = await policyRepository.save(newPolicy);
        // ------------------------
        // 3. Update the original quote to mark it as converted to a policy.
        //    This prevents the same quote from being converted multiple times.
        // ------------------------
        quote.convertedToPolicy = true;
        await quoteRepository.save(quote);
        // ------------------------
        // 4. Fetch the complete policy record again, this time ensuring all relations are loaded.
        //    This is to ensure the returned object is fully populated.
        // ------------------------
        const completePolicy = await policyRepository.findOne({
            where: { id: savedPolicy.id },
            relations: ["quote", "event", "event.venue", "policyHolder"],
        });
        if (!completePolicy) {
            throw new Error("Failed to retrieve created policy");
        }
        // ------------------------
        // Return the fully populated policy.
        // If all operations within the transaction are successful, the transaction will be committed.
        // Otherwise, it will be rolled back.
        // ------------------------
        return completePolicy;
    });
}
//# sourceMappingURL=policy.service.js.map