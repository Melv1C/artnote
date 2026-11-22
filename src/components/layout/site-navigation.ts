import { BookOpenText, Home, Info, Sparkles, type LucideIcon } from 'lucide-react';

export interface SiteNavItem {
  label: string;
  to: '/' | '/artworks' | '/whats-new' | '/about';
  icon: LucideIcon;
  /** Active only on this exact path, not on the paths below it */
  exact?: boolean;
}

/** The reader's sections: the top bar on wide screens, the tab bar on phones. */
export const SITE_NAV: SiteNavItem[] = [
  { label: 'Accueil', to: '/', icon: Home, exact: true },
  { label: 'Notices', to: '/artworks', icon: BookOpenText },
  { label: 'Nouveautés', to: '/whats-new', icon: Sparkles },
  { label: 'À propos', to: '/about', icon: Info },
];
