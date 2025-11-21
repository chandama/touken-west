// ESLint Security Configuration for Touken West
// This configuration adds security-focused linting rules
//
// To use this, either:
// 1. Rename to .eslintrc.js (replacing existing)
// 2. Merge these rules into your existing .eslintrc.js
// 3. Extend this in your .eslintrc.js: "extends": ["./.eslintrc.security.js"]

module.exports = {
  extends: [
    'react-app',
    'plugin:security/recommended'
  ],
  plugins: [
    'security'
  ],
  rules: {
    // Security-specific rules
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-regexp': 'warn',
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'warn',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-no-csrf-before-method-override': 'warn',
    'security/detect-non-literal-fs-filename': 'warn',
    'security/detect-non-literal-require': 'warn',
    'security/detect-possible-timing-attacks': 'warn',
    'security/detect-pseudoRandomBytes': 'error',

    // React security best practices
    'react/no-danger': 'error', // Prevent dangerouslySetInnerHTML
    'react/no-danger-with-children': 'error',

    // General code quality that helps security
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

    // Console statements (should be removed in production)
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-alert': 'warn',

    // Strict mode
    'strict': ['error', 'global'],

    // Prevent prototype pollution
    'no-proto': 'error',
    'no-extend-native': 'error',
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/*.spec.js'],
      rules: {
        // Relax some rules for test files
        'no-console': 'off',
        'security/detect-object-injection': 'off',
      }
    }
  ]
};
