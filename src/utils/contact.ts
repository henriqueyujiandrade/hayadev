/**
 * Builders for the contact channels listed on the Contact page. Pure, so the
 * encoding rules can be unit tested.
 */

/** Keeps only the digits of a phone number, which is what `wa.me` expects. */
function digitsOf(phone: string): string {
  return phone.replace(/\D/g, '');
}

/** Click-to-chat link for WhatsApp, optionally with a prefilled first message. */
export function whatsappUrl(phone: string, text?: string): string {
  const base = `https://wa.me/${digitsOf(phone)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/**
 * Human-readable form of a phone number. Brazilian mobile numbers get the
 * familiar `+55 11 91234-5678` grouping; anything else is shown as `+digits`.
 */
export function formatPhone(phone: string): string {
  const digits = digitsOf(phone);
  const brazil = /^55(\d{2})(\d{4,5})(\d{4})$/.exec(digits);
  if (brazil) return `+55 ${brazil[1]} ${brazil[2]}-${brazil[3]}`;
  return `+${digits}`;
}

/** A profile URL without the protocol, `www.` or trailing slash, for display. */
export function displayUrl(url: string): string {
  return url
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/+$/, '');
}
