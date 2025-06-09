import express from 'express';
import cors from 'cors';
import { AppDataSource } from './data-source';
// Import your future routes here
import quoteRoutes from './routes/v1/quote.routes';
import emailRoutes from './routes/v1/email.routes';
import policyRoutes from './routes/v1/policy.routes';
import policyListRoutes from './routes/v1/policy-list.routes';
import adminRoutes from './routes/v1/admin.routes';
import paymentRoutes from './routes/v1/payment.routes';

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/api/health', (req, res) => {
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

// Initialize database connection
AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    
    // Start server
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error during Data Source initialization:", error);
  });