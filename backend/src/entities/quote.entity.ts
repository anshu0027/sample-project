import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { Event } from './event.entity';
import { PolicyHolder } from './policy-holder.entity';
import { Policy } from './policy.entity';
import { Payment } from './payment.entity';
import { StepStatus, QuoteSource } from './enums';

@Entity('quotes')
@Index(['user'])
@Index(['status'])
@Index(['source'])
@Index(['convertedToPolicy'])
export class Quote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  quoteNumber: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ nullable: true })
  coverageLevel: number;

  @Column({ nullable: true })
  liabilityCoverage: string;

  @Column({ default: false, nullable: true })
  liquorLiability: boolean;

  @Column({ nullable: true })
  covidDisclosure: boolean;

  @Column({ nullable: true })
  specialActivities: boolean;

  @Column({ type: 'float', nullable: true })
  totalPremium: number;

  @Column({ type: 'float', nullable: true })
  basePremium: number;

  @Column({ type: 'float', nullable: true })
  liabilityPremium: number;

  @Column({ type: 'float', nullable: true })
  liquorLiabilityPremium: number;

  @Column({ type: 'enum', enum: StepStatus, default: StepStatus.STEP1 })
  status: StepStatus;

  @Column({ type: 'enum', enum: QuoteSource, default: QuoteSource.CUSTOMER })
  source: QuoteSource;

  @Column({ default: false })
  isCustomerGenerated: boolean;

  @Column({ default: false })
  convertedToPolicy: boolean;

  @Column({ default: false })
  emailSent: boolean;

  @Column({ nullable: true })
  emailSentAt: Date;

  @Column({ nullable: true })
  residentState: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn() // Corresponds to @updatedAt
  updatedAt: Date;

  // --- RELATIONS ---
  @Column() // This is the foreign key column
  userId: number;

  @ManyToOne(() => User, (user) => user.quotes)
  @JoinColumn({ name: 'userId' }) // Specifies the FK column
  user: User;

  @OneToOne(() => Event, (event) => event.quote) // The inverse side of the relation
  event: Event;

  @OneToOne(() => PolicyHolder, (policyHolder) => policyHolder.quote) // Inverse side
  policyHolder: PolicyHolder;

  @OneToOne(() => Policy, (policy) => policy.quote) // Inverse side
  policy: Policy;

  @OneToMany(() => Payment, (payment) => payment.quote)
  Payment: Payment[];

  // Additional Venue Information for Weddings (Step 2)
  @Column({ type: 'varchar', length: 255, nullable: true })
  receptionVenueName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  receptionVenueAddress1: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  receptionVenueAddress2: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  receptionVenueCountry: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  receptionVenueCity: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  receptionVenueState: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  receptionVenueZip: string;

  @Column({ type: 'boolean', default: false, nullable: true })
  receptionVenueAsInsured: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  brunchVenueName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  brunchVenueAddress1: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  brunchVenueAddress2: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  brunchVenueCountry: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  brunchVenueCity: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  brunchVenueState: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  brunchVenueZip: string;

  @Column({ type: 'boolean', default: false, nullable: true })
  brunchVenueAsInsured: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  rehearsalVenueName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  rehearsalVenueAddress1: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  rehearsalVenueAddress2: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  rehearsalVenueCountry: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  rehearsalVenueCity: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  rehearsalVenueState: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  rehearsalVenueZip: string;

  @Column({ type: 'boolean', default: false, nullable: true })
  rehearsalVenueAsInsured: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  rehearsalDinnerVenueName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  rehearsalDinnerVenueAddress1: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  rehearsalDinnerVenueAddress2: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  rehearsalDinnerVenueCountry: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  rehearsalDinnerVenueCity: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  rehearsalDinnerVenueState: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  rehearsalDinnerVenueZip: string;

  @Column({ type: 'boolean', default: false, nullable: true })
  rehearsalDinnerVenueAsInsured: boolean;
}