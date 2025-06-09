import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { Event } from './event.entity';
import { PolicyHolder } from './policy-holder.entity';
import { Policy } from './policy.entity';
import { Payment } from './payment.entity';
import { StepStatus, QuoteSource } from './enums';

@Entity('QUOTES')
@Index(['user'])
@Index(['status'])
@Index(['source'])
@Index(['convertedToPolicy'])
export class Quote {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  quoteNumber!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ nullable: true })
  coverageLevel!: number;

  @Column({ nullable: true })
  liabilityCoverage!: string;

  @Column({ default: false, nullable: true })
  liquorLiability!: boolean;

  @Column({ nullable: true })
  covidDisclosure!: boolean;

  @Column({ nullable: true })
  specialActivities!: boolean;

  @Column({ type: 'float', nullable: true })
  totalPremium!: number;

  @Column({ type: 'float', nullable: true })
  basePremium!: number;

  @Column({ type: 'float', nullable: true })
  liabilityPremium!: number;

  @Column({ type: 'float', nullable: true })
  liquorLiabilityPremium!: number;

  @Column({ type: 'varchar', length: 20, default: StepStatus.STEP1 })
  status!: StepStatus;

  @Column({ type: 'varchar', length: 20, default: QuoteSource.CUSTOMER })
  source!: QuoteSource;

  @Column({ default: false })
  isCustomerGenerated!: boolean;

  @Column({ default: false })
  convertedToPolicy!: boolean;

  @Column({ default: false })
  emailSent!: boolean;

  @Column({ nullable: true })
  emailSentAt!: Date;

  @Column({ nullable: true })
  residentState!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn() // Corresponds to @updatedAt
  updatedAt!: Date;

  // --- RELATIONS ---
  @Column() // This is the foreign key column
  userId!: number;

  @ManyToOne(() => User, (user) => user.quotes)
  @JoinColumn({ name: 'userId' }) // Specifies the FK column
  user!: User;

  @OneToOne(() => Event, (event) => event.quote) // The inverse side of the relation
    event!: Event;

  @OneToOne(() => PolicyHolder, (policyHolder) => policyHolder.quote) // Inverse side
  policyHolder!: PolicyHolder;

  @OneToOne(() => Policy, (policy) => policy.quote) // Inverse side
  policy!: Policy;

  @OneToMany(() => Payment, (payment) => payment.quote)
  Payment!: Payment[];
}