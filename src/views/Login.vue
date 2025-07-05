<template>
  <div>
    <h1>Log in</h1>
    <Alert v-if="authenticationFailed" variant="danger" dismissible @dismissed="authenticationFailed = false">Nope, try again</Alert>
    <Form @submit="authenticate($event)" v-slot="{ meta: formMeta }">
      <Field name="login" rules="required" v-slot="{ field, meta }">
        <div class="mb-3">
          <label for="login" class="form-label" :class="{ 'text-danger': meta.dirty && !meta.valid }">Login</label>
          <input id="login" class="form-control" :class="{ 'is-invalid': meta.dirty && !meta.valid }" v-bind="field" />
          <ErrorMessage name="login" class="invalid-feedback" />
        </div>
      </Field>
      <Field name="password" rules="required" v-slot="{ field, meta }">
        <div class="mb-3">
          <label for="password" class="form-label" :class="{ 'text-danger': meta.dirty && !meta.valid }">Password</label>
          <input id="password" type="password" class="form-control" :class="{ 'is-invalid': meta.dirty && !meta.valid }" v-bind="field" />
          <ErrorMessage name="password" class="invalid-feedback" />
        </div>
      </Field>

      <button class="btn btn-primary" type="submit" :disabled="!formMeta.valid">Log me on!</button>
    </Form>
  </div>
</template>

<script setup lang="ts">
import { Field, Form, ErrorMessage } from 'vee-validate';
import { useForms } from '@/composables/Forms';
import { useUserStore } from '@/composables/UserStore';
import { useRouter } from 'vue-router';
import { ref } from 'vue';

useForms();
const userStore = useUserStore();
const router = useRouter();
const authenticationFailed = ref<boolean>(false);

const authenticate = async (values: Record<string, unknown>) => {
  try {
    authenticationFailed.value = false;
    await userStore.authenticate(values as { login: string; password: string });
    router.push({ name: 'home' });
  } catch (error) {
    authenticationFailed.value = true;
  }
};
</script>
