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

    const relations = ['event', 'event.venue', 'policyHolder', 'policy', 'payments'];

    if (quoteNumber) {
      const quote = await quoteRepository.findOne({
        where: { quoteNumber: String(quoteNumber) },
        relations,
      });
      if (!quote) {
        res.status(404).json({ error: 'Quote not found' });
        return;
      }
      res.json({ quote });
      return;
    }

    if (id) {
      const quote = await quoteRepository.findOne({
        where: { id: Number(id) },
        relations,
      });
      if (!quote) {
        res.status(404).json({ error: 'Quote not found' });
        return;
      }
      res.json({ quote });
      return;
    }

    if (email) {
      const quote = await quoteRepository.findOne({
        where: { email: String(email) },
        order: { createdAt: 'DESC' },
        relations,
      });
      if (!quote) {
        res.status(404).json({ error: 'Quote not found' });
        return;
      }
      res.json({ quote });
      return;
    }

    if (allQuotes) {
      const quotes = await quoteRepository.find({
        order: { createdAt: 'DESC' },
        relations,
      });
      res.json({ quotes });
      return;
    }

    const quotes = await quoteRepository.find({
      where: { status: StepStatus.COMPLETE },
      order: { createdAt: 'DESC' },
      relations,
    });
    res.json({ policies: quotes });

  } catch (error) {
    console.error('GET /api/v1/quotes error:', error);
    res.status(500).json({ error: 'Failed to fetch quotes/policies' });
  }
});

