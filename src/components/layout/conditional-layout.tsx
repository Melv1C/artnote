import { useLocation } from '@tanstack/react-router';
import { MainLayout } from './main-layout';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = useLocation({ select: location => location.pathname });

  // Skip MainLayout for admin routes
  if (pathname.startsWith('/dashboard')) {
    return <>{children}</>;
  }

  // Use MainLayout for all other routes
  return <MainLayout>{children}</MainLayout>;
}
