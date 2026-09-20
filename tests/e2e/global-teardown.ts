import { execFileSync } from 'node:child_process';

/** Stops the servers started in the global setup. */
export default function globalTeardown(): void {
  for (const command of ['preview', 'dev']) {
    try {
      execFileSync('pnpm', ['exec', 'astro', command, 'stop'], { stdio: 'ignore' });
    } catch {
      /* Already stopped. */
    }
  }
}
