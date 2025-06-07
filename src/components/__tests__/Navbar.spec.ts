import { describe, expect, test } from 'vitest';
import { mount } from '@vue/test-utils';
import Navbar from '@/components/Navbar.vue';

describe('Navbar.vue', () => {
  test('should toggle the class on click', async () => {
    const wrapper = mount(Navbar);
    const navbarCollapsed = wrapper.get('#navbar').element!;

    expect(navbarCollapsed.className).toContain('navbar-collapse collapse');

    const button = wrapper.get('button');
    await button.trigger('click');

    const navbar = wrapper.get('#navbar').element!;

    expect(navbar.className).toContain('navbar-collapse');
    expect(navbar.className).not.toContain('navbar-collapse collapse');
  });
});
