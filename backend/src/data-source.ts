import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Import all your new entities
import { User } from './entities/user.entity';
import { Quote } from './entities/quote.entity';
import { Event } from './entities/event.entity';
import { Venue } from './entities/venue.entity';
import { PolicyHolder } from './entities/policy-holder.entity';
import { Policy } from './entities/policy.entity';
import { Payment } from './entities/payment.entity';
import { PolicyVersion } from './entities/policy-version.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'oracle',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  sid: process.env.DB_SID,
  // serviceName: process.env.DB_SERVICE_NAME,
  // Add all entities to this array
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
  synchronize: false, // Be careful with this in production
  logging: ['error', 'query', 'info', 'log'], // Set to true to see generated SQL queries
});