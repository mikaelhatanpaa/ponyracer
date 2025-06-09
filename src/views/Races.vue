<template>
  <div>
    <Race v-for="race in races" :race-model="race" :key="race.id" />
  </div>
</template>

<script lang="ts">
import Race from '@/components/Race.vue';
import { useRaceService } from '@/composables/RaceService';
import { RaceModel } from '@/models/RaceModel';
import { defineComponent, onMounted, ref } from 'vue';

export default defineComponent({
  name: 'Races',
  components: {
    Race
  },
  setup() {
    const raceService = useRaceService();
    const races = ref<Array<RaceModel>>([]);

    onMounted(async () => {
      races.value = await raceService.list();
    });

    return { races };
  }
});
</script>
