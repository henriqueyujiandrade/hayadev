/**
 * Builders for the contact channels.
 *
 * The site has no backend, so the contact form does not send anything itself:
 * it composes a `mailto:` URL and hands it to the visitor's own mail app. These
 * functions are shared by that script and the server-rendered page, and are
 * pure so the encoding rules can be unit tested.
 */

export interface MailDraft {
  to: string;
  subject?: string;
  body?: string;
}

/**
 * Builds a `mailto:` URL with a prefilled subject and body.
 *
 * RFC 6068 wants line breaks as CRLF, so they are normalized before encoding —
 * a bare `\n` is shown as one line by some desktop clients. Empty fields are
 * left out rather than sent as `subject=`.
 */
export function mailtoUrl({ to, subject = '', body = '' }: MailDraft): string {
  const params = (
    [
      ['subject', subject.trim()],
      ['body', body.trim().replace(/\r?\n/g, '\r\n')],
    ] as const
  )
    .filter(([, value]) => value.length > 0)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`);

  return `mailto:${to}${params.length > 0 ? `?${params.join('&')}` : ''}`;
}

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
