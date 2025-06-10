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
            relations: ['quote', 'quote.event', 'quote.event.venue', 'quote.policyHolder', 'event', 'event.venue', 'policyHolder', 'payments'],
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
        } as unknown as Event);

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
        } as unknown as PolicyHolder);

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
        } as unknown as Policy);

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
        const versionRepository = AppDataSource.getRepository(PolicyVersion);
        const policyRecord = await policyRepository.findOne({
            where: { id: Number(id) },
            relations: ['quote', 'event', 'event.venue', 'policyHolder', 'versions'],
        });

        if (!policyRecord) {
            res.status(404).json({ error: 'Policy not found' });
            return;
        }

        // Create snapshot of current policy data
        const policySnapshot = {
            policy: policyRecord,
            quote: policyRecord.quote,
            event: policyRecord.event,
            venue: policyRecord.event?.venue,
            policyHolder: policyRecord.policyHolder,
            versionMetadata
        };

        // Create new version
        const newVersion = versionRepository.create({
            policy: policyRecord,
            data: policySnapshot
        });
        await versionRepository.save(newVersion);

        // Check and cleanup old versions if needed
        const versions = await versionRepository.find({
            where: { policy: { id: Number(id) } },
            order: { createdAt: 'DESC' }
        });

        if (versions.length > 10) {
            // Delete oldest versions beyond the limit
            const versionsToDelete = versions.slice(10);
            await versionRepository.remove(versionsToDelete);
        }

        // --- Update Logic ---
        // Merge top-level policy fields
        policyRepository.merge(policyRecord, { 
            policyNumber: fields.policyNumber, 
            pdfUrl: fields.pdfUrl,
            status: fields.status
        });

        // Update event fields if provided
        if (fields.eventType || fields.eventDate || fields.maxGuests || 
            fields.honoree1FirstName || fields.honoree1LastName || 
            fields.honoree2FirstName || fields.honoree2LastName) {
            
            const eventRepository = AppDataSource.getRepository(Event);
            const event = policyRecord.event || new Event();
            
            eventRepository.merge(event, {
                eventType: fields.eventType,
                eventDate: fields.eventDate,
                maxGuests: fields.maxGuests,
                honoree1FirstName: fields.honoree1FirstName,
                honoree1LastName: fields.honoree1LastName,
                honoree2FirstName: fields.honoree2FirstName,
                honoree2LastName: fields.honoree2LastName
            });
            
            await eventRepository.save(event);
            policyRecord.event = event;
        }

        // Update venue fields if provided
        if (fields.venueName || fields.venueAddress1 || fields.venueAddress2 || 
            fields.venueCountry || fields.venueCity || fields.venueState || 
            fields.venueZip || fields.ceremonyLocationType || 
            fields.indoorOutdoor || fields.venueAsInsured) {
            
            const venueRepository = AppDataSource.getRepository(Venue);
            const venue = policyRecord.event?.venue || new Venue();
            
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
                venueAsInsured: fields.venueAsInsured
            });
            
            await venueRepository.save(venue);
            if (policyRecord.event) {
                policyRecord.event.venue = venue;
            }
        }

        // Update policy holder fields if provided
        if (fields.firstName || fields.lastName || fields.phone || 
            fields.relationship || fields.hearAboutUs || fields.address || 
            fields.country || fields.city || fields.state || fields.zip || 
            fields.legalNotices || fields.completingFormName) {
            
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
                completingFormName: fields.completingFormName
            });
            
            await policyHolderRepository.save(policyHolder);
            policyRecord.policyHolder = policyHolder;
        }

        // Update quote fields if provided
        if (fields.email || fields.coverageLevel || fields.liabilityCoverage || 
            fields.liquorLiability || fields.covidDisclosure || 
            fields.specialActivities || fields.residentState || 
            fields.totalPremium || fields.basePremium || 
            fields.liabilityPremium || fields.liquorLiabilityPremium) {
            
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
                liquorLiabilityPremium: fields.liquorLiabilityPremium
            });
            
            await quoteRepository.save(quote);
            policyRecord.quote = quote;
        }

        // Save the updated policy
        const updatedPolicy = await policyRepository.save(policyRecord);

        // Fetch the complete policy with all relations
        const completePolicy = await policyRepository.findOne({
            where: { id: updatedPolicy.id },
            relations: ['quote', 'event', 'event.venue', 'policyHolder', 'versions']
        });

        res.json({ policy: completePolicy });

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

// --- GET /api/v1/policies/:id/versions ---
router.get('/:id/versions', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const versionRepository = AppDataSource.getRepository(PolicyVersion);

        const versions = await versionRepository.find({
            where: { policy: { id: Number(id) } },
            order: { createdAt: 'DESC' }
        });

        res.json({ versions });
    } catch (error) {
        console.error('GET /api/policies/:id/versions error:', error);
        res.status(500).json({ error: 'Failed to fetch policy versions' });
    }
});

// --- GET /api/v1/policies/:id/versions/:versionId ---
router.get('/:id/versions/:versionId', async (req: Request, res: Response) => {
    try {
        const { id, versionId } = req.params;
        const versionRepository = AppDataSource.getRepository(PolicyVersion);

        const version = await versionRepository.findOne({
            where: { 
                id: Number(versionId),
                policy: { id: Number(id) }
            }
        });

        if (!version) {
            res.status(404).json({ error: 'Policy version not found' });
            return;
        }

        res.json({ version });
    } catch (error) {
        console.error('GET /api/policies/:id/versions/:versionId error:', error);
        res.status(500).json({ error: 'Failed to fetch policy version' });
    }
});

// Endpoint to fetch event data for a policy
router.get('/:id/event', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const policyRepository = AppDataSource.getRepository(Policy);
        const policy = await policyRepository.findOne({
            where: { id: Number(id) },
            relations: ['event', 'event.venue'],
        });

        if (!policy || !policy.event) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }

        res.json({ event: policy.event });
    } catch (error) {
        console.error('GET /api/policies/:id/event error:', error);
        res.status(500).json({ error: 'Failed to fetch event data' });
    }
});

// Endpoint to fetch policy holder data for a policy
router.get('/:id/policy-holder', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const policyRepository = AppDataSource.getRepository(Policy);
        const policy = await policyRepository.findOne({
            where: { id: Number(id) },
            relations: ['policyHolder'],
        });

        if (!policy || !policy.policyHolder) {
            res.status(404).json({ error: 'Policy holder not found' });
            return;
        }

        res.json({ policyHolder: policy.policyHolder });
    } catch (error) {
        console.error('GET /api/policies/:id/policy-holder error:', error);
        res.status(500).json({ error: 'Failed to fetch policy holder data' });
    }
});

// Endpoint to fetch payments data for a policy
router.get('/:id/payments', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const policyRepository = AppDataSource.getRepository(Policy);
        const policy = await policyRepository.findOne({
            where: { id: Number(id) },
            relations: ['payments'],
        });

        if (!policy || !policy.payments) {
            res.status(404).json({ error: 'Payments not found' });
            return;
        }

        res.json({ payments: policy.payments });
    } catch (error) {
        console.error('GET /api/policies/:id/payments error:', error);
        res.status(500).json({ error: 'Failed to fetch payments data' });
    }
});

export default router;


