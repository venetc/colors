import antfu from '@antfu/eslint-config';

export default antfu({
  ignores: ['**/*.svg'],
  rules: {
    'style/semi': 'off',
    'style/brace-style': 'off',
    'import/order': [
      'warn',
      {
        'newlines-between': 'always',
        'groups': [
          'index',
          'sibling',
          'parent',
          'internal',
          'external',
          'builtin',
          'object',
          'type',
        ],
      },
    ],
    'style/member-delimiter-style': [
      'warn',
      {
        multiline: {
          delimiter: 'semi',
          requireLast: true,
        },

        singleline: {
          delimiter: 'semi',
          requireLast: false,
        },
        multilineDetection: 'brackets',
      },
    ],
    'ts/ban-ts-comment': 'off',
    'style/indent': [
      'warn',
      2,
    ],
    'no-console': 'off',
    'antfu/if-newline': 'off',
    'curly': [
      'off',
      'multi',
      'consistent',
    ],
    'vue/max-attributes-per-line': [
      'error',
      {
        singleline: {
          max: 1,
        },
        multiline: {
          max: 1,
        },
      },
    ],
    'vue/attribute-hyphenation': [
      'warn',
      'never',
    ],
    'vue/valid-v-model': [
      'off',
    ],
    'vue/v-on-event-hyphenation': [
      'warn',
      'never',
      {
        autofix: true,
      },
    ],
    'ts/semi': [
      'warn',
      'always',
    ],
  },
});
