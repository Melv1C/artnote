/// <reference types="vite/client" />
import { ConditionalLayout } from '@/components/layout/conditional-layout';
import { AnalyticsProvider } from '@/features/analytics/components/analytics-provider';
import { CookieBanner } from '@/features/analytics/components/cookie-banner';
import { getUmamiWebsiteId } from '@/features/analytics/actions/umami-config';
import { useUmamiPageViews } from '@/features/analytics/hooks/use-umami-page-views';
import { NotFound } from '@/components/layout/not-found';
import { QueryProvider } from '@/lib/query-provider';
import {
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  getSiteUrl,
  ogImageMeta,
  pageMeta,
} from '@/lib/seo';
import { cn } from '@/lib/utils';
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { type PropsWithChildren } from 'react';
import { Toaster } from '@/components/ui/sonner';
import appCss from '../styles.css?url';

export const Route = createRootRoute({
  // Resolved once during SSR and reused on the client
  loader: async () => {
    const [siteUrl, umamiWebsiteId] = await Promise.all([getSiteUrl(), getUmamiWebsiteId()]);
    return { siteUrl, umamiWebsiteId };
  },
  staleTime: Infinity,
  head: ({ loaderData: { siteUrl, umamiWebsiteId } = { siteUrl: '', umamiWebsiteId: null } }) => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ...pageMeta(SITE_TITLE, SITE_DESCRIPTION),
      { property: 'og:locale', content: 'fr_BE' },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:type', content: 'website' },
      ...ogImageMeta(siteUrl, [DEFAULT_OG_IMAGE]),
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/icon.png', type: 'image/png' },
    ],
    // Umami (ADR 0010), only where its website id is set. Served and sending through /stats/ on
    // our own domain (Nitro route rules in vite.config.ts). Page views are sent by
    // useUmamiPageViews, so dashboard pages and previews can be left out.
    scripts: umamiWebsiteId
      ? [
          {
            src: '/stats/script.js',
            defer: true,
            'data-website-id': umamiWebsiteId,
            'data-host-url': '/stats',
            'data-auto-pageview': 'false',
            'data-exclude-search': 'true',
            'data-do-not-track': 'true',
          },
        ]
      : [],
  }),
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
});

function RootDocument({ children }: PropsWithChildren) {
  useUmamiPageViews();
  return (
    <html suppressHydrationWarning lang="fr" className="h-full">
      <head>
        <HeadContent />
      </head>
      <body className={cn('antialiased', 'h-full')}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AnalyticsProvider>
              <ConditionalLayout>{children}</ConditionalLayout>
            </AnalyticsProvider>
            <Toaster />
            <CookieBanner />
          </QueryProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
