'use client';

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
import { Search } from 'lucide-react';
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

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(() => {
    const sort = searchParams.get('sort') || 'title';
    const order = searchParams.get('order') || 'asc';
    return `${sort}-${order}`;
  });

  const debouncedSearch = useDebounce(search, 300);

  const updateURL = useCallback(
    (newParams: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(newParams).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
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

  useEffect(() => {
    updateURL({ search: debouncedSearch });
  }, [debouncedSearch, updateURL]);

  const handleSortChange = (value: string) => {
    setSortBy(value);
    updateURL({ sortBy: value });
  };

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

      {/* Sort */}
      <div className="flex items-center gap-2">
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
    </div>
  );
}
