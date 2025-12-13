import { AnalyticsProvider } from '@/components/analytics-provider';
import { CookieBanner } from '@/components/cookie-banner';
import { ConditionalLayout } from '@/components/layout/conditional-layout';
import { QueryProvider } from '@/lib/query-provider';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Geist, Geist_Mono } from 'next/font/google';
import { PropsWithChildren } from 'react';
import { Toaster } from 'sonner';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ArtNote - La peinture dans tout son art',
  description:
    "(Re)découvrez l'histoire de la peinture à travers des notices scientifiques. Visitez les musées belges autrement grâce à cette plateforme accessible et didactique.",
  metadataBase: new URL(
    process.env.BASE_URL ||
      process.env.VERCEL_URL ||
      process.env.VERCEL_BRANCH_URL ||
      'https://artnote.vercel.app',
  ),
  openGraph: {
    locale: 'fr_BE',
    siteName: 'ArtNote',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ArtNote - La peinture dans tout son art',
      },
    ],
  },
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html suppressHydrationWarning lang="en" className="h-full">
      <body className={cn(geistSans.variable, geistMono.variable, 'antialiased', 'h-full')}>
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
      </body>
    </html>
  );
}
