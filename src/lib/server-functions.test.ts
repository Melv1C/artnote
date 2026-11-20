import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Server functions are public HTTP endpoints, exported or not. This test reads every
 * `createServerFn` in `src/` and enforces the AGENTS.md rules that types cannot: a guard
 * middleware from `src/lib/auth-functions.ts` unless the function is listed below as public, and
 * a Zod schema (not a pass-through function) wherever its handler reads input.
 */
const PUBLIC_SERVER_FUNCTIONS = new Set([
  'fetchFilteredArtworks', // public notices list
  'fetchLatestPublishedArtworks', // home and "what's new"
  'fetchPublishedArtwork', // public notice page
  'recordNoticeView', // view counter, published notices only
  'getDashboardAccess', // the caller's own session and whether it may open the dashboard
  'getSiteUrl', // Open Graph base URL
]);

const GUARD =
  /\.middleware\(\[\s*(requireAuth|dashboardAccessMiddleware|requirePermission\(|require\w+)/;

const SRC = join(import.meta.dirname, '..');

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'generated' ? [] : sourceFiles(path);
    return /\.tsx?$/.test(entry.name) && !entry.name.endsWith('.test.ts') ? [path] : [];
  });

type ServerFn = { name: string; file: string; builder: string; handlerParams: string };

const files = sourceFiles(SRC).map(file => ({ file, source: readFileSync(file, 'utf8') }));

/** Every `const <name> = createServerFn(...)`, with its builder chain and handler parameters. */
const serverFunctions: ServerFn[] = files.flatMap(({ file, source }) =>
  [...source.matchAll(/(?:export )?const (\w+) = createServerFn\(/g)].map(match => {
    const handlerAt = source.indexOf('.handler(', match.index);
    const builder = source.slice(match.index, handlerAt);
    // The handler's parameter list: everything up to its arrow
    const handlerParams = source.slice(handlerAt, source.indexOf('=>', handlerAt));
    return { name: match[1] ?? '', file: relative(SRC, file), builder, handlerParams };
  }),
);

describe('server functions', () => {
  it('are all found', () => {
    const calls = files.reduce(
      (count, { source }) => count + (source.match(/createServerFn\(/g)?.length ?? 0),
      0,
    );
    expect(serverFunctions).toHaveLength(calls);
  });

  // Middleware names declared with a guard in their own file (e.g. `requireArtistManager`) count
  it.each(serverFunctions.filter(fn => !PUBLIC_SERVER_FUNCTIONS.has(fn.name)))(
    '$name ($file) has a guard middleware',
    ({ builder }) => {
      expect(builder).toMatch(GUARD);
    },
  );

  it.each(serverFunctions.filter(fn => /\bdata\b/.test(fn.handlerParams)))(
    '$name ($file) validates its input with a schema',
    ({ builder }) => {
      expect(builder).toMatch(/\.validator\(/);
      // A function validator such as `(x: T) => x` checks nothing at runtime
      expect(builder).not.toMatch(/\.validator\(\s*\(/);
    },
  );

  it('defines local guard aliases (e.g. `requireArtistManager`) with requirePermission', () => {
    for (const { file, source } of files) {
      if (file.endsWith('auth-functions.ts')) continue;
      for (const [, name, value] of source.matchAll(/const (require\w+) = ([^;]+)/g)) {
        expect(value, `${name} in ${relative(SRC, file)}`).toMatch(/^requirePermission\(/);
      }
    }
  });

  it('lists only public functions that exist', () => {
    const names = new Set(serverFunctions.map(fn => fn.name));
    for (const name of PUBLIC_SERVER_FUNCTIONS) expect(names).toContain(name);
  });
});
