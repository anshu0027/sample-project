import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Quote } from './quote.entity';
import { Event } from './event.entity';
import { PolicyHolder } from './policy-holder.entity';
import { Payment } from './payment.entity';
import { PolicyVersion } from './policy-version.entity';

@Entity('POLICIES')
export class Policy {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id!: number;

  @Column({ name: 'POLICYNUMBER', unique: true })
  policyNumber!: string;

  @Column({ name: 'PDFURL', nullable: true })
  pdfUrl!: string;

  @Column({ name: 'EMAILSENT', default: false })
  emailSent!: boolean;

  @Column({ name: 'EMAILSENTAT', nullable: true })
  emailSentAt!: Date;

  @CreateDateColumn({ name: 'CREATEDAT' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'UPDATEDAT' })
  updatedAt!: Date;

  // --- RELATIONS ---
  @Column({ name: 'QUOTEID', unique: true, nullable: true })
  quoteId!: number;

  @OneToOne(() => Quote, (quote) => quote.policy)
  @JoinColumn({ name: 'QUOTEID' })
  quote!: Quote;

  @OneToOne(() => Event, (event) => event.policy)
  event!: Event;

  @OneToOne(() => PolicyHolder, (policyHolder) => policyHolder.policy)
  policyHolder!: PolicyHolder;

  @OneToMany(() => Payment, (payment) => payment.policy)
  payments!: Payment[];

  @OneToMany(() => PolicyVersion, (version) => version.policy)
  versions!: PolicyVersion[];
}
