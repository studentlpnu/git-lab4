import js from '@eslint/js';
import globals from 'globals';
import pluginVue from 'eslint-plugin-vue';
import prettierConfig from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      // Заборона невикористаних змінних 
      'no-unused-vars': ['error', { vars: 'all', args: 'after-used', ignoreRestSiblings: false }],
      // Заборона використання console.log 
      'no-console': 'warn',
      // Обов'язкові крапки з комою
      'semi': ['error', 'always'],
      // Використання одинарних лапок
      'quotes': ['error', 'single'],
    },
  },
  prettierConfig, // Вимикає правила, які конфліктують з Prettier
];