import { cn } from '@/lib/utils';
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
          // A phone shows only the current page and the one above it
          const phoneHidden = index < trail.length - 2;
          return (
            <Fragment key={step.href}>
              {index > 0 && (
                <ChevronRight
                  className={cn(
                    'size-3.5 shrink-0 text-muted-foreground',
                    // Its left neighbour is hidden on a phone
                    index - 1 < trail.length - 2 && 'hidden sm:block',
                  )}
                  aria-hidden="true"
                />
              )}
              <li className={cn('min-w-0', phoneHidden && 'hidden sm:block')}>
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
