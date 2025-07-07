<template>
  <div class="mb-3" v-for="race in races" :key="race.id">
    <Race :raceModel="race" />
    <RouterLink :to="{ name: 'bet', params: { raceId: race.id } }" class="btn btn-primary"> Bet on {{ race.name }} </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RaceModel } from '@/models/RaceModel';
import { useRaceService } from '@/composables/RaceService';
import Race from '@/components/Race.vue';

const raceService = useRaceService();
const races = ref<Array<RaceModel>>(await raceService.list('PENDING'));
</script>
