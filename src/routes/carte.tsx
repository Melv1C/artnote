import { MapSlot } from '@/features/places/components/map-slot';
import { fetchMapPlaces } from '@/features/places/actions/place-queries';
import { pageMeta, pageTitle } from '@/lib/seo';
import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';

const PlacesMap = lazy(() => import('@/features/places/components/places-map'));

export const Route = createFileRoute('/carte')({
  loader: () => fetchMapPlaces(),
  // The map fills the phone screen: no footer to scroll down to below it
  staticData: { fillsPhoneScreen: true },
  head: () => ({
    meta: pageMeta(
      pageTitle('Carte'),
      'Les lieux où voir les œuvres présentées sur ArtNote, avec leur nombre de notices.',
    ),
  }),
  component: MapPage,
});

function MapPage() {
  const places = Route.useLoaderData();

  return (
    // Below the header and its 1px border, down to the tab bar on phones and to the bottom of
    // the screen elsewhere
    <div className="relative h-[calc(100dvh-var(--header-total)-1px-var(--tabbar-height)-env(safe-area-inset-bottom))] md:h-[calc(100dvh-var(--header-total)-1px)]">
      <h1 className="sr-only">Carte des lieux</h1>
      <MapSlot unavailable="La carte ne peut pas s’afficher sur cet appareil." className="h-full">
        <PlacesMap places={places} />
      </MapSlot>
      {places.length === 0 && (
        <p className="absolute inset-x-4 top-4 mx-auto max-w-sm rounded-md border bg-background p-3 text-center text-sm shadow-sm">
          Aucun lieu à afficher pour le moment.
        </p>
      )}
    </div>
  );
}
