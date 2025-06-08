import { Router, Request, Response } from 'express';
import { AppDataSource } from '../../data-source';
import { Quote } from '../../entities/quote.entity';
import { User } from '../../entities/user.entity';
import { Event } from '../../entities/event.entity';
import { Venue } from '../../entities/venue.entity';
import { PolicyHolder } from '../../entities/policy-holder.entity';
import { Policy } from '../../entities/policy.entity';
import { Payment } from '../../entities/payment.entity';
import { QuoteSource, StepStatus } from '../../entities/enums';
import { createPolicyFromQuote } from '../../services/policy.service';
import { PaymentStatus } from '../../entities/enums';
import {
  generateQuoteNumber,
  calculateBasePremium,
  calculateLiabilityPremium,
  calculateLiquorLiabilityPremium,
  mapMaxGuestsToGuestRange,
  CoverageLevel,
  LiabilityOption,
} from '../../utils/quote.utils';
import { In } from 'typeorm';

const router = Router();

// --- GET /api/v1/quotes ---
router.get('/', async (req: Request, res: Response) => {
  try {
    const { quoteNumber, id, email, allQuotes } = req.query;
    const quoteRepository = AppDataSource.getRepository(Quote);

    const relations = ['event', 'event.venue', 'policyHolder', 'policy'];

    if (quoteNumber) {
      const quote = await quoteRepository.findOne({
        where: { quoteNumber: String(quoteNumber) },
        relations,
      });
      if (!quote) {
        res.status(404).json({ error: 'Quote not found' }); // REMOVED 'return'
        return;
      }
      res.json({ quote }); // REMOVED 'return'
      return;
    }

    if (id) {
      const quote = await quoteRepository.findOne({
        where: { id: Number(id) },
        relations,
      });
      if (!quote) {
        res.status(404).json({ error: 'Quote not found' }); // REMOVED 'return'
        return;
      }
      res.json({ quote }); // REMOVED 'return'
      return;
    }

    if (email) {
      const quote = await quoteRepository.findOne({
        where: { email: String(email) },
        order: { createdAt: 'DESC' },
        relations,
      });
      if (!quote) {
        res.status(404).json({ error: 'Quote not found' }); // REMOVED 'return'
        return;
      }
      res.json({ quote }); // REMOVED 'return'
      return;
    }

    if (allQuotes) {
      const quotes = await quoteRepository.find({
        order: { createdAt: 'DESC' },
        relations: [...relations, 'Payment'],
      });
      res.json({ quotes }); // REMOVED 'return'
      return;
    }

    const quotes = await quoteRepository.find({
      where: { status: StepStatus.COMPLETE },
      order: { createdAt: 'DESC' },
      relations,
    });
    res.json({ policies: quotes }); // REMOVED 'return'

  } catch (error) {
    console.error('GET /api/v1/quotes error:', error);
    res.status(500).json({ error: 'Failed to fetch quotes/policies' }); // REMOVED 'return'
  }
});

