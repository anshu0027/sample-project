import express from "express";
import type { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// ------------------------
// Rate limiter for login attempts to prevent brute-force attacks.
// ------------------------
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
});

const router = express.Router();

// ------------------------
// Get admin credentials from environment variables
// ------------------------
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// ------------------------
// POST / - Handles admin login attempts.
// Applies rate limiting.
// ------------------------
router.post("/", loginLimiter, (req: Request, res: Response): void => {
  const { id, password } = req.body;

  // Check if environment variables are set
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error(
      "Admin credentials not properly configured in environment variables"
    );
    res.status(500).json({
      success: false,
      message: "Server configuration error",
    });
    return;
  }

  // ------------------------
  // Verify the provided credentials against environment variables
  // ------------------------
  if (id === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    res.status(200).json({
      success: true,
      message: "Login successful",
      route: "/admin",
    });
    return;
  }

  // ------------------------
  // If credentials do not match, return a 401 Unauthorized response.
  // ------------------------
  res.status(401).json({
    success: false,
    message: "Invalid credentials",
  });
});

export default router;
