import { Router, Request, Response } from 'express';
import { sendQuoteEmail, sendPolicyEmail } from '../../services/email.service';

const router = Router();

router.post('/send', async (req: Request, res: Response) => {
    try {
        const { to, type = 'quote', data } = req.body;

        if (!to || !data) {
            res.status(400).json({ error: 'Missing recipient or data.' });
            return;
        }

        if (type === 'quote') {
            await sendQuoteEmail(to, data);
        } else if (type === 'policy') {
            await sendPolicyEmail(to, data);
        } else {
            res.status(400).json({ error: 'Invalid email type specified.' });
            return;
        }

        res.status(200).json({ success: true, message: 'Email sent successfully.' });

    } catch (error) {
        console.error('Email send error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to send email.';
        res.status(500).json({ error: errorMessage });
    }
});

export default router;