// --- POST /api/v1/quotes ---
// Replace the existing POST handler in my-backend/src/routes/v1/quote.routes.ts
router.post('/', async (req: Request, res: Response) => {

  console.log("Request Body:", req.body);
  try {
    const fields = req.body;
    const { source = 'CUSTOMER', paymentStatus } = fields;
    console.log("Source:", source);
    console.log("Payment Status:", paymentStatus);

    const referer = req.get('referer');
    console.log("Referer:", referer);
    const isAdminRequest = source === 'ADMIN' || (referer && referer.includes('/admin/'));
    console.log("Is Admin Request:", isAdminRequest);
    const effectiveSource = isAdminRequest ? QuoteSource.ADMIN : QuoteSource.CUSTOMER;
    console.log("Effective Source:", effectiveSource);

    if (!fields.email) {
      res.status(400).json({ error: 'Missing user email.' });
      return;
    }

    // --- User Handling ---
    const userRepository = AppDataSource.getRepository(User);
    let user = await userRepository.findOneBy({ email: fields.email });
    console.log("User:", user);
    if (!user) {
      user = userRepository.create({
        email: fields.email,
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
    console.log("Quote Repository:", quoteRepository);
    const newQuote = quoteRepository.create({
      ...quoteData,
      quoteNumber: generateQuoteNumber(),
      status: isAdminRequest ? StepStatus.COMPLETE : StepStatus.STEP1,
      source: effectiveSource,
      isCustomerGenerated: effectiveSource === QuoteSource.CUSTOMER,
      user: user,
    });
    console.log("New Quote:", newQuote);
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
        const venueRepository = AppDataSource.getRepository(Venue);
        console.log("Venue Repository:", venueRepository);
        const venueData = {
          name: fields.venueName,
          address1: fields.venueAddress1,
          address2: fields.venueAddress2,
          country: fields.venueCountry,
          city: fields.venueCity,
          state: fields.venueState,
          zip: fields.venueZip,
          locationType: fields.locationType,
          indoorOutdoor: fields.indoorOutdoor,
          receptionLocationType: fields.receptionLocationType,
          receptionIndoorOutdoor: fields.receptionIndoorOutdoor,
          receptionAddress1: fields.receptionAddress1,
          receptionAddress2: fields.receptionAddress2,
          receptionCity: fields.receptionCity,
          receptionState: fields.receptionState,
          receptionZip: fields.receptionZip,
          receptionCountry: fields.receptionCountry,
          receptionVenueAsInsured: fields.receptionVenueAsInsured,
          brunchLocationType: fields.brunchLocationType,
          brunchIndoorOutdoor: fields.brunchIndoorOutdoor,
          brunchAddress1: fields.brunchAddress1,
          brunchAddress2: fields.brunchAddress2,
          brunchCity: fields.brunchCity,
          brunchState: fields.brunchState,
          brunchZip: fields.brunchZip,
          brunchCountry: fields.brunchCountry,
          brunchVenueAsInsured: fields.brunchVenueAsInsured,
          rehearsalLocationType: fields.rehearsalLocationType,
          rehearsalIndoorOutdoor: fields.rehearsalIndoorOutdoor,
          rehearsalAddress1: fields.rehearsalAddress1,
          rehearsalAddress2: fields.rehearsalAddress2,
          rehearsalCity: fields.rehearsalCity,
          rehearsalState: fields.rehearsalState,
          rehearsalZip: fields.rehearsalZip,
          rehearsalCountry: fields.rehearsalCountry,
          rehearsalVenueAsInsured: fields.rehearsalVenueAsInsured,
          rehearsalDinnerLocationType: fields.rehearsalDinnerLocationType,
          rehearsalDinnerIndoorOutdoor: fields.rehearsalDinnerIndoorOutdoor,
          rehearsalDinnerAddress1: fields.rehearsalDinnerAddress1,
          rehearsalDinnerAddress2: fields.rehearsalDinnerAddress2,
          rehearsalDinnerCity: fields.rehearsalDinnerCity,
          rehearsalDinnerState: fields.rehearsalDinnerState,
          rehearsalDinnerZip: fields.rehearsalDinnerZip,
          rehearsalDinnerCountry: fields.rehearsalDinnerCountry,
          rehearsalDinnerVenueAsInsured: fields.rehearsalDinnerVenueAsInsured,
        };
        newEvent.venue = venueRepository.create(venueData);
        // Explicitly save the venue
        await venueRepository.save(newEvent.venue);
        console.log("New Event:", newEvent);
      }
      newQuote.event = newEvent;
      console.log("New Quote:", newQuote);
    }

    if (fields.firstName && fields.lastName) {
      const policyHolderRepository = AppDataSource.getRepository(PolicyHolder);
      console.log("Policy Holder Repository:", policyHolderRepository);
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
      newQuote.policyHolder = policyHolderRepository.create(policyHolderData);
      // Explicitly save the policy holder
      await policyHolderRepository.save(newQuote.policyHolder);
      console.log("New Policy Holder:", newQuote.policyHolder);
    }

    // Explicitly save the event if it was created
    if (newQuote.event) {
      await AppDataSource.getRepository(Event).save(newQuote.event);
    }
    console.log("New Quote:", newQuote);
    const savedQuote = await quoteRepository.save(newQuote);
    console.log("Saved Quote:", savedQuote);

    // --- START: AUTO-CONVERSION LOGIC ---
    if (savedQuote.source === QuoteSource.CUSTOMER && paymentStatus === 'SUCCESS') {
      const policy = await createPolicyFromQuote(savedQuote.id);
      console.log("Policy:", policy);
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
      console.log("New Payment:", Payment);
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
    console.error('Quote creation error:', error);
    console.error('POST /api/v1/quotes error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    console.error('POST /api/v1/quotes error:', error);
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

    console.log('Updating quote:', quoteNumber, 'with fields:', fields);

    const quoteRepository = AppDataSource.getRepository(Quote);
    const quoteToUpdate = await quoteRepository.findOne({
      where: { quoteNumber },
      relations: ['event', 'event.venue', 'policyHolder', 'user'],
    });

    if (!quoteToUpdate) {
      res.status(404).json({ error: `Quote with number ${quoteNumber} not found.` });
      return;
    }

    // Handle premium recalculation if needed
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

    // Update quote fields
    quoteRepository.merge(quoteToUpdate, fields);

    // Handle event updates
    const eventRepository = AppDataSource.getRepository(Event);
    if (fields.eventType || fields.eventDate || fields.maxGuests || fields.honoree1FirstName || fields.honoree1LastName || fields.honoree2FirstName || fields.honoree2LastName) {
      let event = quoteToUpdate.event;
      if (!event) {
        event = eventRepository.create();
        quoteToUpdate.event = event;
      }
      
      // Ensure required fields are present
      if (!fields.eventType) {
        throw new Error('Event type is required');
      }

      const eventFields = {
        eventType: fields.eventType,
        eventDate: fields.eventDate ? new Date(fields.eventDate) : new Date(), // Default to current date if not provided
        maxGuests: fields.maxGuests || 0, // Default to 0 if not provided
        honoree1FirstName: fields.honoree1FirstName || '',
        honoree1LastName: fields.honoree1LastName || '',
        honoree2FirstName: fields.honoree2FirstName || '',
        honoree2LastName: fields.honoree2LastName || '',
        quoteId: quoteToUpdate.id
      };
      
      console.log('Creating/updating event with fields:', eventFields);
      eventRepository.merge(event, eventFields);
      await eventRepository.save(event);
    }

    // Handle venue updates
    const venueRepository = AppDataSource.getRepository(Venue);
    if (quoteToUpdate.event && (fields.venueName || fields.venueAddress1 || fields.venueAddress2 || fields.venueCity || fields.venueState || fields.venueZip || fields.venueCountry)) {
      let venue = quoteToUpdate.event.venue;
      if (!venue) {
        venue = venueRepository.create();
        quoteToUpdate.event.venue = venue;
      }
      
      // Ensure required fields are present
      if (!fields.venueName || !fields.venueAddress1) {
        throw new Error('Venue name and address are required');
      }

      const venueFields = {
        name: fields.venueName,
        address1: fields.venueAddress1,
        address2: fields.venueAddress2 || '',
        city: fields.venueCity || '',
        state: fields.venueState || '',
        zip: fields.venueZip || '',
        country: fields.venueCountry || '',
        eventId: quoteToUpdate.event.id
      };
      
      console.log('Creating/updating venue with fields:', venueFields);
      venueRepository.merge(venue, venueFields);
      await venueRepository.save(venue);
    }

    // Handle policy holder updates
    const policyHolderRepository = AppDataSource.getRepository(PolicyHolder);
    if (fields.firstName || fields.lastName || fields.phone || fields.address || fields.city || fields.state || fields.zip || fields.country) {
      let policyHolder = quoteToUpdate.policyHolder;
      if (!policyHolder) {
        policyHolder = policyHolderRepository.create();
        quoteToUpdate.policyHolder = policyHolder;
      }
      
      // Ensure required fields are present
      if (!fields.firstName || !fields.lastName) {
        throw new Error('First name and last name are required for policy holder');
      }

      const policyHolderFields = {
        firstName: fields.firstName,
        lastName: fields.lastName,
        phone: fields.phone || '',
        address: fields.address || '',
        city: fields.city || '',
        state: fields.state || '',
        zip: fields.zip || '',
        country: fields.country || '',
        quoteId: quoteToUpdate.id
      };
      
      console.log('Creating/updating policy holder with fields:', policyHolderFields);
      policyHolderRepository.merge(policyHolder, policyHolderFields);
      await policyHolderRepository.save(policyHolder);
    }

    // Save the updated quote
    const updatedQuote = await quoteRepository.save(quoteToUpdate);
    
    // Fetch the complete quote with all relations
    const completeQuote = await quoteRepository.findOne({
      where: { id: updatedQuote.id },
      relations: ['event', 'event.venue', 'policyHolder', 'user', 'payments'],
    });

    console.log('Quote updated successfully:', completeQuote);

    res.json({ 
      message: 'Quote updated successfully', 
      quote: completeQuote 
    });

  } catch (error) {
    console.error('PUT /api/v1/quotes error:', error);
    res.status(500).json({ error: 'Server error during quote update' });
  }
});

// --- DELETE /api/v1/quotes/:quoteNumber ---
router.delete('/:quoteNumber', async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const { quoteNumber } = req.params;
    const quoteRepository = queryRunner.manager.getRepository(Quote);

    const quote = await quoteRepository.findOne({
      where: { quoteNumber },
      relations: ['event', 'event.venue', 'policyHolder', 'policy', 'policy.versions', 'payments'],
    });

    if (!quote) {
      await queryRunner.rollbackTransaction();
      res.status(404).json({ error: 'Quote not found' });
      return;
    }

    // Delete in correct order to handle foreign key constraints
    if (quote.payments?.length) {
      await queryRunner.manager.delete('payments', { quoteId: quote.id });
    }

    if (quote.policy?.versions?.length) {
      await queryRunner.manager.delete('policy_versions', { policyId: quote.policy.id });
    }

    if (quote.policy) {
      await queryRunner.manager.delete('policies', { id: quote.policy.id });
    }

    if (quote.event?.venue) {
      await queryRunner.manager.delete('venues', { id: quote.event.venue.id });
    }

    if (quote.event) {
      await queryRunner.manager.delete('events', { id: quote.event.id });
    }

    if (quote.policyHolder) {
      await queryRunner.manager.delete('policy_holders', { id: quote.policyHolder.id });
    }

    await quoteRepository.remove(quote);
    await queryRunner.commitTransaction();

    res.json({ message: 'Quote and related records deleted successfully' });

  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('DELETE /api/v1/quotes error:', error);
    res.status(500).json({ 
      error: 'Failed to delete quote',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await queryRunner.release();
  }
});

// Error handling middleware
router.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error('Unhandled express error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default router;