// Form constants and options

// ------------------------
// Array of U.S. states and territories for dropdowns.
// ------------------------
// U.S. States and territories
export const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'DC', label: 'District of Columbia' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
  { value: 'PR', label: 'Puerto Rico' },
  { value: 'VI', label: 'U.S. Virgin Islands' },
  { value: 'GU', label: 'Guam' },
  { value: 'AS', label: 'American Samoa' },
  { value: 'MP', label: 'Northern Mariana Islands' },
];

// ------------------------
// Array of Canadian provinces for dropdowns.
// ------------------------
export const CA_PROVINCES = [
  { value: 'AB', label: 'Alberta' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'NL', label: 'Newfoundland and Labrador' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'ON', label: 'Ontario' },
  { value: 'PE', label: 'Prince Edward Island' },
  { value: 'QC', label: 'Quebec' },
  { value: 'SK', label: 'Saskatchewan' },
  { value: 'NT', label: 'Northwest Territories' },
  { value: 'NU', label: 'Nunavut' },
  { value: 'YT', label: 'Yukon' },
];

// ------------------------
// Array of Mexican states for dropdowns.
export const MX_STATES = [
  { value: 'AG', label: 'Aguascalientes' },
  { value: 'BC', label: 'Baja California' },
  { value: 'BS', label: 'Baja California Sur' },
  { value: 'CM', label: 'Campeche' },
  { value: 'CS', label: 'Chiapas' },
  { value: 'CH', label: 'Chihuahua' },
  { value: 'CO', label: 'Coahuila' },
  { value: 'CL', label: 'Colima' },
  { value: 'DG', label: 'Durango' },
  { value: 'GT', label: 'Guanajuato' },
  { value: 'GR', label: 'Guerrero' },
  { value: 'HG', label: 'Hidalgo' },
  { value: 'JA', label: 'Jalisco' },
  { value: 'MX', label: 'México State' },
  { value: 'MI', label: 'Michoacán' },
  { value: 'MO', label: 'Morelos' },
  { value: 'NA', label: 'Nayarit' },
  { value: 'NL', label: 'Nuevo León' },
  { value: 'OA', label: 'Oaxaca' },
  { value: 'PU', label: 'Puebla' },
  { value: 'QT', label: 'Querétaro' },
  { value: 'QR', label: 'Quintana Roo' },
  { value: 'SL', label: 'San Luis Potosí' },
  { value: 'SI', label: 'Sinaloa' },
  { value: 'SO', label: 'Sonora' },
  { value: 'TB', label: 'Tabasco' },
  { value: 'TM', label: 'Tamaulipas' },
  { value: 'TL', label: 'Tlaxcala' },
  { value: 'VE', label: 'Veracruz' },
  { value: 'YU', label: 'Yucatán' },
  { value: 'ZA', label: 'Zacatecas' },
  { value: 'DF', label: 'Ciudad de México' },
];

// Array of example international regions for 'Other (International)'
export const O_REGIONS = [
  { value: 'ENG', label: 'England' },
  { value: 'SCT', label: 'Scotland' },
  { value: 'WLS', label: 'Wales' },
  { value: 'NIR', label: 'Northern Ireland' },
  { value: 'DEU', label: 'Germany' },
  { value: 'FRA', label: 'France' },
  { value: 'AUS', label: 'Australia' },
  { value: 'NZL', label: 'New Zealand' },
  { value: 'IND', label: 'India' },
  { value: 'CHN', label: 'China' },
  { value: 'JPN', label: 'Japan' },
  { value: 'BRA', label: 'Brazil' },
  { value: 'ZAF', label: 'South Africa' },
  { value: 'OTHER', label: 'Other/Not Listed' },
];

// ------------------------
// A mapping from country code to its states/provinces list.
// ------------------------
export const STATES_BY_COUNTRY: Record<string, { value: string; label: string }[]> = {
  US: US_STATES,
  CA: CA_PROVINCES,
  MX: MX_STATES,
  O: O_REGIONS,
  // Add other countries here, e.g., 'GB': UK_COUNTIES
};

