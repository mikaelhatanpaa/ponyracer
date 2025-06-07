import pluginVue from 'eslint-plugin-vue';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import pluginVitest from '@vitest/eslint-plugin';
// @ts-expect-error eslint-plugin-cypress/flat does not have types
import pluginCypress from 'eslint-plugin-cypress/flat';
import vueEslintConfigPrettier from '@vue/eslint-config-prettier';
import * as tsParser from '@typescript-eslint/parser';

export default defineConfigWithVueTs([
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}']
  },
  {
    name: 'app/files-to-ignore',
    ignores: ['dist', 'coverage', 'results']
  },
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.strict,
  vueTsConfigs.stylisticTypeChecked,
  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*']
  },
  {
    ...pluginCypress.configs.recommended,
    files: ['cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}', 'cypress/support/**/*.{js,ts,jsx,tsx}']
  },
  {
    rules: {
      '@typescript-eslint/array-type': [
        'error',
        {
          default: 'generic',
          readonly: 'generic'
        }
      ],
      '@typescript-eslint/no-deprecated': 'error',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'vue/attribute-hyphenation': 'off',
      'vue/attributes-order': 'off',
      'vue/define-emits-declaration': 'error',
      'vue/define-props-declaration': 'error',
      'vue/v-on-event-hyphenation': 'off',
      'vue/multi-word-component-names': 'off'
    }
  },
  {
    languageOptions: {
      parserOptions: {
        project: ['tsconfig.app.json', 'tsconfig.vitest.json', 'tsconfig.node.json', 'cypress/tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
        parser: tsParser,
        extraFileExtensions: ['.vue']
      }
    }
  },
  vueEslintConfigPrettier
]);
