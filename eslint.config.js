const eslint = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  {
    ignores: ['node_modules/', 'lib/', 'coverage/']
  },
  eslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2017,
        project: './tsconfig.json'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      ...tseslint.configs['eslint-recommended'].overrides[0].rules,
      ...tseslint.configs['recommended'].rules,
      '@typescript-eslint/no-floating-promises': ['error'],
      '@typescript-eslint/no-explicit-any': 'off'
    }
  },
  prettierConfig
];
