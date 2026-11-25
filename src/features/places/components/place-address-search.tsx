import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AddressResult } from '@/schemas/place';
import { Loader2, MapPin, Search } from 'lucide-react';
import { useState, useTransition, type KeyboardEvent } from 'react';
import { searchAddress } from '../actions/address-search';

interface PlaceAddressSearchProps {
  onPick: (result: AddressResult) => void;
}

type SearchState =
  | { kind: 'idle' }
  | { kind: 'results'; results: AddressResult[] }
  | { kind: 'empty' }
  | { kind: 'failed' };

/**
 * The address search above the place form's map. It runs only on "Rechercher" or Enter, never
 * while the writer types. It sits inside the place form, so it is no form of its own and its
 * field has no name: neither Enter nor the button submits the place.
 */
export function PlaceAddressSearch({ onPick }: PlaceAddressSearchProps) {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<SearchState>({ kind: 'idle' });
  const [isSearching, startSearch] = useTransition();

  const search = () => {
    const text = query.trim();
    if (text === '' || isSearching) return;
    startSearch(async () => {
      try {
        const results = await searchAddress({ data: { query: text } });
        setState(results.length > 0 ? { kind: 'results', results } : { kind: 'empty' });
      } catch (error) {
        console.error('Address search failed:', error);
        setState({ kind: 'failed' });
      }
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    search();
  };

  const pick = (result: AddressResult) => {
    onPick(result);
    setState({ kind: 'idle' });
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          type="search"
          aria-label="Adresse ou nom du lieu"
          placeholder="Adresse ou nom du lieu"
          value={query}
          onChange={event => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={200}
        />
        <Button
          type="button"
          variant="secondary"
          onClick={search}
          disabled={isSearching || query.trim() === ''}
        >
          {isSearching ? <Loader2 aria-hidden className="animate-spin" /> : <Search aria-hidden />}
          Rechercher
        </Button>
      </div>

      <div aria-live="polite">
        {state.kind === 'results' && (
          <ul aria-label="Résultats de la recherche" className="divide-y rounded-md border">
            {state.results.map(result => (
              <li key={`${result.latitude},${result.longitude},${result.label}`}>
                <button
                  type="button"
                  onClick={() => pick(result)}
                  className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                >
                  <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span>{result.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {state.kind === 'empty' && (
          <p className="text-sm text-muted-foreground">
            Aucun résultat. Essayez d’autres mots ou placez le repère sur la carte.
          </p>
        )}
        {state.kind === 'failed' && (
          <p role="alert" className="text-sm text-destructive">
            La recherche a échoué. Réessayez ou placez le repère sur la carte.
          </p>
        )}
      </div>
    </div>
  );
}
