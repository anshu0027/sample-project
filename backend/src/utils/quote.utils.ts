// my-backend/src/utils/quote.utils.ts

// Types from your old API route - these are useful here
export type GuestRange =
  | "1-50"
  | "51-100"
  | "101-150"
  | "151-200"
  | "201-250"
  | "251-300"
  | "301-350"
  | "351-400";
export type CoverageLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type LiabilityOption = "none" | "option1" | "option2" | "option3";

export const calculateBasePremium = (
  level: CoverageLevel | null | undefined
): number => {
  if (level === null || level === undefined) return 0;
  const premiumMap: Record<CoverageLevel, number> = {
    1: 160, 2: 200, 3: 250, 4: 300, 5: 355,
    6: 450, 7: 600, 8: 750, 9: 900, 10: 1025,
  };
  return premiumMap[level as CoverageLevel] || 0;
};

export const calculateLiabilityPremium = (
  option: LiabilityOption | string | undefined | null
): number => {
  if (option === null || option === undefined) return 0;
  switch (option) {
    case "option1": return 165;
    case "option2": return 180;
    case "option3": return 200;
    default: return 0;
  }
};

export const calculateLiquorLiabilityPremium = (
  hasLiquorLiability: boolean | undefined,
  guestRange: GuestRange | string | undefined | null
): number => {
  if (!hasLiquorLiability || guestRange === null || guestRange === undefined) return 0;
  const premiumMap: Record<GuestRange, number> = {
    "1-50": 65, "51-100": 65, "101-150": 85, "151-200": 85,
    "201-250": 100, "251-300": 100, "301-350": 150, "351-400": 150,
  };
  return premiumMap[guestRange as GuestRange] || 0;
};

export function generateQuoteNumber(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear());
  const dateStr = `${day}${month}${year}`;
  const randomNumber = Math.floor(100000 + Math.random() * 900000);
  return `QI-${dateStr}-${randomNumber}`;
}

export function mapMaxGuestsToGuestRange(maxGuests: string | null | undefined): GuestRange | undefined {
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