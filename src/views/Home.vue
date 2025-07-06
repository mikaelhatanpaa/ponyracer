<template>
  <div class="text-center" style="margin-top: 100px">
    <div>
      <h1>Ponyracer <small>Always a pleasure to bet on ponies</small></h1>
    </div>
    <Transition name="fade" mode="out-in">
      <div v-if="!userModel">
        <RouterLink to="/login" class="btn btn-large btn-primary me-2">Login</RouterLink>
        <RouterLink to="/register" class="btn btn-large btn-primary">Register</RouterLink>
      </div>
      <div v-else>
        <RouterLink to="/races" class="btn btn-large btn-primary me-2">Races</RouterLink>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/composables/UserStore';
import { storeToRefs } from 'pinia';
const store = useUserStore();
const { userModel } = storeToRefs(store);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
