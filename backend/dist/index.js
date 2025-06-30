"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const path_1 = __importDefault(require("path")); // Import the 'path' module
const data_source_1 = require("./data-source");
// Import your future routes here
const quote_routes_1 = __importDefault(require("./routes/v1/quote.routes"));
const email_routes_1 = __importDefault(require("./routes/v1/email.routes"));
const policy_routes_1 = __importDefault(require("./routes/v1/policy.routes"));
const policy_list_routes_1 = __importDefault(require("./routes/v1/policy-list.routes"));
const admin_routes_1 = __importDefault(require("./routes/v1/admin.routes"));
const payment_routes_1 = __importDefault(require("./routes/v1/payment.routes"));
const login_route_1 = __importDefault(require("./routes/v1/login.route"));
const scheduled_tasks_service_1 = require("./services/scheduled-tasks.service");
// ------------------------
// Initialize the Express application.
// ------------------------
const app = (0, express_1.default)();
// CORS configuration
// ------------------------
// Configure CORS to allow requests from any origin ('*').
// Specifies allowed HTTP methods, headers, and enables credentials.
// ------------------------
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000",
        "https://localhost:3000",
        "https://localhost:3001",
        "http://192.168.1.8:3000",
        "https://192.168.1.8:3000",
        "http://localhost:8000",
        "https://localhost:8000",
        "http://127.0.0.1:3000",
        "http://192.168.1.8:3000",
        "https://127.0.0.1:3000",
        "https://192.168.1.8:3000",
        "http://127.0.0.1:8000",
        "http://192.168.1.8:8000",
        "https://127.0.0.1:8000",
        "https://192.168.1.8:8000",
        /\.ngrok\.io$/,
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
}));
// Global Rate Limiter
// ------------------------
// Apply a global rate limiter to all incoming requests.
// Limits each IP to 100 requests per 15 minutes.
// ------------------------
const globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
// Middleware
// ------------------------
// Use built-in Express middleware to parse JSON and URL-encoded request bodies.
// ------------------------
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static files from the 'public' directory
// ------------------------
// Serve static files (e.g., images, PDF templates) from the 'public' directory
// located at the root of the backend project.
// ------------------------
app.use(express_1.default.static(path_1.default.join(process.cwd(), "public")));
// Apply the global rate limiter to all requests
// ------------------------
// Apply the configured global rate limiter middleware to the application.
// ------------------------
app.use(globalLimiter);
// Health check route
// ------------------------
// A comprehensive health check endpoint to verify if the API is running.
// Returns detailed information about the system status.
// ------------------------
app.get("/api/health", async (_req, res) => {
    try {
        const startTime = Date.now();
        // Check database connection
        const dbStatus = data_source_1.AppDataSource.isInitialized ? "connected" : "disconnected";
        // Get system information
        const uptime = process.uptime();
        const memoryUsage = process.memoryUsage();
        const nodeVersion = process.version;
        const platform = process.platform;
        // Test database query if connected
        let dbTest = "not tested";
        if (data_source_1.AppDataSource.isInitialized) {
            try {
                await data_source_1.AppDataSource.query("SELECT 1");
                dbTest = "success";
            }
            catch (error) {
                dbTest = "failed";
            }
        }
        const healthData = {
            status: "ok",
            timestamp: new Date().toISOString(),
            uptime: {
                seconds: Math.floor(uptime),
                formatted: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
            },
            database: {
                status: dbStatus,
                test: dbTest,
            },
            system: {
                nodeVersion,
                platform,
                memory: {
                    rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
                    heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
                    heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
                    external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
                },
            },
            environment: {
                nodeEnv: process.env.NODE_ENV || "development",
                port: process.env.PORT || 8000,
            },
            responseTime: `${Date.now() - startTime}ms`,
        };
        res.status(200).json(healthData);
    }
    catch (error) {
        res.status(500).json({
            status: "error",
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : "Unknown error",
            uptime: {
                seconds: Math.floor(process.uptime()),
                formatted: `${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m ${Math.floor(process.uptime() % 60)}s`,
            },
        });
    }
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
app.use("/api/v1/quotes", quote_routes_1.default);
app.use("/api/v1/email", email_routes_1.default);
app.use("/api/v1/policies", policy_routes_1.default);
app.use("/api/v1/policy-list", policy_list_routes_1.default);
app.use("/api/v1/admin", admin_routes_1.default);
app.use("/api/v1/payment", payment_routes_1.default);
app.use("/api/v1/login", login_route_1.default);
// --- APP INITIALIZATION ---
const startServer = async () => {
    try {
        // 1. Initialize Database
        await data_source_1.AppDataSource.initialize();
        console.log("✅ Data Source has been initialized!");
        // 2. Initialize Services (like scheduled tasks)
        await scheduled_tasks_service_1.ScheduledTasksService.getInstance().initializeScheduledTasks();
        // 3. Start the Express Server
        const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8000;
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`🚀 Backend running on http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error("❌ Error during server initialization:", error);
        process.exit(1); // Exit with failure
    }
};
startServer();
//# sourceMappingURL=index.js.map