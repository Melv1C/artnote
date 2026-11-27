import { env } from '@/lib/env';
import { robotsTag } from '@/lib/search-indexing';
import { createMiddleware, createStart } from '@tanstack/react-start';
import { setResponseHeader } from '@tanstack/react-start/server';

// Outside production, every response tells crawlers not to index it (ALLOW_INDEXING)
const searchIndexingMiddleware = createMiddleware().server(({ next }) => {
  const tag = robotsTag(env.ALLOW_INDEXING);
  if (tag) setResponseHeader('X-Robots-Tag', tag);
  return next();
});

export const startInstance = createStart(() => ({
  requestMiddleware: [searchIndexingMiddleware],
}));
