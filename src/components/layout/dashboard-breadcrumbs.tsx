import { Link, useLocation } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';
import { Fragment } from 'react';
import { dashboardTrail } from './dashboard-trail';

/** Where the admin is in the dashboard; each step but the last links back. */
export function DashboardBreadcrumbs() {
  const pathname = useLocation({ select: location => location.pathname });
  const trail = dashboardTrail(pathname);

  return (
    <nav aria-label="Fil d’Ariane" className="min-w-0">
      <ol className="flex items-center gap-1.5 text-sm">
        {trail.map((step, index) => {
          const last = index === trail.length - 1;
          return (
            <Fragment key={step.href}>
              {index > 0 && (
                <ChevronRight
                  className="size-3.5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
              <li className="min-w-0">
                {last ? (
                  <span aria-current="page" className="block truncate font-medium">
                    {step.label}
                  </span>
                ) : (
                  <Link
                    to={step.href}
                    className="block truncate text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {step.label}
                  </Link>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
