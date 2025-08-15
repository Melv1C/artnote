import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArtistsTable } from '@/features/artists';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function ArtistsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Artistes</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les artistes et leurs informations biographiques
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/artists/create">
            <Plus className="mr-2 h-4 w-4" />
            Nouvel artiste
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tous les artistes</CardTitle>
          <CardDescription>Liste des artistes enregistrés dans la base de données</CardDescription>
        </CardHeader>
        <CardContent>
          <ArtistsTable />
        </CardContent>
      </Card>
    </div>
  );
}
