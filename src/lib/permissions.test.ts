import { describe, expect, it } from 'vite-plus/test';
import { DASHBOARD_PERMISSIONS, hasRolePermission } from './permissions';

describe('hasRolePermission', () => {
  it('lets admins into the dashboard and user administration', () => {
    expect(hasRolePermission('admin', DASHBOARD_PERMISSIONS)).toBe(true);
    expect(hasRolePermission('admin', { artist: ['manage'], place: ['manage'] })).toBe(true);
    expect(hasRolePermission('admin', { user: ['list', 'ban', 'set-role', 'delete'] })).toBe(true);
  });

  it('keeps readers out of every write and of the dashboard', () => {
    expect(hasRolePermission('user', DASHBOARD_PERMISSIONS)).toBe(false);
    expect(hasRolePermission('user', { artist: ['manage'] })).toBe(false);
    expect(hasRolePermission('user', { place: ['manage'] })).toBe(false);
    expect(hasRolePermission('user', { user: ['list'] })).toBe(false);
  });

  it('lets readers read published content', () => {
    expect(
      hasRolePermission('user', { artwork: ['read'], artist: ['read'], place: ['read'] }),
    ).toBe(true);
  });

  it('requires every listed action', () => {
    expect(hasRolePermission('user', { artwork: ['read', 'manage'] })).toBe(false);
  });
});
