'use client';

import { usePathname } from 'next/navigation';
import { MainLayout } from './main-layout';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Skip MainLayout for admin routes
  if (pathname.startsWith('/dashboard')) {
    return <>{children}</>;
  }

  // Use MainLayout for all other routes
  return <MainLayout>{children}</MainLayout>;
}
