<template>
  <div v-for="race in races" :key="race.name">
    <div>
      <h2>{{ race.name }}</h2>
    </div>
  </div>
</template>

<script lang="ts">
import { RaceModel } from '@/models/RaceModel';
import { ref, defineComponent } from 'vue';

export default defineComponent({
  name: 'Races',
  setup() {
    const races = ref<Array<RaceModel>>([{ name: 'Lyon' }, { name: 'London' }]);

    return { races };
  }
});
</script>
