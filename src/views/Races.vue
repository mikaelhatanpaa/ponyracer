<template>
  <div>
    <div v-if="loadError">
      <Alert :variant="'danger'" :dismissible="true" @dismissed="loadError = false"> An error occurred while loading </Alert>
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
