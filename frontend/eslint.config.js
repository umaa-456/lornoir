export default [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    files: ['src/**/*.{js,jsx}', 'vite.config.js', 'tailwind.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        FormData: 'readonly',
        URLSearchParams: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        __dirname: 'readonly',
      },
    },
    rules: {
      'no-undef': 'error',
      'no-duplicate-imports': 'error',
      // Core ESLint does not recognise JSX references; React-aware unused
      // analysis belongs to eslint-plugin-react when it is introduced.
      'no-unused-vars': 'off',
    },
  },
];
