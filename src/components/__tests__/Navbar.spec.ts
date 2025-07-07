import { describe, expect, test } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import { nextTick } from 'vue';
import { getRouter, injectRouterMock } from 'vue-router-mock';
import { createVitestRouterMock } from '@/__tests__/router-mock';
import { createVitestPinia } from '@/__tests__/pinia';
import Navbar from '@/components/Navbar.vue';
import { UserModel } from '@/models/UserModel';
import { useUserStore } from '@/composables/UserStore';

const router = createVitestRouterMock();

async function navbarWrapper() {
  injectRouterMock(router);
  const wrapper = mount(Navbar, {
    global: {
      plugins: [createVitestPinia()],
      stubs: {
        RouterLink: RouterLinkStub
      }
    }
  });
  const userStore = useUserStore();
  userStore.userModel = null;
  await nextTick();
  return wrapper;
}

describe('Navbar.vue', () => {
  test('should toggle the class on click', async () => {
    const wrapper = await navbarWrapper();
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

  test('should display a link to the home page', async () => {
    const wrapper = await navbarWrapper();
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
    const wrapper = await navbarWrapper();
    const linksNotLogged = wrapper.findAllComponents(RouterLinkStub);

    // You should have only one link in the navbar if the user is not logged
    expect(linksNotLogged).toHaveLength(1);

    // if the user is logged in
    const userStore = useUserStore();
    userStore.userModel = {
      login: 'cedric',
      money: 200,
      birthYear: 1986,
      password: ''
    } as UserModel;
    await nextTick();

    const links = wrapper.findAllComponents(RouterLinkStub);

    // You should have only three links in the navbar if the user is logged
    expect(links).toHaveLength(3);

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
    const wrapper = await navbarWrapper();

    // if the user is logged in
    const userStore = useUserStore();
    userStore.userModel = {
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
    userStore.userModel.money = 3000;
    await nextTick();

    // You should display the user's score in a `span` element
    expect(info.text()).toContain('3000');
  });

  test('should logout the user', async () => {
    const wrapper = await navbarWrapper();
    const mockRouter = getRouter();

    // You should not have a link to logout the user if he/she is not logged in
    expect(wrapper.find('#logout-link').exists()).toBe(false);

    // if the user is logged in
    const userStore = useUserStore();
    userStore.userModel = {
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

    // should call the `logoutAndForget` function from `useUserStore`
    expect(userStore.logoutAndForget).toHaveBeenCalled();
    // and redirect to the home page
    expect(mockRouter.push).toHaveBeenCalled();
  });
});
