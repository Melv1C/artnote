import type { UserRole } from '@/schemas/common';

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrateur',
  user: 'Utilisateur',
};

interface Account {
  name: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  banned?: boolean | null;
  banExpires?: Date | null;
}

export type AccountStatus = 'active' | 'suspended' | 'suspensionExpired';

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  active: 'Actif',
  suspended: 'Suspendu',
  suspensionExpired: 'Suspendu (expiré)',
};

/** Whether an account is suspended, its suspension over, or neither. */
export function accountStatus(account: Account, now: Date = new Date()): AccountStatus {
  if (!account.banned) return 'active';
  return account.banExpires && account.banExpires < now ? 'suspensionExpired' : 'suspended';
}

/** Filters of the dashboard's account list, applied in the browser; `all` leaves a filter off. */
export interface UserFilter {
  search: string;
  role: UserRole | 'all';
  emailVerified: 'all' | 'verified' | 'unverified';
  /** `suspended` includes suspensions that are over */
  status: 'all' | 'active' | 'suspended';
}

export const DEFAULT_USER_FILTER: UserFilter = {
  search: '',
  role: 'all',
  emailVerified: 'all',
  status: 'all',
};

/** The accounts matching every filter: name or email containing the search, ignoring case. */
export function filterUsers<T extends Account>(accounts: T[], filter: UserFilter): T[] {
  const search = filter.search.trim().toLowerCase();
  return accounts.filter(
    account =>
      (!search ||
        account.name.toLowerCase().includes(search) ||
        account.email.toLowerCase().includes(search)) &&
      (filter.role === 'all' || account.role === filter.role) &&
      (filter.emailVerified === 'all' ||
        account.emailVerified === (filter.emailVerified === 'verified')) &&
      (filter.status === 'all' || !account.banned === (filter.status === 'active')),
  );
}

/** How many filters are on (search excluded: it has its own input). */
export const countActiveUserFilters = (filter: UserFilter) =>
  [filter.role, filter.emailVerified, filter.status].filter(value => value !== 'all').length;