// ------------------------
// Array of event types for dropdowns.
// ------------------------
// Event types
export const EVENT_TYPES = [
  { value: 'wedding', label: 'Wedding' },
  { value: 'reception', label: 'Wedding Reception' },
  { value: 'rehearsal', label: 'Rehearsal Dinner' },
  { value: 'engagement', label: 'Engagement Party' },
  { value: 'bridal_shower', label: 'Bridal Shower' },
  { value: 'anniversary', label: 'Anniversary Party' },
  { value: 'birthday', label: 'Birthday Party' },
  { value: 'bar_mitzvah', label: 'Bar/Bat Mitzvah' },
  { value: 'retirement', label: 'Retirement Party' },
  { value: 'reunion', label: 'Reunion' },
  { value: 'other', label: 'Other Private Event' },
];

// ------------------------
// Array of guest count ranges for dropdowns.
// ------------------------
// Guest count ranges
export const GUEST_RANGES = [
  { value: '1-50', label: '1-50 guests' },
  { value: '51-100', label: '51-100 guests' },
  { value: '101-150', label: '101-150 guests' },
  { value: '151-200', label: '151-200 guests' },
  { value: '201-250', label: '201-250 guests' },
  { value: '251-300', label: '251-300 guests' },
  { value: '301-350', label: '301-350 guests' },
  { value: '351-400', label: '351-400 guests' },
];

// ------------------------
// Array of core coverage levels with their respective details and base prices.
// ------------------------
// Coverage levels with their limits and premiums
export const COVERAGE_LEVELS = [
  {
    value: '1',
    label: 'Level 1 - $7,500 Coverage',
    description: 'Basic coverage for smaller events',
    price: 160,
  },
  {
    value: '2',
    label: 'Level 2 - $15,000 Coverage',
    description: 'Enhanced coverage for small to medium events',
    price: 210,
  },
  {
    value: '3',
    label: 'Level 3 - $25,000 Coverage',
    description: 'Standard coverage for medium events',
    price: 255,
  },
  {
    value: '4',
    label: 'Level 4 - $35,000 Coverage',
    description: 'Extended coverage for medium events',
    price: 300,
  },
  {
    value: '5',
    label: 'Level 5 - $50,000 Coverage',
    description: 'Comprehensive coverage for medium to large events',
    price: 355,
  },
  {
    value: '6',
    label: 'Level 6 - $75,000 Coverage',
    description: 'Premium coverage for larger events',
    price: 500,
  },
  {
    value: '7',
    label: 'Level 7 - $100,000 Coverage',
    description: 'Enhanced premium coverage for large events',
    price: 615,
  },
  {
    value: '8',
    label: 'Level 8 - $125,000 Coverage',
    description: 'Deluxe coverage for large events',
    price: 735,
  },
  {
    value: '9',
    label: 'Level 9 - $150,000 Coverage',
    description: 'Premium deluxe coverage for large events',
    price: 870,
  },
  {
    value: '10',
    label: 'Level 10 - $175,000 Coverage',
    description: 'Maximum coverage for luxury events',
    price: 1025,
  },
];

