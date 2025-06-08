import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Event } from './event.entity';

@Entity('venues')
export class Venue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  address1: string;

  @Column({ nullable: true })
  address2: string;

  @Column()
  country: string;

  @Column()
  city: string;

  @Column({ name: 'state_column', nullable: true }) // Corresponds to @map("state_column")
  state: string;

  @Column({ name: 'zip_code', nullable: true }) // Corresponds to @map("zip_code")
  zip: string;

  @Column({ nullable: true })
  locationType: string;

  @Column({ nullable: true })
  ceremonyLocationType: string;

  @Column({ nullable: true })
  indoorOutdoor: string;

  @Column({ nullable: true })
  venueAsInsured: boolean;

  // --- RELATIONS ---
  @Column({ unique: true })
  eventId: number;

  @OneToOne(() => Event, (event) => event.venue)
  @JoinColumn({ name: 'eventId' })
  event: Event;
}