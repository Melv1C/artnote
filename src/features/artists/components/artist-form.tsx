import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArtistFormSchema, type Artist } from '@/schemas/artist';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { createArtist, updateArtist } from '../actions/artist-mutations';
import { artistKeys } from '../hooks/use-artists';

interface ArtistFormProps {
  /** The artist to edit; omit to create one. */
  artist?: Artist;
}

export function ArtistForm({ artist }: ArtistFormProps) {
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  const handleSubmit = (formData: FormData) => {
    const parsed = ArtistFormSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Formulaire invalide');
      return;
    }

    startTransition(async () => {
      try {
        if (artist) {
          await updateArtist({ data: { ...parsed.data, id: artist.id } });
        } else {
          await createArtist({ data: parsed.data });
        }
        await queryClient.invalidateQueries({ queryKey: artistKeys.all });
        toast.success(artist ? 'Artiste modifié' : 'Artiste créé');
        await navigate({ to: '/dashboard/artists' });
      } catch (error) {
        console.error('Saving artist failed:', error);
        toast.error('Erreur lors de l’enregistrement de l’artiste');
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">Prénom *</Label>
          <Input id="firstName" name="firstName" defaultValue={artist?.firstName} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Nom</Label>
          <Input id="lastName" name="lastName" defaultValue={artist?.lastName} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthDate">Date de naissance</Label>
          <Input
            id="birthDate"
            name="birthDate"
            placeholder="1525, 01/01/1950, XIXe siècle…"
            defaultValue={artist?.birthDate ?? ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="deathDate">Date de décès</Label>
          <Input
            id="deathDate"
            name="deathDate"
            placeholder="1569, vers 1600…"
            defaultValue={artist?.deathDate ?? ''}
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
          placeholder="Décrivez la vie et l’œuvre de l’artiste…"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate({ to: '/dashboard/artists' })}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Enregistrement…' : artist ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  );
}
