<template>
  <div>
    <Race v-for="race in races" :race-model="race" :key="race.id" />
  </div>
</template>

<script setup lang="ts">
import Race from '@/components/Race.vue';
import { useRaceService } from '@/composables/RaceService';
import { RaceModel } from '@/models/RaceModel';
import { ref } from 'vue';

const raceService = useRaceService();
const races = ref<Array<RaceModel>>([]);
races.value = await raceService.list();
</script>
