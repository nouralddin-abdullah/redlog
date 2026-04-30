/**
 * Phone-format helpers, currently Egypt-only.
 *
 * Backend stores phone numbers in E.164 ("+201012345678"), but Egyptian users
 * recognise the national format ("01012345678"). We accept the local form in
 * the UI, convert to E.164 at the API boundary, and convert back when
 * rendering an E.164 value to a user.
 */

/** Egyptian mobile networks: Vodafone (010), Etisalat (011), Orange (012), We (015). */
export const EG_LOCAL_PHONE_REGEX = /^01[0125]\d{8}$/;

/** Strip whitespace and dashes that users naturally type (e.g. "010 1234 5678"). */
export function stripPhoneFormatting(value: string): string {
  return value.replace(/[\s-]/g, '');
}

/** Validate a local Egyptian mobile number after light normalisation. */
export function isEgyptianMobile(value: string): boolean {
  return EG_LOCAL_PHONE_REGEX.test(stripPhoneFormatting(value));
}

/** "01012345678" → "+201012345678". Caller should validate first. */
export function egyptianLocalToE164(local: string): string {
  return `+20${stripPhoneFormatting(local).slice(1)}`;
}

/** "+201012345678" → "01012345678" for friendlier display. Falls back to the
 *  raw value when it isn't a recognised Egyptian E.164. */
export function egyptianE164ToLocal(e164: string): string {
  if (!e164) return e164;
  if (e164.startsWith('+20')) return `0${e164.slice(3)}`;
  if (e164.startsWith('20')) return `0${e164.slice(2)}`;
  return e164;
}
