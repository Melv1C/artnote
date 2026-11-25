import { FormPage } from '@/components/layout/form-page';
import { PlaceForm } from '@/features/places/components/place-form';
import { pageTitle } from '@/lib/seo';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/places/create')({
  head: () => ({ meta: [{ title: pageTitle('Nouveau lieu') }] }),
  component: CreatePlacePage,
});

function CreatePlacePage() {
  return (
    <FormPage
      title="Nouveau lieu"
      description="Un musée, une église ou une collection qui conserve des œuvres."
    >
      <PlaceForm />
    </FormPage>
  );
}
