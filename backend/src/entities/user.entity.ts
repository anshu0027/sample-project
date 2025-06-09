import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, Index } from 'typeorm';
import { Quote } from './quote.entity';

@Entity('USERS')
@Index(['email'])
export class User {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id!: number;

  @Column({ name: 'EMAIL', unique: true })
  email!: string;

  @CreateDateColumn({ name: 'CREATEDAT' })
  createdAt!: Date;

  // --- RELATIONS ---
  @OneToMany(() => Quote, (quote) => quote.user)
  quotes!: Quote[];
}
