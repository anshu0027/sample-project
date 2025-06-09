import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Event } from './event.entity';
import { PolicyHolder } from './policy-holder.entity';
import { Policy } from './policy.entity';
import { Payment } from './payment.entity';
import { StepStatus, QuoteSource } from './enums';

@Entity('QUOTES')
@Index(['userId'])
@Index(['status'])
@Index(['source'])
@Index(['convertedToPolicy'])
export class Quote {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id!: number;

  @Column({ name: 'QUOTENUMBER', unique: true })
  quoteNumber!: string;

  @Column({ name: 'EMAIL', type: 'varchar', length: 255 })
  email!: string;

  @Column({ name: 'COVERAGELEVEL', nullable: true })
  coverageLevel!: number;

  @Column({ name: 'LIABILITYCOVERAGE', nullable: true })
  liabilityCoverage!: string;

  @Column({ name: 'LIQUORLIABILITY', default: false, nullable: true })
  liquorLiability!: boolean;

  @Column({ name: 'COVIDDISCLOSURE', nullable: true })
  covidDisclosure!: boolean;

  @Column({ name: 'SPECIALACTIVITIES', nullable: true })
  specialActivities!: boolean;

  @Column({ name: 'TOTALPREMIUM', type: 'float', nullable: true })
  totalPremium!: number;

  @Column({ name: 'BASEPREMIUM', type: 'float', nullable: true })
  basePremium!: number;

  @Column({ name: 'LIABILITYPREMIUM', type: 'float', nullable: true })
  liabilityPremium!: number;

  @Column({ name: 'LIQUORLIABILITYPREMIUM', type: 'float', nullable: true })
  liquorLiabilityPremium!: number;

  @Column({ name: 'STATUS', type: 'varchar', length: 20, default: StepStatus.STEP1 })
  status!: StepStatus;

  @Column({ name: 'SOURCE', type: 'varchar', length: 20, default: QuoteSource.CUSTOMER })
  source!: QuoteSource;

  @Column({ name: 'ISCUSTOMERGENERATED', default: false })
  isCustomerGenerated!: boolean;

  @Column({ name: 'CONVERTEDTOPOLICY', default: false })
  convertedToPolicy!: boolean;

  @Column({ name: 'EMAILSENT', default: false })
  emailSent!: boolean;

  @Column({ name: 'EMAILSENTAT', nullable: true })
  emailSentAt!: Date;

  @Column({ name: 'RESIDENTSTATE', nullable: true })
  residentState!: string;

  @CreateDateColumn({ name: 'CREATEDAT' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'UPDATEDAT' })
  updatedAt!: Date;

  // --- RELATIONS ---
  @Column({ name: 'USERID' })
  userId!: number;

  @ManyToOne(() => User, (user) => user.quotes)
  @JoinColumn({ name: 'USERID' })
  user!: User;

  @OneToOne(() => Event, (event) => event.quote)
  event!: Event;

  @OneToOne(() => PolicyHolder, (policyHolder) => policyHolder.quote)
  policyHolder!: PolicyHolder;

  @OneToOne(() => Policy, (policy) => policy.quote)
  policy!: Policy;

  @OneToMany(() => Payment, (payment) => payment.quote)
  payments!: Payment[];
}
