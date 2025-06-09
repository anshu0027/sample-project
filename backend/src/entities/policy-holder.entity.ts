import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Quote } from './quote.entity';
import { Policy } from './policy.entity';

@Entity('POLICY_HOLDERS')
export class PolicyHolder {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  phone!: string;

  @Column({ nullable: true })
  relationship!: string;

  @Column({ nullable: true })
  hearAboutUs!: string;

  @Column()
  address!: string;

  @Column()
  country!: string;

  @Column()
  city!: string;

  @Column({ name: 'state_column', nullable: true })
  state!: string;

  @Column({ name: 'zip_code', nullable: true })
  zip!: string;

  @Column({ nullable: true })
  legalNotices!: boolean;

  @Column({ nullable: true })
  completingFormName!: string;

  // --- RELATIONS ---
  @Column({ unique: true, nullable: true })
  quoteId!: number;

  @OneToOne(() => Quote, (quote) => quote.policyHolder)
  @JoinColumn({ name: 'quoteId' })
  quote!: Quote;

  @Column({ nullable: true })
  policyId!: number;

  @OneToOne(() => Policy, (policy) => policy.policyHolder)
  @JoinColumn({ name: 'policyId' })
  policy!: Policy;
}