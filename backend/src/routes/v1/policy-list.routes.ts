// my-backend/src/routes/v1/policy-list.routes.ts
import { Router, Request, Response } from 'express';
import { AppDataSource } from '../../data-source';
import { Policy } from '../../entities/policy.entity';

const router = Router();

// --- GET /api/v1/policy-list ---
router.get('/', async (req: Request, res: Response) => {
    try {
        // 1. Parse pagination parameters from the query string
        const page = parseInt(req.query.page as string || '1', 10);
        const pageSize = parseInt(req.query.pageSize as string || '10', 10);
        const skip = (page - 1) * pageSize;

        const policyRepository = AppDataSource.getRepository(Policy);

        // 2. Use findAndCount for efficient pagination
        const [policies, total] = await policyRepository.findAndCount({
            relations: ['quote', 'quote.policyHolder', 'quote.event'],
            order: { createdAt: 'DESC' },
            skip: skip,
            take: pageSize,
        });

        // 3. Format the data exactly as the frontend expects
        const policiesWithQuote = policies.map((p) => {
            if (p.quote) {
                return {
                    ...p.quote, // Spread the quote fields
                    quoteNumber: p.quote.quoteNumber,
                    policyId: p.id,
                    policyNumber: p.policyNumber,
                    email: p.quote.email,
                    policyCreatedAt: p.createdAt,
                    pdfUrl: p.pdfUrl,
                };
            } else {
                // Handle policies that might not have a quote (customer flow)
                return {
                    policyId: p.id,
                    policyCreatedAt: p.createdAt,
                    pdfUrl: p.pdfUrl,
                    policyNumber: p.policyNumber,
                };
            }
        });

        res.json({ policies: policiesWithQuote, total });

    } catch (error) {
        console.error('GET /api/v1/policy-list error:', error);
        res.status(500).json({ error: 'Failed to fetch policies' });
    }
});

// The DELETE logic from the old file seems out of place for a "list" route.
// It more logically belongs in the main policy.routes.ts file, which we have already done.
// Therefore, we will NOT include the DELETE handler here to maintain a clean API design.

export default router;