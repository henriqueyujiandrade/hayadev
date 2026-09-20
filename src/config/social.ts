/**
 * Social and professional profiles.
 *
 * Every value starts empty on purpose: no URL is invented. Fill in the ones
 * that exist and the site will render them — links left empty are dropped from
 * the header, footer, contact section and `sameAs` structured data.
 */
export const socialLinks = {
  github: '',
  linkedin: '',
  x: '',
  mastodon: '',
  bluesky: '',
} as const;

export type SocialPlatform = keyof typeof socialLinks;

/** Display name for each platform, used for accessible link labels. */
export const socialLabel: Record<SocialPlatform, string> = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  x: 'X',
  mastodon: 'Mastodon',
  bluesky: 'Bluesky',
};

export interface ResolvedSocialLink {
  platform: SocialPlatform;
  label: string;
  url: string;
}

/**
 * Returns only the profiles that have a URL configured, in a stable order.
 * This is the only function the UI should use to render social links.
 */
export function getSocialLinks(): ResolvedSocialLink[] {
  return (Object.keys(socialLinks) as SocialPlatform[])
    .filter((platform) => socialLinks[platform].trim().length > 0)
    .map((platform) => ({
      platform,
      label: socialLabel[platform],
      url: socialLinks[platform],
    }));
}

/** URLs published in `sameAs` for the `Person` structured data. */
export function getSameAs(): string[] {
  return getSocialLinks().map((link) => link.url);
}
