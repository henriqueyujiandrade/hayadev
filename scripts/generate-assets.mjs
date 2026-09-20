/**
 * Generates the raster brand assets from a single SVG source of truth.
 *
 * Run locally and commit the output — deliberately not part of `build`. The
 * rasterizer resolves text through the system font stack, and a CI or Vercel
 * builder has a different set of fonts installed, so generating these during
 * deployment would make the artwork depend on the machine that produced it.
 *
 *   pnpm generate:assets
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

import { person, jobTitle } from '../src/config/person.ts';
import { siteConfig } from '../src/config/site.ts';
import { primaryTechnologies } from '../src/config/stack.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'public');

/* Resolved from the OKLCH design tokens; see scripts/README note in the docs. */
const COLORS = {
  accent: '#006655',
  accentDark: '#55d7be',
  paper: '#fbfaf8',
  ink: '#1f1d17',
  inkMuted: '#5f5d57',
  inkOnAccent: '#0f0e0b',
  border: '#e6e3dd',
};

const SERIF = 'Liberation Serif, DejaVu Serif, Times New Roman, serif';
const SANS = 'Liberation Sans, DejaVu Sans, Helvetica, Arial, sans-serif';
const MONO = 'Liberation Mono, DejaVu Sans Mono, Courier New, monospace';

/** The monogram, matching `BrandMark.astro`. */
function markSvg({ size, background, foreground, radius }) {
  const scale = size / 24;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
  <rect width="24" height="24" rx="${radius}" fill="${background}"/>
  <path d="M7.75 6.5v11M16.25 6.5v11M7.75 12.75h8.5"
        stroke="${foreground}" stroke-width="2" stroke-linecap="round" fill="none"/>
</svg>`.replace('viewBox', `data-scale="${scale}" viewBox`);
}

/** Favicon: one file, both themes, via a media query inside the SVG. */
function faviconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <style>
    .bg { fill: ${COLORS.accent}; }
    .fg { stroke: #ffffff; }
    @media (prefers-color-scheme: dark) {
      .bg { fill: ${COLORS.accentDark}; }
      .fg { stroke: ${COLORS.inkOnAccent}; }
    }
  </style>
  <rect class="bg" width="24" height="24" rx="5.5"/>
  <path class="fg" d="M7.75 6.5v11M16.25 6.5v11M7.75 12.75h8.5"
        stroke-width="2" stroke-linecap="round" fill="none"/>
</svg>
`;
}

/** Default social sharing card, 1200x630. */
function ogSvg() {
  const role = jobTitle.en;
  const technologies = primaryTechnologies.join('   ·   ');
  const domain = siteConfig.url.replace(/^https?:\/\//, '');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${COLORS.paper}"/>
  <rect x="0" y="0" width="1200" height="8" fill="${COLORS.accent}"/>

  <g transform="translate(88, 96)">
    <rect width="56" height="56" rx="13" fill="${COLORS.accent}"/>
    <g transform="translate(28,28) scale(2.333) translate(-12,-12)">
      <path d="M7.75 6.5v11M16.25 6.5v11M7.75 12.75h8.5"
            stroke="#ffffff" stroke-width="2" stroke-linecap="round" fill="none"/>
    </g>
    <text x="76" y="38" font-family="${SANS}" font-size="30" font-weight="600"
          fill="${COLORS.ink}" letter-spacing="-0.5">${siteConfig.name}</text>
  </g>

  <text x="88" y="330" font-family="${SERIF}" font-size="112" font-weight="700"
        fill="${COLORS.ink}" letter-spacing="-3">${person.name}</text>

  <text x="88" y="396" font-family="${SANS}" font-size="38" font-weight="500"
        fill="${COLORS.accent}" letter-spacing="-0.5">${role}</text>

  <rect x="88" y="452" width="1024" height="1" fill="${COLORS.border}"/>

  <text x="88" y="504" font-family="${MONO}" font-size="21"
        fill="${COLORS.inkMuted}" letter-spacing="0.5">${technologies}</text>

  <text x="88" y="566" font-family="${MONO}" font-size="21"
        fill="${COLORS.inkMuted}" letter-spacing="1">${domain}</text>
</svg>`;
}

async function write(relativePath, data) {
  const target = join(publicDir, relativePath);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, data);
  console.log(`  ${relativePath}`);
}

async function main() {
  console.log('Generating brand assets:');

  await write('favicon.svg', faviconSvg());

  /* Apple touch icons are composited on a solid tile, so no transparency. */
  await write(
    'apple-touch-icon.png',
    await sharp(
      Buffer.from(
        markSvg({ size: 180, background: COLORS.accent, foreground: '#ffffff', radius: 0 }),
      ),
    )
      .png()
      .toBuffer(),
  );

  for (const size of [192, 512]) {
    await write(
      `icon-${size}.png`,
      await sharp(
        Buffer.from(
          markSvg({ size, background: COLORS.accent, foreground: '#ffffff', radius: 5.5 }),
        ),
      )
        .png()
        .toBuffer(),
    );
  }

  await write('og/hayadev.png', await sharp(Buffer.from(ogSvg())).png({ quality: 90 }).toBuffer());

  console.log('Done.');
}

await main();
