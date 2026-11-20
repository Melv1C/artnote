/** Prisma string filter: `value` anywhere in the column, ignoring case. */
export const containsInsensitive = (value: string) => ({
  contains: value,
  mode: 'insensitive' as const,
});
