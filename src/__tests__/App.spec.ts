/* eslint-disable vue/one-component-per-file */
import { describe, expect, test, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import App from '@/App.vue';
import Navbar from '@/components/Navbar.vue';
import Alert from '@/components/Alert.vue';

function appWrapper(stubs = {}) {
  return mount(App, {
    global: {
      components: {
        Alert
      },
      stubs
    }
  });
}

describe('App.vue', () => {
  test('renders a title', () => {
    const wrapper = appWrapper();

    expect(wrapper.get('h1').text()).toBe('Ponyracer');
  });

  test('renders the navbar', () => {
    const wrapper = appWrapper();
    const navbar = wrapper.findComponent(Navbar);

    // Maybe you forgot to add <Navbar/> in your App.vue component
    expect(navbar.exists()).toBe(true);
  });

  test('renders the races list inside a Suspense component', async () => {
    const wrapper = appWrapper({
      Races: defineComponent({
        async setup() {
          return { result: 'Hello' };
        },
        template: '<div>{{ result }}</div>'
      })
    });

    expect(wrapper.html()).toContain('Loading');

    await flushPromises();

    expect(wrapper.html()).not.toContain('Loading');
    expect(wrapper.html()).toContain('Hello');
  });

  test('renders an error if races list does not load', async () => {
    vi.spyOn(console, 'warn').mockReturnValue();
    const wrapper = appWrapper({
      Alert: defineComponent({
        // eslint-disable-next-line vue/require-prop-types
        props: ['variant', 'dismissible'],
        emits: ['dismissed'],
        template: '<slot></slot>'
      }),
      Races: defineComponent({
        async setup() {
          await Promise.reject(new Error('Oops'));
        },
        template: '<div>Error</div>'
      })
    });

    expect(wrapper.html()).toContain('Loading');

    await flushPromises();

    expect(wrapper.html()).not.toContain('Loading');
    expect(wrapper.html()).toContain('An error occurred');

    // The alert should be dismissed when the user clicks on it
    const alert = wrapper.findComponent(Alert);
    await alert.vm.$emit('dismissed');

    expect(wrapper.html()).not.toContain('An error occurred');
  });
});
