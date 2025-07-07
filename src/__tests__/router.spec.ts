import { beforeEach, describe, expect, test } from 'vitest';
import { setActivePinia } from 'pinia';
import { RouteLocationNormalized } from 'vue-router';
import { createVitestPinia } from './pinia';
import { isLoggedIn } from '@/router';
import { UserModel } from '@/models/UserModel';
import { useUserStore } from '@/composables/UserStore';

describe('Router', () => {
  beforeEach(() => {
    setActivePinia(createVitestPinia());
  });

  test('should not allow to navigate if user is not logged in', async () => {
    const userStore = useUserStore();
    userStore.userModel = null;
    let guardResult = await isLoggedIn({ name: 'races' } as RouteLocationNormalized);

    // You can directly return '/'
    expect(guardResult).toBe('/');

    guardResult = await isLoggedIn({ name: 'bet' } as RouteLocationNormalized);

    // You can directly return '/'
    expect(guardResult).toBe('/');

    guardResult = await isLoggedIn({ name: 'live' } as RouteLocationNormalized);

    // You can directly return '/'
    expect(guardResult).toBe('/');
  });

  test('should allow to navigate if user is logged in', async () => {
    const userStore = useUserStore();
    userStore.userModel = { login: 'cedric' } as UserModel;
    let guardResult = await isLoggedIn({ name: 'races' } as RouteLocationNormalized);

    // You can return true to allow the navigation
    expect(guardResult).toBe(true);

    guardResult = await isLoggedIn({ name: 'bet' } as RouteLocationNormalized);

    // You can return true to allow the navigation
    expect(guardResult).toBe(true);

    guardResult = await isLoggedIn({ name: 'live' } as RouteLocationNormalized);
  });

  test('should allow to navigate if navigating to home, login or register anonymously', async () => {
    const userStore = useUserStore();
    userStore.userModel = null;
    let guardResult = await isLoggedIn({ name: 'home' } as RouteLocationNormalized);

    // You can return true to allow the navigation
    expect(guardResult).toBe(true);

    guardResult = await isLoggedIn({ name: 'login' } as RouteLocationNormalized);

    // You can return true to allow the navigation
    expect(guardResult).toBe(true);

    guardResult = await isLoggedIn({ name: 'register' } as RouteLocationNormalized);

    // You can return true to allow the navigation
    expect(guardResult).toBe(true);
  });
});
