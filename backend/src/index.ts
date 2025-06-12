// import cookieParser from 'cookie-parser';
// import csrf from 'csurf';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path'; // Import the 'path' module
import { AppDataSource } from './data-source';
// Import your future routes here
import quoteRoutes from './routes/v1/quote.routes';
import emailRoutes from './routes/v1/email.routes';
import policyRoutes from './routes/v1/policy.routes';
import policyListRoutes from './routes/v1/policy-list.routes';
import adminRoutes from './routes/v1/admin.routes';
import paymentRoutes from './routes/v1/payment.routes';
import loginRoutes from './routes/v1/login.route';

const app = express();

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(process.cwd(), 'public')));

// Apply the global rate limiter to all requests
app.use(globalLimiter);

// Health check route
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Wedding Insurance API is running' });
});

// API routes
app.use('/api/v1/quotes', quoteRoutes);
app.use('/api/v1/email', emailRoutes);
app.use('/api/v1/policies', policyRoutes);
app.use('/api/v1/policy-list', policyListRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/login', loginRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Initialize database connection
AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    
    // Start server
    const PORT = process.env.PORT || 8000;
    // const LINK = "http://localhost:" + PORT;
    // const HOST = LINK || process.env.NEXT_PUBLIC_FRONTEND_URL;
    
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error during Data Source initialization:", error);
  });