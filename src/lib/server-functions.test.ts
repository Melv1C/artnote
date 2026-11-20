import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Server functions are public HTTP endpoints. This test reads every `createServerFn` in `src/`
 * and enforces the AGENTS.md rules that types cannot: a guard middleware unless the function is
 * listed below as public, and a Zod schema (not a pass-through function) wherever it reads input.
 */
const PUBLIC_SERVER_FUNCTIONS = new Set([
  'fetchFilteredArtworks', // public notices list
  'fetchLatestPublishedArtworks', // home and "what's new"
  'fetchPublishedArtwork', // public notice page
  'recordNoticeView', // view counter, published notices only
  'getDashboardAccess', // tells the dashboard layout whether to render
  'getSiteUrl', // Open Graph base URL
]);

const SRC = join(import.meta.dirname, '..');

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'generated' ? [] : sourceFiles(path);
    return /\.tsx?$/.test(entry.name) && !entry.name.endsWith('.test.ts') ? [path] : [];
  });

type ServerFn = { name: string; file: string; chain: string };

/** Each `export const <name> = createServerFn(...)` with its builder chain up to `.handler(`. */
const serverFunctions: ServerFn[] = sourceFiles(SRC).flatMap(file => {
  const source = readFileSync(file, 'utf8');
  return [...source.matchAll(/export const (\w+) = createServerFn\(/g)].map(match => {
    const start = match.index;
    const chain = source.slice(start, source.indexOf('.handler(', start) + '.handler('.length);
    const handler = source.slice(start + chain.length, start + chain.length + 120);
    return { name: match[1] ?? '', file: relative(SRC, file), chain: chain + handler };
  });
});

describe('server functions', () => {
  it('are found', () => {
    expect(serverFunctions.length).toBeGreaterThan(30);
  });

  it.each(serverFunctions.filter(fn => !PUBLIC_SERVER_FUNCTIONS.has(fn.name)))(
    '$name ($file) has a guard middleware',
    ({ chain }) => {
      expect(chain).toMatch(/\.middleware\(\[/);
    },
  );

  it.each(serverFunctions.filter(fn => /\bdata\b/.test(fn.chain.split('.handler(')[1] ?? '')))(
    '$name ($file) validates its input with a schema',
    ({ chain }) => {
      expect(chain).toMatch(/\.validator\(/);
      // A function validator such as `(x: T) => x` checks nothing at runtime
      expect(chain).not.toMatch(/\.validator\(\s*\(/);
    },
  );

  it('lists only public functions that exist', () => {
    const names = new Set(serverFunctions.map(fn => fn.name));
    for (const name of PUBLIC_SERVER_FUNCTIONS) expect(names).toContain(name);
  });
});
