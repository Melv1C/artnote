/// <reference types="vite/client" />
import { AnalyticsProvider } from '@/components/analytics-provider';
import { CookieBanner } from '@/components/cookie-banner';
import { ConditionalLayout } from '@/components/layout/conditional-layout';
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
import { PropsWithChildren } from 'react';
import { Toaster } from 'sonner';
import appCss from '../styles.css?url';

export const Route = createRootRoute({
  // Resolved once during SSR and reused on the client
  loader: () => getSiteUrl(),
  staleTime: Infinity,
  head: ({ loaderData: siteUrl = '' }) => ({
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
  }),
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
});

function RootDocument({ children }: PropsWithChildren) {
  return (
    <html suppressHydrationWarning lang="en" className="h-full">
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
