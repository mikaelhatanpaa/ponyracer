<template>
  <nav class="navbar navbar-expand-md navbar-light bg-light">
    <div class="container-fluid">
      <a class="navbar-brand">PonyRacer</a>
      <button @click="toggleNavbar" type="button" class="navbar-toggler">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div id="navbar" class="navbar-collapse" :class="{ collapse: navbarCollapsed }">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <a class="nav-link">Races</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue';

export default defineComponent({
  name: 'NavBar',
  setup() {
    const navbarCollapsed = ref<boolean>(true);
    function toggleNavbar() {
      navbarCollapsed.value = !navbarCollapsed.value;
    }

    return { navbarCollapsed, toggleNavbar };
  }
});
</script>
