import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import { ArtworkSchema, ArtworkStatusSchema } from '@/schemas';

export const metadata = {
  title: "Nouveautés - ArtNote",
};

export default async function WhatsNewPage() {
  const latestArtworks = ArtworkSchema.array().parse(
    await prisma.artwork.findMany({
      where: { status: ArtworkStatusSchema.Values.PUBLISHED },
      orderBy: { publishedAt: 'desc' },
      take: 10,
    })
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Nouveautés</h1>
      {latestArtworks.length === 0 ? (
        <p>Aucune notice publiée récemment.</p>
      ) : (
        <div className="space-y-4">
          {latestArtworks.map((artwork) => (
            <Card key={artwork.id}>
              <CardHeader>
                <CardTitle>{artwork.title}</CardTitle>
                {artwork.publishedAt && (
                  <CardDescription>
                    Publié le{' '}
                    {new Date(artwork.publishedAt).toLocaleDateString('fr-FR')}
                  </CardDescription>
                )}
              </CardHeader>
              {artwork.notice && (
                <CardContent>
                  <p className="line-clamp-3">{artwork.notice}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
