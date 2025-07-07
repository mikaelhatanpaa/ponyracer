<template>
  <Pagination :collection="allRaces" :currentPage="currentPage" @pageChange="changePage($event)" />
  <div class="mb-3" v-for="race in races" :key="race.id">
    <Race :race-model="race" />
  </div>
</template>

<script setup lang="ts">
import Pagination from '@/components/Pagination.vue';
import Race from '@/components/Race.vue';
import { useRaceService } from '@/composables/RaceService';
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const raceService = useRaceService();
const router = useRouter();
const route = useRoute('finishedRaces');

const allRaces = await raceService.list('FINISHED');
const currentPage = computed(() => (route.query.page ? parseInt(route.query.page as string) : 1));
const races = computed(() => allRaces.slice((currentPage.value - 1) * 10, currentPage.value * 10));

function changePage(page: number) {
  router.push({ query: { page } });
}
</script>
