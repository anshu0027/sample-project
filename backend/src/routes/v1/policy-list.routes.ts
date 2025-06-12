// my-backend/src/routes/v1/policy-list.routes.ts
import { Router, Request, Response } from 'express';
import { AppDataSource } from '../../data-source';
import { Policy } from '../../entities/policy.entity';
import { QuoteSource, PaymentStatus } from '../../entities/enums';

const router = Router();

// --- GET /api/v1/policy-list ---
router.get('/', async (req: Request, res: Response) => {
    try {
        // 1. Parse pagination parameters from the query string
        const page = parseInt(req.query.page as string || '1', 10);
        const pageSize = parseInt(req.query.pageSize as string || '10', 10);
        const skip = (page - 1) * pageSize;

        const policyRepository = AppDataSource.getRepository(Policy);

        // 2. Use findAndCount for efficient pagination with all necessary relations
        const [policies, total] = await policyRepository.findAndCount({
            relations: [
                'quote',
                'quote.policyHolder',
                'quote.event',
                'event',
                'policyHolder',
                'payments'
            ],
            order: { createdAt: 'DESC' },
            skip: skip,
            take: pageSize,
        });

        console.log('Raw policies data:', JSON.stringify(policies, null, 2));

        // 3. Format the data exactly as the frontend expects
        const formattedPolicies = policies.map((policy) => {
            console.log('Processing policy:', policy.id);
            console.log('Policy quote:', policy.quote);
            console.log('Policy event:', policy.event);
            console.log('Policy holder:', policy.policyHolder);
            console.log('Policy payments:', policy.payments);

            // Get the relevant data from either quote or direct policy
            const source = policy.quote || policy;
            const event = policy.quote?.event || policy.event;
            const policyHolder = policy.quote?.policyHolder || policy.policyHolder;
            const payment = policy.payments?.[0];

            console.log('Extracted data:', {
                source,
                event,
                policyHolder,
                payment
            });

            // Determine payment status
            let paymentStatus = payment?.status || 'PENDING';
            if (policy.quote?.source === QuoteSource.ADMIN) {
                paymentStatus = PaymentStatus.SUCCESS;
            }

            // Format the data for the frontend
            const formattedPolicy = {
                id: policy.id,
                policyId: policy.id,
                policyNumber: policy.policyNumber,
                quoteNumber: policy.quote?.quoteNumber,
                email: policy.quote?.email,
                customer: policyHolder ? `${policyHolder.firstName || ''} ${policyHolder.lastName || ''}`.trim() : null,
                policyHolder: {
                    firstName: policyHolder?.firstName || null,
                    lastName: policyHolder?.lastName || null
                },
                event: {
                    eventType: event?.eventType || null,
                    eventDate: event?.eventDate || null,
                    maxGuests: event?.maxGuests || null
                },
                eventType: event?.eventType || null,
                eventDate: event?.eventDate || null,
                totalPremium: policy.quote?.totalPremium || payment?.amount || 0,
                status: paymentStatus,
                createdAt: policy.createdAt,
                updatedAt: policy.updatedAt,
                payments: policy.payments?.map(p => ({
                    amount: p.amount,
                    status: p.status,
                    method: p.method,
                    reference: p.reference
                })) || []
            };

            console.log('Formatted policy:', formattedPolicy);
            return formattedPolicy;
        });

        // 4. Send the formatted response
        const response = { 
            policies: formattedPolicies, 
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize)
        };

        console.log('Final response:', JSON.stringify(response, null, 2));
        res.json(response);

    } catch (error) {
        console.error('GET /api/v1/policy-list error:', error);
        res.status(500).json({ error: 'Failed to fetch policies' });
    }
});

// The DELETE logic from the old file seems out of place for a "list" route.
// It more logically belongs in the main policy.routes.ts file, which we have already done.
// Therefore, we will NOT include the DELETE handler here to maintain a clean API design.

export default router;