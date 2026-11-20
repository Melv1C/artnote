import pluginRouter from '@tanstack/eslint-plugin-router';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import reactPlugin from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';

// Server-only modules: importing one from UI code would pull secrets or Prisma into the bundle
const SERVER_ONLY_IMPORTS = [
  { name: '@/lib/prisma', message: 'Read data through a server function in actions/.' },
  { name: '@/lib/auth', message: 'Use a server function, or authClient in the browser.' },
  { name: '@/lib/auth-server', message: 'Use a guard middleware from @/lib/auth-functions.' },
  { name: '@/lib/env', message: 'Server-only. Pass the value from a server function.' },
];

const eslintConfig = [
  {
    ignores: [
      'src/generated/**/*',
      'src/routeTree.gen.ts',
      '.output/**/*',
      '.nitro/**/*',
      '.tanstack/**/*',
      '.vercel/**/*',
      'node_modules/**/*',
      'dist/**/*',
      'build/**/*',
    ],
  },
  ...pluginRouter.configs['flat/recommended'],
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': hooksPlugin,
      '@typescript-eslint': tsPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        // Explicit version: eslint-plugin-react's 'detect' relies on an API removed in ESLint 10
        version: '19.3',
      },
    },
    rules: {
      ...tsPlugin.configs['eslint-recommended'].overrides[0].rules,
      ...tsPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...hooksPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'inline-type-imports', disallowTypeAnnotations: false },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.name='process'][property.name='env']",
          message: 'Read validated variables from `env` in src/lib/env.ts.',
        },
      ],
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      'react/no-unknown-property': ['error', { ignore: ['cmdk-empty'] }],
      // React Compiler rules this codebase does not follow yet
      'react-hooks/error-boundaries': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/incompatible-library': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
    },
  },
  {
    // UI code reaches the server only through server functions
    files: ['src/**/components/**/*.{ts,tsx}', 'src/**/hooks/**/*.{ts,tsx}', 'src/**/lib/**/*.ts'],
    ignores: ['src/lib/**'],
    rules: {
      'no-restricted-imports': ['error', { paths: SERVER_ONLY_IMPORTS }],
    },
  },
  {
    // Scripts and config run outside the app and read the environment directly
    files: ['scripts/**', 'prisma/**', '*.config.*', 'src/lib/env.ts'],
    rules: { 'no-restricted-syntax': 'off' },
  },
  prettierConfig,
];

export default eslintConfig;