// --- POST /api/v1/quotes ---
// Replace the existing POST handler in my-backend/src/routes/v1/quote.routes.ts
router.post('/', async (req: Request, res: Response) => {
  try {
    const fields = req.body;
    const { source = 'CUSTOMER', paymentStatus } = fields;

    const referer = req.get('referer');
    const isAdminRequest = source === 'ADMIN' || (referer && referer.includes('/admin/'));
    const effectiveSource = isAdminRequest ? QuoteSource.ADMIN : QuoteSource.CUSTOMER;

    if (!fields.email) {
      res.status(400).json({ error: 'Missing user email.' });
      return;
    }

    // --- User Handling ---
    const userRepository = AppDataSource.getRepository(User);
    let user = await userRepository.findOneBy({ email: fields.email });
    if (!user) {
      user = userRepository.create({
        email: fields.email,
        firstName: fields.firstName || '',
        lastName: fields.lastName || '',
        phone: fields.phone || '',
      });
      await userRepository.save(user);
    }

    // --- Create explicit data objects for each entity ---
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

    const quoteRepository = AppDataSource.getRepository(Quote);
    const newQuote = quoteRepository.create({
      ...quoteData,
      quoteNumber: generateQuoteNumber(),
      status: isAdminRequest ? StepStatus.COMPLETE : StepStatus.STEP1,
      source: effectiveSource,
      isCustomerGenerated: effectiveSource === QuoteSource.CUSTOMER,
      user: user,
    });

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
      if (fields.venueName) {
        const venueData = {
          name: fields.venueName,
          address1: fields.venueAddress1,
          address2: fields.venueAddress2,
          country: fields.venueCountry,
          city: fields.venueCity,
          state: fields.venueState,
          zip: fields.venueZip,
        };
        const venueRepository = AppDataSource.getRepository(Venue);
        newEvent.venue = venueRepository.create(venueData);
      }
      newQuote.event = newEvent;
    }

    if (fields.firstName && fields.lastName) {
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
      const policyHolderRepository = AppDataSource.getRepository(PolicyHolder);
      newQuote.policyHolder = policyHolderRepository.create(policyHolderData);
    }

    const savedQuote = await quoteRepository.save(newQuote);

    // --- START: AUTO-CONVERSION LOGIC ---
    if (savedQuote.source === QuoteSource.CUSTOMER && paymentStatus === 'SUCCESS') {
        const policy = await createPolicyFromQuote(savedQuote.id);

        if (policy && fields.totalPremium) {
            const paymentRepository = AppDataSource.getRepository(Payment);
            const newPayment = paymentRepository.create({
                quoteId: savedQuote.id,
                policyId: policy.id,
                amount: parseFloat(fields.totalPremium.toString()),
                status: PaymentStatus.SUCCESS,
                method: 'online',
                reference: `payment-${Date.now()}`,
            });
            await paymentRepository.save(newPayment);
        }

        res.status(201).json({
            quoteNumber: savedQuote.quoteNumber,
            quote: savedQuote,
            policy: policy,
            converted: true,
        });
        return; // End the request here
    }
    // --- END: AUTO-CONVERSION LOGIC ---

    // If auto-conversion didn't happen, send the standard response
    res.status(201).json({
      message: 'Quote saved successfully',
      quoteNumber: savedQuote.quoteNumber,
      quote: savedQuote,
    });

  } catch (error) {
    console.error('POST /api/v1/quotes error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    // @ts-ignore - Check for Oracle's unique constraint error code
    if (error.message && error.message.includes('ORA-00001')) {
      res.status(409).json({ error: 'A record with this unique value already exists. Please try again.' });
    } else {
      res.status(500).json({ error: message });
    }
  }
});