// ------------------------
// Detailed breakdown of coverage limits for each core coverage level.
// ------------------------
export const COVERAGE_DETAILS: Record<string, Array<{ name: string; limit: string }>> = {
  '1': [
    { name: 'Coverage A - Cancellation Postponement', limit: '$7,500' },
    { name: 'Coverage B - Additional Expense', limit: '$1,500' },
    { name: 'Coverage C - Event Photographs/Video', limit: '$1,500' },
    { name: 'Coverage D - Event Gifts', limit: '$1,000' },
    { name: 'Coverage E - Special Attire', limit: '$1,500' },
    { name: 'Coverage F - Special Jewelry', limit: '$1,000' },
    { name: 'Coverage G - Lost Deposits', limit: '$1,000' },
  ],
  '2': [
    { name: 'Coverage A - Cancellation Postponement', limit: '$15,000' },
    { name: 'Coverage B - Additional Expense', limit: '$3,000' },
    { name: 'Coverage C - Event Photographs/Video', limit: '$2,000' },
    { name: 'Coverage D - Event Gifts', limit: '$1,500' },
    { name: 'Coverage E - Special Attire', limit: '$2,000' },
    { name: 'Coverage F - Special Jewelry', limit: '$1,500' },
    { name: 'Coverage G - Lost Deposits', limit: '$1,500' },
  ],
  '3': [
    { name: 'Coverage A - Cancellation Postponement', limit: '$25,000' },
    { name: 'Coverage B - Additional Expense', limit: '$5,000' },
    { name: 'Coverage C - Event Photographs/Video', limit: '$2,500' },
    { name: 'Coverage D - Event Gifts', limit: '$2,000' },
    { name: 'Coverage E - Special Attire', limit: '$2,500' },
    { name: 'Coverage F - Special Jewelry', limit: '$2,000' },
    { name: 'Coverage G - Lost Deposits', limit: '$2,000' },
  ],
  '4': [
    { name: 'Coverage A - Cancellation Postponement', limit: '$35,000' },
    { name: 'Coverage B - Additional Expense', limit: '$7,000' },
    { name: 'Coverage C - Event Photographs/Video', limit: '$3,000' },
    { name: 'Coverage D - Event Gifts', limit: '$2,500' },
    { name: 'Coverage E - Special Attire', limit: '$3,000' },
    { name: 'Coverage F - Special Jewelry', limit: '$2,500' },
    { name: 'Coverage G - Lost Deposits', limit: '$2,500' },
  ],
  '5': [
    { name: 'Coverage A - Cancellation Postponement', limit: '$50,000' },
    { name: 'Coverage B - Additional Expense', limit: '$10,000' },
    { name: 'Coverage C - Event Photographs/Video', limit: '$3,500' },
    { name: 'Coverage D - Event Gifts', limit: '$3,000' },
    { name: 'Coverage E - Special Attire', limit: '$3,500' },
    { name: 'Coverage F - Special Jewelry', limit: '$3,000' },
    { name: 'Coverage G - Lost Deposits', limit: '$3,000' },
  ],
  '6': [
    { name: 'Coverage A - Cancellation Postponement', limit: '$75,000' },
    { name: 'Coverage B - Additional Expense', limit: '$15,000' },
    { name: 'Coverage C - Event Photographs/Video', limit: '$4,500' },
    { name: 'Coverage D - Event Gifts', limit: '$4,000' },
    { name: 'Coverage E - Special Attire', limit: '$4,500' },
    { name: 'Coverage F - Special Jewelry', limit: '$4,000' },
    { name: 'Coverage G - Lost Deposits', limit: '$4,000' },
  ],
  '7': [
    { name: 'Coverage A - Cancellation Postponement', limit: '$100,000' },
    { name: 'Coverage B - Additional Expense', limit: '$20,000' },
    { name: 'Coverage C - Event Photographs/Video', limit: '$6,000' },
    { name: 'Coverage D - Event Gifts', limit: '$5,500' },
    { name: 'Coverage E - Special Attire', limit: '$6,000' },
    { name: 'Coverage F - Special Jewelry', limit: '$5,500' },
    { name: 'Coverage G - Lost Deposits', limit: '$5,500' },
  ],
  '8': [
    { name: 'Coverage A - Cancellation Postponement', limit: '$125,000' },
    { name: 'Coverage B - Additional Expense', limit: '$25,000' },
    { name: 'Coverage C - Event Photographs/Video', limit: '$7,500' },
    { name: 'Coverage D - Event Gifts', limit: '$7,000' },
    { name: 'Coverage E - Special Attire', limit: '$7,500' },
    { name: 'Coverage F - Special Jewelry', limit: '$7,000' },
    { name: 'Coverage G - Lost Deposits', limit: '$7,000' },
  ],
  '9': [
    { name: 'Coverage A - Cancellation Postponement', limit: '$150,000' },
    { name: 'Coverage B - Additional Expense', limit: '$30,000' },
    { name: 'Coverage C - Event Photographs/Video', limit: '$9,000' },
    { name: 'Coverage D - Event Gifts', limit: '$8,500' },
    { name: 'Coverage E - Special Attire', limit: '$9,000' },
    { name: 'Coverage F - Special Jewelry', limit: '$8,500' },
    { name: 'Coverage G - Lost Deposits', limit: '$8,500' },
  ],
  '10': [
    { name: 'Coverage A - Cancellation Postponement', limit: '$175,000' },
    { name: 'Coverage B - Additional Expense', limit: '$35,000' },
    { name: 'Coverage C - Event Photographs/Video', limit: '$10,500' },
    { name: 'Coverage D - Event Gifts', limit: '$10,000' },
    { name: 'Coverage E - Special Attire', limit: '$10,500' },
    { name: 'Coverage F - Special Jewelry', limit: '$10,000' },
    { name: 'Coverage G - Lost Deposits', limit: '$10,000' },
  ],
  Default: [
    // Fallback if a level is not found, using the structure from your send-email route
    { name: 'Coverage A - Cancellation Postponement', limit: '$25,000' },
    { name: 'Coverage B - Additional Expense', limit: '$5,000' },
    { name: 'Coverage C - Event Photographs/Video', limit: '$5,000' },
    { name: 'Coverage D - Event Gifts', limit: '$5,000' },
    { name: 'Coverage E - Special Attire', limit: '$10,000' },
    { name: 'Coverage F - Special Jewelry', limit: '$25,000' },
    { name: 'Coverage G - Lost Deposits', limit: '$5,000' },
  ],
};

