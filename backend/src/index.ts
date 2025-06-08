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

const main = async () => {
  // Initialize TypeORM connection
  try {
    await AppDataSource.initialize();
    console.log("Data Source has been initialized!");
  } catch (err) {
    console.error("Error during Data Source initialization:", err);
    return;
  }

  const app = express();

  // --- Middlewares ---
  // Enable CORS to allow requests from your frontend
  app.use(cors({
    origin: 'http://localhost:3000', // Your Next.js frontend URL
    credentials: true,
  }));
  // Parse JSON bodies
  app.use(express.json());

  // --- Routes ---
  app.get('/api/health', (_, res) => res.send('Server is healthy!'));
  app.use('/api/v1/quotes', quoteRoutes); // We will add this next
  app.use('/api/v1/email', emailRoutes);
  app.use('/api/v1/policies', policyRoutes);
  app.use('/api/v1/policy-list', policyListRoutes);
  app.use('/api/v1/admin', adminRoutes);
  app.use('/api/v1/payment', paymentRoutes);

  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
};

main().catch(console.error);