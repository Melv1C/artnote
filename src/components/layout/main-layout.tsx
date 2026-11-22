import { Footer } from './footer';
import { Header } from './header';
import { MobileTabBar } from './mobile-tab-bar';

interface MainLayoutProps {
  children: React.ReactNode;
}

/** The reader's shell: header, page, footer, and the tab bar on phones. */
export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col pb-[calc(var(--tabbar-height)+env(safe-area-inset-bottom))] md:pb-0">
      <a
        href="#contenu"
        className="sr-only z-50 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Aller au contenu
      </a>
      <Header />
      <main id="contenu" tabIndex={-1} className="w-full flex-1 outline-none">
        {children}
      </main>
      <Footer />
      <MobileTabBar />
    </div>
  );
}
