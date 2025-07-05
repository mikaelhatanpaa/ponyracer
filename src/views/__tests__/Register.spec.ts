import { describe, expect, test, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { getRouter, injectRouterMock } from 'vue-router-mock';
import { createVitestRouterMock } from '@/__tests__/router-mock';
import { createVitestPinia } from '@/__tests__/pinia';
import { useUserStore } from '@/composables/UserStore';
import Register from '@/views/Register.vue';
import Alert from '@/components/Alert.vue';

const router = createVitestRouterMock();

async function registerWrapper() {
  injectRouterMock(router);
  const wrapper = mount(Register, {
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

describe('Register.vue', () => {
  test('should display a form', async () => {
    const wrapper = await registerWrapper();

    // The template should display an input for the login
    expect(wrapper.find('input').exists()).toBe(true);
    // The template should display an input of type password for the password
    expect(wrapper.find('input[type=password]').exists()).toBe(true);
    // The template should display an input of type number for the birth year
    expect(wrapper.find('input[type=number]').exists()).toBe(true);

    // The template should display a submit button
    const button = wrapper.get('button');

    // Your submit button should be disabled if the form is not dirty or not valid
    expect(button.attributes('disabled')).toBeDefined();
  });

  test('should display errors for login', async () => {
    const wrapper = await registerWrapper();

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

    await loginInput.setValue('ce');
    await flushPromises();

    // The login field should display an error
    expect(loginError.text()).toContain('The login must be at least 3 characters');
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
    const wrapper = await registerWrapper();

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
    const confirmPasswordInput = wrapper.findAll('input[type=password]')[1];
    await confirmPasswordInput.setValue('password');
    await flushPromises();

    // The password field error should not be displayed
    expect(wrapper.find('.invalid-feedback').exists()).toBe(false);
    // The password input should not have the CSS class is-invalid when not in error
    expect(passwordInput.classes()).not.toContain('is-invalid');
    // The password label should not have the CSS class text-danger when not in error
    expect(label.classes()).not.toContain('text-danger');
  });

  test('should display errors for password confirmation', async () => {
    const wrapper = await registerWrapper();

    const passwordInput = wrapper.findAll('input[type=password]')[0];
    const confirmPasswordInput = wrapper.findAll('input[type=password]')[1];

    // The confirm password input should not have the CSS class is-invalid when not dirty
    expect(confirmPasswordInput.classes()).not.toContain('is-invalid');
    // The confirm password field error should not be displayed when not dirty
    expect(wrapper.find('.invalid-feedback').exists()).toBe(false);

    // The confirm password label should not have the CSS class text-danger when not dirty
    const label = wrapper.findAll('label')[2];

    expect(label.classes()).not.toContain('text-danger');

    await confirmPasswordInput.setValue('password');
    await flushPromises();
    // The confirm password field should display an error
    const confirmPasswordError = wrapper.get('.invalid-feedback');

    expect(confirmPasswordError.text()).toContain('The password confirmation does not match');
    // The confirm password input should have the CSS class is-invalid when in error
    expect(confirmPasswordInput.classes()).toContain('is-invalid');
    // The confirm password label should have the CSS class text-danger when in error
    expect(label.classes()).toContain('text-danger');

    await confirmPasswordInput.setValue('');
    await flushPromises();

    // The confirm password field should display an error
    expect(confirmPasswordError.text()).toContain('The password confirmation is required');
    // The confirm password input should have the CSS class is-invalid when in error
    expect(confirmPasswordInput.classes()).toContain('is-invalid');
    // The confirm password label should have the CSS class text-danger when in error
    expect(label.classes()).toContain('text-danger');

    await passwordInput.setValue('password');
    await confirmPasswordInput.setValue('password');
    await flushPromises();

    // The confirm password field error should not be displayed
    expect(wrapper.find('.invalid-feedback').exists()).toBe(false);
    // The confirm password input should not have the CSS class is-invalid when not in error
    expect(confirmPasswordInput.classes()).not.toContain('is-invalid');
    // The confirm password label should not have the CSS class text-danger when not in error
    expect(label.classes()).not.toContain('text-danger');
  });

  test('should display errors for birthYear', async () => {
    const wrapper = await registerWrapper();

    const birthYearInput = wrapper.get<HTMLInputElement>('input[type=number]');

    // the birthYear input should be initialized with the current year minus 18
    // use `initialValues` on `Form` to do so
    expect(birthYearInput.element.value).toBe(`${new Date().getFullYear() - 18}`);
    // The birthYear input should not have the CSS class is-invalid when not dirty
    expect(birthYearInput.classes()).not.toContain('is-invalid');
    // The birthYear field error should not be displayed when not dirty
    expect(wrapper.find('.invalid-feedback').exists()).toBe(false);

    // The birthYear label should not have the CSS class text-danger when not dirty
    const label = wrapper.findAll('label')[3];

    expect(label.classes()).not.toContain('text-danger');

    await birthYearInput.setValue(1986);
    await flushPromises();
    await birthYearInput.setValue('');
    await flushPromises();
    // The birthYear field should display an error
    const birthYearError = wrapper.get('.invalid-feedback');

    expect(birthYearError.text()).toContain('The birth year is required');
    // The birthYear input should have the CSS class is-invalid when in error
    expect(birthYearInput.classes()).toContain('is-invalid');
    // The birthYear label should have the CSS class text-danger when in error
    expect(label.classes()).toContain('text-danger');

    await birthYearInput.setValue(1899);
    await flushPromises();

    // The birthYear field should display an error if the year is before 1900
    expect(birthYearError.text()).toContain('The birth year must be 1900 or more');
    // The birthYear input should have the CSS class is-invalid when in error
    expect(birthYearInput.classes()).toContain('is-invalid');
    // The birthYear label should have the CSS class text-danger when in error
    expect(label.classes()).toContain('text-danger');

    await birthYearInput.setValue(new Date().getFullYear() - 17);
    await flushPromises();

    // The birthYear field should display an error if the user is not old enough
    expect(birthYearError.text()).toContain(`You're not old enough to bet on ponies`);
    // The birthYear input should have the CSS class is-invalid when in error
    expect(birthYearInput.classes()).toContain('is-invalid');
    // The birthYear label should have the CSS class text-danger when in error
    expect(label.classes()).toContain('text-danger');

    await birthYearInput.setValue(1986);
    await flushPromises();

    // The birthYear field error should not be displayed
    expect(wrapper.find('.invalid-feedback').exists()).toBe(false);
    // The birthYear input should not have the CSS class is-invalid when not in error
    expect(birthYearInput.classes()).not.toContain('is-invalid');
    // The birthYear label should not have the CSS class text-danger when not in error
    expect(label.classes()).not.toContain('text-danger');
  });

  test('should call the register function on submit', async () => {
    const wrapper = await registerWrapper();
    const mockRouter = getRouter();

    // Fill all values
    const loginInput = wrapper.get('input');
    await loginInput.setValue('cedric');
    const passwordInput = wrapper.get('input[type=password]');
    await passwordInput.setValue('password');
    const confirmPasswordInput = wrapper.findAll('input[type=password]')[1];
    await confirmPasswordInput.setValue('password');
    const birthYearInput = wrapper.get('input[type=number]');
    await birthYearInput.setValue(1986);
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
    // or to call the `register` function in the submit handler
    const userStore = useUserStore();

    expect(userStore.register).toHaveBeenCalled();

    await flushPromises();

    // It should redirect to home after a submission success
    expect(mockRouter.push).toHaveBeenCalled();

    const alert = wrapper.findComponent(Alert);

    // An alert should not be displayed on registration success
    expect(alert.exists()).toBe(false);
  });

  test('should display an alert on submission failure', async () => {
    const wrapper = await registerWrapper();
    const userStore = useUserStore();
    vi.mocked(userStore.register).mockRejectedValue(new Error('Registration failed'));
    const mockRouter = getRouter();

    // Fill all values
    const loginInput = wrapper.get('input');
    await loginInput.setValue('cedric');
    const passwordInput = wrapper.get('input[type=password]');
    await passwordInput.setValue('password');
    const confirmPasswordInput = wrapper.findAll('input[type=password]')[1];
    await confirmPasswordInput.setValue('password');
    const birthYearInput = wrapper.get('input[type=number]');
    await birthYearInput.setValue(1986);
    await flushPromises();

    // You should have a `button` to submit
    const submitButton = wrapper.get('button');
    await submitButton.trigger('submit');
    await flushPromises();

    // You may have forgotten the submit handler on the `form` element
    // or to call the `register` function in the submit handler
    expect(userStore.register).toHaveBeenCalled();

    await flushPromises();

    // It should not redirect to home after a submission failure
    expect(mockRouter.push).not.toHaveBeenCalled();

    const alert = wrapper.getComponent(Alert);

    // An alert should be displayed on registration failure
    expect(alert.text()).toContain('Try again with another login');
    expect(alert.props().variant).toBe('danger');

    const closeButton = alert.get('button');
    await closeButton.trigger('click');

    // The alert should be closable
    expect(wrapper.findComponent(Alert).exists()).toBe(false);
  });
});
