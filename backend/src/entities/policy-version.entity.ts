import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Policy } from './policy.entity';

@Entity('POLICY_VERSIONS')
@Index(['policyId'])
export class PolicyVersion {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id!: number;

  @Column({ name: 'DATA', type: 'simple-json' }) // Json in Oracle might need special handling later
  data!: object;

  @CreateDateColumn({ name: 'CREATEDAT' })
  createdAt!: Date;

  // --- RELATIONS ---
  @Column({ name: 'POLICYID' })
  policyId!: number;

  @ManyToOne(() => Policy, (policy) => policy.versions)
  @JoinColumn({ name: 'POLICYID' })
  policy!: Policy;
}
