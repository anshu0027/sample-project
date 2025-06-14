// import cookieParser from 'cookie-parser';
// import csrf from 'csurf';
// ------------------------
// Import necessary modules.
// express: Web framework for Node.js.
// cors: Middleware for enabling Cross-Origin Resource Sharing.
// rateLimit: Middleware for rate limiting requests.
// path: Utility for working with file and directory paths.
// AppDataSource: TypeORM data source for database connection.
// Route modules: Import all defined API route handlers.
// ------------------------
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import path from "path"; // Import the 'path' module
import { AppDataSource } from "./data-source";
// Import your future routes here
import quoteRoutes from "./routes/v1/quote.routes";
import emailRoutes from "./routes/v1/email.routes";
import policyRoutes from "./routes/v1/policy.routes";
import policyListRoutes from "./routes/v1/policy-list.routes";
import adminRoutes from "./routes/v1/admin.routes";
import paymentRoutes from "./routes/v1/payment.routes";
import loginRoutes from "./routes/v1/login.route";

// ------------------------
// Initialize the Express application.
// ------------------------
const app = express();

// CORS configuration
// ------------------------
// Configure CORS to allow requests from any origin ('*').
// Specifies allowed HTTP methods, headers, and enables credentials.
// ------------------------
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Global Rate Limiter
// ------------------------
// Apply a global rate limiter to all incoming requests.
// Limits each IP to 100 requests per 15 minutes.
// ------------------------
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Middleware
// ------------------------
// Use built-in Express middleware to parse JSON and URL-encoded request bodies.
// ------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
// ------------------------
// Serve static files (e.g., images, PDF templates) from the 'public' directory
// located at the root of the backend project.
// ------------------------
app.use(express.static(path.join(process.cwd(), "public")));

// Apply the global rate limiter to all requests
// ------------------------
// Apply the configured global rate limiter middleware to the application.
// ------------------------
app.use(globalLimiter);

// Health check route
// ------------------------
// A simple health check endpoint to verify if the API is running.
// Returns a JSON response with status 'ok'.
// ------------------------
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Root route
// ------------------------
// The root endpoint of the API.
// Returns a JSON message indicating the API is running.
// ------------------------
app.get("/", (_req, res) => {
  res.json({ message: "Wedding Insurance API is running" });
});

// API routes
// ------------------------
// Mount the imported route handlers for different API resources.
// Each route module handles a specific set of endpoints (e.g., /api/v1/quotes).
// ------------------------
app.use("/api/v1/quotes", quoteRoutes);
app.use("/api/v1/email", emailRoutes);
app.use("/api/v1/policies", policyRoutes);
app.use("/api/v1/policy-list", policyListRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/login", loginRoutes);

// Error handling middleware
// ------------------------
// A generic error handling middleware.
// Catches any unhandled errors that occur during request processing.
// Logs the error and returns a 500 Internal Server Error response.
// ------------------------
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
);

// Initialize database connection
// ------------------------
// Initialize the TypeORM data source to connect to the database.
// Once the connection is established, start the Express server.
// ------------------------
AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");

    // Start server
    const PORT = process.env.PORT || 8000;
    // const LINK = "http://localhost:" + PORT;
    // const HOST = LINK || process.env.NEXT_PUBLIC_FRONTEND_URL;

    // ------------------------
    // Start the Express server and listen on the configured port.
    // ------------------------
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    // ------------------------
    // Log an error message if database initialization fails.
    // ------------------------
    console.error("Error during Data Source initialization:", error);
  });
