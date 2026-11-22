const SECTION_LABELS: Record<string, string> = {
  artworks: 'Mes notices',
  artists: 'Artistes',
  places: 'Lieux',
  users: 'Utilisateurs',
};

const ACTION_LABELS: Record<string, string> = {
  create: 'Nouveau',
  edit: 'Modifier',
};

/**
 * The breadcrumb steps of a dashboard path: "Tableau de bord", then its section, then the page
 * ("Nouveau", "Modifier"). Ids in the path are not shown.
 */
export function dashboardTrail(pathname: string): { label: string; href: string }[] {
  const segments = pathname.replace(/\/+$/, '').split('/').filter(Boolean);
  const trail = [{ label: 'Tableau de bord', href: '/dashboard' }];
  const [root, section, ...rest] = segments;
  if (root !== 'dashboard' || !section) return trail;

  const sectionHref = `/dashboard/${section}`;
  trail.push({ label: SECTION_LABELS[section] ?? section, href: sectionHref });

  const action = rest.find(segment => segment in ACTION_LABELS);
  if (action) {
    trail.push({ label: ACTION_LABELS[action], href: pathname });
  } else if (rest.length > 0) {
    // An item's own page, such as /dashboard/artists/<id>
    trail.push({ label: ACTION_LABELS.edit, href: pathname });
  }
  return trail;
}
