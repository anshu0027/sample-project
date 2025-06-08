'use client';
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
export type GuestRange = '1-50' | '51-100' | '101-150' | '151-200' | '201-250' | '251-300' | '301-350' | '351-400';
export type CoverageLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type LiabilityOption = 'none' | 'option1' | 'option2' | 'option3';
export type NewLiabilityOption = 'option4' | 'option5' | 'option6';

export interface QuoteState {
  // Step 1 - Quote
  residentState: string;
  eventType: string;
  maxGuests: GuestRange | '';
  eventDate: string;
  coverageLevel: CoverageLevel | null;
  liabilityCoverage: LiabilityOption | NewLiabilityOption; // Allow new options
  liquorLiability: boolean;
  covidDisclosure: boolean;
  specialActivities: boolean;
  email: string;

  // Quote results
  quoteNumber: string;
  totalPremium: number;
  basePremium: number;
  liabilityPremium: number;
  liquorLiabilityPremium: number;

  // Step 2 - Event Information
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
 receptionVenueName: string;
 receptionVenueAddress1: string;
 receptionVenueAddress2: string;
 receptionVenueCountry: string;
 receptionVenueCity: string;
 receptionVenueState: string;
 receptionVenueZip: string;
 receptionVenueAsInsured: boolean;
 brunchVenueName: string;
 brunchVenueAddress1: string;
 brunchVenueAddress2: string;
 brunchVenueCountry: string;
 brunchVenueCity: string;
 brunchVenueState: string;
 brunchVenueZip: string;
 brunchVenueAsInsured: boolean;
 rehearsalVenueName: string;
 rehearsalVenueAddress1: string;
 rehearsalVenueAddress2: string;
 rehearsalVenueCountry: string;
 rehearsalVenueCity: string;
 rehearsalVenueState: string;
 rehearsalVenueZip: string;
 rehearsalVenueAsInsured: boolean;
 rehearsalDinnerVenueName: string;
 rehearsalDinnerVenueAddress1: string;
 rehearsalDinnerVenueAddress2: string;
 rehearsalDinnerVenueCountry: string;
 rehearsalDinnerVenueCity: string;
 rehearsalDinnerVenueState: string;
 rehearsalDinnerVenueZip: string;
 rehearsalDinnerVenueAsInsured: boolean;
  venueAsInsured: boolean;

  // Step 3 - Policy Holder
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

  // Form progression
  step1Complete: boolean;
  step2Complete: boolean;
  step3Complete: boolean;
}

const initialState: QuoteState = {
  // Step 1 - Quote
  residentState: '',
  eventType: '',
  maxGuests: '',
  eventDate: '',
  coverageLevel: null,
  liabilityCoverage: 'none',
  liquorLiability: false,
  covidDisclosure: false,
  specialActivities: false,
  email: '',

  // Quote results
  quoteNumber: '',
  totalPremium: 0,
  basePremium: 0,
  liabilityPremium: 0,
  liquorLiabilityPremium: 0,

  // Step 2 - Event Information
  honoree1FirstName: '',
  honoree1LastName: '',
  honoree2FirstName: '',
  honoree2LastName: '',
  ceremonyLocationType: '',
  indoorOutdoor: '',
  venueName: '',
  venueAddress1: '',
  venueAddress2: '',
  venueCountry: 'United States',
  venueCity: '',
  venueState: '',
  venueZip: '',
 receptionVenueName: '',
 receptionVenueAddress1: '',
 receptionVenueAddress2: '',
 receptionVenueCountry: 'United States',
 receptionVenueCity: '',
 receptionVenueState: '',
 receptionVenueZip: '',
 receptionVenueAsInsured: false,
 brunchVenueName: '',
 brunchVenueAddress1: '',
 brunchVenueAddress2: '',
 brunchVenueCountry: 'United States',
 brunchVenueCity: '',
 brunchVenueState: '',
 brunchVenueZip: '',
 brunchVenueAsInsured: false,
 rehearsalVenueName: '',
 rehearsalVenueAddress1: '',
 rehearsalVenueAddress2: '',
 rehearsalVenueCountry: 'United States',
 rehearsalVenueCity: '',
 rehearsalVenueState: '',
 rehearsalVenueZip: '',
 rehearsalVenueAsInsured: false,
 rehearsalDinnerVenueName: '',
 rehearsalDinnerVenueAddress1: '',
 rehearsalDinnerVenueAddress2: '',
 rehearsalDinnerVenueCountry: 'United States',
 rehearsalDinnerVenueCity: '',
 rehearsalDinnerVenueState: '',
 rehearsalDinnerVenueZip: '',
 rehearsalDinnerVenueAsInsured: false,
  venueAsInsured: false,

  // Step 3 - Policy Holder
  firstName: '',
  lastName: '',
  phone: '',
  relationship: '',
  hearAboutUs: '',
  address: '',
  country: 'United States',
  city: '',
  state: '',
  zip: '',
  legalNotices: false,
  completingFormName: '',

  // Form progression
  step1Complete: false,
  step2Complete: false,
  step3Complete: false,
};

