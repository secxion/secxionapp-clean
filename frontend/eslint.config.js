import js from '@eslint/js';
import react from 'eslint-plugin-react';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react,
      'jsx-a11y': jsxA11y,
    },
    extends: [
      'plugin:react/recommended',
      'plugin:jsx-a11y/recommended',
      'plugin:prettier/recommended',
    ],
    rules: {
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
    },
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
    },
  },
];
