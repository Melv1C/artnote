/// <reference types="vite/client" />
import { ConfirmProvider } from '@/components/confirm-dialog';
import { MainLayout } from '@/components/layout/main-layout';
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
import { HeadContent, Scripts, createRootRoute, useMatches } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { type PropsWithChildren } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { THEME_COLORS, ThemeColor } from '@/components/theme/theme-color';
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
      // viewport-fit=cover lets the layout reach under a notch; padding uses the safe-area insets
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { name: 'theme-color', media: '(prefers-color-scheme: light)', content: THEME_COLORS.light },
      { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: THEME_COLORS.dark },
      { name: 'color-scheme', content: 'light dark' },
      { name: 'application-name', content: SITE_NAME },
      { name: 'apple-mobile-web-app-title', content: SITE_NAME },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      { name: 'format-detection', content: 'telephone=no' },
      ...pageMeta(SITE_TITLE, SITE_DESCRIPTION),
      { property: 'og:locale', content: 'fr_BE' },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:type', content: 'website' },
      ...ogImageMeta(siteUrl, [DEFAULT_OG_IMAGE]),
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/icon.png', type: 'image/png' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      // Ready for a PWA: installable metadata, no service worker yet
      { rel: 'manifest', href: '/manifest.webmanifest' },
    ],
    // Umami (ADR 0010), only where its website id is set. Served and sending through /stats/ on
    // our own domain (Nitro route rules in vite.config.ts). Page views are sent by
    // useUmamiPageViews, so routes declared `measured: false` can be left out.
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
  // A page not found anywhere matches only this root, so it gets the reader's shell
  const hasOwnLayout = useMatches({
    select: matches => matches.some(match => match.staticData.hasOwnLayout),
  });
  return (
    <html suppressHydrationWarning lang="fr" className="h-full">
      <head>
        <HeadContent />
      </head>
      <body className={cn('antialiased', 'min-h-full')}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <ConfirmProvider>
              {hasOwnLayout ? children : <MainLayout>{children}</MainLayout>}
            </ConfirmProvider>
            <Toaster
              // On a phone, toasts sit above the tab bar
              mobileOffset={{
                bottom: 'calc(var(--tabbar-height) + env(safe-area-inset-bottom) + 0.5rem)',
              }}
            />
            <ThemeColor />
          </QueryProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
