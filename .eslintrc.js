/**
 * ESLint Configuration
 * Enterprise-grade JavaScript linting rules
 */

module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // Error Prevention
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'off', // Allow console for server logs
    'no-debugger': 'error',

    // Code Style
    'indent': ['warn', 2, { SwitchCase: 1 }],
    'linebreak-style': ['warn', 'unix'],
    'quotes': ['warn', 'single', { avoidEscape: true }],
    'semi': ['warn', 'always'],

    // Best Practices
    'eqeqeq': ['error', 'always', { null: 'ignore' }],
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-return-await': 'warn',
    'require-await': 'warn',

    // Security
    'no-script-url': 'error',
    'no-new-wrappers': 'error',

    // Code Quality
    'no-var': 'error',
    'prefer-const': 'warn',
    'prefer-template': 'warn',
    'object-shorthand': 'warn',

    // Complexity
    'max-depth': ['warn', 4],
    'max-lines-per-function': ['warn', { max: 100, skipBlankLines: true, skipComments: true }],
    'complexity': ['warn', 15]
  },
  ignorePatterns: [
    'node_modules/',
    'vscode-extension/',
    'coverage/',
    '*.min.js',
    'public/index.html'
  ]
};
