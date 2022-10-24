module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'jest'],
  extends: ['standard', 'plugin:@typescript-eslint/recommended'],
  rules: {
    'no-use-before-define': 0,
    'no-unused-vars': 'off',
    camelcase: 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    indent: 'off',
    '@typescript-eslint/indent': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', args: 'after-used' }],
    '@typescript-eslint/no-empty-function': 0,
    '@typescript-eslint/no-use-before-define': ['warn', { functions: false, classes: false }],
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/interface-name-prefix': 0,
    '@typescript-eslint/member-delimiter-style': 0,
    '@typescript-eslint/camelcase': 0,
    '@typescript-eslint/no-namespace': 0,
    '@typescript-eslint/ban-ts-comment': 0,
    'standard/no-callback-literal': 0,
    'import/no-extraneous-dependencies': ['error'],
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'prefer-spread': 0,
    'prefer-rest-params': 0,
    'no-prototype-builtins': 0,
    'no-unused-expressions': 0,
    'comma-dangle': ['error', 'always-multiline'],
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always',
      },
    ],
    'generator-star-spacing': 0,
    'no-process-env': ['error'],
  },
}
