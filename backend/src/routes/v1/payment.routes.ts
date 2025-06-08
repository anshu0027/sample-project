// my-backend/src/routes/v1/payment.routes.ts
import { Router, Request, Response } from 'express';
import { AppDataSource } from '../../data-source';
import { Payment } from '../../entities/payment.entity';
import { PaymentStatus } from '../../entities/enums';
import { FindOptionsWhere } from 'typeorm';

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
            relations: ['Policy', 'Policy.quote', 'quote', 'quote.policyHolder', 'quote.event', 'quote.event.venue'],
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
            relations: ['Policy', 'Policy.quote', 'quote', 'quote.policyHolder', 'quote.event', 'quote.event.venue'],
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
    try {
        const { amount, quoteId, method, status, reference } = req.body;

        if (!amount || !quoteId || !status) {
            res.status(400).json({ error: 'Missing required fields (amount, quoteId, status)' });
            return;
        }

        // Validate status against the enum
        if (!Object.values(PaymentStatus).includes(status as PaymentStatus)) {
            res.status(400).json({ error: `Invalid payment status: ${status}` });
            return;
        }

        const paymentRepository = AppDataSource.getRepository(Payment);

        const newPayment = paymentRepository.create({
            amount: parseFloat(amount),
            quoteId: parseInt(quoteId),
            method: method || 'Online',
            status: status as PaymentStatus,
            reference: reference || null,
        });

        const savedPayment = await paymentRepository.save(newPayment);

        res.status(201).json({ payment: savedPayment });

    } catch (error) {
        console.error('POST /api/payment error:', error);
        res.status(500).json({ error: 'Failed to create payment' });
    }
});

export default router;