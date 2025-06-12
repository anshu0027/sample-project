import express from 'express';
import type { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit each IP to 5 requests per windowMs
});

const router = express.Router();

const LoginID = "admin@weddingguard.com";
const LoginPassword = "admin123";

router.post('/',loginLimiter, (req: Request, res: Response): void => {
    const { id, password } = req.body;

    // Verify admin credentials
    if (id === LoginID && password === LoginPassword) {
        res.status(200).json({
            success: true,
            message: 'Login successful',
            route: '/admin'
        });
        return;
    }

    // Invalid credentials
    res.status(401).json({
        success: false,
        message: 'Invalid credentials'
    });
});

export default router;
