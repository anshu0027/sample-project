// my-backend/src/routes/v1/policy.routes.ts
import { Router, Request, Response } from 'express';
import { AppDataSource } from '../../data-source';
import { Quote } from '../../entities/quote.entity';
import { Policy } from '../../entities/policy.entity';
import { PolicyVersion } from '../../entities/policy-version.entity';
import { Event } from '../../entities/event.entity';
import { Venue } from '../../entities/venue.entity';
import { PolicyHolder } from '../../entities/policy-holder.entity';
import { Payment } from '../../entities/payment.entity';
import { QuoteSource, StepStatus, PaymentStatus } from '../../entities/enums';
import { createPolicyFromQuote } from '../../services/policy.service';

const router = Router();

// --- GET /api/v1/policies ---
// --- GET /api/v1/policies/:id ---
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { versionsOnly } = req.query;

        if (versionsOnly === 'true') {
            const versionRepository = AppDataSource.getRepository(PolicyVersion);
            const versions = await versionRepository.find({
                where: { policy: { id: Number(id) } },
                order: { createdAt: 'DESC' },
            });
            res.json({ versions });
            return;
        }

        const policyRepository = AppDataSource.getRepository(Policy);
        const policy = await policyRepository.findOne({
            where: { id: Number(id) },
            relations: ['quote', 'quote.event', 'quote.event.venue', 'quote.policyHolder', 'event', 'event.venue', 'policyHolder', 'payments', 'versions'],
        });

        if (!policy) {
            res.status(404).json({ error: 'Policy not found' });
            return;
        }
        res.json({ policy });

    } catch (error) {
        console.error('GET /api/policies/:id error:', error);
        res.status(500).json({ error: 'Failed to fetch policy' });
    }
});

// --- GET /api/v1/policies ---
// Handles fetching ALL policies.
router.get('/', async (req: Request, res: Response) => {
    try {
        const policyRepository = AppDataSource.getRepository(Policy);
        const policies = await policyRepository.find({
            order: { createdAt: 'DESC' },
            relations: ['quote', 'quote.event', 'quote.event.venue', 'quote.policyHolder', 'event', 'event.venue', 'policyHolder', 'payments', 'versions'],
        });
        res.json({ policies });

    } catch (error) {
        console.error('GET /api/policies error:', error);
        res.status(500).json({ error: 'Failed to fetch policies' });
    }
});


// --- POST /api/v1/policies ---
// This is for creating a policy directly (customer flow)
router.post('/', async (req: Request, res: Response) => {
    try {
        const fields = req.body;
        if (!fields.policyNumber || !fields.eventType || !fields.firstName || !fields.paymentAmount) {
            res.status(400).json({ error: 'Incomplete data for policy creation.' });
            return;
        }

        const policyRepository = AppDataSource.getRepository(Policy);
        const eventRepository = AppDataSource.getRepository(Event);
        const policyHolderRepository = AppDataSource.getRepository(PolicyHolder);
        const paymentRepository = AppDataSource.getRepository(Payment);

        // Check if policy already exists
        const existingPolicy = await policyRepository.findOne({
            where: { policyNumber: fields.policyNumber }
        });

        if (existingPolicy) {
            res.status(400).json({ error: 'Policy with this number already exists.' });
            return;
        }

        // Create and save event first
        const event = eventRepository.create({
            eventType: fields.eventType,
            eventDate: fields.eventDate,
            maxGuests: fields.maxGuests,
            venue: fields.venueId ? { id: fields.venueId } : null
        });
        const savedEvent = await eventRepository.save(event);

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
            country: fields.country
        });
        const savedPolicyHolder = await policyHolderRepository.save(policyHolder);

        // Create and save payment
        const payment = paymentRepository.create({
            amount: parseFloat(fields.paymentAmount),
            status: fields.paymentStatus || 'PENDING',
            method: fields.paymentMethod || 'CASH',
            reference: fields.paymentReference || `PAY-${Date.now()}`
        });
        const savedPayment = await paymentRepository.save(payment);

        // Create the main policy with saved relations
        const newPolicy = policyRepository.create({
            policyNumber: fields.policyNumber,
            pdfUrl: fields.pdfUrl,
            event: savedEvent,
            policyHolder: savedPolicyHolder,
            payments: [savedPayment]
        });

        const savedPolicy = await policyRepository.save(newPolicy);

        // Fetch the complete policy with all relations
        const completePolicy = await policyRepository.findOne({
            where: { id: savedPolicy.id },
            relations: ['event', 'policyHolder', 'payments']
        });

        res.status(201).json({ policy: completePolicy });

    } catch (error) {
        console.error('POST /api/policies error:', error);
        res.status(500).json({ error: 'Server error during policy creation' });
    }
});


