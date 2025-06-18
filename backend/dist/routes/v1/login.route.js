"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv = __importStar(require("dotenv"));
// Load environment variables
dotenv.config();
// ------------------------
// Rate limiter for login attempts to prevent brute-force attacks.
// ------------------------
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
});
const router = express_1.default.Router();
// ------------------------
// Get admin credentials from environment variables
// ------------------------
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
// ------------------------
// POST / - Handles admin login attempts.
// Applies rate limiting.
// ------------------------
router.post("/", loginLimiter, (req, res) => {
    const { id, password } = req.body;
    // Check if environment variables are set
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        console.error("Admin credentials not properly configured in environment variables");
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
exports.default = router;
