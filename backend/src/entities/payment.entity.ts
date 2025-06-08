import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Quote } from './quote.entity';
import { Policy } from './policy.entity';
import { PaymentStatus } from './enums';

@Entity('payments')
@Index(['status'])
@Index(['quoteId'])
export class Payment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'float' })
  amount!: number;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @Column({ nullable: true })
  method!: string;

  @Column({ nullable: true })
  reference!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // --- RELATIONS ---
  @Column()
  quoteId!: number;

  @ManyToOne(() => Quote, (quote) => quote.Payment)
  @JoinColumn({ name: 'quoteId' })
  quote!: Quote;

  @Column({ nullable: true })
  policyId!: number;

  @ManyToOne(() => Policy, (policy) => policy.payments, { nullable: true })
  @JoinColumn({ name: 'policyId' })
  Policy!: Policy;
}