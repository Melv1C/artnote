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
  params: Promise<{ artworkId: string }>;
}

export default async function EditArtworkPage({
  params,
}: EditArtworkPageProps) {
  const user = await getRequiredUser();
  const { artworkId } = await params;

  const artwork = await prisma.artwork.findUnique({
    where: { id: artworkId },
    include: {
      images: {
        include: {
          image: true,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      },
      place: true,
      artists: {
        include: {
          artist: true,
        },
      },
    },
  });

  if (!artwork || artwork.writerId !== user.id) {
    notFound();
  }

  const parsed = ArtworkSchema.parse(artwork);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Modifier la notice</h1>
        <p className="text-muted-foreground">
          Mettez à jour les informations de l'œuvre d'art
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l'œuvre</CardTitle>
          <CardDescription>
            Modifiez les détails de l'œuvre d'art
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ArtworkForm
            initialValues={parsed}
            onSubmit={updateArtwork.bind(null, artworkId)}
            submitLabel="Mettre à jour"
            successMessage="Notice mise à jour avec succès !"
          />
        </CardContent>
      </Card>
    </div>
  );
}
