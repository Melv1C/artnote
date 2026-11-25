import { artistFullName } from '@/features/artists/lib/artist-name';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import type { ArtworkEditorValues } from '@/schemas/artwork';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { useState } from 'react';
import { useArtistOptions } from '@/features/artists/hooks/use-artists';

type SelectedArtist = ArtworkEditorValues['artists'][number];

interface ArtistSelectorProps {
  selectedArtists: SelectedArtist[];
  onChange: (artists: SelectedArtist[]) => void;
}

/** The notice editor's artist picker: search the artists, then pick or drop any number. */
export function ArtistSelector({ selectedArtists, onChange }: ArtistSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebounce(searchValue, 300);

  const { data: artists = [], isLoading } = useArtistOptions(debouncedSearch);

  const isSelected = (artistId: string) => selectedArtists.some(a => a.id === artistId);
  const remove = (artistId: string) => onChange(selectedArtists.filter(a => a.id !== artistId));
  const toggle = (artist: SelectedArtist) =>
    isSelected(artist.id) ? remove(artist.id) : onChange([...selectedArtists, artist]);

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedArtists.length > 0
              ? `${selectedArtists.length} artiste${selectedArtists.length > 1 ? 's' : ''}`
              : 'Sélectionner des artistes…'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput
              placeholder="Rechercher un artiste…"
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>{isLoading ? 'Chargement…' : 'Aucun artiste trouvé.'}</CommandEmpty>
              <CommandGroup>
                {artists.map(artist => (
                  <CommandItem
                    key={artist.id}
                    value={artistFullName(artist)}
                    onSelect={() => toggle(artist)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        isSelected(artist.id) ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {artistFullName(artist)}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedArtists.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedArtists.map(artist => (
            <Badge key={artist.id} variant="secondary" className="pr-1">
              {artistFullName(artist)}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={() => remove(artist.id)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Supprimer {artistFullName(artist)}</span>
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
