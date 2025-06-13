'use client';
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// ------------------------
// Types
// Defines the possible string values for guest ranges.
// ------------------------
export type GuestRange =
  | '1-50'
  | '51-100'
  | '101-150'
  | '151-200'
  | '201-250'
  | '251-300'
  | '301-350'
  | '351-400';
// ------------------------
// Defines the possible numerical values for coverage levels.
// ------------------------
export type CoverageLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
// ------------------------
// Defines the possible string values for standard liability options.
// ------------------------
export type LiabilityOption = 'none' | 'option1' | 'option2' | 'option3';
// ------------------------
// Defines the possible string values for new/extended liability options.
// ------------------------
export type NewLiabilityOption = 'option4' | 'option5' | 'option6';

// ------------------------
// Interface defining the structure of the quote state.
// This includes all fields collected across different steps of the quote generation process.
// ------------------------
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

  // Ceremony Venue
  ceremonyLocationType: string;
  indoorOutdoor: string;
  venueName: string;
  venueAddress1: string;
  venueAddress2: string;
  venueCountry: string;
  venueCity: string;
  venueState: string;
  venueZip: string;

  // Reception Venue
  receptionVenueName: string;
  receptionLocationType: string;
  receptionIndoorOutdoor: string;
  receptionVenueAddress1: string;
  receptionVenueAddress2: string;
  receptionVenueCountry: string;
  receptionVenueCity: string;
  receptionVenueState: string;
  receptionVenueZip: string;
  receptionVenueAsInsured: boolean;

  // Brunch Venue
  brunchVenueName: string;
  brunchVenueAddress1: string;
  brunchVenueAddress2: string;
  brunchVenueCountry: string;
  brunchVenueCity: string;
  brunchVenueState: string;
  brunchVenueZip: string;
  brunchVenueAsInsured: boolean;
  brunchLocationType: string;
  brunchIndoorOutdoor: string;

  // Rehearsal Venue
  rehearsalVenueName: string;
  rehearsalVenueAddress1: string;
  rehearsalVenueAddress2: string;
  rehearsalVenueCountry: string;
  rehearsalVenueCity: string;
  rehearsalVenueState: string;
  rehearsalVenueZip: string;
  rehearsalVenueAsInsured: boolean;
  rehearsalLocationType: string;
  rehearsalIndoorOutdoor: string;

  // Rehearsal Dinner Venue
  rehearsalDinnerVenueName: string;
  rehearsalDinnerVenueAddress1: string;
  rehearsalDinnerVenueAddress2: string;
  rehearsalDinnerVenueCountry: string;
  rehearsalDinnerVenueCity: string;
  rehearsalDinnerVenueState: string;
  rehearsalDinnerVenueZip: string;
  rehearsalDinnerVenueAsInsured: boolean;
  rehearsalDinnerLocationType: string;
  rehearsalDinnerIndoorOutdoor: string;
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

// ------------------------
// Initial state for the quote context.
// All fields are initialized to their default/empty values.
// ------------------------
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
  venueAsInsured: false,

  receptionLocationType: '',
  receptionIndoorOutdoor: '',
  receptionVenueName: '',
  receptionVenueAddress1: '',
  receptionVenueAddress2: '',
  receptionVenueCountry: 'United States',
  receptionVenueCity: '',
  receptionVenueState: '',
  receptionVenueZip: '',
  receptionVenueAsInsured: false,

  brunchLocationType: '',
  brunchIndoorOutdoor: '',
  brunchVenueName: '',
  brunchVenueAddress1: '',
  brunchVenueAddress2: '',
  brunchVenueCountry: 'United States',
  brunchVenueCity: '',
  brunchVenueState: '',
  brunchVenueZip: '',
  brunchVenueAsInsured: false,

  rehearsalLocationType: '',
  rehearsalIndoorOutdoor: '',
  rehearsalVenueName: '',
  rehearsalVenueAddress1: '',
  rehearsalVenueAddress2: '',
  rehearsalVenueCountry: 'United States',
  rehearsalVenueCity: '',
  rehearsalVenueState: '',
  rehearsalVenueZip: '',
  rehearsalVenueAsInsured: false,

  rehearsalDinnerLocationType: '',
  rehearsalDinnerIndoorOutdoor: '',
  rehearsalDinnerVenueName: '',
  rehearsalDinnerVenueAddress1: '',
  rehearsalDinnerVenueAddress2: '',
  rehearsalDinnerVenueCountry: 'United States',
  rehearsalDinnerVenueCity: '',
  rehearsalDinnerVenueState: '',
  rehearsalDinnerVenueZip: '',
  rehearsalDinnerVenueAsInsured: false,

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

