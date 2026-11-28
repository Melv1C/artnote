import { DASHBOARD_HOME, DASHBOARD_NAV } from './dashboard-navigation';

const ACTION_LABELS: Record<string, string> = {
  create: 'Nouveau',
  edit: 'Modifier',
};

/**
 * The breadcrumb steps of a dashboard path: the dashboard home, then its section, then the page
 * ("Nouveau", "Modifier"). Ids in the path are not shown.
 */
export function dashboardTrail(pathname: string): { label: string; href: string }[] {
  const segments = pathname.replace(/\/+$/, '').split('/').filter(Boolean);
  const trail: { label: string; href: string }[] = [
    { label: DASHBOARD_HOME.label, href: DASHBOARD_HOME.to },
  ];
  const [root, section, ...rest] = segments;
  if (root !== 'dashboard' || !section) return trail;

  const sectionHref = `/dashboard/${section}`;
  const sectionItem = DASHBOARD_NAV.find(item => item.to === sectionHref);
  trail.push({ label: sectionItem?.label ?? section, href: sectionHref });

  const action = rest.find(segment => segment in ACTION_LABELS);
  if (action) {
    trail.push({ label: ACTION_LABELS[action], href: pathname });
  } else if (rest.length > 0) {
    // An item's own page, such as /dashboard/artists/<id>
    trail.push({ label: ACTION_LABELS.edit, href: pathname });
  }
  return trail;
}
