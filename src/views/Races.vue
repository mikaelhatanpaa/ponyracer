<template>
  <div>
    <h1>Races</h1>
    <ul class="nav nav-tabs mt-2 mb-4">
      <li class="nav-item">
        <RouterLink :to="{ name: 'pendingRaces' }" class="nav-link" activeClass="active">Pending races</RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink :to="{ name: 'finishedRaces' }" class="nav-link" activeClass="active">Finished races</RouterLink>
      </li>
    </ul>
    <RouterView />
  </div>
</template>

<script setup lang="ts">
// empty setup for now
</script>
