import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Quote } from './quote.entity';
import { Policy } from './policy.entity';
import { Venue } from './venue.entity';

@Entity('EVENTS')
export class Event {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id!: number;

  @Column({ name: 'EVENTTYPE' })
  eventType!: string;

  @Column({ name: 'EVENTDATE' })
  eventDate!: Date;

  @Column({ name: 'MAXGUESTS' })
  maxGuests!: string;

  @Column({ name: 'HONOREE1FIRSTNAME', nullable: true })
  honoree1FirstName!: string;

  @Column({ name: 'HONOREE1LASTNAME', nullable: true })
  honoree1LastName!: string;

  @Column({ name: 'HONOREE2FIRSTNAME', nullable: true })
  honoree2FirstName!: string;

  @Column({ name: 'HONOREE2LASTNAME', nullable: true })
  honoree2LastName!: string;

  // --- RELATIONS ---
  @Column({ name: 'QUOTEID', unique: true, nullable: true })
  quoteId!: number;

  @OneToOne(() => Quote, (quote) => quote.event)
  @JoinColumn({ name: 'QUOTEID' })
  quote!: Quote;

  @Column({ name: 'POLICYID', unique: true, nullable: true })
  policyId!: number;

  @OneToOne(() => Policy, (policy) => policy.event)
  @JoinColumn({ name: 'POLICYID' })
  policy!: Policy;

  @OneToOne(() => Venue, (venue) => venue.event)
  venue!: Venue;
}
