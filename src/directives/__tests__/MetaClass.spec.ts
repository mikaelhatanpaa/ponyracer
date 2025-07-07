import { describe, expect, test } from 'vitest';
import { defineComponent } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { defineRule, ErrorMessage, Field, Form } from 'vee-validate';
import { vMetaClass } from '../MetaClass';

const Test = defineComponent({
  directives: {
    metaClass: vMetaClass
  },
  components: {
    ErrorMessage,
    Field,
    // eslint-disable-next-line vue/no-reserved-component-names
    Form
  },
  setup() {
    defineRule('required', (value: string) => !!value || 'Required');
  },
  template: `
    <Form>
      <Field name="login" rules="required" v-slot="{ field, meta }">
        <input class="form-control" v-bind="field" v-meta-class:foo="meta" />
        <ErrorMessage name="login" class="is-invalid" />
      </Field>
    </Form>
  `
});

describe('MetaClass', () => {
  test('should add/remove a class', async () => {
    const wrapper = mount(Test);
    const input = wrapper.get('input');

    expect(input.classes()).toContain('form-control');
    expect(input.classes()).not.toContain('foo');
    expect(wrapper.find('.is-invalid').exists()).toBe(false);

    // fill the input with a valid value
    await input.setValue('foo');
    await flushPromises();

    expect(input.classes()).toContain('form-control');
    expect(input.classes()).not.toContain('foo');
    expect(wrapper.find('.is-invalid').exists()).toBe(false);

    // clear the input
    // this makes the field invalid
    await input.setValue('');
    await flushPromises();

    expect(input.classes()).toContain('form-control');
    expect(input.classes()).toContain('foo');
    expect(wrapper.find('.is-invalid').exists()).toBe(true);

    // fill the input again with a valid value
    await input.setValue('foo');
    await flushPromises();

    expect(input.classes()).toContain('form-control');
    expect(input.classes()).not.toContain('foo');
    expect(wrapper.find('.is-invalid').exists()).toBe(false);
  });
});
