import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Quote } from './quote.entity';
import { Policy } from './policy.entity';
import { PaymentStatus } from './enums';

@Entity('PAYMENTS')
@Index(['status'])
@Index(['quoteId'])
export class Payment {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id!: number;

  @Column({ name: 'AMOUNT', type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ name: 'STATUS', length: 50 })
  status!: string;

  @Column({ name: 'METHOD', length: 50 })
  method!: string;

  @Column({ name: 'REFERENCE', length: 100, nullable: true })
  reference!: string;

  @CreateDateColumn({ name: 'CREATEDAT' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'UPDATEDAT' })
  updatedAt!: Date;

  // --- RELATIONS ---
  @Column({ name: 'QUOTEID', nullable: true })
  quoteId!: number;

  @ManyToOne(() => Quote, (quote) => quote.payments)
  @JoinColumn({ name: 'QUOTEID' })
  quote!: Quote;

  @Column({ name: 'POLICYID', nullable: true })
  policyId!: number;

  @ManyToOne(() => Policy, (policy) => policy.payments)
  @JoinColumn({ name: 'POLICYID' })
  policy!: Policy;
}
