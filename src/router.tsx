import { NotFound } from '@/components/layout/not-found';
import { PageLoading } from '@/components/layout/page-loading';
import { RouteError } from '@/components/layout/route-error';
import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

export function getRouter() {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPendingComponent: PageLoading,
    defaultNotFoundComponent: NotFound,
    defaultErrorComponent: RouteError,
  });

  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
  interface StaticDataRouteOption {
    /** The page fills the phone screen: no footer below it on phones (`MainLayout`). */
    fillsPhoneScreen?: boolean;
    /** The route and the routes below it bring their own shell instead of the reader's `MainLayout`. */
    hasOwnLayout?: boolean;
    /** False: no Umami page view for the route and the routes below it, which are not reading (ADR 0010). */
    measured?: boolean;
  }
}
