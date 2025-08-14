'use client';

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import { Artist } from '@/schemas/artist';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { useState } from 'react';
import { useArtists } from '../hooks/use-artwork-selectors';

interface ArtistSelectorProps {
  selectedArtists: Artist[];
  onSelectionChange: (artists: Artist[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function ArtistSelector({
  selectedArtists,
  onSelectionChange,
  placeholder = 'Sélectionner des artistes...',
  className,
  disabled = false,
}: ArtistSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebounce(searchValue, 300);

  const { data: artists = [], isLoading } = useArtists(debouncedSearch);

  const handleSelect = (artist: Artist) => {
    const isSelected = selectedArtists.some((a) => a.id === artist.id);

    if (isSelected) {
      onSelectionChange(selectedArtists.filter((a) => a.id !== artist.id));
    } else {
      onSelectionChange([...selectedArtists, artist]);
    }
  };

  const handleRemove = (artistId: string) => {
    onSelectionChange(selectedArtists.filter((a) => a.id !== artistId));
  };

  const formatArtistName = (artist: Artist) => {
    return `${artist.firstName} ${artist.lastName}`;
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {selectedArtists.length > 0
              ? `${selectedArtists.length} artiste(s) sélectionné(s)`
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput
              placeholder="Rechercher un artiste..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? 'Chargement...' : 'Aucun artiste trouvé.'}
              </CommandEmpty>
              <CommandGroup>
                {artists.map((artist) => {
                  const isSelected = selectedArtists.some(
                    (a) => a.id === artist.id
                  );
                  return (
                    <CommandItem
                      key={artist.id}
                      value={`${artist.firstName} ${artist.lastName}`}
                      onSelect={() => handleSelect(artist)}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          isSelected ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {formatArtistName(artist)}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected artists badges */}
      {selectedArtists.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedArtists.map((artist) => (
            <Badge key={artist.id} variant="secondary" className="pr-1">
              {formatArtistName(artist)}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={() => handleRemove(artist.id)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">
                  Supprimer {formatArtistName(artist)}
                </span>
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
