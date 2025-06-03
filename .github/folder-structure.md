# ArtNote - Complete Folder Structure

This document provides a comprehensive overview of the ArtNote project's folder structure.

## Project Root

```plaintext
├── app/                            # Next.js 15 App Router
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Root page (homepage)
│   ├── globals.css                 # Global CSS styles
│   ├── icon.png                    # App icon
│   └── api/                        # API route handlers
│       └── auth/                   # Authentication endpoints
│           └── [...all]/           # Better Auth catch-all route
│               └── route.ts        # Better Auth route handler
├── assets/                         # Static assets
│   └── icon.png                    # App icon
├── src/                            # Source code
│   ├── components/                 # Shared UI components
│   │   ├── ui/                     # Shadcn UI primitives
│   │   │   ├── alert.tsx           # Alert component
│   │   │   ├── avatar.tsx          # Avatar component
│   │   │   ├── button.tsx          # Button component
│   │   │   ├── card.tsx            # Card component
│   │   │   ├── dialog.tsx          # Dialog/Modal component
│   │   │   ├── dropdown-menu.tsx   # Dropdown menu component
│   │   │   ├── form.tsx            # Form components
│   │   │   ├── input.tsx           # Input component
│   │   │   ├── label.tsx           # Label component
│   │   │   ├── skeleton.tsx        # Loading skeleton component
│   │   │   ├── sonner.tsx          # Toast notification component
│   │   │   └── textarea.tsx        # Textarea component
│   │   ├── layout/                 # Layout components
│   │   │   ├── header.tsx          # Main header navigation
│   │   │   ├── footer.tsx          # Main footer
│   │   │   └── main-layout.tsx     # Main page layout wrapper
│   │   └── theme/                  # Theme components
│   │       ├── theme-provider.tsx  # Theme context provider
│   │       └── theme-toggle.tsx    # Dark/light mode toggle
│   ├── features/                   # Feature-specific logic and components
│   │   └── auth/                   # Authentication features
│   │       ├── components/         # Auth-specific components
│   │       │   ├── auth-dialog.tsx # Auth modal dialog
│   │       │   ├── sign-in-form.tsx # Sign in form
│   │       │   └── sign-up-form.tsx # Sign up form
│   │       └── hooks/              # Auth-specific hooks
│   │           ├── use-auth.ts     # Authentication hooks
│   │           └── index.ts        # Hook exports
│   ├── lib/                        # Utility functions and configurations
│   │   ├── auth.ts                 # Better Auth configuration
│   │   ├── auth-client.ts          # Client-side auth utilities
│   │   ├── auth-server.ts          # Server-side auth utilities
│   │   ├── prisma.ts               # Prisma client instance
│   │   └── utils.ts                # General utility functions
│   ├── schemas/                    # Zod validation schemas
│   │   ├── user.ts                 # User validation schemas
│   │   ├── artwork.ts              # Artwork validation schemas
│   │   ├── artist.ts               # Artist validation schemas
│   │   ├── place.ts                # Place validation schemas
│   │   ├── concept.ts              # Concept validation schemas
│   │   ├── keyword.ts              # Keyword validation schemas
│   │   ├── image.ts                # Image validation schemas
│   │   ├── common.ts               # Common validation schemas
│   │   └── index.ts                # Schema exports
│   ├── hooks/                      # Custom React hooks (general purpose)
│   └── generated/                  # Generated files
│       └── prisma/                 # Generated Prisma client
├── prisma/                         # Database schema and migrations
│   ├── schema.prisma               # Prisma data model
│   └── migrations/                 # Database migrations
├── components.json                 # Shadcn UI configuration
├── docker-compose.yml              # Docker composition for development environment
├── .env.local                      # Environment variables template
├── eslint.config.mjs               # ESLint configuration
├── next.config.ts                  # Next.js configuration
├── postcss.config.mjs              # PostCSS configuration
├── tailwind.config.ts              # Tailwind CSS configuration (if exists)
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # NPM dependencies and scripts
├── pnpm-lock.yaml                  # PNPM lock file
├── pnpm-workspace.yaml             # PNPM workspace configuration
└── README.md                       # Project overview and setup
```

## Key Directories Explained

### `/app` - Next.js App Router

- **Route-based file structure**: Each folder represents a route
- **Special files**: `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`
- **API routes**: Server-side endpoints in `/api` folder
- **Nested layouts**: Inherited layouts for different sections

### `/src/components` - UI Components

- **`/ui`**: Base Shadcn UI components (buttons, inputs, dialogs)
- **`/layout`**: Page layout components (header, footer, main-layout)
- **`/theme`**: Theme-related components (provider, toggle)

### `/src/features` - Domain Logic

- **`/auth`**: Authentication features with components and hooks
- **Feature-based organization**: Each domain will have its own folder
- **Co-location**: Related files kept together

### `/src/lib` - Utilities & Configuration

- **Configuration files**: Auth, Prisma setup
- **Utility functions**: General utility functions
- **Type definitions**: Global TypeScript types (planned)

### `/src/schemas` - Data Validation

- **Zod schemas**: Runtime validation for all data models
- **API schemas**: Request/response validation (planned)
- **Form schemas**: Client-side form validation (planned)

### `/prisma` - Database

- **Schema definition**: Data models and relationships
- **Migrations**: Database version control
- **Seeding**: Development data setup

## Architecture Principles

1. **Feature-driven structure**: Code organized by business domain
2. **Co-location**: Related files kept together
3. **Clear separation**: UI, logic, data, and configuration separated
4. **Type safety**: TypeScript and Zod for runtime validation
5. **Scalability**: Structure supports growth and team collaboration
