import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Event } from './event.entity';

@Entity('venues')
export class Venue {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  address1!: string;

  @Column({ nullable: true })
  address2!: string;

  @Column()
  country!: string;

  @Column()
  city!: string;

  @Column({ name: 'state_column', nullable: true }) // Corresponds to @map("state_column")
  state!: string;

  @Column({ name: 'zip_code', nullable: true }) // Corresponds to @map("zip_code")
  zip!: string;

  @Column({ nullable: true })
  locationType!: string;

  @Column({ nullable: true })
  ceremonyLocationType!: string;

  @Column({ nullable: true })
  indoorOutdoor!: string;

  @Column({ nullable: true })
  venueAsInsured!: boolean;


    // Additional Venue Information for Weddings (Step 2)
    
    // Reception Venue
    @Column({ type: 'varchar', length: 255, nullable: true })
    receptionLocationType!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    receptionIndoorOutdoor!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    receptionVenueName!: string;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    receptionVenueAddress1!: string;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    receptionVenueAddress2!: string;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    receptionVenueCountry!: string;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    receptionVenueCity!: string;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    receptionVenueState!: string;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    receptionVenueZip!: string;
  
    @Column({ type: 'boolean', default: false, nullable: true })
    receptionVenueAsInsured!: boolean;

    // Brunch Venue
    @Column({ type: 'varchar', length: 255, nullable: true })
    brunchLocationType!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    brunchIndoorOutdoor!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
      brunchVenueName!: string;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    brunchVenueAddress1!: string;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    brunchVenueAddress2!: string;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    brunchVenueCountry!: string;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    brunchVenueCity!: string;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    brunchVenueState!: string;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    brunchVenueZip!: string;
  
    @Column({ type: 'boolean', default: false, nullable: true })
    brunchVenueAsInsured!: boolean;

    // Rehearsal Venue
    @Column({ type: 'varchar', length: 255, nullable: true })
    rehearsalLocationType!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    rehearsalIndoorOutdoor!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    rehearsalVenueName!: string;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    rehearsalVenueAddress1!: string;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    rehearsalVenueAddress2!: string;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    rehearsalVenueCountry!: string;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    rehearsalVenueCity!: string;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    rehearsalVenueState!: string;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    rehearsalVenueZip!: string;
  
    @Column({ type: 'boolean', default: false, nullable: true })
    rehearsalVenueAsInsured!: boolean;

    // Rehearsal Dinner Venue
    @Column({ type: 'varchar', length: 255, nullable: true })
    rehearsalDinnerVenueName!: string;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    rehearsalDinnerVenueAddress1!: string;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    rehearsalDinnerVenueAddress2!: string;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    rehearsalDinnerVenueCountry!: string;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    rehearsalDinnerVenueCity!: string;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    rehearsalDinnerVenueState!: string;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    rehearsalDinnerVenueZip!: string;
  
    @Column({ type: 'boolean', default: false, nullable: true })
    rehearsalDinnerVenueAsInsured!: boolean;

    @Column({ type: 'varchar', length: 255, nullable: true })
    rehearsalDinnerLocationType!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    rehearsalDinnerIndoorOutdoor!: string;

  // --- RELATIONS ---
  @Column({ unique: true })
  eventId!: number;

  @OneToOne(() => Event, (event) => event.venue)
  @JoinColumn({ name: 'eventId' })
  event!: Event;
}