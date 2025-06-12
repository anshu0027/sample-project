// my-backend/src/services/policy.service.ts
import { AppDataSource } from '../data-source';
import { Quote } from '../entities/quote.entity';
import { Policy } from '../entities/policy.entity';
import { generateUniqueId } from '../utils/helpers';

export async function createPolicyFromQuote(quoteId: number): Promise<Policy> {
    // Use a transaction to ensure both operations succeed or fail together
    return AppDataSource.manager.transaction(async (transactionalEntityManager) => {
        const quoteRepository = transactionalEntityManager.getRepository(Quote);
        const policyRepository = transactionalEntityManager.getRepository(Policy);

        const quote = await quoteRepository.findOne({
            where: { id: quoteId },
            relations: ['policy', 'event', 'event.venue', 'policyHolder'], // Include all necessary relations
        });

        if (!quote) {
            throw new Error('Quote not found');
        }

        // If policy already exists, return it
        if (quote.policy) {
            return quote.policy;
        }

        // 1. Create the new policy with all necessary data
        const policyPrefix = 'PI';
        const policyNumber = generateUniqueId(policyPrefix);
        const newPolicy = policyRepository.create({
            policyNumber,
            quote: quote,
            event: quote.event,
            policyHolder: quote.policyHolder,
        });

        // 2. Save the policy first to establish the relationship
        const savedPolicy = await policyRepository.save(newPolicy);

        // 3. Mark the quote as converted
        quote.convertedToPolicy = true;
        await quoteRepository.save(quote);

        // 4. Return the complete policy with all relations
        const completePolicy = await policyRepository.findOne({
            where: { id: savedPolicy.id },
            relations: ['quote', 'event', 'event.venue', 'policyHolder']
        });

        if (!completePolicy) {
            throw new Error('Failed to retrieve created policy');
        }

        return completePolicy;
    });
}