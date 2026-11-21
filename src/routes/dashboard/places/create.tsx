import { PageHeader } from '@/components/layout/page-header';
import { PlaceForm } from '@/features/places/components/place-form';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/places/create')({
  head: () => ({ meta: [{ title: 'ArtNote - Nouveau lieu' }] }),
  component: CreatePlacePage,
});

function CreatePlacePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title="Nouveau lieu"
        description="Un musée, une église ou une collection qui conserve des œuvres."
      />
      <div className="rounded-xl border bg-card p-6 shadow-xs sm:p-8">
        <PlaceForm />
      </div>
    </div>
  );
}
