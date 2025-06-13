// ------------------------
// Interface for a PolicyVersion record.
// Represents a snapshot of a policy at a specific point in time.
// ------------------------
export interface PolicyVersion {
  id: number;
  policyId: number;
  data: string; // JSON string of the policy data
  createdAt: Date;
}

// ------------------------
// Interface for the data structure stored within a PolicyVersion's 'data' field.
// This mirrors the structure of the quote/policy form, capturing all relevant fields
// at the time the version was created.
// ------------------------
export interface PolicyVersionData {
  // Step 1
  residentState: string;
  eventType: string;
  eventDate: string;
  maxGuests: string;
  email: string;
  coverageLevel: number | null;
  liabilityCoverage: string | null;
  liquorLiability: boolean;
  covidDisclosure: boolean;
  specialActivities: boolean;

  // Step 2
  honoree1FirstName: string;
  honoree1LastName: string;
  honoree2FirstName: string;
  honoree2LastName: string;
  ceremonyLocationType: string;
  indoorOutdoor: string;
  venueName: string;
  venueAddress1: string;
  venueAddress2: string;
  venueCountry: string;
  venueCity: string;
  venueState: string;
  venueZip: string;
  venueAsInsured: boolean;

  // Additional Venue Information for Weddings (Step 2)
  receptionLocationType: string;
  receptionIndoorOutdoor: string;
  receptionVenueName: string;
  receptionVenueAddress1: string;
  receptionVenueAddress2: string;
  receptionVenueCountry: string;
  receptionVenueCity: string;
  receptionVenueState: string;
  receptionVenueZip: string;
  receptionVenueAsInsured: boolean;

  brunchLocationType: string;
  brunchIndoorOutdoor: string;
  brunchVenueName: string;
  brunchVenueAddress1: string;
  brunchVenueAddress2: string;
  brunchVenueCountry: string;
  brunchVenueCity: string;
  brunchVenueState: string;
  brunchVenueZip: string;
  brunchVenueAsInsured: boolean;

  rehearsalLocationType: string;
  rehearsalIndoorOutdoor: string;
  rehearsalVenueName: string;
  rehearsalVenueAddress1: string;
  rehearsalVenueAddress2: string;
  rehearsalVenueCountry: string;
  rehearsalVenueCity: string;
  rehearsalVenueState: string;
  rehearsalVenueZip: string;
  rehearsalVenueAsInsured: boolean;

  rehearsalDinnerLocationType: string;
  rehearsalDinnerIndoorOutdoor: string;
  rehearsalDinnerVenueName: string;
  rehearsalDinnerVenueAddress1: string;
  rehearsalDinnerVenueAddress2: string;
  rehearsalDinnerVenueCountry: string;
  rehearsalDinnerVenueCity: string;
  rehearsalDinnerVenueState: string;
  rehearsalDinnerVenueZip: string;
  rehearsalDinnerVenueAsInsured: boolean;

  // Step 3
  firstName: string;
  lastName: string;
  phone: string;
  relationship: string;
  hearAboutUs: string;
  address: string;
  country: string;
  city: string;
  state: string;
  zip: string;
  legalNotices: boolean;
  completingFormName: string;

  // Other fields
  id?: number; // Policy ID from database
  quoteNumber: string;
  totalPremium: number;
  basePremium: number;
  liabilityPremium: number;
  liquorLiabilityPremium: number;
  status: string;
  policyId: number;
  policyNumber: string;
  pdfUrl: string;
}
