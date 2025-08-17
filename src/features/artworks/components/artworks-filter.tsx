'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDebounce } from '@/hooks/use-debounce';
import { Filter, RotateCcw, Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

const SORT_OPTIONS = [
  { value: 'title-asc', label: 'Titre (A-Z)' },
  { value: 'title-desc', label: 'Titre (Z-A)' },
  { value: 'artist-asc', label: 'Artiste (A-Z)' },
  { value: 'artist-desc', label: 'Artiste (Z-A)' },
  { value: 'year-desc', label: 'Année (Plus récent)' },
  { value: 'year-asc', label: 'Année (Plus ancien)' },
  { value: 'published-desc', label: 'Publication (Plus récent)' },
  { value: 'published-asc', label: 'Publication (Plus ancien)' },
] as const;

export function ArtworksFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state for form inputs
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [artist, setArtist] = useState(searchParams.get('artist') || '');
  const [place, setPlace] = useState(searchParams.get('place') || '');
  const [medium, setMedium] = useState(searchParams.get('medium') || '');
  const [year, setYear] = useState(searchParams.get('year') || '');
  const [sortBy, setSortBy] = useState(() => {
    const sort = searchParams.get('sort') || 'title';
    const order = searchParams.get('order') || 'asc';
    return `${sort}-${order}`;
  });

  // Debounced search value
  const debouncedSearch = useDebounce(search, 300);

  // Update URL when filters change
  const updateURL = useCallback(
    (newParams: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Update or remove parameters
      Object.entries(newParams).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      // Handle sort and order specially
      if (newParams.sortBy) {
        const [sort, order] = newParams.sortBy.split('-');
        params.set('sort', sort);
        params.set('order', order);
        params.delete('sortBy');
      }

      router.push(`/artworks?${params.toString()}`);
    },
    [router, searchParams],
  );

  // Update URL when debounced search changes
  useEffect(() => {
    updateURL({ search: debouncedSearch });
  }, [debouncedSearch, updateURL]);

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    updateURL({ [key]: value });
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value);
    updateURL({ sortBy: value });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearch('');
    setArtist('');
    setPlace('');
    setMedium('');
    setYear('');
    setSortBy('title-asc');
    router.push('/artworks');
  };

  // Check if any filters are active
  const hasActiveFilters = search || artist || place || medium || year || sortBy !== 'title-asc';

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher par titre, artiste, ou mots-clés..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Artist Filter */}
        <div className="space-y-2">
          <Label htmlFor="artist-filter">Artiste</Label>
          <Input
            id="artist-filter"
            placeholder="Nom de l'artiste"
            value={artist}
            onChange={e => {
              setArtist(e.target.value);
              handleFilterChange('artist', e.target.value);
            }}
          />
        </div>

        {/* Place Filter */}
        <div className="space-y-2">
          <Label htmlFor="place-filter">Lieu</Label>
          <Input
            id="place-filter"
            placeholder="Musée, galerie..."
            value={place}
            onChange={e => {
              setPlace(e.target.value);
              handleFilterChange('place', e.target.value);
            }}
          />
        </div>

        {/* Medium Filter */}
        <div className="space-y-2">
          <Label htmlFor="medium-filter">Technique</Label>
          <Input
            id="medium-filter"
            placeholder="Huile sur toile..."
            value={medium}
            onChange={e => {
              setMedium(e.target.value);
              handleFilterChange('medium', e.target.value);
            }}
          />
        </div>

        {/* Year Filter */}
        <div className="space-y-2">
          <Label htmlFor="year-filter">Année</Label>
          <Input
            id="year-filter"
            placeholder="Année de création"
            value={year}
            onChange={e => {
              setYear(e.target.value);
              handleFilterChange('year', e.target.value);
            }}
          />
        </div>
      </div>

      {/* Sort and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Label>Trier par :</Label>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters} className="gap-2" size="sm">
            <RotateCcw className="h-4 w-4" />
            Réinitialiser
          </Button>
        )}
      </div>
    </div>
  );
}
