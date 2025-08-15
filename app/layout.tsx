import { ConditionalLayout } from '@/components/layout/conditional-layout';
import { QueryProvider } from '@/lib/query-provider';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import { PropsWithChildren } from 'react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: "ArtNote - Découvrez l'art à travers des notices enrichies",
  description:
    "Explorez les œuvres d'art avec des notices détaillées et découvrez le patrimoine culturel français.",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html suppressHydrationWarning lang="en" className="h-full">
      <body className={cn(geistSans.variable, geistMono.variable, 'antialiased', 'h-full')}>
        {' '}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <ConditionalLayout>{children}</ConditionalLayout>
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
