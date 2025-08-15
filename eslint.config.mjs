import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
  {
    ignores: ['src/generated/**/*', '.next/**/*', 'node_modules/**/*', 'dist/**/*', 'build/**/*'],
  },
  {
    rules: {
      'react/no-unescaped-entities': 'off',
    },
  },
];

export default eslintConfig;
