import { FormPage } from '@/components/layout/form-page';
import { ArtistForm } from '@/features/artists/components/artist-form';
import { pageTitle } from '@/lib/seo';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/artists/create')({
  head: () => ({ meta: [{ title: pageTitle('Nouvel artiste') }] }),
  component: CreateArtistPage,
});

function CreateArtistPage() {
  return (
    <FormPage
      title="Nouvel artiste"
      description="Ses nom et dates, tels que les sources les donnent."
    >
      <ArtistForm />
    </FormPage>
  );
}
