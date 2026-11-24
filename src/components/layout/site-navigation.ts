import { BookOpenText, Home, Info, Map as MapIcon, Sparkles, type LucideIcon } from 'lucide-react';

export interface SiteNavItem {
  label: string;
  to: '/' | '/artworks' | '/carte' | '/whats-new' | '/about';
  icon: LucideIcon;
  /** Active only on this exact path, not on the paths below it */
  exact?: boolean;
}

/** The reader's sections: the top bar on wide screens, the tab bar on phones. */
export const SITE_NAV: SiteNavItem[] = [
  { label: 'Accueil', to: '/', icon: Home, exact: true },
  { label: 'Notices', to: '/artworks', icon: BookOpenText },
  { label: 'Carte', to: '/carte', icon: MapIcon },
  { label: 'Nouveautés', to: '/whats-new', icon: Sparkles },
  { label: 'À propos', to: '/about', icon: Info },
];
