import { configure, defineRule } from 'vee-validate';
import { confirmed, min, min_value, required } from '@vee-validate/rules';
import { localize } from '@vee-validate/i18n';

export function useForms() {
  defineRule('confirmed', confirmed);
  defineRule('required', required);
  defineRule('min', min);
  defineRule('min_value', min_value);
  configure({
    validateOnInput: true,
    generateMessage: localize('en', {
      messages: {
        required: 'The {field} is required.',
        min_value: 'The {field} must be 0:{min} or more.',
        min: 'The {field} must be at least 0:{min} characters.',
        confirmed: 'The {field} does not match.'
      }
    })
  });
}
