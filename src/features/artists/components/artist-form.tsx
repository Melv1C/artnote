import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useValidatedForm } from '@/components/validated-form';
import { runMutation } from '@/lib/run-mutation';
import { ArtistFormSchema, type Artist } from '@/schemas/artist';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { createArtist, updateArtist } from '../actions/artist-mutations';
import { artistKeys } from '../hooks/use-artists';

interface ArtistFormProps {
  /** The artist to edit; omit to create one. */
  artist?: Artist;
}

export function ArtistForm({ artist }: ArtistFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { onSubmit, isPending, field, fieldError } = useValidatedForm(
    ArtistFormSchema,
    async data => {
      const saved = await runMutation(
        async () => {
          await (artist
            ? updateArtist({ data: { ...data, id: artist.id } })
            : createArtist({ data }));
          await queryClient.invalidateQueries({ queryKey: artistKeys.all });
        },
        {
          success: artist ? 'Artiste modifié' : 'Artiste créé',
          failure: 'L’artiste n’a pas pu être enregistré.',
        },
      );
      if (saved) await navigate({ to: '/dashboard/artists' });
    },
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">Prénom *</Label>
          <Input defaultValue={artist?.firstName} required {...field('firstName')} />
          {fieldError('firstName')}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Nom</Label>
          <Input defaultValue={artist?.lastName} {...field('lastName')} />
          {fieldError('lastName')}
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthDate">Date de naissance</Label>
          <Input
            placeholder="1525, 01/01/1950, XIXe siècle…"
            defaultValue={artist?.birthDate ?? ''}
            {...field('birthDate')}
          />
          {fieldError('birthDate')}
        </div>

        <div className="space-y-2">
          <Label htmlFor="deathDate">Date de décès</Label>
          <Input
            placeholder="1569, vers 1600…"
            defaultValue={artist?.deathDate ?? ''}
            {...field('deathDate')}
          />
          {fieldError('deathDate')}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="biography">Biographie</Label>
        <Textarea
          defaultValue={artist?.biography ?? ''}
          rows={8}
          placeholder="Décrivez la vie et l’œuvre de l’artiste…"
          {...field('biography')}
        />
        {fieldError('biography')}
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