// ------------------------
// Type definition for actions that can be dispatched to the quoteReducer.
// Each action has a 'type' and an optional 'payload' or specific fields.
// ------------------------
type QuoteAction =
  | { type: 'UPDATE_FIELD'; field: keyof QuoteState; value: any }
  | {
      type: 'CALCULATE_QUOTE';
      payload?: {
        basePremium: number;
        liabilityPremium: number;
        liquorLiabilityPremium: number;
        totalPremium: number;
      };
    }
  | { type: 'COMPLETE_STEP'; step: number }
  | { type: 'RESET_FORM' }
  | { type: 'SET_ENTIRE_QUOTE_STATE'; payload: Partial<QuoteState> };

// ------------------------
// Reducer function for managing the quote state.
// It takes the current state and an action, and returns the new state.
// ------------------------
const quoteReducer = (state: QuoteState, action: QuoteAction): QuoteState => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return {
        ...state,
        [action.field]: action.value,
      };

    // ------------------------
    // Handles the calculation of quote premiums and generation of a quote number.
    // Updates the state with the calculated premiums and the new quote number.
    // ------------------------
    case 'CALCULATE_QUOTE':
      // Generate a unique quote number
      // This quote number is for UI display purposes and might differ from the one saved in DB.
      const quoteNumber = getNextQuoteNumber();
      return {
        ...state,
        quoteNumber,
        basePremium: action.payload?.basePremium || 0,
        liabilityPremium: action.payload?.liabilityPremium || 0,
        liquorLiabilityPremium: action.payload?.liquorLiabilityPremium || 0,
        totalPremium: action.payload?.totalPremium || 0,
      };

    // ------------------------
    // Marks a specific step as complete in the form progression.
    // ------------------------
    case 'COMPLETE_STEP':
      if (action.step === 1) {
        return { ...state, step1Complete: true };
      } else if (action.step === 2) {
        return { ...state, step2Complete: true };
      } else {
        return { ...state, step3Complete: true };
      }

    // ------------------------
    // Resets the entire form state to its initial values.
    // ------------------------
    case 'RESET_FORM':
      return initialState;

    // ------------------------
    // Allows setting the entire quote state or a partial update from a payload.
    // Useful for restoring a quote from storage or an API response.
    // ------------------------
    case 'SET_ENTIRE_QUOTE_STATE':
      return {
        ...state, // Preserve existing state if payload is partial
        ...action.payload, // Overwrite with new values
      };

    default:
      return state;
  }
};

// ------------------------
// Helper functions for premium calculations
// These functions are currently defined within the context but are not directly used by the reducer.
// The premium calculation logic is expected to be handled externally (e.g., in the component calling dispatch).
// ------------------------
const calculateBasePremium = (level: CoverageLevel | null): number => {
  if (!level) return 0;

  // Coverage level premium mapping
  const premiumMap: Record<CoverageLevel, number> = {
    1: 160, // $7,500 coverage
    2: 200,
    3: 250,
    4: 300,
    5: 355, // $50,000 coverage
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

const calculateLiquorLiabilityPremium = (
  hasLiquorLiability: boolean,
  guestRange: GuestRange,
): number => {
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
    '351-400': 150,
  };

  return premiumMap[guestRange] || 0;
};

// ------------------------
// NOTE: getNextQuoteNumber is ONLY for display purposes and should NOT be used for DB operations. This is only for UI preview, not DB.
// Generates a sequential quote number for display purposes, based on the current date and a sequence number stored in localStorage.
// This is intended for UI preview and might not match the quote number generated and stored by the backend.
// ------------------------
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

// ------------------------
// Interface for the QuoteContext value.
// Provides the current state and the dispatch function to components.
// ------------------------
interface QuoteContextType {
  state: QuoteState;
  dispatch: React.Dispatch<QuoteAction>;
}

// ------------------------
// Create the QuoteContext with an initial undefined value.
// ------------------------
const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

// ------------------------
// QuoteProvider component: Wraps parts of the application that need access to the quote state.
// It uses the useReducer hook to manage the state and provides the state and dispatch function
// through the QuoteContext.
// ------------------------
export const QuoteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(quoteReducer, initialState);

  return <QuoteContext.Provider value={{ state, dispatch }}>{children}</QuoteContext.Provider>;
};

// ------------------------
// Custom hook useQuote: Provides a convenient way for components to access the QuoteContext.
// Throws an error if used outside of a QuoteProvider.
// ------------------------
export const useQuote = (): QuoteContextType => {
  const context = useContext(QuoteContext);
  if (context === undefined) {
    throw new Error('useQuote must be used within a QuoteProvider');
  }
  return context;
};
