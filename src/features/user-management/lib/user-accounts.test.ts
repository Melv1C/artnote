import { describe, expect, it } from 'vite-plus/test';
import {
  accountStatus,
  countActiveUserFilters,
  DEFAULT_USER_FILTER,
  filterUsers,
} from './user-accounts';

const now = new Date('2026-11-25T12:00:00Z');
const account = (overrides: Partial<Parameters<typeof accountStatus>[0]> = {}) => ({
  name: 'Marie Dupont',
  email: 'marie@example.com',
  role: 'user' as const,
  emailVerified: true,
  banned: false,
  banExpires: null,
  ...overrides,
});

it('tells a suspension that is over from one still running', () => {
  expect(accountStatus(account(), now)).toBe('active');
  expect(accountStatus(account({ banned: true }), now)).toBe('suspended');
  expect(accountStatus(account({ banned: true, banExpires: new Date('2026-12-01') }), now)).toBe(
    'suspended',
  );
  expect(accountStatus(account({ banned: true, banExpires: new Date('2026-11-01') }), now)).toBe(
    'suspensionExpired',
  );
});

describe('filterUsers', () => {
  const marie = account();
  const admin = account({ name: 'Admin', email: 'ADMIN@example.com', role: 'admin' });
  const banned = account({
    name: 'Banni',
    email: 'b@example.com',
    banned: true,
    emailVerified: false,
  });
  const all = [marie, admin, banned];

  it('keeps every account by default', () => {
    expect(filterUsers(all, DEFAULT_USER_FILTER)).toEqual(all);
  });

  it('searches names and emails, ignoring case', () => {
    expect(filterUsers(all, { ...DEFAULT_USER_FILTER, search: ' admin@ ' })).toEqual([admin]);
    expect(filterUsers(all, { ...DEFAULT_USER_FILTER, search: 'dupont' })).toEqual([marie]);
  });

  it('combines role, verification and status', () => {
    expect(filterUsers(all, { ...DEFAULT_USER_FILTER, role: 'admin' })).toEqual([admin]);
    expect(filterUsers(all, { ...DEFAULT_USER_FILTER, emailVerified: 'unverified' })).toEqual([
      banned,
    ]);
    expect(filterUsers(all, { ...DEFAULT_USER_FILTER, status: 'suspended' })).toEqual([banned]);
    expect(filterUsers(all, { ...DEFAULT_USER_FILTER, status: 'active', role: 'user' })).toEqual([
      marie,
    ]);
  });
});

it('counts the filters that are on, not the search', () => {
  expect(countActiveUserFilters({ ...DEFAULT_USER_FILTER, search: 'x' })).toBe(0);
  expect(countActiveUserFilters({ ...DEFAULT_USER_FILTER, role: 'admin', status: 'active' })).toBe(
    2,
  );
});
