import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig, loadEnv } from 'vite-plus';

// Vite+ config: dev server and build (Vite), tests (`test`, Vitest), lint (`lint`, Oxlint),
// format (`fmt`, Oxfmt) and the pre-commit hook (`staged`). `vp check` runs fmt, lint and the
// type check together.

const GENERATED = ['src/generated/**', 'src/routeTree.gen.ts'];
const BUILD_OUTPUT = ['.output/**', '.nitro/**', '.tanstack/**', 'dist/**'];

// Zod with the French locale set; importing 'zod' directly would skip it
const ZOD_IMPORT = { name: 'zod', message: "Import { z } from '@/lib/zod' (French messages)." };

// Server-only modules: importing one from UI code would pull secrets or Prisma into the bundle
const SERVER_ONLY_IMPORTS = [
  { name: '@/lib/prisma', message: 'Read data through a server function in actions/.' },
  { name: '@/lib/auth', message: 'Use a server function, or authClient in the browser.' },
  { name: '@/lib/auth-server', message: 'Use a guard middleware from @/lib/auth-functions.' },
  { name: '@/lib/env', message: 'Server-only. Pass the value from a server function.' },
];

// Type-aware rules that shadcn components, kept close to upstream, break
const SHADCN_RELAXED_RULES = [
  'typescript/no-floating-promises',
  'typescript/restrict-template-expressions',
  'typescript/no-redundant-type-constituents',
  'typescript/no-base-to-string',
  'typescript/no-misused-spread',
];

export default defineConfig(({ mode }) => {
  const { BASE_URL = 'http://localhost:3000' } = loadEnv(mode, process.cwd(), '');
  // Better Auth rejects sign-ins from any origin other than BASE_URL, so never fall back to another port
  const listen = { port: Number(new URL(BASE_URL).port) || 3000, strictPort: true };

  return {
    server: listen,
    preview: listen,
    resolve: {
      tsconfigPaths: true,
    },
    plugins: [
      tailwindcss(),
      tanstackStart({
        srcDirectory: 'src',
      }),
      // React's Vite plugin must come after the Start plugin
      viteReact(),
      // Nitro builds the Node server in .output/ that the Docker image runs (Dockerfile)
      nitro({
        // Umami's tracker and collect endpoint, served from our own domain so ad-blockers that
        // block Umami's domains let them through (ADR 0010)
        routeRules: {
          '/stats/script.js': { proxy: 'https://cloud.umami.is/script.js' },
          '/stats/api/send': { proxy: 'https://gateway.umami.is/api/send' },
        },
      }),
    ],

    // Unit tests for pure modules. No database, no server runtime.
    test: {
      include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
      environment: 'node',
    },

    lint: {
      plugins: ['oxc', 'typescript', 'unicorn', 'react'],
      jsPlugins: [
        '@tanstack/eslint-plugin-router',
        { name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' },
      ],
      categories: {
        correctness: 'error',
      },
      options: {
        // Type-aware rules and the TypeScript type check run as part of `vp check`
        typeAware: true,
        typeCheck: true,
      },
      ignorePatterns: [...GENERATED, ...BUILD_OUTPUT],
      rules: {
        '@tanstack/router/create-route-property-order': 'error',
        '@tanstack/router/route-param-names': 'error',
        'vite-plus/prefer-vite-plus-imports': 'error',
        'no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            destructuredArrayIgnorePattern: '^_',
          },
        ],
        'prefer-const': 'error',
        'no-var': 'error',
        'typescript/consistent-type-imports': [
          'error',
          { fixStyle: 'inline-type-imports', disallowTypeAnnotations: false },
        ],
        'typescript/no-explicit-any': 'error',
        'typescript/ban-ts-comment': 'error',
        'react/rules-of-hooks': 'error',
        'react/exhaustive-deps': 'error',
        'react/jsx-key': 'error',
        'react/no-unknown-property': ['error', { ignore: ['cmdk-empty'] }],
        // React Compiler rules existing components break; new code should still follow them
        'react/set-state-in-effect': 'off',
        'react/purity': 'off',
        'react/preserve-manual-memoization': 'off',
        'react/incompatible-library': 'off',
        'no-restricted-imports': ['error', { paths: [ZOD_IMPORT] }],
        'no-restricted-properties': [
          'error',
          {
            object: 'process',
            property: 'env',
            message: 'Read validated variables from `env` in src/lib/env.ts.',
          },
        ],
      },
      overrides: [
        {
          // UI code (pages, components, hooks, pure lib/) reaches the server only through server
          // functions. Server routes under src/routes/api/ are .ts files and may import server modules.
          files: [
            'src/routes/**/*.tsx',
            'src/**/components/**/*.{ts,tsx}',
            'src/**/hooks/**/*.{ts,tsx}',
            'src/features/*/lib/**/*.ts',
          ],
          rules: {
            'no-restricted-imports': ['error', { paths: [ZOD_IMPORT, ...SERVER_ONLY_IMPORTS] }],
          },
        },
        {
          // shadcn components, copied from upstream: keep them close to the original
          files: ['src/components/ui/**'],
          rules: Object.fromEntries(SHADCN_RELAXED_RULES.map(rule => [rule, 'off'] as const)),
        },
        {
          // The map started from mapcn but is the app's own code now: no exemption
          files: ['src/components/ui/map.tsx'],
          rules: Object.fromEntries(SHADCN_RELAXED_RULES.map(rule => [rule, 'error'] as const)),
        },
        {
          files: ['src/lib/zod.ts'],
          rules: { 'no-restricted-imports': 'off' },
        },
        {
          // Scripts and config run outside the app and read the environment directly
          files: ['scripts/**', 'prisma/**', '*.config.ts', 'src/lib/env.ts'],
          rules: { 'no-restricted-properties': 'off' },
        },
      ],
    },

    fmt: {
      printWidth: 100,
      singleQuote: true,
      trailingComma: 'all',
      arrowParens: 'avoid',
      sortPackageJson: false,
      ignorePatterns: [...GENERATED, ...BUILD_OUTPUT, 'bun.lock'],
    },

    // Pre-commit hook (.vite-hooks/pre-commit runs `vp staged`)
    staged: {
      '*': 'vp check --fix',
    },
  };
});
