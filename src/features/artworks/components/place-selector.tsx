'use client';

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
import { Place } from '@/schemas/place';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { usePlaces } from '../hooks/use-artwork-selectors';

interface PlaceSelectorProps {
  selectedPlace: Place | null;
  onSelectionChange: (place: Place | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function PlaceSelector({
  selectedPlace,
  onSelectionChange,
  placeholder = 'Sélectionner un lieu...',
  className,
  disabled = false,
}: PlaceSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebounce(searchValue, 300);

  const { data: places = [], isLoading } = usePlaces(debouncedSearch);

  const handleSelect = (place: Place) => {
    if (selectedPlace?.id === place.id) {
      onSelectionChange(null);
    } else {
      onSelectionChange(place);
    }
    setOpen(false);
  };

  const formatPlaceName = (place: Place) => {
    const parts = [place.name];
    if (place.city) parts.push(place.city);
    if (place.country) parts.push(place.country);
    return parts.join(', ');
  };

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {selectedPlace ? formatPlaceName(selectedPlace) : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput
              placeholder="Rechercher un lieu..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>{isLoading ? 'Chargement...' : 'Aucun lieu trouvé.'}</CommandEmpty>
              <CommandGroup>
                {places.map(place => (
                  <CommandItem
                    key={place.id}
                    value={formatPlaceName(place)}
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
                      {(place.city || place.country) && (
                        <span className="text-sm text-muted-foreground">
                          {[place.city, place.country].filter(Boolean).join(', ')}
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
