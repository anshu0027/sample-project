import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Quote } from './quote.entity';
import { Policy } from './policy.entity';

@Entity('POLICY_HOLDERS')
export class PolicyHolder {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id!: number;

  @Column({ name: 'FIRSTNAME' })
  firstName!: string;

  @Column({ name: 'LASTNAME' })
  lastName!: string;

  @Column({ name: 'PHONE' })
  phone!: string;

  @Column({ name: 'RELATIONSHIP', nullable: true })
  relationship!: string;

  @Column({ name: 'HEARABOUTUS', nullable: true })
  hearAboutUs!: string;

  @Column({ name: 'ADDRESS' })
  address!: string;

  @Column({ name: 'COUNTRY' })
  country!: string;

  @Column({ name: 'CITY' })
  city!: string;

  @Column({ name: 'STATE', nullable: true })
  state!: string;

  @Column({ name: 'ZIP', nullable: true })
  zip!: string;

  @Column({ name: 'LEGALNOTICES', nullable: true })
  legalNotices!: boolean;

  @Column({ name: 'COMPLETINGFORMNAME', nullable: true })
  completingFormName!: string;

  // --- RELATIONS ---
  @Column({ name: 'QUOTEID', unique: true, nullable: true })
  quoteId!: number;

  @OneToOne(() => Quote, (quote) => quote.policyHolder)
  @JoinColumn({ name: 'QUOTEID' })
  quote!: Quote;

  @Column({ name: 'POLICYID', nullable: true })
  policyId!: number;

  @OneToOne(() => Policy, (policy) => policy.policyHolder)
  @JoinColumn({ name: 'POLICYID' })
  policy!: Policy;
}
