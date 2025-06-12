// my-backend/src/routes/v1/payment.routes.ts
import { Router, Request, Response } from 'express';
import { AppDataSource } from '../../data-source';
import { Payment } from '../../entities/payment.entity';
import { PaymentStatus } from '../../entities/enums';
import { FindOptionsWhere } from 'typeorm';
import { Quote } from '../../entities/quote.entity';
import { Policy } from '../../entities/policy.entity';
import { StepStatus } from '../../entities/enums';
import { APIContracts, APIControllers } from 'authorizenet'; // Removed "Constants" as it was not used.
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiter for manual payment creation
const manualPaymentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 manual payment creations per hour
    message: 'Too many payment creation attempts, please try again later.',
});

// Stricter rate limiter for Authorize.Net endpoint
const authorizeNetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 Authorize.Net attempts per 15 minutes
    message: 'Too many payment attempts with gateway, please try again later.',
});

// Authorize.Net configuration
const apiLoginId = process.env.AUTHORIZE_NET_API_LOGIN_ID_SANDBOX;
const transactionKey = process.env.AUTHORIZE_NET_TRANSACTION_KEY_SANDBOX;

const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();

merchantAuthenticationType.setName(apiLoginId!);
merchantAuthenticationType.setTransactionKey(transactionKey!);

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
router.post('/', manualPaymentLimiter, async (req: Request, res: Response) => {
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
            quoteId: quoteId ? parseInt(quoteId) : undefined,
            policyId: policyId ? parseInt(policyId) : undefined,
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

// --- POST /api/v1/payment/authorize-net ---
router.post('/authorize-net', authorizeNetLimiter, async (req: Request, res: Response) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const { quoteId, amount, opaqueData } = req.body;
        console.log('Received payment request:', { quoteId, amount, opaqueData });

        if (!quoteId || !amount || !opaqueData) {
            console.error('Missing required fields:', { quoteId, amount, opaqueData });
            res.status(400).json({ 
                error: 'Missing required fields. Need quoteId, amount, and opaqueData',
                received: { quoteId, amount, opaqueData }
            });
            return;
        }

        if (!opaqueData.dataDescriptor || !opaqueData.dataValue) {
            console.error('Invalid opaqueData format:', opaqueData);
            res.status(400).json({
                error: 'Invalid opaqueData format. Need dataDescriptor and dataValue',
                received: opaqueData
            });
            return;
        }

        // Format amount to 2 decimal places
        const formattedAmount = parseFloat(amount).toFixed(2);
        console.log('Formatted amount:', formattedAmount);

        // Create the payment data for a credit card
        const creditCard = new APIContracts.OpaqueDataType();
        creditCard.setDataDescriptor(opaqueData.dataDescriptor);
        creditCard.setDataValue(opaqueData.dataValue);

        // Create a transaction
        const paymentType = new APIContracts.PaymentType();
        paymentType.setOpaqueData(creditCard);

        // Create the transaction request
        const transactionRequestType = new APIContracts.TransactionRequestType();
        transactionRequestType.setTransactionType(APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
        transactionRequestType.setPayment(paymentType);
        transactionRequestType.setAmount(formattedAmount);

        // Assemble the complete transaction request
        const createRequest = new APIContracts.CreateTransactionRequest();
        createRequest.setMerchantAuthentication(merchantAuthenticationType);
        createRequest.setTransactionRequest(transactionRequestType);

        console.log('Sending request to Authorize.Net...');
        // Create the controller
        const ctrl = new APIControllers.CreateTransactionController(createRequest.getJSON());

        // Execute the API call using Promise
        const response = await new Promise<APIContracts.CreateTransactionResponse>((resolve, reject) => {
            ctrl.execute(() => {
                const apiResponse = ctrl.getResponse();
                if (apiResponse) {
                    resolve(new APIContracts.CreateTransactionResponse(apiResponse));
                } else {
                    reject(new Error('No response from payment gateway'));
                }
            });
        });

        console.log('Authorize.Net response:', {
            resultCode: response.getMessages().getResultCode(),
            responseCode: response.getTransactionResponse()?.getResponseCode(),
            message: response.getMessages().getMessage()[0]?.getText()
        });

        // Handle the response
        if (response.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK) {
            if (response.getTransactionResponse().getResponseCode() === "1") {
                // Transaction was successful
                const paymentRepository = queryRunner.manager.getRepository(Payment);
                const quoteRepository = queryRunner.manager.getRepository(Quote);

                // Create payment record
                const newPayment = paymentRepository.create({
                    amount: parseFloat(formattedAmount),
                    quoteId: parseInt(quoteId),
                    method: 'Credit Card',
                    status: PaymentStatus.SUCCESS,
                    reference: response.getTransactionResponse().getTransId(),
                });

                const savedPayment = await paymentRepository.save(newPayment);

                // Convert quote to policy
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

                    // Update payment with policy ID
                    savedPayment.policyId = savedPolicy.id;
                    await paymentRepository.save(savedPayment);
                }

                await queryRunner.commitTransaction();

                // Fetch the complete payment with relations
                const completePayment = await paymentRepository.findOne({
                    where: { id: savedPayment.id },
                    relations: ['policy', 'policy.quote', 'quote', 'quote.policyHolder', 'quote.event', 'quote.event.venue']
                });

                res.status(201).json({
                    message: 'Payment processed successfully',
                    payment: completePayment,
                    transactionId: response.getTransactionResponse().getTransId()
                });
            } else {
                // Transaction failed
                const errorMessage = response.getTransactionResponse().getErrors()[0].getErrorText();
                await queryRunner.rollbackTransaction();
                res.status(400).json({
                    error: 'Payment failed',
                    message: errorMessage,
                    responseCode: response.getTransactionResponse().getResponseCode()
                });
            }
        } else {
            // API call failed
            const errorMessage = response.getMessages().getMessage()[0].getText();
            await queryRunner.rollbackTransaction();
            res.status(400).json({
                error: 'Payment processing failed',
                message: errorMessage,
                resultCode: response.getMessages().getResultCode()
            });
        }

    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error('POST /api/v1/payment/authorize-net error:', error);
        res.status(500).json({ 
            error: 'Failed to process payment',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    } finally {
        await queryRunner.release();
    }
});

export default router;