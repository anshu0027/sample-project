import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Event } from './event.entity';

@Entity('VENUES')
export class Venue {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id!: number;

  @Column({ name: 'NAME' })
  name!: string;

  @Column({ name: 'ADDRESS1' })
  address1!: string;

  @Column({ name: 'ADDRESS2', nullable: true })
  address2!: string;

  @Column({ name: 'COUNTRY' })
  country!: string;

  @Column({ name: 'CITY' })
  city!: string;

  @Column({ name: 'STATE', nullable: true })
  state!: string;

  @Column({ name: 'ZIP', nullable: true })
  zip!: string;

  @Column({ name: 'LOCATIONTYPE', nullable: true })
  locationType!: string;

  @Column({ name: 'CEREMONYLOCATIONTYPE', nullable: true })
  ceremonyLocationType!: string;

  @Column({ name: 'INDOOROUTDOOR', nullable: true })
  indoorOutdoor!: string;

  @Column({ name: 'VENUEASINSURED', type: 'number', default: 0 })
  venueAsInsured!: boolean;

  // --- RECEPTION VENUE ---
  @Column({ name: 'RECEPTIONLOCATIONTYPE', type: 'varchar', length: 255, nullable: true })
  receptionLocationType!: string;

  @Column({ name: 'RECEPTIONINDOOROUTDOOR', type: 'varchar', length: 255, nullable: true })
  receptionIndoorOutdoor!: string;

  @Column({ name: 'RECEPTIONVENUENAME', type: 'varchar', length: 255, nullable: true })
  receptionVenueName!: string;

  @Column({ name: 'RECEPTIONVENUEADDRESS1', type: 'varchar', length: 255, nullable: true })
  receptionVenueAddress1!: string;

  @Column({ name: 'RECEPTIONVENUEADDRESS2', type: 'varchar', length: 255, nullable: true })
  receptionVenueAddress2!: string;

  @Column({ name: 'RECEPTIONVENUECOUNTRY', type: 'varchar', length: 255, nullable: true })
  receptionVenueCountry!: string;

  @Column({ name: 'RECEPTIONVENUECITY', type: 'varchar', length: 255, nullable: true })
  receptionVenueCity!: string;

  @Column({ name: 'RECEPTIONVENUESTATE', type: 'varchar', length: 255, nullable: true })
  receptionVenueState!: string;

  @Column({ name: 'RECEPTIONVENUEZIP', type: 'varchar', length: 255, nullable: true })
  receptionVenueZip!: string;

  @Column({ name: 'RECEPTIONVENUEASINSURED', type: 'number', default: 0, nullable: true })
  receptionVenueAsInsured!: boolean;

  // --- BRUNCH VENUE ---
  @Column({ name: 'BRUNCHLOCATIONTYPE', type: 'varchar', length: 255, nullable: true })
  brunchLocationType!: string;

  @Column({ name: 'BRUNCHINDOOROUTDOOR', type: 'varchar', length: 255, nullable: true })
  brunchIndoorOutdoor!: string;

  @Column({ name: 'BRUNCHVENUENAME', type: 'varchar', length: 255, nullable: true })
  brunchVenueName!: string;

  @Column({ name: 'BRUNCHVENUEADDRESS1', type: 'varchar', length: 255, nullable: true })
  brunchVenueAddress1!: string;

  @Column({ name: 'BRUNCHVENUEADDRESS2', type: 'varchar', length: 255, nullable: true })
  brunchVenueAddress2!: string;

  @Column({ name: 'BRUNCHVENUECOUNTRY', type: 'varchar', length: 255, nullable: true })
  brunchVenueCountry!: string;

  @Column({ name: 'BRUNCHVENUECITY', type: 'varchar', length: 255, nullable: true })
  brunchVenueCity!: string;

  @Column({ name: 'BRUNCHVENUESTATE', type: 'varchar', length: 255, nullable: true })
  brunchVenueState!: string;

