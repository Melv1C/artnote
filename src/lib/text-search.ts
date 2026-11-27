import '@tanstack/react-start/server-only';
import { Prisma } from '@/generated/prisma/client';
import { prisma } from './prisma';

/** The text columns each table can search, as Postgres names them. */
type SearchableColumns = {
  artist: 'firstName' | 'lastName' | 'biography';
  place: 'name' | 'address' | 'city' | 'country';
  artwork: 'title' | 'medium' | 'notice';
};

/**
 * Ids of the `table` rows where one of `columns` contains `text`, ignoring case and accents
 * (Postgres `unaccent`, which Prisma's `contains` cannot call). `undefined` without a text.
 */
export async function idsContaining<T extends keyof SearchableColumns>(
  table: T,
  columns: SearchableColumns[T][],
  text: string | undefined,
): Promise<string[] | undefined> {
  if (!text) return undefined;
  // `%`, `_` and `\` in the text are literal, as with Prisma's `contains`
  const pattern = `%${text.replace(/[\\%_]/g, '\\$&')}%`;
  const matches = columns.map(
    column => Prisma.sql`unaccent(${Prisma.raw(`"${column}"`)}) ILIKE unaccent(${pattern})`,
  );
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM ${Prisma.raw(`"${table}"`)} WHERE ${Prisma.join(matches, ' OR ')}`;
  return rows.map(row => row.id);
}
