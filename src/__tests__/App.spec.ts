/* eslint-disable vue/one-component-per-file */
import { describe, expect, test, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { injectRouterMock, RouterMock } from 'vue-router-mock';
import { createVitestRouterMock } from './router-mock';
import { createVitestPinia } from './pinia';
import App from '@/App.vue';
import Navbar from '@/components/Navbar.vue';
import Alert from '@/components/Alert.vue';

const HelloComponent = defineComponent({
  async setup() {
    await Promise.resolve();
    return {};
  },
  template: 'Hello'
});
const ErrorComponent = defineComponent({
  async setup() {
    await Promise.reject(new Error('Oops'));
  },
  template: 'Error'
});
let mockRouter: RouterMock;

function appWrapper(stubs = {}) {
  mockRouter = createVitestRouterMock({
    routes: [
      { path: '/', component: HelloComponent },
      { path: '/error', component: ErrorComponent }
    ]
  });
  injectRouterMock(mockRouter);
  return mount(App, {
    global: {
      plugins: [
        createVitestPinia({
          stubActions: false
        })
      ],
      components: {
        Alert
      },
      stubs
    }
  });
}

describe('App.vue', () => {
  test('renders the navbar', () => {
    const wrapper = appWrapper();
    const navbar = wrapper.findComponent(Navbar);

    // Maybe you forgot to add <Navbar/> in your App.vue component
    expect(navbar.exists()).toBe(true);
  });

  test('renders the router view inside a Suspense component', async () => {
    const wrapper = appWrapper({
      RouterView: false
    });
    await mockRouter.push('/');

    expect(wrapper.html()).toContain('Loading');

    await flushPromises();

    expect(wrapper.html()).not.toContain('Loading');
    expect(wrapper.html()).toContain('Hello');
  });

  test('renders an error if router view does not load', async () => {
    vi.spyOn(console, 'warn').mockReturnValue();
    const wrapper = appWrapper({
      Alert: defineComponent({
        // eslint-disable-next-line vue/require-prop-types
        props: ['variant', 'dismissible'],
        emits: ['dismissed'],
        template: '<slot></slot>'
      }),
      RouterView: false
    });
    await mockRouter.push('/error');

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
