export const containsInsensitive = (value: string) => ({
  contains: value,
  mode: 'insensitive' as const,
});
