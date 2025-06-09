import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArtworkForm, updateArtwork } from '@/features/artworks';
import { getRequiredUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { ArtworkSchema } from '@/schemas';
import { notFound } from 'next/navigation';

interface EditArtworkPageProps {
  params: { artworkId: string };
}

export default async function EditArtworkPage({
  params,
}: EditArtworkPageProps) {
  const user = await getRequiredUser();

  const artwork = await prisma.artwork.findUnique({
    where: { id: params.artworkId },
  });

  if (!artwork || artwork.writerId !== user.id) {
    notFound();
  }

  const parsed = ArtworkSchema.parse(artwork);

  const initialValues = {
    title: parsed.title,
    creationYear: parsed.creationYear || undefined,
    medium: parsed.medium || undefined,
    dimensions: parsed.dimensions || undefined,
    notice: parsed.notice || undefined,
    sources: parsed.sources || undefined,
    status: parsed.status,
    placeId: parsed.placeId || undefined,
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Modifier la notice</CardTitle>
          <CardDescription>
            Mettez à jour les informations de l'œuvre d'art
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ArtworkForm
            initialValues={initialValues}
            onSubmit={(data) => updateArtwork(params.artworkId, data)}
            submitLabel="Mettre à jour"
            successMessage="Notice mise à jour avec succès !"
          />
        </CardContent>
      </Card>
    </div>
  );
}