// ------------------------
// Array of liability coverage options with descriptions and prices.
// ------------------------
// Liability coverage options
export const LIABILITY_OPTIONS = [
  {
    value: 'none',
    label: 'No Liability Coverage',
    description: 'No coverage for third-party bodily injury or property damage',
    price: 0,
  },
  {
    value: 'option1',
    label: '$1M Liability with $25K Property Damage',
    description:
      '$1,000,000 per occurrence / $1,000,000 aggregate with $25,000 property damage sublimit',
    price: 195,
  },
  {
    value: 'option2',
    label: '$1M Liability with $250K Property Damage',
    description:
      '$1,000,000 per occurrence / $1,000,000 aggregate with $250,000 property damage sublimit',
    price: 210,
  },
  {
    value: 'option3',
    label: '$1M Liability with $1M Property Damage',
    description:
      '$1,000,000 per occurrence / $1,000,000 aggregate with $1,000,000 property damage sublimit',
    price: 240,
  },
  // NEW OPTIONS (light red)
  {
    value: 'option4',
    label: '$1M/$2M Aggregate Liability with $25K PD',
    description:
      '$1,000,000 per occurrence / $2,000,000 aggregate with $25,000 property damage sublimit',
    price: 240,
    isNew: true,
  },
  {
    value: 'option5',
    label: '$1M/$2M Aggregate Liability with $250K PD',
    description:
      '$1,000,000 per occurrence / $2,000,000 aggregate with $250,000 property damage sublimit',
    price: 255,
    isNew: true,
  },
  {
    value: 'option6',
    label: '$1M/$2M Aggregate Liability with $1M PD',
    description:
      '$1,000,000 per occurrence / $2,000,000 aggregate with $1,000,000 property damage sublimit',
    price: 265,
    isNew: true,
  },
];

// ------------------------
// Premiums for standard liquor liability, indexed by guest count range.
// ------------------------
// Liquor liability premiums by guest count
export const LIQUOR_LIABILITY_PREMIUMS: Record<string, number> = {
  '1-50': 65,
  '51-100': 65,
  '101-150': 85,
  '151-200': 85,
  '201-250': 100,
  '251-300': 100,
  '301-350': 150,
  '351-400': 150,
};

// ------------------------
// Premiums for new liquor liability options (e.g., $1M/$2M Aggregate), indexed by guest count range.
// ------------------------
// New liquor liability premiums for $1M/$2M Aggregate
export const LIQUOR_LIABILITY_PREMIUMS_NEW: Record<string, number> = {
  '1-50': 100,
  '51-100': 100,
  '101-150': 115,
  '151-200': 115,
  '201-250': 125,
  '251-300': 125,
  '301-350': 175,
  '351-400': 175,
};

// ------------------------
// Array of venue location types for dropdowns.
// ------------------------
// Venue location types
export const VENUE_TYPES = [
  { value: 'banquet_hall', label: 'Banquet Hall' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'country_club', label: 'Country Club' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'private_residence', label: 'Private Residence' },
  { value: 'park', label: 'Park/Public Space' },
  { value: 'beach', label: 'Beach' },
  { value: 'cruise_ship', label: 'Cruise Ship' },
  { value: 'vineyard', label: 'Vineyard/Winery' },
  { value: 'barn', label: 'Barn/Farm' },
  { value: 'historic', label: 'Historic Building' },
  { value: 'religious', label: 'Religious Venue' },
  { value: 'garden', label: 'Garden/Outdoor Venue' },
  { value: 'other', label: 'Other' },
];

