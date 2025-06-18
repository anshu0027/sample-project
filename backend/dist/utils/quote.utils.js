"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateLiquorLiabilityPremium = exports.calculateLiabilityPremium = exports.calculateBasePremium = void 0;
exports.generateQuoteNumber = generateQuoteNumber;
exports.mapMaxGuestsToGuestRange = mapMaxGuestsToGuestRange;
// ------------------------
// Calculates the base premium based on the selected coverage level.
// Returns 0 if the level is null, undefined, or not found in the map.
// ------------------------
const calculateBasePremium = (level) => {
    if (level === null || level === undefined)
        return 0;
    const premiumMap = {
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
    return premiumMap[level] || 0;
};
exports.calculateBasePremium = calculateBasePremium;
// ------------------------
// Calculates the premium for liability coverage based on the selected option.
// Returns 0 if the option is null, undefined, or not a recognized liability option.
// ------------------------
const calculateLiabilityPremium = (option) => {
    if (option === null || option === undefined)
        return 0;
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
exports.calculateLiabilityPremium = calculateLiabilityPremium;
// ------------------------
// Calculates the premium for liquor liability coverage.
// This depends on whether liquor liability is selected and the guest range.
// Returns 0 if liquor liability is not selected or if the guest range is null, undefined, or not found.
// Also considers if the selected liability option is one of the "new" options, which have different liquor liability premiums.
// ------------------------
const calculateLiquorLiabilityPremium = (hasLiquorLiability, guestRange, liabilityOption) => {
    if (!hasLiquorLiability || guestRange === null || guestRange === undefined)
        return 0;
    const standardPremiums = {
        "1-50": 65,
        "51-100": 65,
        "101-150": 85,
        "151-200": 85,
        "201-250": 100,
        "251-300": 100,
        "301-350": 150,
        "351-400": 150,
    };
    const newPremiums = {
        "1-50": 100,
        "51-100": 100,
        "101-150": 115,
        "151-200": 115,
        "201-250": 125,
        "251-300": 125,
        "301-350": 175,
        "351-400": 175,
    };
    const isNewLiabilityOption = ["option4", "option5", "option6"].includes(liabilityOption);
    const premiumMap = isNewLiabilityOption ? newPremiums : standardPremiums;
    return premiumMap[guestRange] || 0;
};
exports.calculateLiquorLiabilityPremium = calculateLiquorLiabilityPremium;
// ------------------------
// Generates a unique quote number.
// The format is QI-DDMMYYYY-XXXXXX, where XXXXXX is a random 6-digit number.
// ------------------------
function generateQuoteNumber() {
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
function mapMaxGuestsToGuestRange(maxGuests) {
    if (!maxGuests)
        return undefined;
    const guestCount = parseInt(maxGuests, 10);
    if (isNaN(guestCount))
        return undefined;
    if (guestCount <= 50)
        return "1-50";
    if (guestCount <= 100)
        return "51-100";
    if (guestCount <= 150)
        return "101-150";
    if (guestCount <= 200)
        return "151-200";
    if (guestCount <= 250)
        return "201-250";
    if (guestCount <= 300)
        return "251-300";
    if (guestCount <= 350)
        return "301-350";
    if (guestCount <= 400)
        return "351-400";
    return undefined;
}
