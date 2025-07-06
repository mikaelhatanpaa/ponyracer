<template>
  <h1>{{ raceModel.name }}</h1>
  <p>{{ startInstant }}</p>
  <Alert class="mt-2" v-if="betFailed" variant="danger" dismissible @dismissed="betFailed = false">
    The race is already started or finished.
  </Alert>
  <div class="row">
    <div class="col" v-for="pony of raceModel.ponies" :key="pony.id" :class="{ selected: isPonySelected(pony) }">
      <Pony :pony-model="pony" @pony-selected="placeOrCancelBet(pony)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRaceService } from '@/composables/RaceService';
import { PonyModel } from '@/models/PonyModel';
import { RaceModel } from '@/models/RaceModel';
import fromNow from '@/utils/FromNow';
import { computed } from 'vue';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import Pony from '@/components/Pony.vue';

const route = useRoute('bet');
const raceService = useRaceService();

const raceId = +route.params.raceId;
const race = await raceService.get(raceId);

const raceModel = ref<RaceModel>(race);
const betFailed = ref<boolean>(false);

const startInstant = computed(() => fromNow(raceModel.value!.startInstant));

function isPonySelected(pony: PonyModel) {
  return pony.id === raceModel.value.betPonyId;
}

async function placeOrCancelBet(pony: PonyModel) {
  betFailed.value = false;
  try {
    if (!isPonySelected(pony)) {
      raceModel.value = await raceService.bet(raceId, parseInt(`${pony.id}` as string));
    } else {
      await raceService.cancelBet(raceId);
      raceModel.value.betPonyId = null;
    }
  } catch (error) {
    betFailed.value = true;
  }
}
</script>

<style scoped>
.selected {
  border: 3px solid green;
  border-radius: 10px;
}
</style>
