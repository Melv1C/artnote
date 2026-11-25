import { describe, expect, it } from 'vite-plus/test';
import { DASHBOARD_NAV } from './dashboard-navigation';
import { dashboardTrail } from './dashboard-trail';

const labels = (path: string) => dashboardTrail(path).map(step => step.label);

describe('dashboardTrail', () => {
  it('starts at the dashboard home', () => {
    expect(labels('/dashboard')).toEqual(['Tableau de bord']);
    expect(labels('/dashboard/')).toEqual(['Tableau de bord']);
  });

  it('names the section and the page, not the ids', () => {
    expect(labels('/dashboard/artworks')).toEqual(['Tableau de bord', 'Mes notices']);
    expect(labels('/dashboard/artworks/create')).toEqual([
      'Tableau de bord',
      'Mes notices',
      'Nouveau',
    ]);
    expect(labels('/dashboard/artworks/abc123/edit')).toEqual([
      'Tableau de bord',
      'Mes notices',
      'Modifier',
    ]);
    expect(labels('/dashboard/artists/abc123')).toEqual([
      'Tableau de bord',
      'Artistes',
      'Modifier',
    ]);
  });

  it('names every section as the sidebar does', () => {
    for (const item of DASHBOARD_NAV) {
      expect(dashboardTrail(item.to).at(-1)).toEqual({ label: item.label, href: item.to });
    }
  });

  it('links each step to its page', () => {
    expect(dashboardTrail('/dashboard/places/create').map(step => step.href)).toEqual([
      '/dashboard',
      '/dashboard/places',
      '/dashboard/places/create',
    ]);
  });
});
