import pluginRouter from '@tanstack/eslint-plugin-router';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import reactPlugin from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';

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
      ...reactPlugin.configs.recommended.rules,
      ...hooksPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      'react/no-unknown-property': ['error', { ignore: ['cmdk-empty'] }],
      // Disable strict React Compiler rules that are new
      'react-hooks/error-boundaries': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/incompatible-library': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
    },
  },
  prettierConfig,
];

export default eslintConfig;
