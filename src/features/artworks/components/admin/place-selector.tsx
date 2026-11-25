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
import { placeLocality } from '@/features/places/lib/place-display';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import type { ArtworkEditorValues } from '@/schemas/artwork';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { usePlaceOptions } from '@/features/places/hooks/use-places';

type SelectedPlace = ArtworkEditorValues['place'];

interface PlaceSelectorProps {
  selectedPlace: SelectedPlace;
  onChange: (place: SelectedPlace) => void;
}

/** "Musée Fin-de-Siècle, Bruxelles, Belgique". */
const placeLabel = (place: NonNullable<SelectedPlace>) =>
  [place.name, placeLocality(place)].filter(Boolean).join(', ');

/** The notice editor's place picker: search the places, pick one, pick it again to clear it. */
export function PlaceSelector({ selectedPlace, onChange }: PlaceSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebounce(searchValue);

  const { data: places = [], isLoading } = usePlaceOptions(debouncedSearch);

  const handleSelect = (place: NonNullable<SelectedPlace>) => {
    onChange(selectedPlace?.id === place.id ? null : place);
    setOpen(false);
  };

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            <span className="truncate">
              {selectedPlace ? placeLabel(selectedPlace) : 'Sélectionner un lieu…'}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) min-w-72 p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Rechercher un lieu…"
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>{isLoading ? 'Chargement…' : 'Aucun lieu trouvé.'}</CommandEmpty>
              <CommandGroup>
                {places.map(place => (
                  <CommandItem
                    key={place.id}
                    value={placeLabel(place)}
                    onSelect={() => handleSelect(place)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedPlace?.id === place.id ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{place.name}</span>
                      {placeLocality(place) && (
                        <span className="text-sm text-muted-foreground">
                          {placeLocality(place)}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
