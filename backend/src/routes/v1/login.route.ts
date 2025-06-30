import express from "express";
import type { Request, Response } from "express";
import { SentryService } from "../../services/sentry.service";
import { createClerkClient } from "@clerk/backend";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

interface AuthRequestBody {
  userId: string;
  email: string;
  token: string;
}

const logRequestInfo = (label: string, req: Request): void => {
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

const validateRequestBody = (
  body: Partial<AuthRequestBody>
): body is AuthRequestBody => {
  return (
    typeof body.userId === "string" &&
    typeof body.email === "string" &&
    typeof body.token === "string"
  );
};

// ------------------------
// POST / - Verify Admin Login
// ------------------------
router.post("/", async (req: Request, res: Response): Promise<void> => {
  logRequestInfo(
    "🔑 Backend: Authentication verification request received",
    req
  );

  const sentryService = SentryService.getInstance();

  if (!validateRequestBody(req.body)) {
    console.error("❌ Missing required authentication fields");
    await sentryService.logAdminLogin(
      req,
      res,
      req.body.email || req.body.userId || "unknown",
      false
    );
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
    } catch (sessionError) {
      // If session verification fails, try to verify as a JWT token
      try {
        const payload = await clerkClient.verifyToken(token);
        if (payload) {
          // Token is valid, create a mock session object
          session = { id: payload.sub || "unknown" };
        } else {
          throw new Error("Invalid token");
        }
      } catch (jwtError) {
        console.error("Both session and JWT verification failed:", {
          sessionError,
          jwtError,
        });
        throw new Error("Token verification failed");
      }
    }

    if (!session) {
      console.error("❌ Invalid session token");
      await sentryService.logAdminLogin(req, res, email, false);
      res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
      return;
    }

    // Fetch user details
    const user = await clerkClient.users.getUser(userId);
    const userEmail = user?.emailAddresses[0]?.emailAddress;

    if (!user || userEmail !== email) {
      console.error("❌ User verification failed", {
        expected: email,
        actual: userEmail,
      });
      await sentryService.logAdminLogin(req, res, email, false);
      res.status(401).json({
        success: false,
        message: "User verification failed",
      });
      return;
    }

    // Log success
    await sentryService.logAdminLogin(req, res, email, true);
    console.log("✅ Authentication successful");

    res.status(200).json({
      success: true,
      message: "Authentication successful",
      route: "/admin",
      userId,
      email,
      sessionId: session.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Authentication error:", message);
    await sentryService.logAdminLogin(
      req,
      res,
      email || userId || "unknown",
      false
    );
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
router.post("/logout", async (req: Request, res: Response): Promise<void> => {
  const { userId = "unknown", token } = req.body;
  const sentryService = SentryService.getInstance();

  console.log("🚪 Logout request received", { userId, hasToken: !!token });

  try {
    if (token) {
      await clerkClient.sessions.revokeSession(token);
      console.log("✅ Session revoked successfully");
    }

    await sentryService.logAdminLogout(req, res, userId);
    res.status(200).json({
      success: true,
      message: "Logout successful",
      sessionRevoked: !!token,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Logout error:", message);
    res.status(500).json({
      success: false,
      message: "Logout failed",
      error: message,
    });
  }
});

export default router;
