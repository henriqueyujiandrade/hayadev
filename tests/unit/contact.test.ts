import { describe, expect, it } from 'vitest';

import { displayUrl, formatPhone, whatsappUrl } from '@utils/contact';

describe('whatsappUrl', () => {
  it('links to wa.me with digits only', () => {
    expect(whatsappUrl('+55 (11) 91234-5678')).toBe('https://wa.me/5511912345678');
  });

  it('prefills the first message when given one', () => {
    expect(whatsappUrl('5511912345678', 'Olá!')).toBe('https://wa.me/5511912345678?text=Ol%C3%A1!');
  });
});

describe('formatPhone', () => {
  it('groups Brazilian mobile and landline numbers', () => {
    expect(formatPhone('5511912345678')).toBe('+55 11 91234-5678');
    expect(formatPhone('551132345678')).toBe('+55 11 3234-5678');
  });

  it('falls back to +digits for other countries', () => {
    expect(formatPhone('14155550123')).toBe('+14155550123');
  });
});

describe('displayUrl', () => {
  it('strips the protocol, www and trailing slash', () => {
    expect(displayUrl('https://www.linkedin.com/in/someone/')).toBe('linkedin.com/in/someone');
    expect(displayUrl('https://github.com/someone')).toBe('github.com/someone');
  });
});
