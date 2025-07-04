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
    'read', // View artworks (excluding drafts),
    'readAll', // View all artworks including drafts
    'manage', // Manage artworks (create, update, delete)
  ],

  // Artist management permissions
  artist: [
    'read', // View artist information
    'manage', // Manage artists (create, update, delete)
  ],

  // Place management permissions
  place: [
    'read', // View places
    'manage', // Manage places (create, update, delete)
  ],

  // Concept management permissions
  concept: [
    'read', // View concepts
    'manage', // Manage concepts (create, update, delete)
  ],

  // Keyword management permissions
  keyword: [
    'read', // View keywords
    'manage', // Manage keywords (create, update, delete)
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
  artwork: ['read', 'manage'],

  // All artist management permissions
  artist: ['read', 'manage'],

  // All place management permissions
  place: ['read', 'manage'],

  // All concept management permissions
  concept: ['read', 'manage'],

  // All keyword management permissions
  keyword: ['read', 'manage'],

  // Include all default admin permissions (user management, session management)
  ...adminAc.statements,
});

/**
 * Writer Role - Content creation and management
 * Can manage artworks and related content but not users
 */
export const writer = ac.newRole({
  // Full artwork management for their own content
  artwork: ['read', 'manage'],

  // Artist management - can create and edit
  artist: ['read', 'manage'],

  // Place management - can create and edit
  place: ['read', 'manage'],

  // Concept management - can create and edit
  concept: ['read', 'manage'],

  // Keyword management - can create and edit
  keyword: ['read', 'manage'],
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
