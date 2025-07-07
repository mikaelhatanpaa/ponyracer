<template>
  <div>
    <h1>Log in</h1>
    <Alert v-if="authenticationFailed" variant="danger" dismissible @dismissed="authenticationFailed = false">Nope, try again</Alert>
    <Form @submit="authenticate($event)" v-slot="{ meta: formMeta }">
      <Field name="login" rules="required" v-slot="{ field, meta }">
        <div class="mb-3">
          <label for="login" class="form-label" v-meta-class:text-danger="meta">Login</label>
          <input id="login" class="form-control" v-meta-class:is-invalid="meta" v-bind="field" />
          <ErrorMessage name="login" class="invalid-feedback" />
        </div>
      </Field>
      <Field name="password" rules="required" v-slot="{ field, meta }">
        <div class="mb-3">
          <label for="password" class="form-label" v-meta-class:text-danger="meta">Password</label>
          <input id="password" type="password" class="form-control" v-meta-class:is-invalid="meta" v-bind="field" />
          <ErrorMessage name="password" class="invalid-feedback" />
        </div>
      </Field>

      <button class="btn btn-primary" :class="{ shake: authenticationFailed }" type="submit" :disabled="!formMeta.valid">Log me on!</button>
    </Form>
  </div>
</template>

<script setup lang="ts">
import { Field, Form, ErrorMessage } from 'vee-validate';
import { useForms } from '@/composables/Forms';
import { useUserStore } from '@/composables/UserStore';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { vMetaClass } from '@/directives/MetaClass';

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

<style scoped>
.shake {
  animation: shake 300ms ease;
}
@keyframes shake {
  10%,
  50%,
  90% {
    transform: translateX(0.5rem);
  }
  30%,
  70% {
    transform: translateX(-0.5rem);
  }
}
</style>