  @Column({ name: 'BRUNCHVENUEZIP', type: 'varchar', length: 255, nullable: true })
  brunchVenueZip!: string;

  @Column({ name: 'BRUNCHVENUEASINSURED', type: 'number', default: 0, nullable: true })
  brunchVenueAsInsured!: boolean;

  // --- REHEARSAL VENUE ---
  @Column({ name: 'REHEARSALLOCATIONTYPE', type: 'varchar', length: 255, nullable: true })
  rehearsalLocationType!: string;

  @Column({ name: 'REHEARSALINDOOROUTDOOR', type: 'varchar', length: 255, nullable: true })
  rehearsalIndoorOutdoor!: string;

  @Column({ name: 'REHEARSALVENUENAME', type: 'varchar', length: 255, nullable: true })
  rehearsalVenueName!: string;

  @Column({ name: 'REHEARSALVENUEADDRESS1', type: 'varchar', length: 255, nullable: true })
  rehearsalVenueAddress1!: string;

  @Column({ name: 'REHEARSALVENUEADDRESS2', type: 'varchar', length: 255, nullable: true })
  rehearsalVenueAddress2!: string;

  @Column({ name: 'REHEARSALVENUECOUNTRY', type: 'varchar', length: 255, nullable: true })
  rehearsalVenueCountry!: string;

  @Column({ name: 'REHEARSALVENUECITY', type: 'varchar', length: 255, nullable: true })
  rehearsalVenueCity!: string;

  @Column({ name: 'REHEARSALVENUESTATE', type: 'varchar', length: 255, nullable: true })
  rehearsalVenueState!: string;

  @Column({ name: 'REHEARSALVENUEZIP', type: 'varchar', length: 255, nullable: true })
  rehearsalVenueZip!: string;

  @Column({ name: 'REHEARSALVENUEASINSURED', type: 'number', default: 0, nullable: true })
  rehearsalVenueAsInsured!: boolean;

  // --- REHEARSAL DINNER VENUE ---
  @Column({ name: 'REHEARSALDINNERVENUENAME', type: 'varchar', length: 255, nullable: true })
  rehearsalDinnerVenueName!: string;

  @Column({ name: 'REHEARSALDINNERVENUEADDRESS1', type: 'varchar', length: 255, nullable: true })
  rehearsalDinnerVenueAddress1!: string;

  @Column({ name: 'REHEARSALDINNERVENUEADDRESS2', type: 'varchar', length: 255, nullable: true })
  rehearsalDinnerVenueAddress2!: string;

  @Column({ name: 'REHEARSALDINNERVENUECOUNTRY', type: 'varchar', length: 255, nullable: true })
  rehearsalDinnerVenueCountry!: string;

  @Column({ name: 'REHEARSALDINNERVENUECITY', type: 'varchar', length: 255, nullable: true })
  rehearsalDinnerVenueCity!: string;

  @Column({ name: 'REHEARSALDINNERVENUESTATE', type: 'varchar', length: 255, nullable: true })
  rehearsalDinnerVenueState!: string;

  @Column({ name: 'REHEARSALDINNERVENUEZIP', type: 'varchar', length: 255, nullable: true })
  rehearsalDinnerVenueZip!: string;

  @Column({ name: 'REHEARSALDINNERVENUEASINSURED', type: 'number', default: 0, nullable: true })
  rehearsalDinnerVenueAsInsured!: boolean;

  @Column({ name: 'REHEARSALDINNERLOCATIONTYPE', type: 'varchar', length: 255, nullable: true })
  rehearsalDinnerLocationType!: string;

  @Column({ name: 'REHEARSALDINNERINDOOROUTDOOR', type: 'varchar', length: 255, nullable: true })
  rehearsalDinnerIndoorOutdoor!: string;

  // --- RELATIONS ---
  @Column({ name: 'EVENTID', unique: true })
  eventId!: number;

  @OneToOne(() => Event, (event) => event.venue)
  @JoinColumn({ name: 'EVENTID' })
  event!: Event;
}
