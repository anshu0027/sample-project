import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { User } from "./entities/user.entity";
import { Quote } from "./entities/quote.entity";
import { Event } from "./entities/event.entity";
import { Venue } from "./entities/venue.entity";
import { PolicyHolder } from "./entities/policy-holder.entity";
import { Policy } from "./entities/policy.entity";
import { Payment } from "./entities/payment.entity";
import { PolicyVersion } from "./entities/policy-version.entity";

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
export const AppDataSource = new DataSource({
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
    User,
    Quote,
    Event,
    Venue,
    PolicyHolder,
    Policy,
    Payment,
    PolicyVersion,
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
