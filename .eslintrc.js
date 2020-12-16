module.exports = {
  env: {
    node: true,
    es2020: true,
    browser: true
  },
  parserOptions: {
    sourceType: 'module'
  },
  extends: [
    /* Base ESLint Config */
    'eslint:recommended',

    /* Prettier Integration */
    'prettier',
    'plugin:prettier/recommended',

    /* SonarJS Config */
    'plugin:sonarjs/recommended'
  ],
  plugins: ['simple-import-sort', 'sonarjs'],
  rules: {
    /**
     * Object Formatting
     */
    'object-shorthand': ['error', 'always', { avoidQuotes: true }],

    /* Sorting */
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error'
  },
  globals: { Atomics: 'readonly', SharedArrayBuffer: 'readonly' },
  overrides: [
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        sourceType: 'module'
      },
      plugins: ['@typescript-eslint', 'simple-import-sort', 'tsdoc', 'sonarjs'],
      extends: [
        /* TypeScript ESLint */
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/eslint-recommended',

        /* Prettier Integration */
        'prettier/@typescript-eslint',

        /* SonarJS Config */
        'plugin:sonarjs/recommended'
      ],
      rules: {
        /**
         * Object Formatting
         */
        'object-shorthand': ['error', 'always', { avoidQuotes: true }],

        /**
         * TypeScript
         */
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',

        /**
         * SonarJS
         */
        'sonarjs/no-duplicate-string': 'off',

        /**
         * Sorting
         */
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',

        /**
         * TSDoc
         */
        'tsdoc/syntax': 'warn'
      }
    }
  ]
}
