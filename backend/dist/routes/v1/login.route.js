"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const event_logger_service_1 = require("../../services/event-logger.service");
const backend_1 = require("@clerk/backend");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = express_1.default.Router();
const clerkClient = (0, backend_1.createClerkClient)({
    secretKey: process.env.CLERK_SECRET_KEY,
});
const logRequestInfo = (label, req) => {
    const { userId, email, token } = req.body || {};
    console.log(`🔍 ${label}`, {
        hasUserId: !!userId,
        hasEmail: !!email,
        hasToken: !!token,
        requestBody: {
            userId,
            email,
            token: token ? "present" : "missing",
        },
    });
};
const validateRequestBody = (body) => {
    return (typeof body.userId === "string" &&
        typeof body.email === "string" &&
        typeof body.token === "string");
};
// ------------------------
// POST / - Verify Admin Login
// ------------------------
router.post("/", async (req, res) => {
    var _a;
    logRequestInfo("🔑 Backend: Authentication verification request received", req);
    const eventLogger = event_logger_service_1.EventLoggerService.getInstance();
    if (!validateRequestBody(req.body)) {
        console.error("❌ Missing required authentication fields");
        await eventLogger.logAdminLogin(req, res, req.body.email || req.body.userId || "unknown", false);
        res.status(400).json({
            success: false,
            message: "Missing required authentication fields",
        });
        return;
    }
    const { userId, email, token } = req.body;
    try {
        // Verify token - try session first, then JWT
        let session;
        try {
            session = await clerkClient.sessions.verifySession(token, "");
        }
        catch (sessionError) {
            // If session verification fails, try to verify as a JWT token
            try {
                const payload = await clerkClient.verifyToken(token);
                if (payload) {
                    // Token is valid, create a mock session object
                    session = { id: payload.sub || "unknown" };
                }
                else {
                    throw new Error("Invalid token");
                }
            }
            catch (jwtError) {
                console.error("Both session and JWT verification failed:", {
                    sessionError,
                    jwtError,
                });
                throw new Error("Token verification failed");
            }
        }
        if (!session) {
            console.error("❌ Invalid session token");
            await eventLogger.logAdminLogin(req, res, email, false);
            res.status(401).json({
                success: false,
                message: "Invalid authentication token",
            });
            return;
        }
        // Fetch user details
        const user = await clerkClient.users.getUser(userId);
        const userEmail = (_a = user === null || user === void 0 ? void 0 : user.emailAddresses[0]) === null || _a === void 0 ? void 0 : _a.emailAddress;
        if (!user || userEmail !== email) {
            console.error("❌ User verification failed", {
                expected: email,
                actual: userEmail,
            });
            await eventLogger.logAdminLogin(req, res, email, false);
            res.status(401).json({
                success: false,
                message: "User verification failed",
            });
            return;
        }
        // Log success
        await eventLogger.logAdminLogin(req, res, email, true);
        console.log("✅ Authentication successful");
        res.status(200).json({
            success: true,
            message: "Authentication successful",
            route: "/admin",
            userId,
            email,
            sessionId: session.id,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("❌ Authentication error:", message);
        await eventLogger.logAdminLogin(req, res, email || userId || "unknown", false);
        res.status(500).json({
            success: false,
            message: "Authentication failed",
            error: message,
        });
    }
});
// ------------------------
// POST /logout - Revoke Session
// ------------------------
router.post("/logout", async (req, res) => {
    const { userId = "unknown", token } = req.body;
    const eventLogger = event_logger_service_1.EventLoggerService.getInstance();
    console.log("🚪 Logout request received", { userId, hasToken: !!token });
    try {
        if (token) {
            await clerkClient.sessions.revokeSession(token);
            console.log("✅ Session revoked successfully");
        }
        await eventLogger.logAdminLogout(req, res, userId);
        res.status(200).json({
            success: true,
            message: "Logout successful",
            sessionRevoked: !!token,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("❌ Logout error:", message);
        res.status(500).json({
            success: false,
            message: "Logout failed",
            error: message,
        });
    }
});
exports.default = router;
//# sourceMappingURL=login.route.js.map