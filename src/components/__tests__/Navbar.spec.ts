import { beforeEach, describe, expect, test, vi } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import { getRouter, injectRouterMock } from 'vue-router-mock';
import { createVitestRouterMock } from '@/__tests__/router-mock';
import Navbar from '@/components/Navbar.vue';
import { UserModel } from '@/models/UserModel';
import { useUserService } from '@/composables/UserService';

let mockUserService: ReturnType<typeof useUserService>;
vi.mock('@/composables/UserService', () => ({
  useUserService: () => mockUserService
}));
const router = createVitestRouterMock();

function navbarWrapper() {
  injectRouterMock(router);
  return mount(Navbar, {
    global: {
      stubs: {
        RouterLink: RouterLinkStub
      }
    }
  });
}

describe('Navbar.vue', () => {
  beforeEach(() => {
    mockUserService = {
      userModel: ref<UserModel | null>(null),
      logoutAndForget: vi.fn() as () => void
    } as ReturnType<typeof useUserService>;
  });

  test('should toggle the class on click', async () => {
    const wrapper = navbarWrapper();
    const navbarCollapsed = wrapper.get('#navbar').element;

    // The element with the id `#navbar` should have the class `collapse`
    expect(navbarCollapsed.className).toContain('navbar-collapse collapse');

    // We should have a `button` element to collapse the menu
    const button = wrapper.get('button');
    await button.trigger('click');

    const navbar = wrapper.get('#navbar').element;

    // The element with the id `#navbar` should have not the class `collapse` after a click
    expect(navbar.className).toContain('navbar-collapse');
    expect(navbar.className).not.toContain('navbar-collapse collapse');
  });

  test('should display a link to the home page', () => {
    const wrapper = navbarWrapper();
    // The navbar brand should link to the home page
    const navbarBrand = wrapper.getComponent(RouterLinkStub);

    expect(navbarBrand.text()).toBe('PonyRacer');

    // The URL of the link is not correct.
    // Maybe you forgot to use `<RouterLink to="/">` or `<RouterLink :to="{ name: 'home' }">`?
    const to = navbarBrand.props().to;
    if (typeof to === 'object') {
      expect(to.name).toBe('home');
    } else {
      expect(to).toBe('/');
    }
  });

  test('should display a link to the races page', async () => {
    const wrapper = navbarWrapper();
    const linksNotLogged = wrapper.findAllComponents(RouterLinkStub);

    // You should have only one link in the navbar if the user is not logged
    expect(linksNotLogged).toHaveLength(1);

    // if the user is logged in
    mockUserService.userModel.value = {
      login: 'cedric',
      money: 200,
      birthYear: 1986,
      password: ''
    } as UserModel;
    await nextTick();

    const links = wrapper.findAllComponents(RouterLinkStub);

    // You should have only two links in the navbar if the user is logged
    expect(links).toHaveLength(2);

    const racesLink = links[1];

    // The races link should link to the races page
    expect(racesLink.exists()).toBe(true);
    expect(racesLink.text()).toBe('Races');

    // The URL of the link is not correct.
    // Maybe you forgot to use `<RouterLink to="/races">` or `<RouterLink :to="{ name: 'races' }">`?
    const to = racesLink.props().to;
    if (typeof to === 'object') {
      expect(to.name).toBe('races');
    } else {
      expect(to).toBe('/races');
    }
  });

  test('should display the logged in user', async () => {
    const wrapper = navbarWrapper();

    // if the user is logged in
    mockUserService.userModel.value = {
      login: 'cedric',
      money: 200,
      birthYear: 1986,
      password: ''
    } as UserModel;
    await nextTick();

    // You should have a `span` element with the classes `navbar-text me-2` and the ID `current-user` to display the user info
    const info = wrapper.get('#current-user');

    // You should display the user's name in a `span` element
    expect(info.text()).toContain('cedric');
    // You should display the user's score in a `span` element
    expect(info.text()).toContain('200');

    // and react to changes
    mockUserService.userModel.value.money = 300;
    await nextTick();

    // You should display the user's score in a `span` element
    expect(info.text()).toContain('300');
  });

  test('should logout the user', async () => {
    const wrapper = navbarWrapper();
    const mockRouter = getRouter();

    // if the user is not logged in
    mockUserService.userModel.value = null;
    await nextTick();

    // You should not have a link to logout the user if he/she is not logged in
    expect(wrapper.find('#logout-link').exists()).toBe(false);

    // if the user is logged in
    mockUserService.userModel.value = {
      login: 'cedric',
      money: 200,
      birthYear: 1986,
      password: ''
    } as UserModel;
    await nextTick();

    // You should have an `a` link to logout the user
    const link = wrapper.get('a#logout-link.nav-link');

    // You should display the logout icon in the link
    expect(link.find('span.fa.fa-power-off').exists()).toBe(true);

    // click on the logout link
    link.trigger('click');

    // should call the `logoutAndForget` function from `useUserService`
    expect(mockUserService.logoutAndForget).toHaveBeenCalled();
    // and redirect to the home page
    expect(mockRouter.push).toHaveBeenCalled();
  });
});
