import { z } from 'zod';

// =============================================================================
// ENUMS
// =============================================================================

export const UserRoleSchema = z.enum(['admin', 'writer', 'user']);
export const ArtworkStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
export const PlaceTypeSchema = z.enum([
  'MUSEUM',
  'CHURCH',
  'PUBLIC_SPACE',
  'OTHER',
]);

// =============================================================================
// COMMON QUERY/FILTER SCHEMAS
// =============================================================================

// Common pagination schema
export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

// Common search schema
export const SearchSchema = z.object({
  search: z.string().optional(),
});

// =============================================================================
// API RESPONSE SCHEMAS
// =============================================================================

// Success response wrapper
export const SuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

// Error response wrapper
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
  }),
});

// Paginated response wrapper
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(
  itemSchema: T
) =>
  z.object({
    success: z.literal(true),
    data: z.object({
      items: z.array(itemSchema),
      pagination: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        totalPages: z.number(),
        hasNext: z.boolean(),
        hasPrev: z.boolean(),
      }),
    }),
  });

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type UserRole = z.infer<typeof UserRoleSchema>;
export type ArtworkStatus = z.infer<typeof ArtworkStatusSchema>;
export type PlaceType = z.infer<typeof PlaceTypeSchema>;
