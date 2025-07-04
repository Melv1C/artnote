import { createAccessControl } from 'better-auth/plugins/access';
import { adminAc, defaultStatements } from 'better-auth/plugins/admin/access';

// =============================================================================
// CUSTOM PERMISSION STATEMENTS
// =============================================================================

/**
 * Define custom resources and their available actions for ArtNote
 * Make sure to use `as const` so TypeScript can infer the type correctly
 */
export const statement = {
  // Merge default admin statements for user and session management
  ...defaultStatements,

  // Artwork management permissions
  artwork: [
    'create', // Create new artworks
    'read', // View artworks (including drafts)
    'update', // Edit artwork content
    'delete', // Remove artworks
  ],

  // Artist management permissions
  artist: [
    'create', // Create new artist entries
    'read', // View artist information
    'update', // Edit artist information
    'delete', // Remove artists
  ],

  // Place management permissions
  place: [
    'create', // Create new places
    'read', // View places
    'update', // Edit place information
    'delete', // Remove places
  ],

  // Concept management permissions
  concept: [
    'create', // Create new concepts
    'read', // View concepts
    'update', // Edit concepts
    'delete', // Remove concepts
  ],

  // Keyword management permissions
  keyword: [
    'create', // Create new keywords
    'read', // View keywords
    'update', // Edit keywords
    'delete', // Remove keywords
  ],
} as const;

// =============================================================================
// ACCESS CONTROL INSTANCE
// =============================================================================

export const ac = createAccessControl(statement);

// =============================================================================
// CUSTOM ROLES DEFINITION
// =============================================================================

/**
 * Admin Role - Full system access
 * Inherits all default admin permissions plus full ArtNote permissions
 */
export const admin = ac.newRole({
  // All artwork management permissions
  artwork: ['create', 'read', 'update', 'delete'],

  // All artist management permissions
  artist: ['create', 'read', 'update', 'delete'],

  // All place management permissions
  place: ['create', 'read', 'update', 'delete'],

  // All concept management permissions
  concept: ['create', 'read', 'update', 'delete'],

  // All keyword management permissions
  keyword: ['create', 'read', 'update', 'delete'],

  // Include all default admin permissions (user management, session management)
  ...adminAc.statements,
});

/**
 * Writer Role - Content creation and management
 * Can manage artworks and related content but not users
 */
export const writer = ac.newRole({
  // Full artwork management for their own content
  artwork: ['create', 'read', 'update', 'delete'],

  // Artist management - can create and edit
  artist: ['create', 'read', 'update'],

  // Place management - can create and edit
  place: ['create', 'read', 'update'],

  // Concept management - can create and edit
  concept: ['create', 'read', 'update'],

  // Keyword management - can create and edit
  keyword: ['create', 'read', 'update'],
});

/**
 * Regular User Role - Limited read access
 * Can only read published content
 */
export const user = ac.newRole({
  // Read-only access to published artworks
  artwork: ['read'],

  // Read-only access to public information
  artist: ['read'],
  place: ['read'],
  concept: ['read'],
  keyword: ['read'],
});

// =============================================================================
// ROLE EXPORTS
// =============================================================================

export const roles = {
  admin,
  writer,
  user,
} as const;
