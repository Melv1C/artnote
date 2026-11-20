import type { UserRole } from '@/schemas/common';

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrateur',
  user: 'Utilisateur',
};
