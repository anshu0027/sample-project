import express from "express";
import type { Request, Response } from "express";
import rateLimit from "express-rate-limit";
// ------------------------
// Rate limiter for login attempts to prevent brute-force attacks.
// ------------------------
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
});

const router = express.Router();
// ------------------------
// Hardcoded admin credentials.
// IMPORTANT: In a production environment, these should NEVER be hardcoded.
// Use environment variables and secure password hashing mechanisms.
// ------------------------
const LoginID = "admin@weddingguard.com";
const LoginPassword = "admin123";
// ------------------------
// POST / - Handles admin login attempts.
// Applies rate limiting.
// ------------------------
router.post("/", loginLimiter, (req: Request, res: Response): void => {
  const { id, password } = req.body;
  // ------------------------
  // Verify the provided credentials against the hardcoded admin credentials.
  // ------------------------
  // Verify admin credentials
  if (id === LoginID && password === LoginPassword) {
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
