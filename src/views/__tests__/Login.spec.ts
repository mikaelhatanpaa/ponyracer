import { describe, expect, test, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { getRouter, injectRouterMock } from 'vue-router-mock';
import { createVitestRouterMock } from '@/__tests__/router-mock';
import { createVitestPinia } from '@/__tests__/pinia';
import Login from '@/views/Login.vue';
import Alert from '@/components/Alert.vue';
import { useUserStore } from '@/composables/UserStore';

const router = createVitestRouterMock();

async function loginWrapper() {
  injectRouterMock(router);
  const wrapper = mount(Login, {
    global: {
      plugins: [createVitestPinia()],
      components: {
        Alert
      }
    }
  });
  await flushPromises();
  return wrapper;
}

describe('Login.vue', () => {
  test('should display a form', async () => {
    const wrapper = await loginWrapper();

    // The template should display an input for the login
    expect(wrapper.find('input').exists()).toBe(true);
    // The template should display an input of type password for the password
    expect(wrapper.find('input[type=password]').exists()).toBe(true);

    // The template should display a submit button
    const button = wrapper.get('button');

    // Your submit button should be disabled if the form is not dirty or not valid
    expect(button.attributes('disabled')).toBeDefined();
  });

  test('should display errors for login', async () => {
    const wrapper = await loginWrapper();

    const loginInput = wrapper.get('input');

    // The login input should not have the CSS class is-invalid when not dirty
    expect(loginInput.classes()).not.toContain('is-invalid');
    // The login field error should not be displayed when not dirty
    expect(wrapper.find('.invalid-feedback').exists()).toBe(false);

    // The login label should not have the CSS class text-danger when not dirty
    const label = wrapper.findAll('label')[0];

    expect(label.classes()).not.toContain('text-danger');

    await loginInput.setValue('cedric');
    await flushPromises();
    await loginInput.setValue('');
    await flushPromises();
    // The login field should display an error
    const loginError = wrapper.get('.invalid-feedback');

    expect(loginError.text()).toContain('The login is required');
    // The login input should have the CSS class is-invalid when in error
    expect(loginInput.classes()).toContain('is-invalid');
    // The login label should have the CSS class text-danger when in error
    expect(label.classes()).toContain('text-danger');

    await loginInput.setValue('cedric');
    await flushPromises();

    // The login field error should not be displayed
    expect(wrapper.find('.invalid-feedback').exists()).toBe(false);
    // The login input should not have the CSS class is-invalid when not in error
    expect(loginInput.classes()).not.toContain('is-invalid');
    // The login label should not have the CSS class text-danger when not in error
    expect(label.classes()).not.toContain('text-danger');
  });

  test('should display errors for password', async () => {
    const wrapper = await loginWrapper();

    const passwordInput = wrapper.get('input[type=password]');

    // The password input should not have the CSS class is-invalid when not dirty
    expect(passwordInput.classes()).not.toContain('is-invalid');
    // The password field error should not be displayed when not dirty
    expect(wrapper.find('.invalid-feedback').exists()).toBe(false);

    // The password label should not have the CSS class text-danger when not dirty
    const label = wrapper.findAll('label')[1];

    expect(label.classes()).not.toContain('text-danger');

    await passwordInput.setValue('password');
    await flushPromises();
    await passwordInput.setValue('');
    await flushPromises();
    // The password field should display an error
    const passwordError = wrapper.get('.invalid-feedback');

    expect(passwordError.text()).toContain('The password is required');
    // The password input should have the CSS class is-invalid when in error
    expect(passwordInput.classes()).toContain('is-invalid');
    // The password label should have the CSS class text-danger when in error
    expect(label.classes()).toContain('text-danger');

    await passwordInput.setValue('password');
    await flushPromises();

    // The password field error should not be displayed
    expect(wrapper.find('.invalid-feedback').exists()).toBe(false);
    // The password input should not have the CSS class is-invalid when not in error
    expect(passwordInput.classes()).not.toContain('is-invalid');
    // The password label should not have the CSS class text-danger when not in error
    expect(label.classes()).not.toContain('text-danger');
  });

  test('should call the authenticate function on submit', async () => {
    const wrapper = await loginWrapper();
    const mockRouter = getRouter();

    // Fill all values
    const loginInput = wrapper.get('input');
    await loginInput.setValue('cedric');
    const passwordInput = wrapper.get('input[type=password]');
    await passwordInput.setValue('password');
    await flushPromises();

    // No error
    const errors = wrapper.findAll('.invalid-feedback');

    expect(errors).toHaveLength(0);

    // You should have a `button` to submit
    const submitButton = wrapper.get('button');

    // Your submit button should not be disabled if the form is valid
    expect(submitButton.attributes('disabled')).toBeUndefined();

    await submitButton.trigger('submit');
    await flushPromises();
    // You may have forgotten the submit handler on the `form` element
    // or to call the `authenticate` function in the submit handler
    const userStore = useUserStore();

    expect(userStore.authenticate).toHaveBeenCalled();

    await flushPromises();

    // It should redirect to home after a submission success
    expect(mockRouter.push).toHaveBeenCalled();

    const alert = wrapper.findComponent(Alert);

    // An alert should not be displayed on login success
    expect(alert.exists()).toBe(false);
  });

  test('should display an alert on submission failure', async () => {
    const wrapper = await loginWrapper();
    const userStore = useUserStore();
    vi.mocked(userStore.authenticate).mockRejectedValue(new Error('Authentication failed'));
    const mockRouter = getRouter();

    // Fill all values
    const loginInput = wrapper.get('input');
    await loginInput.setValue('cedric');
    const passwordInput = wrapper.get('input[type=password]');
    await passwordInput.setValue('password');
    await flushPromises();

    // You should have a `button` to submit
    const submitButton = wrapper.get('button');
    await submitButton.trigger('submit');
    await flushPromises();

    // You may have forgotten the submit handler on the `form` element
    // or to call the `authenticate` function in the submit handler
    expect(userStore.authenticate).toHaveBeenCalled();

    await flushPromises();

    // It should not redirect to home after a submission failure
    expect(mockRouter.push).not.toHaveBeenCalled();

    const alert = wrapper.findComponent(Alert);

    // An alert should be displayed on login failure
    expect(alert.exists()).toBe(true);

    const closeButton = alert.get('button');
    await closeButton.trigger('click');

    // The alert should be closable
    expect(wrapper.findComponent(Alert).exists()).toBe(false);
  });
});
