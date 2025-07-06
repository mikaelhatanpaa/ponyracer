<template>
  <div v-for="race in races" :key="race.id">
    <Race :race-model="race" />
    <RouterLink :to="{ name: 'bet', params: { raceId: race.id } }" class="btn btn-primary">Bet on {{ race.name }}</RouterLink>
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
