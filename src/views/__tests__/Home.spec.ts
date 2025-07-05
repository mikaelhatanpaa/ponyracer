import { beforeEach, describe, expect, test, vi } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import Home from '@/views/Home.vue';
import { UserModel } from '@/models/UserModel';
import { useUserService } from '@/composables/UserService';

let mockUserService: ReturnType<typeof useUserService>;
vi.mock('@/composables/UserService', () => ({
  useUserService: () => mockUserService
}));

function homeWrapper() {
  return mount(Home, {
    global: {
      stubs: {
        RouterLink: RouterLinkStub
      }
    }
  });
}

describe('Home.vue', () => {
  beforeEach(() => {
    mockUserService = {
      userModel: ref<UserModel | null>(null)
    } as ReturnType<typeof useUserService>;
  });

  test('should display every race name in a title', () => {
    const wrapper = homeWrapper();

    // You should have an `h1` element to display the title
    const title = wrapper.get('h1');

    expect(title.text()).toContain('Ponyracer');
    // You should have the `small` element inside the `h1` element
    expect(title.text()).toContain('Always a pleasure to bet on ponies');

    // You should have a `small` element to display the subtitle
    const subtitle = wrapper.get('small');

    expect(subtitle.text()).toBe('Always a pleasure to bet on ponies');
  });

  test('display a link to go the login', () => {
    const wrapper = homeWrapper();

    // You should have an `a` element to display the link to the login page
    const link = wrapper.getComponent(RouterLinkStub);

    // The link should have a text
    expect(link.text()).toBe('Login');

    // The URL of the link is not correct.
    // Maybe you forgot to use `<RouterLink to="/login">` or `<RouterLink :to="{ name: 'login' }">`?
    const to = link.props().to;
    if (typeof to === 'object') {
      expect(to.name).toBe('login');
    } else {
      expect(to).toBe('/login');
    }
  });

  test('display a link to go the register page', () => {
    const wrapper = homeWrapper();

    const link = wrapper.findAllComponents(RouterLinkStub)[1];

    // You should have an `a` element to display the link to the register page
    expect(link.exists()).toBe(true);
    // The link should have a text
    expect(link.text()).toBe('Register');

    // The URL of the link is not correct.
    // Maybe you forgot to use `<RouterLink to="/register">` or `<RouterLink :to="{ name: 'register' }">`?
    const to = link.props().to;
    if (typeof to === 'object') {
      expect(to.name).toBe('register');
    } else {
      expect(to).toBe('/register');
    }
  });

  test('display a link to go the races page if the user is logged in', async () => {
    const wrapper = homeWrapper();

    // if the user is logged in
    mockUserService.userModel.value = {
      login: 'cedric',
      money: 200,
      birthYear: 1986,
      password: ''
    } as UserModel;
    await nextTick();

    const links = wrapper.findAllComponents(RouterLinkStub);

    // You should have only one link to the races when user is logged in
    expect(links).toHaveLength(1);

    const link = links[0];

    // You should have an `a` element to display the link to the races page
    expect(link.exists()).toBe(true);
    // The link should have a text
    expect(link.text()).toBe('Races');

    // The URL of the link is not correct.
    // Maybe you forgot to use `<RouterLink to="/races">` or `<RouterLink :to="{ name: 'races' }">`?
    const to = link.props().to;
    if (typeof to === 'object') {
      expect(to.name).toBe('races');
    } else {
      expect(to).toBe('/races');
    }
  });
});
