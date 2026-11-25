import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

/** A table's search box; its placeholder is also its accessible name. */
export function SearchInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={`${label}…`}
        aria-label={label}
        value={value}
        onChange={event => onChange(event.target.value)}
        className="pl-10"
      />
    </div>
  );
}
