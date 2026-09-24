/**
 * Contact form delivery.
 *
 * The site has no backend, so form submissions go to Web3Forms, which emails
 * them to the address registered with the access key. The key is public by
 * design: it can only deliver messages to that one inbox and grants no access
 * to the account. If it gets abused, rotate it in the Web3Forms dashboard and
 * replace it here.
 *
 * The endpoint's origin is also allowed in the CSP (`connect-src` for the
 * script, `form-action` for the no-JavaScript submission) in astro.config.ts.
 */
export const contactForm = {
  endpoint: 'https://api.web3forms.com/submit',
  accessKey: '45d3a310-c485-433a-879c-fcafa8fb95f6',
  /** Sender name shown on the notification email, so it is easy to filter. */
  fromName: 'HayaDev — formulário do site',
} as const;
