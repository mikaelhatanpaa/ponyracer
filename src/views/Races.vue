<template>
  <div>
    <div v-if="loadError" class="alert alert-danger">
      An error occurred while loading
      <button type="button" class="btn-close" aria-label="Close" @click="loadError = false"></button>
    </div>
    <Race v-else v-for="race in races" :race-model="race" :key="race.id" />
  </div>
</template>

<script setup lang="ts">
import Race from '@/components/Race.vue';
import { useRaceService } from '@/composables/RaceService';
import { RaceModel } from '@/models/RaceModel';
import { onMounted, ref } from 'vue';

const raceService = useRaceService();
const races = ref<Array<RaceModel>>([]);

const loadError = ref<boolean>(false);

onMounted(async () => {
  try {
    races.value = await raceService.list();
  } catch {
    loadError.value = true;
  }
});
</script>
