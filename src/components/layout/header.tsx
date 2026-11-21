import { Logo } from '@/components/brand/logo';
import { ModeToggle } from '@/components/theme/theme-toggle';
import { AuthButton } from '@/features/auth/components/auth-button';
import { AuthDialog } from '@/features/auth/components/auth-dialog';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { SITE_NAV } from './site-navigation';

export function Header() {
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  return (
    <>
      <header className="pt-safe sticky top-0 z-40 w-full border-b border-border/60 bg-background/[0.97] backdrop-blur-xl">
        <div className="mx-auto flex h-(--header-height) w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Logo />

          {/* Wide screens: sections in the bar. Phones use the tab bar at the bottom. */}
          <nav aria-label="Navigation principale" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {SITE_NAV.filter(item => item.to !== '/').map(item => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    activeOptions={{ exact: item.exact }}
                    className="relative rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none data-[status=active]:bg-accent data-[status=active]:text-accent-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1.5">
            <ModeToggle />
            <AuthButton onSignInClick={() => setIsAuthDialogOpen(true)} />
          </div>
        </div>
      </header>
      <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
    </>
  );
}
