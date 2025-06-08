import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, Index } from 'typeorm';
import { Quote } from './quote.entity';

@Entity('users') // It's good practice to name tables in plural
@Index(['email']) // Corresponds to @@index([email])
export class User {
  @PrimaryGeneratedColumn() // Corresponds to Int @id @default(autoincrement())
  id!: number;

  @Column({ unique: true }) // Corresponds to @unique
  email!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ type: 'varchar', length: 15, nullable: true }) // Corresponds to String? @db.VarChar(15)
  phone!: string;

  @CreateDateColumn() // Corresponds to DateTime @default(now())
  createdAt!: Date;

  // --- RELATIONS ---
  @OneToMany(() => Quote, (quote) => quote.user)
  quotes!: Quote[];
}