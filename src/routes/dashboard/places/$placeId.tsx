import { PageHeader } from '@/components/layout/page-header';
import { PlaceForm } from '@/features/places/components/place-form';
import { fetchPlace } from '@/features/places/actions/place-queries';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/places/$placeId')({
  loader: ({ params }) => fetchPlace({ data: params.placeId }),
  head: () => ({ meta: [{ title: 'ArtNote - Modifier le lieu' }] }),
  component: EditPlacePage,
});

function EditPlacePage() {
  const place = Route.useLoaderData();
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader title={place.name} description="Modifier le lieu" />
      <div className="rounded-xl border bg-card p-6 shadow-xs sm:p-8">
        <PlaceForm place={place} />
      </div>
    </div>
  );
}
