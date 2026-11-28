import { DASHBOARD_PAGE_SIZE, MAX_PAGE_SIZE } from '@/lib/pagination';
import { z } from '@/lib/zod';

// Allowed values of the plain-string columns `User.role`, `Artwork.status` and `Place.type`
export const UserRoleSchema = z.enum(['admin', 'user']);
export const ArtworkStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
export const PlaceTypeSchema = z.enum(['MUSEUM', 'CHURCH', 'PUBLIC_SPACE', 'OTHER']);

export type UserRole = z.infer<typeof UserRoleSchema>;
export type ArtworkStatus = z.infer<typeof ArtworkStatusSchema>;
export type PlaceType = z.infer<typeof PlaceTypeSchema>;

/** A record id (cuid for app tables, Better Auth's id for users) as received from a client. */
export const IdSchema = z.string().trim().min(1).max(64);

/** Free-text search as received from a client. */
export const SearchTextSchema = z.string().trim().max(200);

/**
 * A web address an admin types, such as a place's website: http(s) only, so it is safe as a link's
 * `href` (no `javascript:`). Pages check stored addresses with it too, as older rows were not.
 */
export const WebLinkSchema = z.url({ protocol: /^https?$/, message: 'URL invalide' });

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DASHBOARD_PAGE_SIZE),
});

export const emptyToNull = (value: string | null | undefined) => value?.trim() || null;
