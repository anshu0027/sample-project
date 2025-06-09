import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Quote } from './quote.entity';
import { Policy } from './policy.entity';
import { Venue } from './venue.entity';

@Entity('EVENTS')
export class Event {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  eventType!: string;

  @Column()
  eventDate!: Date;

  @Column()
  maxGuests!: string;

  @Column({ nullable: true })
  honoree1FirstName!: string;

  @Column({ nullable: true })
  honoree1LastName!: string;

  @Column({ nullable: true })
  honoree2FirstName!: string;

  @Column({ nullable: true })
  honoree2LastName!: string;

  

  // --- RELATIONS ---
  @Column({ unique: true, nullable: true })
  quoteId!: number;

  @OneToOne(() => Quote, (quote) => quote.event)
  @JoinColumn({ name: 'quoteId' }) // This is the "owning" side for the quote relation
  quote!: Quote;

  @Column({ unique: true, nullable: true })
  policyId!: number;

  @OneToOne(() => Policy, (policy) => policy.event)
  @JoinColumn({ name: 'policyId' }) // This is the "owning" side for the policy relation
  policy!: Policy;

  @OneToOne(() => Venue, (venue) => venue.event)
  venue!: Venue;
}