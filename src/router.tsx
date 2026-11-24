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
  }
}
