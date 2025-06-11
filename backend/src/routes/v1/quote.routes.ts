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
      console.log('Quotes from database:', JSON.stringify(quotes, null, 2));
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
    console.log('Saved quote:', JSON.stringify(savedQuote, null, 2));

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
    if (quoteToUpdate.event && (fields.venueName || fields.venueAddress1 || fields.venueAddress2 || fields.venueCity || fields.venueState || fields.venueZip || fields.venueCountry || fields.ceremonyLocationType || fields.indoorOutdoor || fields.receptionLocationType || fields.receptionIndoorOutdoor || fields.receptionVenueName || fields.receptionVenueAddress1 || fields.receptionVenueAddress2 || fields.receptionVenueCountry || fields.receptionVenueCity || fields.receptionVenueState || fields.receptionVenueZip || fields.receptionVenueAsInsured || fields.brunchLocationType || fields.brunchIndoorOutdoor || fields.brunchVenueName || fields.brunchVenueAddress1 || fields.brunchVenueAddress2 || fields.brunchVenueCountry || fields.brunchVenueCity || fields.brunchVenueState || fields.brunchVenueZip || fields.brunchVenueAsInsured || fields.rehearsalLocationType || fields.rehearsalIndoorOutdoor || fields.rehearsalVenueName || fields.rehearsalVenueAddress1 || fields.rehearsalVenueAddress2 || fields.rehearsalVenueCountry || fields.rehearsalVenueCity || fields.rehearsalVenueState || fields.rehearsalVenueZip || fields.rehearsalVenueAsInsured || fields.rehearsalDinnerLocationType || fields.rehearsalDinnerIndoorOutdoor || fields.rehearsalDinnerVenueName || fields.rehearsalDinnerVenueAddress1 || fields.rehearsalDinnerVenueAddress2 || fields.rehearsalDinnerVenueCountry || fields.rehearsalDinnerVenueCity || fields.rehearsalDinnerVenueState || fields.rehearsalDinnerVenueZip || fields.rehearsalDinnerVenueAsInsured)) {
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
        locationType: fields.ceremonyLocationType || '',
        indoorOutdoor: fields.indoorOutdoor || '',
        receptionLocationType: fields.receptionLocationType || '',
        receptionIndoorOutdoor: fields.receptionIndoorOutdoor || '',
        receptionVenueName: fields.receptionVenueName || '',
        receptionVenueAddress1: fields.receptionVenueAddress1 || '',
        receptionVenueAddress2: fields.receptionVenueAddress2 || '',
        receptionVenueCountry: fields.receptionVenueCountry || '',
        receptionVenueCity: fields.receptionVenueCity || '',
        receptionVenueState: fields.receptionVenueState || '',
        receptionVenueZip: fields.receptionVenueZip || '',
        receptionVenueAsInsured: fields.receptionVenueAsInsured || false,
        brunchLocationType: fields.brunchLocationType || '',
        brunchIndoorOutdoor: fields.brunchIndoorOutdoor || '',
        brunchVenueName: fields.brunchVenueName || '',
        brunchVenueAddress1: fields.brunchVenueAddress1 || '',
        brunchVenueAddress2: fields.brunchVenueAddress2 || '',
        brunchVenueCountry: fields.brunchVenueCountry || '',
        brunchVenueCity: fields.brunchVenueCity || '',
        brunchVenueState: fields.brunchVenueState || '',
        brunchVenueZip: fields.brunchVenueZip || '',
        brunchVenueAsInsured: fields.brunchVenueAsInsured || false,
        rehearsalLocationType: fields.rehearsalLocationType || '',
        rehearsalIndoorOutdoor: fields.rehearsalIndoorOutdoor || '',
        rehearsalVenueName: fields.rehearsalVenueName || '',
        rehearsalVenueAddress1: fields.rehearsalVenueAddress1 || '',
        rehearsalVenueAddress2: fields.rehearsalVenueAddress2 || '',
        rehearsalVenueCountry: fields.rehearsalVenueCountry || '',
        rehearsalVenueCity: fields.rehearsalVenueCity || '',
        rehearsalVenueState: fields.rehearsalVenueState || '',
        rehearsalVenueZip: fields.rehearsalVenueZip || '',
        rehearsalVenueAsInsured: fields.rehearsalVenueAsInsured || false,
        rehearsalDinnerLocationType: fields.rehearsalDinnerLocationType || '',
        rehearsalDinnerIndoorOutdoor: fields.rehearsalDinnerIndoorOutdoor || '',
        rehearsalDinnerVenueName: fields.rehearsalDinnerVenueName || '',
        rehearsalDinnerVenueAddress1: fields.rehearsalDinnerVenueAddress1 || '',
        rehearsalDinnerVenueAddress2: fields.rehearsalDinnerVenueAddress2 || '',
        rehearsalDinnerVenueCountry: fields.rehearsalDinnerVenueCountry || '',
        rehearsalDinnerVenueCity: fields.rehearsalDinnerVenueCity || '',
        rehearsalDinnerVenueState: fields.rehearsalDinnerVenueState || '',
        rehearsalDinnerVenueZip: fields.rehearsalDinnerVenueZip || '',
        rehearsalDinnerVenueAsInsured: fields.rehearsalDinnerVenueAsInsured || false
      };
      
      console.log('Updating venue with fields:', venueFields);
      venueRepository.merge(venue, venueFields);
      await venueRepository.save(venue);
    }

    // Handle policy holder updates
    const policyHolderRepository = AppDataSource.getRepository(PolicyHolder);
    if (fields.firstName || fields.lastName || fields.phone || fields.address || fields.city || fields.state || fields.zip || fields.country || fields.relationship || fields.completingFormName) {
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
        relationship: fields.relationship || '',
        completingFormName: fields.completingFormName || '',
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
    console.log('Attempting to delete quote:', quoteNumber);
    
    const quoteRepository = queryRunner.manager.getRepository(Quote);

    const quote = await quoteRepository.findOne({
      where: { quoteNumber },
      relations: ['event', 'event.venue', 'policyHolder', 'policy', 'policy.versions', 'payments'],
    });

    if (!quote) {
      await queryRunner.rollbackTransaction();
      console.log('Quote not found:', quoteNumber);
      res.status(404).json({ error: 'Quote not found' });
      return;
    }

    console.log('Found quote with ID:', quote.id);
    console.log('Policy ID:', quote.policy?.id);
    console.log('Event ID:', quote.event?.id);
    console.log('Policy Holder ID:', quote.policyHolder?.id);

    try {
      // 1. Delete payments first (they reference the quote)
      if (quote.payments?.length) {
        console.log('Deleting payments for quote:', quote.id);
        await queryRunner.manager.delete('PAYMENTS', { quoteId: quote.id });
      }

      // 2. Delete policy versions (they reference the policy)
      if (quote.policy?.versions?.length) {
        console.log('Deleting policy versions for policy:', quote.policy.id);
        await queryRunner.manager.delete('POLICY_VERSIONS', { policyId: quote.policy.id });
      }

      // 3. Delete policy holder (it references the policy)
      if (quote.policyHolder) {
        console.log('Deleting policy holder:', quote.policyHolder.id);
        await queryRunner.manager.delete('POLICY_HOLDERS', { id: quote.policyHolder.id });
      }

      // 4. Delete venue (it's referenced by the event)
      if (quote.event?.venue) {
        console.log('Deleting venue:', quote.event.venue.id);
        await queryRunner.manager.delete('VENUES', { id: quote.event.venue.id });
      }

      // 5. Delete event (it references the policy)
      if (quote.event) {
        console.log('Deleting event:', quote.event.id);
        await queryRunner.manager.delete('EVENTS', { id: quote.event.id });
      }

      // 6. Delete policy (after all its references are removed)
      if (quote.policy) {
        console.log('Deleting policy:', quote.policy.id);
        await queryRunner.manager.delete('POLICIES', { id: quote.policy.id });
      }

      // 7. Finally delete the quote
      console.log('Deleting quote:', quote.id);
      await quoteRepository.remove(quote);
      
      await queryRunner.commitTransaction();
      console.log('Successfully deleted quote and all related records');
      res.json({ message: 'Quote and all related records deleted successfully' });

    } catch (deleteError) {
      console.error('Error during deletion:', deleteError);
      await queryRunner.rollbackTransaction();
      throw deleteError;
    }

  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('DELETE /api/v1/quotes error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      code: error instanceof Error ? (error as any).code : undefined
    });
    res.status(500).json({ 
      error: 'Failed to delete quote',
      details: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof Error ? (error as any).code : undefined
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