// ------------------------
// Array of indoor/outdoor options for venue specification.
// ------------------------
// Indoor/Outdoor options
export const INDOOR_OUTDOOR_OPTIONS = [
  { value: 'indoor', label: 'Indoor' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'both', label: 'Both Indoor and Outdoor' },
];

// ------------------------
// Array of countries for address forms, primarily for US, Canada, Mexico.
// ------------------------
// Countries
export const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'MX', label: 'Mexico' },
  { value: 'O', label: 'Other (International)' },
];

// ------------------------
// Array of relationship options for the person completing the form.
// ------------------------
// Relationship to couple
export const RELATIONSHIP_OPTIONS = [
  { value: 'honoree1', label: 'I am Honoree #1' },
  { value: 'honoree2', label: 'I am Honoree #2' },
  { value: 'parent1', label: 'Parent of Honoree #1' },
  { value: 'parent2', label: 'Parent of Honoree #2' },
  { value: 'planner', label: 'Wedding/Event Planner' },
  { value: 'family', label: 'Other Family Member' },
  { value: 'friend', label: 'Friend' },
  { value: 'other', label: 'Other' },
];

// ------------------------
// Array of referral sources for marketing tracking.
// ------------------------
// How did you hear about us
export const REFERRAL_OPTIONS = [
  { value: 'search', label: 'Internet Search' },
  { value: 'social', label: 'Social Media' },
  { value: 'planner', label: 'Wedding/Event Planner' },
  { value: 'venue', label: 'Venue Recommendation' },
  { value: 'friend', label: 'Friend or Family' },
  { value: 'ad', label: 'Advertisement' },
  { value: 'agent', label: 'Insurance Agent' },
  { value: 'other', label: 'Other' },
];

// ------------------------
// List of activities that are prohibited under the policy.
// ------------------------
// Special activities that are prohibited
export const PROHIBITED_ACTIVITIES = [
  'Bungee jumping',
  'Fireworks or pyrotechnics',
  'Trampolines',
  'Bounce houses for adults',
  'Mechanical rides',
  'Live animals (excluding service animals)',
  'Firearms or weapons displays',
  'Motorized recreational vehicles',
  'Sky diving or aerial performances',
  'Fire performances',
  'Activities on water (e.g., boating)',
  'Circus acts',
];

// ------------------------
// Dynamically generated record of core coverage premiums, indexed by guest range and coverage level value.
// ------------------------
// Premiums for Core Coverage Levels, structured by guest range
// The price for each coverage level is currently the same across all guest ranges,
// as it's taken directly from the `price` field in `COVERAGE_LEVELS`.
// Example: CORE_COVERAGE_PREMIUMS['1-50']['1'] would give the premium for Level 1 (value: "1") for 1-50 guests.
export const CORE_COVERAGE_PREMIUMS: Record<string, Record<string, number>> = GUEST_RANGES.reduce(
  (acc, guestRange) => {
    acc[guestRange.value] = COVERAGE_LEVELS.reduce(
      (levelAcc, level) => {
        levelAcc[level.value] = level.price; // Using the price from COVERAGE_LEVELS
        return levelAcc;
      },
      {} as Record<string, number>,
    );
    return acc;
  },
  {} as Record<string, Record<string, number>>,
);

// ------------------------
// Dynamically generated record of liability coverage premiums, indexed by guest range and liability option value.
// ------------------------
// Premiums for Liability Coverage Options, structured by guest range
// The price for each liability option is currently the same across all guest ranges,
// as it's taken directly from the `price` field in `LIABILITY_OPTIONS`.
// Example: LIABILITY_COVERAGE_PREMIUMS['1-50']['option1'] would give the premium for Option 1 for 1-50 guests.
export const LIABILITY_COVERAGE_PREMIUMS: Record<
  string,
  Record<string, number>
> = GUEST_RANGES.reduce(
  (acc, guestRange) => {
    acc[guestRange.value] = LIABILITY_OPTIONS.reduce(
      (optionAcc, option) => {
        optionAcc[option.value] = option.price; // Using the price from LIABILITY_OPTIONS
        return optionAcc;
      },
      {} as Record<string, number>,
    );
    return acc;
  },
  {} as Record<string, Record<string, number>>,
);
