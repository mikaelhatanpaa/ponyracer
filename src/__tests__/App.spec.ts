import { describe, expect, test } from 'vitest';
import { mount } from '@vue/test-utils';
import App from '@/App.vue';
import Navbar from '@/components/Navbar.vue';

describe('App.vue', () => {
  test('renders a title', () => {
    const wrapper = mount(App);

    expect(wrapper.get('h1').text()).toBe('Ponyracer');
  });

  test('renders the navbar', () => {
    const wrapper = mount(App);
    const navbar = wrapper.findComponent(Navbar);

    expect(navbar.exists()).toBe(true);
  });
});
