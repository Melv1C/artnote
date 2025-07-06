import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlacesTable } from '@/features/places';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function PlacesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Lieux</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les lieux d'exposition et de conservation des œuvres d'art
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/places/create">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau lieu
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tous les lieux</CardTitle>
          <CardDescription>
            Liste des lieux d'exposition et de conservation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlacesTable />
        </CardContent>
      </Card>
    </div>
  );
}
