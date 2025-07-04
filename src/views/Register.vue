<template>
  <div class="row">
    <div class="col-md-6 offset-md-3">
      <h1>Sign up</h1>

      <Alert v-if="registrationFailed" variant="danger" dismissible @dismissed="registrationFailed = false">
        Try again with another login.
      </Alert>

      <form @submit.prevent="register()">
        <div class="mb-3">
          <label for="login" class="form-label" :class="{ 'text-danger': dirty.login && errors.login }">Login</label>
          <input
            id="login"
            name="login"
            class="form-control"
            :class="{ 'is-invalid': dirty.login && errors.login }"
            v-model="userModel.login"
            @input.once="dirty.login = true"
          />
          <div v-if="dirty.login && errors.login" class="invalid-feedback d-block">The login is required.</div>
        </div>
        <div class="mb-3">
          <label for="password" class="form-label" :class="{ 'text-danger': dirty.password && errors.password }">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            class="form-control"
            :class="{ 'is-invalid': dirty.password && errors.password }"
            v-model="userModel.password"
            @input.once="dirty.password = true"
          />
          <div v-if="dirty.password && errors.password" class="invalid-feedback d-block">The password is required.</div>
        </div>
        <div class="mb-3">
          <label for="birth-year" class="form-label" :class="{ 'text-danger': dirty.birthYear && errors.birthYear }">Birth year</label>
          <input
            id="birth-year"
            name="birthYear"
            type="number"
            class="form-control"
            :class="{ 'is-invalid': dirty.birthYear && errors.birthYear }"
            v-model.number="userModel.birthYear"
            @input.once="dirty.birthYear = true"
          />
          <div v-if="dirty.birthYear && errors.birthYear" class="invalid-feedback d-block">The birth year is required.</div>
        </div>
        <button class="btn btn-primary" type="submit" :disabled="Object.keys(errors).length > 0">Let's Go!</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import UserModel from '@/models/UserModel';
import { useUserService } from '@/composables/UserService';
import { useRouter } from 'vue-router';
import { reactive } from 'vue';
import { computed } from 'vue';
import { ref } from 'vue';

const userModel = reactive<UserModel>({ login: '', password: '', birthYear: new Date().getFullYear() - 18 });
const dirty = reactive<{ [K in keyof UserModel]: boolean }>({
  login: false,
  password: false,
  birthYear: false
});

const errors = computed(() => {
  const errors: Partial<Record<keyof UserModel, boolean>> = {};

  if (!userModel.login) {
    errors.login = true;
  }

  if (!userModel.password) {
    errors.password = true;
  }

  if (!userModel.birthYear) {
    errors.birthYear = true;
  }

  return errors;
});

const registrationFailed = ref<boolean>(false);
const userService = useUserService();
const router = useRouter();

const register = async () => {
  try {
    await userService.register(userModel);
    router.push({ name: 'home' });
  } catch (error) {
    registrationFailed.value = true;
  }
};
</script>