// --- PUT /api/v1/quotes/:quoteNumber ---
router.put('/:quoteNumber', async (req: Request, res: Response) => {
  try {
    const { quoteNumber } = req.params;
    const fields = req.body;

    const quoteRepository = AppDataSource.getRepository(Quote);
    const quoteToUpdate = await quoteRepository.findOne({
      where: { quoteNumber },
      relations: ['event', 'event.venue', 'policyHolder', 'user'],
    });

    if (!quoteToUpdate) {
      res.status(404).json({ error: `Quote with number ${quoteNumber} not found.` }); // REMOVED 'return'
      return;
    }

    const needsPremiumRecalculation =
      fields.coverageLevel !== undefined ||
      fields.liabilityCoverage !== undefined ||
      fields.liquorLiability !== undefined ||
      fields.maxGuests !== undefined;

    if (needsPremiumRecalculation) {
      const coverageLevel = fields.coverageLevel ?? quoteToUpdate.coverageLevel;
      const liabilityCoverage = fields.liabilityCoverage ?? quoteToUpdate.liabilityCoverage;
      const liquorLiability = fields.liquorLiability ?? quoteToUpdate.liquorLiability;
      const maxGuests = fields.maxGuests ?? quoteToUpdate.event?.maxGuests;
      
      const guestRange = mapMaxGuestsToGuestRange(maxGuests);
      
      fields.basePremium = calculateBasePremium(coverageLevel as CoverageLevel);
      fields.liabilityPremium = calculateLiabilityPremium(liabilityCoverage as LiabilityOption);
      fields.liquorLiabilityPremium = calculateLiquorLiabilityPremium(liquorLiability, guestRange);
      fields.totalPremium = fields.basePremium + fields.liabilityPremium + fields.liquorLiabilityPremium;
    }

    quoteRepository.merge(quoteToUpdate, fields);

    const eventRepository = AppDataSource.getRepository(Event);
    if (fields.eventType || fields.eventDate || fields.maxGuests) {
        if (!quoteToUpdate.event) {
            quoteToUpdate.event = eventRepository.create();
        }
        eventRepository.merge(quoteToUpdate.event, fields);
        if (fields.eventDate) quoteToUpdate.event.eventDate = new Date(fields.eventDate);
    }

    const venueRepository = AppDataSource.getRepository(Venue);
    if (quoteToUpdate.event && (fields.venueName || fields.venueAddress1)) {
        if (!quoteToUpdate.event.venue) {
            quoteToUpdate.event.venue = venueRepository.create();
        }
        venueRepository.merge(quoteToUpdate.event.venue, {
            name: fields.venueName,
            address1: fields.venueAddress1,
        });
    }

    const policyHolderRepository = AppDataSource.getRepository(PolicyHolder);
    if (fields.firstName || fields.lastName || fields.address) {
        if (!quoteToUpdate.policyHolder) {
            quoteToUpdate.policyHolder = policyHolderRepository.create();
        }
        policyHolderRepository.merge(quoteToUpdate.policyHolder, fields);
    }

    const updatedQuote = await quoteRepository.save(quoteToUpdate);

    res.json({ message: 'Quote updated successfully', quote: updatedQuote }); // REMOVED 'return'

  } catch (error) {
    console.error('PUT /api/v1/quotes error:', error);
    res.status(500).json({ error: 'Server error during quote update' }); // REMOVED 'return'
  }
});

// --- DELETE /api/v1/quotes/:quoteNumber ---
router.delete('/:quoteNumber', async (req: Request, res: Response) => {
    try {
        const { quoteNumber } = req.params;
        const quoteRepository = AppDataSource.getRepository(Quote);

        const quote = await quoteRepository.findOne({
            where: { quoteNumber },
            relations: ['event', 'event.venue', 'policyHolder', 'policy', 'policy.versions', 'Payment'],
        });

        if (!quote) {
            res.status(404).json({ error: 'Quote not found' }); // REMOVED 'return'
            return;
        }

        const entityManager = AppDataSource.manager;

        if (quote.policy?.versions?.length) {
            await entityManager.delete('policy_versions', { policyId: quote.policy.id });
        }
        if (quote.Payment?.length) {
            await entityManager.delete('payments', { quoteId: quote.id });
        }
        if (quote.policy) {
            await entityManager.delete('policies', { id: quote.policy.id });
        }
        if (quote.event?.venue) {
            await entityManager.delete('venues', { id: quote.event.venue.id });
        }
        if (quote.event) {
            await entityManager.delete('events', { id: quote.event.id });
        }
        if (quote.policyHolder) {
            await entityManager.delete('policy_holders', { id: quote.policyHolder.id });
        }
        
        await quoteRepository.remove(quote);

        res.json({ message: 'Quote and related records deleted successfully' }); // REMOVED 'return'

    } catch (error) {
        console.error('DELETE /api/v1/quotes error:', error);
        res.status(500).json({ error: 'Failed to delete quote' }); // REMOVED 'return'
    }
});

export default router;