// --- PUT /api/v1/policies/:id ---
// Handles updating a policy and creating a version snapshot
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { versionMetadata, ...fields } = req.body;

        const policyRepository = AppDataSource.getRepository(Policy);
        const policyRecord = await policyRepository.findOne({
            where: { id: Number(id) },
            relations: ['quote', 'event', 'event.venue', 'policyHolder', 'versions'],
        });

        if (!policyRecord) {
            res.status(404).json({ error: 'Policy not found' });
            return;
        }

        // --- Versioning Logic ---
        const versionRepository = AppDataSource.getRepository(PolicyVersion);
        const policySnapshot = { ...policyRecord, ...fields, versionCreatedAt: new Date() };

        // Cap versions at 10
        if (policyRecord.versions && policyRecord.versions.length >= 10) {
            const versionsSorted = policyRecord.versions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
            await versionRepository.delete(versionsSorted[0].id);
        }

        const newVersion = versionRepository.create({
            policy: policyRecord,
            data: policySnapshot, // TypeORM handles JSON conversion
        });
        await versionRepository.save(newVersion);

        // --- Update Logic ---
        // Merge top-level policy fields
        policyRepository.merge(policyRecord, { policyNumber: fields.policyNumber, pdfUrl: fields.pdfUrl });

        // If it's a customer-flow policy (no quote)
        if (!policyRecord.quote) {
            if (policyRecord.event) {
                AppDataSource.getRepository(Event).merge(policyRecord.event, { eventType: fields.eventType, eventDate: fields.eventDate });
                if (policyRecord.event.venue) {
                    AppDataSource.getRepository(Venue).merge(policyRecord.event.venue, { name: fields.venueName, address1: fields.venueAddress1 });
                }
            }
            if (policyRecord.policyHolder) {
                AppDataSource.getRepository(PolicyHolder).merge(policyRecord.policyHolder, { firstName: fields.firstName, lastName: fields.lastName });
            }
        } else { // If it's an admin-flow policy (with a quote)
            const quoteRepository = AppDataSource.getRepository(Quote);
            const quoteFields = {
                coverageLevel: fields.coverageLevel,
                liabilityCoverage: fields.liabilityCoverage,
                // ... other quote fields
            };
            await quoteRepository.update({ id: policyRecord.quote.id }, quoteFields);
            // Also update event/policyholder on the quote
            if (policyRecord.quote.event) {
                 AppDataSource.getRepository(Event).merge(policyRecord.quote.event, { eventType: fields.eventType, eventDate: fields.eventDate });
                 if (policyRecord.quote.event.venue) {
                    AppDataSource.getRepository(Venue).merge(policyRecord.quote.event.venue, { name: fields.venueName, address1: fields.venueAddress1 });
                }
            }
             if (policyRecord.quote.policyHolder) {
                AppDataSource.getRepository(PolicyHolder).merge(policyRecord.quote.policyHolder, { firstName: fields.firstName, lastName: fields.lastName });
            }
        }
        
        const updatedPolicy = await policyRepository.save(policyRecord);
        res.json({ policy: updatedPolicy });

    } catch (error) {
        console.error('PUT /api/policies error:', error);
        res.status(500).json({ error: 'Failed to update policy' });
    }
});


// --- DELETE /api/v1/policies/:id ---
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const policyRepository = AppDataSource.getRepository(Policy);

        const policy = await policyRepository.findOne({
            where: { id: Number(id) },
            relations: ['quote', 'quote.event', 'quote.event.venue', 'quote.policyHolder', 'event', 'event.venue', 'policyHolder', 'payments', 'versions'],
        });

        if (!policy) {
            res.status(404).json({ error: 'Policy not found' });
            return;
        }

        // Use transaction for safe deletion
        await AppDataSource.manager.transaction(async transactionalEntityManager => {
            // Delete all dependents first
            if (policy.versions.length > 0) await transactionalEntityManager.remove(policy.versions);
            if (policy.payments.length > 0) await transactionalEntityManager.remove(policy.payments);

            // If it's a quote-based policy (admin flow)
            if (policy.quote) {
                const quote = policy.quote;
                if (quote.event?.venue) await transactionalEntityManager.remove(quote.event.venue);
                if (quote.event) await transactionalEntityManager.remove(quote.event);
                if (quote.policyHolder) await transactionalEntityManager.remove(quote.policyHolder);
                // First remove the policy, then the quote
                await transactionalEntityManager.remove(policy);
                await transactionalEntityManager.remove(quote);
            } else { // If it's a direct policy (customer flow)
                if (policy.event?.venue) await transactionalEntityManager.remove(policy.event.venue);
                if (policy.event) await transactionalEntityManager.remove(policy.event);
                if (policy.policyHolder) await transactionalEntityManager.remove(policy.policyHolder);
                await transactionalEntityManager.remove(policy);
            }
        });

        res.json({ message: 'Policy and related records deleted successfully' });

    } catch (error) {
        console.error('DELETE /api/policies error:', error);
        res.status(500).json({ error: 'Failed to delete policy' });
    }
});

// We still need the /from-quote route from the previous step
router.post('/from-quote', async (req: Request, res: Response) => {
    try {
        const { quoteNumber, forceConvert } = req.body;

        if (!quoteNumber) {
            res.status(400).json({ error: 'Missing quoteNumber' });
            return;
        }

        const quoteRepository = AppDataSource.getRepository(Quote);
        const policyRepository = AppDataSource.getRepository(Policy);

        const quote = await quoteRepository.findOne({
            where: { quoteNumber },
            relations: ['policy'],
        });

        if (!quote) {
            res.status(404).json({ error: 'Quote not found' });
            return;
        }

        if (quote.convertedToPolicy) {
            res.status(400).json({ error: 'Quote is already converted to a policy' });
            return;
        }

        // --- START: NEW LOGIC ---
        // Update the quote status to COMPLETE as part of this atomic operation.
        quote.status = StepStatus.COMPLETE;
        await quoteRepository.save(quote);
        // --- END: NEW LOGIC ---

        if (quote.source === QuoteSource.ADMIN && !forceConvert) {
            res.status(400).json({
                error: 'Admin-generated quotes require manual conversion confirmation',
                requiresManualConversion: true,
            });
            return;
        }

        const policy = await createPolicyFromQuote(quote.id);

        res.status(201).json({
            message: 'Quote converted to policy successfully',
            policyNumber: policy.policyNumber,
            policy: policy,
        });

    } catch (error) {
        console.error('POST /from-quote error:', error);
        const message = error instanceof Error ? error.message : 'Server error';
        res.status(500).json({ error: message });
    }
});

export default router;


