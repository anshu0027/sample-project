export interface PolicyVersion {
  id: number;
  policyId: number;
  data: string; // JSON string of the policy data
  createdAt: Date;
}

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