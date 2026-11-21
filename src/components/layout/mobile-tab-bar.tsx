import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';
import { SITE_NAV } from './site-navigation';

/**
 * The phone's main navigation, at the bottom within thumb reach, as in an installed app. Hidden
 * from `md` up, where the header carries the sections.
 */
export function MobileTabBar() {
  return (
    <nav
      aria-label="Navigation principale"
      className="pb-safe px-safe fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background md:hidden"
    >
      <ul className="mx-auto grid h-(--tabbar-height) max-w-md grid-cols-4">
        {SITE_NAV.map(item => (
          <li key={item.to} className="flex">
            <Link
              to={item.to}
              activeOptions={{ exact: item.exact }}
              className={cn(
                'group flex flex-1 flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium text-muted-foreground transition-colors outline-none',
                'focus-visible:text-foreground data-[status=active]:text-primary',
              )}
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'flex h-7 w-12 items-center justify-center rounded-full transition-colors group-focus-visible:ring-2 group-focus-visible:ring-ring',
                      isActive && 'bg-accent',
                    )}
                  >
                    <item.icon className="size-5" strokeWidth={isActive ? 2.25 : 1.75} />
                  </span>
                  {item.label}
                </>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
