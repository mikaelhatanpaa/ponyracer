<template>
  <nav class="navbar navbar-expand-md navbar-light bg-light">
    <div class="container-fluid">
      <!-- <a class="navbar-brand">PonyRacer</a> -->
      <RouterLink class="navbar-brand" to="/">PonyRacer</RouterLink>
      <button @click="toggleNavbar" type="button" class="navbar-toggler">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div id="navbar" class="navbar-collapse" :class="{ collapse: navbarCollapsed }">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <RouterLink v-if="userModel" class="nav-link" to="/races">Races</RouterLink>
            <!-- <a class="nav-link">Races</a> -->
          </li>
        </ul>
        <ul class="navbar-nav" v-if="userModel">
          <li class="navbar-item">
            <RouterLink :to="{ name: 'score' }" class="nav-link">
              <span id="current-user" class="me-2">
                {{ userModel.login }}
                <span class="fa fa-star"></span>
                {{ userModel.money }}
              </span>
            </RouterLink>
          </li>
          <li class="nav-item">
            <a id="logout-link" @click="logout()" class="nav-link" role="button">
              <span class="fa fa-power-off"></span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useUserStore } from '@/composables/UserStore';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { storeToRefs } from 'pinia';

const navbarCollapsed = ref<boolean>(true);
const router = useRouter();
const userStore = useUserStore();
const { userModel } = storeToRefs(userStore);

function toggleNavbar() {
  navbarCollapsed.value = !navbarCollapsed.value;
}

function logout() {
  userStore.logoutAndForget();
  router.push({ name: 'home' });
}
</script>
