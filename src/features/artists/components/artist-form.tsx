'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Artist } from '@/schemas/artist';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { createArtist, updateArtist } from '../actions/artist-actions';

interface ArtistFormProps {
  artist?: Artist;
  mode: 'create' | 'edit';
}

export function ArtistForm({ artist, mode }: ArtistFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      if (mode === 'create') {
        await createArtist(formData);
      } else if (artist) {
        await updateArtist(artist.id, formData);
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">Prénom *</Label>
          <Input
            id="firstName"
            name="firstName"
            defaultValue={artist?.firstName}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Nom *</Label>
          <Input
            id="lastName"
            name="lastName"
            defaultValue={artist?.lastName}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthDate">Date de naissance</Label>
          <Input
            id="birthDate"
            name="birthDate"
            type="date"
            defaultValue={
              artist?.birthDate
                ? new Date(artist.birthDate).toISOString().split('T')[0]
                : ''
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="deathDate">Date de décès</Label>
          <Input
            id="deathDate"
            name="deathDate"
            type="date"
            defaultValue={
              artist?.deathDate
                ? new Date(artist.deathDate).toISOString().split('T')[0]
                : ''
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="biography">Biographie</Label>
        <Textarea
          id="biography"
          name="biography"
          defaultValue={artist?.biography || ''}
          rows={8}
          placeholder="Décrivez la vie et l'œuvre de l'artiste..."
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/artists')}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? 'Enregistrement...'
            : mode === 'create'
            ? 'Créer'
            : 'Modifier'}
        </Button>
      </div>
    </form>
  );
}
