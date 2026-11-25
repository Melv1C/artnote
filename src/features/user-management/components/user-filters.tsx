import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, X } from 'lucide-react';
import { useId } from 'react';
import {
  ACCOUNT_STATUS_LABELS,
  countActiveUserFilters,
  USER_ROLE_LABELS,
  type UserFilter,
} from '../lib/user-accounts';

type Choice = Exclude<keyof UserFilter, 'search'>;

const CHOICES: { [K in Choice]: { label: string; options: Record<UserFilter[K], string> } } = {
  role: {
    label: 'Rôle',
    options: { all: 'Tous les rôles', ...USER_ROLE_LABELS },
  },
  emailVerified: {
    label: 'Email vérifié',
    options: { all: 'Tous', verified: 'Vérifié', unverified: 'Non vérifié' },
  },
  status: {
    label: 'Statut du compte',
    options: {
      all: 'Tous',
      active: ACCOUNT_STATUS_LABELS.active,
      suspended: ACCOUNT_STATUS_LABELS.suspended,
    },
  },
};

/** The account list's role, verification and status filters, in a menu. */
export function UserFilters({
  filter,
  onChange,
  onClear,
}: {
  filter: UserFilter;
  onChange: <K extends Choice>(key: K, value: UserFilter[K]) => void;
  onClear: () => void;
}) {
  const activeCount = countActiveUserFilters(filter);
  const id = useId();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtres
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
              {activeCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Filtrer par</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(Object.keys(CHOICES) as Choice[]).map(key => (
          <div key={key} className="p-2">
            <Label htmlFor={`${id}-${key}`} className="mb-2">
              {CHOICES[key].label}
            </Label>
            <Select
              value={filter[key]}
              onValueChange={value => onChange(key, value as UserFilter[typeof key])}
            >
              <SelectTrigger id={`${id}-${key}`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries<string>(CHOICES[key].options).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
        {activeCount > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button variant="ghost" size="sm" onClick={onClear} className="w-full gap-2">
                <X className="h-4 w-4" />
                Effacer les filtres
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
