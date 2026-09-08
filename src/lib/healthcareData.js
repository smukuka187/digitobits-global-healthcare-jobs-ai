// Static reference data for the Digitobits Global HealthCare Jobs AI platform.

export const CONTINENTS = [
  "Africa", "Europe", "North America", "South America", "Asia", "Middle East", "Australia", "New Zealand"
];

// code, name, flag, continent, currency, timezone (IANA)
export const COUNTRIES = [
  { code: "ZM", name: "Zambia", flag: "🇿🇲", continent: "Africa", currency: "ZMW", timezone: "Africa/Lusaka" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", continent: "Africa", currency: "ZAR", timezone: "Africa/Johannesburg" },
  { code: "KE", name: "Kenya", flag: "🇰🇪", continent: "Africa", currency: "USD", timezone: "Africa/Nairobi" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", continent: "Africa", currency: "USD", timezone: "Africa/Lagos" },
  { code: "GH", name: "Ghana", flag: "🇬🇭", continent: "Africa", currency: "USD", timezone: "Africa/Accra" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", continent: "Europe", currency: "GBP", timezone: "Europe/London" },
  { code: "IE", name: "Ireland", flag: "🇮🇪", continent: "Europe", currency: "EUR", timezone: "Europe/Dublin" },
  { code: "DE", name: "Germany", flag: "🇩🇪", continent: "Europe", currency: "EUR", timezone: "Europe/Berlin" },
  { code: "FR", name: "France", flag: "🇫🇷", continent: "Europe", currency: "EUR", timezone: "Europe/Paris" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", continent: "Europe", currency: "EUR", timezone: "Europe/Amsterdam" },
  { code: "SE", name: "Sweden", flag: "🇸🇪", continent: "Europe", currency: "SEK", timezone: "Europe/Stockholm" },
  { code: "NO", name: "Norway", flag: "🇳🇴", continent: "Europe", currency: "NOK", timezone: "Europe/Oslo" },
  { code: "FI", name: "Finland", flag: "🇫🇮", continent: "Europe", currency: "EUR", timezone: "Europe/Helsinki" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", continent: "Europe", currency: "CHF", timezone: "Europe/Zurich" },
  { code: "CA", name: "Canada", flag: "🇨🇦", continent: "North America", currency: "CAD", timezone: "America/Toronto" },
  { code: "US", name: "United States", flag: "🇺🇸", continent: "North America", currency: "USD", timezone: "America/New_York" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", continent: "South America", currency: "USD", timezone: "America/Sao_Paulo" },
  { code: "AU", name: "Australia", flag: "🇦🇺", continent: "Australia", currency: "AUD", timezone: "Australia/Sydney" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", continent: "New Zealand", currency: "NZD", timezone: "Pacific/Auckland" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", continent: "Middle East", currency: "AED", timezone: "Asia/Dubai" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", continent: "Middle East", currency: "SAR", timezone: "Asia/Riyadh" },
  { code: "QA", name: "Qatar", flag: "🇶🇦", continent: "Middle East", currency: "USD", timezone: "Asia/Qatar" },
  { code: "IN", name: "India", flag: "🇮🇳", continent: "Asia", currency: "USD", timezone: "Asia/Kolkata" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", continent: "Asia", currency: "USD", timezone: "Asia/Singapore" }
];

export const COUNTRY_BY_CODE = Object.fromEntries(COUNTRIES.map((c) => [c.code, c]));

export const CURRENCIES = {
  USD: { code: "USD", symbol: "$", name: "US Dollar", rateToUSD: 1 },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", rateToUSD: 1.27 },
  EUR: { code: "EUR", symbol: "€", name: "Euro", rateToUSD: 1.09 },
  CAD: { code: "CAD", symbol: "C$", name: "Canadian Dollar", rateToUSD: 0.74 },
  AUD: { code: "AUD", symbol: "A$", name: "Australian Dollar", rateToUSD: 0.66 },
  NZD: { code: "NZD", symbol: "NZ$", name: "NZ Dollar", rateToUSD: 0.60 },
  ZAR: { code: "ZAR", symbol: "R", name: "South African Rand", rateToUSD: 0.054 },
  ZMW: { code: "ZMW", symbol: "ZK", name: "Zambian Kwacha", rateToUSD: 0.037 },
  AED: { code: "AED", symbol: "د.إ", name: "UAE Dirham", rateToUSD: 0.27 },
  SAR: { code: "SAR", symbol: "﷼", name: "Saudi Riyal", rateToUSD: 0.27 },
  CHF: { code: "CHF", symbol: "CHF", name: "Swiss Franc", rateToUSD: 1.13 },
  SEK: { code: "SEK", symbol: "kr", name: "Swedish Krona", rateToUSD: 0.095 },
  NOK: { code: "NOK", symbol: "kr", name: "Norwegian Krone", rateToUSD: 0.094 }
};

export const JOB_TYPES = [
  "Full-time", "Part-time", "Temporary", "Contract", "Casual", "Seasonal",
  "Permanent", "Internship", "Graduate", "Volunteer", "Locum", "Agency work"
];

export const WORK_MODES = ["on-site", "hybrid", "remote"];

export const CATEGORIES = [
  { id: "hospital", label: "Hospitals & Clinics", icon: "🏥" },
  { id: "care", label: "Care Homes & Residential", icon: "🏠" },
  { id: "elderly", label: "Elderly & Home Care", icon: "👵" },
  { id: "ngo", label: "NGO & Humanitarian", icon: "🌍" },
  { id: "emergency", label: "Emergency & Public Health", icon: "🚑" },
  { id: "remote", label: "Remote Healthcare", icon: "💻" },
  { id: "home-care", label: "Home Care & Disability", icon: "🏡" },
  { id: "international", label: "International Healthcare", icon: "🌎" }
];

export const PROFESSIONS = [
  {
    category: "Nursing",
    icon: "🧑‍⚕️",
    specializations: [
      "Registered Nurse", "Staff Nurse", "Nurse Practitioner", "Enrolled Nurse",
      "Nursing Assistant", "Nurse Aide", "Clinical Nurse", "ICU Nurse",
      "Theatre Nurse", "Emergency Nurse", "Pediatric Nurse", "Mental Health Nurse",
      "Community Nurse", "Geriatric Nurse", "Oncology Nurse", "Surgical Nurse"
    ]
  },
  {
    category: "Care",
    icon: "🤝",
    specializations: [
      "Caregiver", "Healthcare Assistant", "Personal Care Assistant", "Home Care Worker",
      "Elderly Care Worker", "Dementia Care Worker", "Disability Support Worker",
      "Residential Care Worker", "Nursing Home Assistant", "Care Home Worker"
    ]
  },
  {
    category: "Medical",
    icon: "🩺",
    specializations: [
      "Doctor", "Medical Officer", "General Practitioner", "Specialist Doctor",
      "Clinical Officer", "Medical Assistant"
    ]
  },
  {
    category: "Allied Health",
    icon: "💊",
    specializations: [
      "Physiotherapist", "Occupational Therapist", "Radiographer", "Laboratory Technician",
      "Pharmacist", "Dietitian", "Speech Therapist", "Psychologist"
    ]
  },
  {
    category: "Public Health",
    icon: "🦠",
    specializations: [
      "Public Health Officer", "Epidemiologist", "Infection Prevention Officer",
      "Disease Surveillance Officer", "Health Promotion Officer",
      "Pandemic Response Worker", "Emergency Response Worker"
    ]
  },
  {
    category: "Support & Administration",
    icon: "📋",
    specializations: [
      "Healthcare Administrator", "Medical Receptionist", "Medical Records Officer",
      "Healthcare IT Professional", "Medical Transcriptionist", "Medical Coder",
      "Healthcare Customer Support", "Hospital Support Staff"
    ]
  }
];

export const ALL_SPECIALIZATIONS = PROFESSIONS.flatMap((p) => p.specializations);

export const LANGUAGES = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "fr", label: "Français", dir: "ltr" },
  { code: "pt", label: "Português", dir: "ltr" },
  { code: "es", label: "Español", dir: "ltr" },
  { code: "de", label: "Deutsch", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" }
];

// Approximate cost-of-living index (relative, 0-100) for relocation context — labelled as estimates.
export const COST_OF_LIVING = {
  GB: 75, US: 72, CH: 90, IE: 70, AU: 68, CA: 65, DE: 60, FR: 58, NL: 62,
  SE: 60, NO: 80, FI: 58, AE: 65, SA: 50, QA: 60, NZ: 60, ZA: 40, ZM: 30
};

export function convertSalary(amount, fromCurrency, toCurrency) {
  if (!amount || !CURRENCIES[fromCurrency] || !CURRENCIES[toCurrency]) return null;
  const usd = amount * CURRENCIES[fromCurrency].rateToUSD;
  return Math.round(usd / CURRENCIES[toCurrency].rateToUSD);
}

export function formatSalary(min, max, currency, period) {
  const cur = CURRENCIES[currency] || CURRENCIES.USD;
  const fmt = (n) => n ? cur.symbol + n.toLocaleString() : "";
  const range = max ? `${fmt(min)}–${fmt(max)}` : fmt(min);
  const per = period === "hour" ? "/hr" : period === "month" ? "/mo" : "/yr";
  return `${range} ${per}`;
}

export function getTimezoneOffset(timezone, refDate = new Date()) {
  try {
    const dtf = new Intl.DateTimeFormat("en-US", { timeZone: timezone, timeZoneName: "shortOffset" });
    const parts = dtf.formatToParts(refDate).find((p) => p.type === "timeZoneName");
    return parts ? parts.value : "";
  } catch {
    return "";
  }
}

export function getTimezoneCompatibility(candidateTz, employerTz, hours) {
  if (!candidateTz || !employerTz) return { label: "Unknown", note: "" };
  try {
    const now = new Date();
    const fmt = (tz) => {
      const s = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "shortOffset" }).formatToParts(now).find((p) => p.type === "timeZoneName").value;
      const m = s.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/);
      if (!m) return 0;
      return parseInt(m[1], 10) + (m[2] ? parseInt(m[2], 10) / 60 : 0);
    };
    const diff = Math.abs(fmt(employerTz) - fmt(candidateTz));
    let label = "Good";
    if (diff >= 8) label = "Challenging";
    else if (diff >= 5) label = "Moderate";
    return { label, diff, note: `${diff}h difference` };
  } catch {
    return { label: "Unknown", note: "" };
  }
}