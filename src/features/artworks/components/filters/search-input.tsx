'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

interface ArtworkSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ArtworkSearchInput({
  value,
  onChange,
  placeholder = 'Rechercher par titre, technique, année...',
}: ArtworkSearchInputProps) {
  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-9"
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange('')}
          className="absolute right-1 top-1/2 h-7 w-7 p-0 -translate-y-1/2 hover:bg-transparent"
        >
          <X className="h-3 w-3" />
          <span className="sr-only">Effacer la recherche</span>
        </Button>
      )}
    </div>
  );
}
