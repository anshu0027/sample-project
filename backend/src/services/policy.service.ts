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
            relations: ['policy'], // Check if a policy is already linked
        });

        if (!quote) {
            throw new Error('Quote not found');
        }

        // If policy already exists, return it
        if (quote.policy) {
            return quote.policy;
        }

        // 1. Create the new policy
        const policyPrefix = 'PI';
        const policyNumber = generateUniqueId(policyPrefix);
        const newPolicy = policyRepository.create({
            policyNumber,
            quote: quote,
        });
        await policyRepository.save(newPolicy);

        // 2. Mark the quote as converted
        quote.convertedToPolicy = true;
        await quoteRepository.save(quote);

        return newPolicy;
    });
}