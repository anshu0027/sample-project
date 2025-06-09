// my-backend/src/routes/v1/payment.routes.ts
import { Router, Request, Response } from 'express';
import { AppDataSource } from '../../data-source';
import { Payment } from '../../entities/payment.entity';
import { PaymentStatus } from '../../entities/enums';
import { FindOptionsWhere } from 'typeorm';
import { Quote } from '../../entities/quote.entity';
import { Policy } from '../../entities/policy.entity';
import { StepStatus } from '../../entities/enums';

const router = Router();

// Helper function to map status for the frontend
const mapPaymentStatus = (payment: Payment) => {
    if (!payment) return null;
    return {
        ...payment,
        status:
            payment.status === PaymentStatus.SUCCESS
                ? 'Completed'
                : payment.status === PaymentStatus.FAILED
                ? 'Failed'
                : payment.status,
    };
};

// --- GET /api/v1/payment ---
// --- GET /api/v1/payment/:id ---
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const paymentRepository = AppDataSource.getRepository(Payment);

        const payment = await paymentRepository.findOne({
            where: { id: Number(id) },
            relations: ['policy', 'policy.quote', 'quote', 'quote.policyHolder', 'quote.event', 'quote.event.venue'],
        });

        if (!payment) {
            res.status(404).json({ error: 'Payment not found' });
            return;
        }
        res.json({ payment: mapPaymentStatus(payment) });

    } catch (error) {
        console.error('GET /api/payment/:id error:', error);
        res.status(500).json({ error: 'Failed to fetch payment' });
    }
});

// --- GET /api/v1/payment ---
// Handles fetching a LIST of payments, with optional filters.
router.get('/', async (req: Request, res: Response) => {
    try {
        const { policyId, quoteId } = req.query;
        const paymentRepository = AppDataSource.getRepository(Payment);

        const where: FindOptionsWhere<Payment> = {};
        if (policyId) where.policyId = Number(policyId);
        if (quoteId) where.quoteId = Number(quoteId);

        const payments = await paymentRepository.find({
            where,
            relations: ['policy', 'policy.quote', 'quote', 'quote.policyHolder', 'quote.event', 'quote.event.venue'],
            order: { createdAt: 'DESC' },
        });

        const mappedPayments = payments.map(mapPaymentStatus);
        res.json({ payments: mappedPayments });

    } catch (error) {
        console.error('GET /api/payment error:', error);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});

// --- POST /api/v1/payment ---
router.post('/', async (req: Request, res: Response) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const { amount, quoteId, policyId, method, status, reference } = req.body;
        console.log('Received payment request:', { amount, quoteId, policyId, method, status, reference });

        // Check if either quoteId or policyId is provided
        if (!amount || (!quoteId && !policyId) || !status) {
            res.status(400).json({ 
                error: 'Missing required fields. Need amount, status, and either quoteId or policyId',
                received: { amount, quoteId, policyId, status }
            });
            return;
        }

        // Validate status against the enum
        const validStatuses = Object.values(PaymentStatus);
        if (!validStatuses.includes(status as PaymentStatus)) {
            res.status(400).json({ 
                error: `Invalid payment status: ${status}`,
                validStatuses,
                received: status
            });
            return;
        }

        const paymentRepository = queryRunner.manager.getRepository(Payment);
        const quoteRepository = queryRunner.manager.getRepository(Quote);

        const newPayment = paymentRepository.create({
            amount: parseFloat(amount),
            quoteId: quoteId ? parseInt(quoteId) : null,
            policyId: policyId ? parseInt(policyId) : null,
            method: method || 'Online',
            status: status as PaymentStatus,
            reference: reference || `PAY-${Date.now()}`,
        });

        console.log('Creating payment:', newPayment);
        const savedPayment = await paymentRepository.save(newPayment);
        console.log('Saved payment:', savedPayment);

        // If payment is successful and we have a quoteId, convert quote to policy
        if (status === PaymentStatus.SUCCESS && quoteId) {
            const quote = await quoteRepository.findOne({
                where: { id: parseInt(quoteId) },
                relations: ['event', 'event.venue', 'policyHolder']
            });

            if (quote) {
                // Update quote status
                quote.status = StepStatus.COMPLETE;
                await quoteRepository.save(quote);

                // Create policy from quote
                const policyRepository = queryRunner.manager.getRepository(Policy);
                // Extract the last part of the quote number (after the last hyphen)
                const quoteNumberParts = quote.quoteNumber.split('-');
                const lastPart = quoteNumberParts[quoteNumberParts.length - 1];
                const newPolicy = policyRepository.create({
                    policyNumber: `PI-${lastPart}`,
                    event: quote.event,
                    policyHolder: quote.policyHolder,
                    payments: [savedPayment],
                    quote: quote
                });

                const savedPolicy = await policyRepository.save(newPolicy);
                console.log('Created policy from quote:', savedPolicy);

                // Update payment with policy ID
                savedPayment.policyId = savedPolicy.id;
                await paymentRepository.save(savedPayment);
            }
        }

        await queryRunner.commitTransaction();

        // Fetch the complete payment with relations
        const completePayment = await paymentRepository.findOne({
            where: { id: savedPayment.id },
            relations: ['policy', 'policy.quote', 'quote', 'quote.policyHolder', 'quote.event', 'quote.event.venue']
        });

        res.status(201).json({ 
            message: 'Payment processed successfully',
            payment: completePayment
        });

    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error('POST /api/v1/payment error:', error);
        res.status(500).json({ 
            error: 'Failed to process payment',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    } finally {
        await queryRunner.release();
    }
});

export default router;