type QuoteAction =
  | { type: 'UPDATE_FIELD'; field: keyof QuoteState; value: any }
  | { type: 'CALCULATE_QUOTE' }
  | { type: 'COMPLETE_STEP'; step: 1 | 2 | 3 }
  | { type: 'RESET_FORM' }
  | { type: 'SET_ENTIRE_QUOTE_STATE'; payload: Partial<QuoteState> };

const quoteReducer = (state: QuoteState, action: QuoteAction): QuoteState => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return {
        ...state,
        [action.field]: action.value
      };

    case 'CALCULATE_QUOTE':
      const basePremium = calculateBasePremium(state.coverageLevel);
      const liabilityPremium = calculateLiabilityPremium(state.liabilityCoverage); // No longer needs guest range
      const liquorLiabilityPremium = calculateLiquorLiabilityPremium(
        state.liquorLiability,
        state.maxGuests as GuestRange
      );
      // Generate a unique quote number
      const quoteNumber = getNextQuoteNumber();
      return {
        ...state,
        quoteNumber,
        basePremium,
        liabilityPremium,
        liquorLiabilityPremium,
        totalPremium: basePremium + liabilityPremium + liquorLiabilityPremium
      };

    case 'COMPLETE_STEP':
      if (action.step === 1) {
        return { ...state, step1Complete: true };
      } else if (action.step === 2) {
        return { ...state, step2Complete: true };
      } else {
        return { ...state, step3Complete: true };
      }

    case 'RESET_FORM':
      return initialState;

    case 'SET_ENTIRE_QUOTE_STATE':
      return {
        ...state, // Preserve existing state if payload is partial
        ...action.payload, // Overwrite with new values
      };

    default:
      return state;
  }
};

// Helper functions for premium calculations
const calculateBasePremium = (level: CoverageLevel | null): number => {
  if (!level) return 0;

  // Coverage level premium mapping
  const premiumMap: Record<CoverageLevel, number> = {
    1: 160,  // $7,500 coverage
    2: 200,
    3: 250,
    4: 300,
    5: 355,  // $50,000 coverage
    6: 450,
    7: 600,
    8: 750,
    9: 900,
    10: 1025, // $175,000 coverage
  };

  return premiumMap[level] || 0;
};

const calculateLiabilityPremium = (option: LiabilityOption | NewLiabilityOption): number => {
  switch (option) {
    case 'option1': // $1M liability with $25K property damage
      return 195; // Updated price
    case 'option2': // $1M liability with $250K property damage
      return 210; // Updated price
    case 'option3': // $1M liability with $1M property damage
      return 240; // Updated price
    case 'option4': // $1M/$2M Aggregate Liability with $25K PD
      return 240; // Price from constants
    case 'option5': // $1M/$2M Aggregate Liability with $250K PD
      return 255; // Price from constants
    case 'option6': // $1M/$2M Aggregate Liability with $1M PD
      return 265; // Price from constants
    default:
      return 0;
  }
};

const calculateLiquorLiabilityPremium = (hasLiquorLiability: boolean, guestRange: GuestRange): number => {
  if (!hasLiquorLiability) return 0;

  // Guest count range premium mapping
  const premiumMap: Record<GuestRange, number> = {
    '1-50': 65,
    '51-100': 65,
    '101-150': 85,
    '151-200': 85,
    '201-250': 100,
    '251-300': 100,
    '301-350': 150,
    '351-400': 150
  };

  return premiumMap[guestRange] || 0;
};

// NOTE: getNextQuoteNumber is ONLY for display purposes and should NOT be used for DB operations. This is only for UI preview, not DB.
const getNextQuoteNumber = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}${mm}${dd}`;
  let seq = 1;
  if (typeof window !== 'undefined') {
    const lastDate = localStorage.getItem('quoteDate');
    let lastSeq = parseInt(localStorage.getItem('quoteSeq') || '0', 10);
    if (lastDate === dateStr) {
      seq = lastSeq + 1;
    }
    localStorage.setItem('quoteDate', dateStr);
    localStorage.setItem('quoteSeq', seq.toString());
  }
  // Default to PCI
  return `PCI-${dateStr}-${seq}`;
};

interface QuoteContextType {
  state: QuoteState;
  dispatch: React.Dispatch<QuoteAction>;
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

export const QuoteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(quoteReducer, initialState);

  return (
    <QuoteContext.Provider value={{ state, dispatch }}>
      {children}
    </QuoteContext.Provider>
  );
};

export const useQuote = (): QuoteContextType => {
  const context = useContext(QuoteContext);
  if (context === undefined) {
    throw new Error('useQuote must be used within a QuoteProvider');
  }
  return context;
};