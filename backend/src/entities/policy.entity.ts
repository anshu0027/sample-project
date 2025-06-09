import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { Quote } from './quote.entity';
import { Event } from './event.entity';
import { PolicyHolder } from './policy-holder.entity';
import { Payment } from './payment.entity';
import { PolicyVersion } from './policy-version.entity';

@Entity('POLICIES')
export class Policy {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  policyNumber!: string;

  @Column({ nullable: true })
  pdfUrl!: string;

  @Column({ default: false })
  emailSent!: boolean;

  @Column({ nullable: true })
  emailSentAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // --- RELATIONS ---
  @Column({ unique: true, nullable: true })
  quoteId!: number;

  @OneToOne(() => Quote, (quote) => quote.policy)
  @JoinColumn({ name: 'quoteId' })
  quote!: Quote;

  @OneToOne(() => Event, (event) => event.policy)
  event!: Event;

  @OneToOne(() => PolicyHolder, (policyHolder) => policyHolder.policy)
  policyHolder!: PolicyHolder;

  @OneToMany(() => Payment, (payment) => payment.Policy)
  payments!: Payment[];

  @OneToMany(() => PolicyVersion, (version) => version.policy)
  versions!: PolicyVersion[];
}