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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const dotenv = __importStar(require("dotenv"));
const user_entity_1 = require("./entities/user.entity");
const quote_entity_1 = require("./entities/quote.entity");
const event_entity_1 = require("./entities/event.entity");
const venue_entity_1 = require("./entities/venue.entity");
const policy_holder_entity_1 = require("./entities/policy-holder.entity");
const policy_entity_1 = require("./entities/policy.entity");
const payment_entity_1 = require("./entities/payment.entity");
const policy_version_entity_1 = require("./entities/policy-version.entity");
const event_log_entity_1 = require("./entities/event-log.entity");
const sentry_error_entity_1 = require("./entities/sentry-error.entity");
const backup_log_entity_1 = require("./entities/backup-log.entity");
// ------------------------
// Load environment variables from the .env file in the root of the project.
// ------------------------
dotenv.config();
// console.log("User entity loaded", User);
// console.log("Quote entity loaded", Quote);
// console.log("Event entity loaded", Event);
// console.log("Venue entity loaded", Venue);
// console.log("PolicyHolder entity loaded", PolicyHolder);
// console.log("Policy entity loaded", Policy);
// console.log("Payment entity loaded", Payment);
// console.log("PolicyVersion entity loaded", PolicyVersion);
// ------------------------
// Configuration for the TypeORM DataSource.
// This object defines how TypeORM connects to and interacts with your Oracle database.
// ------------------------
exports.AppDataSource = new typeorm_1.DataSource({
    type: "oracle",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    sid: process.env.DB_SID,
    // serviceName: process.env.DB_SERVICE_NAME,
    // ------------------------
    // List of all entities that TypeORM should be aware of.
    // Each entity corresponds to a database table.
    // ------------------------
    entities: [
        user_entity_1.User,
        quote_entity_1.Quote,
        event_entity_1.Event,
        venue_entity_1.Venue,
        policy_holder_entity_1.PolicyHolder,
        policy_entity_1.Policy,
        payment_entity_1.Payment,
        policy_version_entity_1.PolicyVersion,
        event_log_entity_1.EventLog,
        sentry_error_entity_1.SentryError,
        backup_log_entity_1.BackupLog,
    ],
    // ------------------------
    // synchronize: (Default: false) If true, automatically creates or updates database schema
    // to match entity definitions on every application launch.
    // WARNING: Set to false in production to avoid accidental data loss.
    // ------------------------
    synchronize: false,
    // ------------------------
    // dropSchema: (Default: false) If true, drops the schema each time connection is established.
    // WARNING: Use with extreme caution, as this will delete all data.
    // ------------------------
    dropSchema: false,
    logging: ["error", "info", "log"], // Configure logging levels. Can include 'query' to see executed SQL.
});
//# sourceMappingURL=data-source.js.map