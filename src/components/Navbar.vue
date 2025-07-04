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
            <RouterLink class="nav-link" to="/races">Races</RouterLink>
            <!-- <a class="nav-link">Races</a> -->
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, defineComponent } from 'vue';
const navbarCollapsed = ref<boolean>(true);
function toggleNavbar() {
  navbarCollapsed.value = !navbarCollapsed.value;
}
</script>
