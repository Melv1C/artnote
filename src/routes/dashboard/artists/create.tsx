import { PageHeader } from '@/components/layout/page-header';
import { ArtistForm } from '@/features/artists/components/artist-form';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/artists/create')({
  component: CreateArtistPage,
});

function CreateArtistPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title="Nouvel artiste"
        description="Ses nom et dates, tels que les sources les donnent."
      />
      <div className="rounded-xl border bg-card p-6 shadow-xs sm:p-8">
        <ArtistForm />
      </div>
    </div>
  );
}
