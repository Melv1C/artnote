import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export function ArtworkHeader() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mes Notices</h1>
        <p className="text-muted-foreground mt-2">Gérez vos notices</p>
      </div>
      <Link href="/dashboard/artworks/create">
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Notice
        </Button>
      </Link>
    </div>
  );
}
