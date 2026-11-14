import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'android', '.claude'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ['scripts/**'], languageOptions: { globals: { process: 'readonly', console: 'readonly' } } },
);
