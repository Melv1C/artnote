import { z } from 'zod';

// =============================================================================
// ANALYTICS SCHEMAS
// =============================================================================

// PageView schema for event tracking
export const PageViewSchema = z.object({
  id: z.string(),
  artworkId: z.string(),
  sessionId: z.string().nullable(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  referrer: z.string().nullable(),
  createdAt: z.date(),
});

// Input schema for creating page views
export const CreatePageViewSchema = PageViewSchema.omit({
  id: true,
  createdAt: true,
});

// Analytics summary schemas for dashboard stats
export const ArtworkAnalyticsSchema = z.object({
  artworkId: z.string(),
  title: z.string(),
  viewCount: z.number().int().min(0),
  lastViewedAt: z.date().nullable(),
  totalViews: z.number().int().min(0), // For aggregated data
});

export const UserAnalyticsSchema = z.object({
  userId: z.string(),
  totalArtworks: z.number().int().min(0),
  publishedArtworks: z.number().int().min(0),
  draftArtworks: z.number().int().min(0),
  archivedArtworks: z.number().int().min(0),
  totalViews: z.number().int().min(0),
  averageViewsPerArtwork: z.number().min(0),
});

export const PlatformAnalyticsSchema = z.object({
  totalUsers: z.number().int().min(0),
  activeUsers: z.number().int().min(0), // Users who logged in recently
  totalArtworks: z.number().int().min(0),
  publishedArtworks: z.number().int().min(0),
  totalViews: z.number().int().min(0),
  viewsThisMonth: z.number().int().min(0),
  viewsLastMonth: z.number().int().min(0),
  mostViewedArtworks: z.array(ArtworkAnalyticsSchema).max(10),
});

// Query schemas for analytics endpoints
export const AnalyticsFiltersSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  userId: z.string().optional(),
  artworkId: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type PageView = z.infer<typeof PageViewSchema>;
export type CreatePageView = z.infer<typeof CreatePageViewSchema>;
export type ArtworkAnalytics = z.infer<typeof ArtworkAnalyticsSchema>;
export type UserAnalytics = z.infer<typeof UserAnalyticsSchema>;
export type PlatformAnalytics = z.infer<typeof PlatformAnalyticsSchema>;
export type AnalyticsFilters = z.infer<typeof AnalyticsFiltersSchema>;
