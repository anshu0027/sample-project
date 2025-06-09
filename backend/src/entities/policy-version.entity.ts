import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Policy } from './policy.entity';

@Entity('POLICY_VERSIONS')
@Index(['policyId'])
export class PolicyVersion {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'simple-json' }) // Corresponds to Json type
  data!: object;

  @CreateDateColumn()
  createdAt!: Date;

  // --- RELATIONS ---
  @Column()
  policyId!: number;

  @ManyToOne(() => Policy, (policy) => policy.versions)
  @JoinColumn({ name: 'policyId' })
  policy!: Policy;
}