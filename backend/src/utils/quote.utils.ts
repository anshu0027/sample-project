// Types from your old API route - these are useful here
// ------------------------
// Type definition for guest ranges.
// Represents predefined string ranges for the number of guests.
// ------------------------
export type GuestRange =
  | "1-50"
  | "51-100"
  | "101-150"
  | "151-200"
  | "201-250"
  | "251-300"
  | "301-350"
  | "351-400";
// ------------------------
// Type definition for coverage levels.
// Represents numerical identifiers for different core coverage levels.
// ------------------------
export type CoverageLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
// ------------------------
// Type definition for liability options.
// Represents different options for liability coverage, including 'none'.
// ------------------------
export type LiabilityOption =
  | "none"
  | "option1"
  | "option2"
  | "option3"
  | "option4"
  | "option5"
  | "option6";

// ------------------------
// Calculates the base premium based on the selected coverage level.
// Returns 0 if the level is null, undefined, or not found in the map.
// ------------------------
export const calculateBasePremium = (
  level: CoverageLevel | null | undefined
): number => {
  if (level === null || level === undefined) return 0;
  const premiumMap: Record<CoverageLevel, number> = {
    1: 160,
    2: 200,
    3: 250,
    4: 300,
    5: 355,
    6: 450,
    7: 600,
    8: 750,
    9: 900,
    10: 1025,
  };
  return premiumMap[level as CoverageLevel] || 0;
};

// ------------------------
// Calculates the premium for liability coverage based on the selected option.
// Returns 0 if the option is null, undefined, or not a recognized liability option.
// ------------------------
export const calculateLiabilityPremium = (
  option: LiabilityOption | string | undefined | null
): number => {
  if (option === null || option === undefined) return 0;
  switch (option) {
    case "option1":
      return 195;
    case "option2":
      return 210;
    case "option3":
      return 240;
    case "option4":
      return 240;
    case "option5":
      return 255;
    case "option6":
      return 265;
    default:
      return 0;
  }
};

// ------------------------
// Calculates the premium for liquor liability coverage.
// This depends on whether liquor liability is selected and the guest range.
// Returns 0 if liquor liability is not selected or if the guest range is null, undefined, or not found.
// Also considers if the selected liability option is one of the "new" options, which have different liquor liability premiums.
// ------------------------
export const calculateLiquorLiabilityPremium = (
  hasLiquorLiability: boolean | undefined,
  guestRange: GuestRange | string | undefined | null,
  liabilityOption: LiabilityOption | string | undefined | null
): number => {
  if (!hasLiquorLiability || guestRange === null || guestRange === undefined)
    return 0;

  const standardPremiums: Record<GuestRange, number> = {
    "1-50": 65,
    "51-100": 65,
    "101-150": 85,
    "151-200": 85,
    "201-250": 100,
    "251-300": 100,
    "301-350": 150,
    "351-400": 150,
  };

  const newPremiums: Record<GuestRange, number> = {
    "1-50": 100,
    "51-100": 100,
    "101-150": 115,
    "151-200": 115,
    "201-250": 125,
    "251-300": 125,
    "301-350": 175,
    "351-400": 175,
  };

  const isNewLiabilityOption = ["option4", "option5", "option6"].includes(liabilityOption as string);

  const premiumMap = isNewLiabilityOption ? newPremiums : standardPremiums;

  return premiumMap[guestRange as GuestRange] || 0;
};

// ------------------------
// Generates a unique quote number.
// The format is QI-DDMMYYYY-XXXXXX, where XXXXXX is a random 6-digit number.
// ------------------------
export function generateQuoteNumber(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear());
  const dateStr = `${day}${month}${year}`;
  const randomNumber = Math.floor(100000 + Math.random() * 900000);
  return `QI-${dateStr}-${randomNumber}`;
}

// ------------------------
// Maps a numerical maximum guest count (as a string) to a predefined GuestRange string.
// Returns undefined if the input is null, undefined, or cannot be parsed to a valid guest range.
// ------------------------
export function mapMaxGuestsToGuestRange(
  maxGuests: string | null | undefined
): GuestRange | undefined {
  if (!maxGuests) return undefined;
  const guestCount = parseInt(maxGuests, 10);
  if (isNaN(guestCount)) return undefined;

  if (guestCount <= 50) return "1-50";
  if (guestCount <= 100) return "51-100";
  if (guestCount <= 150) return "101-150";
  if (guestCount <= 200) return "151-200";
  if (guestCount <= 250) return "201-250";
  if (guestCount <= 300) return "251-300";
  if (guestCount <= 350) return "301-350";
  if (guestCount <= 400) return "351-400";
  return undefined;
}
