import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, Index } from 'typeorm';
import { Quote } from './quote.entity';

@Entity('USERS') // It's good practice to name tables in plural
@Index(['email']) // Corresponds to @@index([email])
export class User {
  @PrimaryGeneratedColumn() // Corresponds to Int @id @default(autoincrement())
  id!: number;

  @Column({ unique: true }) // Corresponds to @unique
  email!: string;

  @CreateDateColumn() // Corresponds to DateTime @default(now())
  createdAt!: Date;

  // --- RELATIONS ---
  @OneToMany(() => Quote, (quote) => quote.user)
  quotes!: Quote[];
}