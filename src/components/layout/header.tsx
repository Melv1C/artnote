'use client';

import { ModeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { AuthButton, AuthDialog } from '@/features/auth/components';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  const navigation = [
    { name: 'Œuvres', href: '/artworks' },
    { name: 'Nouveautés', href: '/whats-new' },
  ];

  return (
    <>
      {' '}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center">
          {' '}
          {/* Logo */}{' '}
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image
              src="/icon.png"
              alt="ArtNote Logo"
              width={48}
              height={48}
              className="h-12 w-12"
            />
            <span className="font-bold text-xl">ArtNote</span>
          </Link>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {item.name}
              </Link>
            ))}
          </nav>{' '}
          {/* Right side */}
          <div className="flex flex-1 items-center justify-end space-x-2">
            {/* Theme Toggle */}
            <ModeToggle />
            {/* Auth Section */}
            <AuthButton onSignInClick={() => setIsAuthDialogOpen(true)} />
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              className="md:hidden"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>{' '}
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="space-y-1 pb-3 pt-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-3 py-2 text-base font-medium text-foreground/60 hover:text-foreground/80"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>
      {/* Auth Dialog */}
      <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
    </>
  );
}
