/**
 * Best-effort country derivation when the browser locale lacks a region tag.
 * Covers the Arab-world IANA zones plus a few common diaspora locales — if
 * a learner sits outside the table, the API just stores their detected
 * timezone alone (country stays unset, which is allowed).
 */
const TZ_TO_COUNTRY: Readonly<Record<string, string>> = {
  // Arab world
  'Africa/Cairo': 'EG',
  'Africa/Algiers': 'DZ',
  'Africa/Tunis': 'TN',
  'Africa/Tripoli': 'LY',
  'Africa/Casablanca': 'MA',
  'Africa/El_Aaiun': 'MA',
  'Africa/Khartoum': 'SD',
  'Africa/Juba': 'SS',
  'Africa/Nouakchott': 'MR',
  'Africa/Mogadishu': 'SO',
  'Africa/Djibouti': 'DJ',
  'Asia/Riyadh': 'SA',
  'Asia/Dubai': 'AE',
  'Asia/Amman': 'JO',
  'Asia/Beirut': 'LB',
  'Asia/Damascus': 'SY',
  'Asia/Baghdad': 'IQ',
  'Asia/Hebron': 'PS',
  'Asia/Gaza': 'PS',
  'Asia/Jerusalem': 'IL',
  'Asia/Kuwait': 'KW',
  'Asia/Qatar': 'QA',
  'Asia/Bahrain': 'BH',
  'Asia/Muscat': 'OM',
  'Asia/Aden': 'YE',
  'Asia/Istanbul': 'TR',
  'Europe/Istanbul': 'TR',
  // Common diaspora hubs
  'Europe/London': 'GB',
  'Europe/Berlin': 'DE',
  'Europe/Paris': 'FR',
  'Europe/Madrid': 'ES',
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
};

function safeTimezone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

function regionFromLanguageTag(tag: string | undefined): string | undefined {
  if (!tag) return undefined;
  try {
    const region = new Intl.Locale(tag).region;
    if (region && /^[A-Z]{2}$/.test(region)) return region;
  } catch {
    /* fall through */
  }
  // Manual fallback for runtimes without Intl.Locale
  const parts = tag.split(/[-_]/);
  const last = parts[parts.length - 1];
  if (last && /^[A-Za-z]{2}$/.test(last)) return last.toUpperCase();
  return undefined;
}

function detectCountry(timezone: string | undefined): string | undefined {
  // 1. Most accurate: explicit region tag in the user's locale
  const langs: string[] = [];
  try {
    if (typeof navigator !== 'undefined') {
      if (navigator.language) langs.push(navigator.language);
      if (Array.isArray(navigator.languages)) langs.push(...navigator.languages);
    }
  } catch {
    /* ignore */
  }
  for (const tag of langs) {
    const region = regionFromLanguageTag(tag);
    if (region) return region;
  }

  // 2. Fall back to timezone-based heuristic
  if (timezone && TZ_TO_COUNTRY[timezone]) return TZ_TO_COUNTRY[timezone];

  return undefined;
}

export function detectDefaults(): { country?: string; timezone?: string } {
  const timezone = safeTimezone();
  const country = detectCountry(timezone);
  return {
    ...(country ? { country } : {}),
    ...(timezone ? { timezone } : {}),
  };
}
