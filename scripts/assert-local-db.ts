const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

export function assertLocalDatabase(url: string | undefined): string {
  if (!url) throw new Error('PRISMA_DATABASE_URL is not set. Copy .env.example to .env first.');
  const { hostname } = new URL(url);
  if (!LOCAL_HOSTS.has(hostname)) {
    throw new Error(
      `Refusing to touch ${hostname}: local database scripts only run against localhost. ` +
        'Check PRISMA_DATABASE_URL in .env and .env.local.',
    );
  }
  return url;
}

if (import.meta.main) assertLocalDatabase(process.env.PRISMA_DATABASE_URL);
