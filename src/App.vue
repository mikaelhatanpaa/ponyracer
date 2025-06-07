<template>
  <Navbar />
  <main class="container" style="margin-top: 70px">
    <h1>Ponyracer</h1>
  </main>
</template>

<script lang="ts">
import Navbar from './components/Navbar.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',

  components: {
    Navbar
  }
});
</script>

<style></style>
