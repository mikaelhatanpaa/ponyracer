<template>
  <Alert v-if="error" variant="danger" dismissible @dismissed="error = false">A problem occurred during the live.</Alert>
  <h1>{{ raceModel.name }}</h1>
  <div v-if="raceModel.status === 'FINISHED'">
    <div v-if="!winners.length">The race is over.</div>
    <div v-else>
      <Alert dismissible v-if="betWon" variant="success">You won your bet!</Alert>
      <Alert dismissible v-if="raceModel.betPonyId && !betWon" variant="warning">You lost your bet.</Alert>
      <div>Most Valuable Ponies</div>
      <div class="row">
        <div class="col" v-for="winner of winners" :key="winner.id" :class="{ selected: winner.id === raceModel.betPonyId }">
          <Pony :ponyModel="winner" />
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="raceModel.status === 'PENDING'">
    <p>The race will start {{ startInstant }}</p>
    <div class="row">
      <div class="col" v-for="pony of raceModel.ponies" :key="pony.id" :class="{ selected: pony.id === raceModel.betPonyId }">
        <Pony :ponyModel="pony" />
      </div>
    </div>
  </div>
  <div v-else-if="raceModel.status === 'RUNNING'">
    <div style="margin-left: 95%; margin-bottom: 5px">
      <span class="fa fa-flag" style="font-size: x-large"></span>
    </div>
    <div style="width: 95%; border-right: 3px dotted lightgray">
      <div
        v-for="pony of runningPonies"
        :key="pony.id"
        :style="{ marginLeft: `${pony.position - 5}%`, transition: 'all linear 1s' }"
        :class="{ selected: pony.id === raceModel.betPonyId }"
      >
        <Pony :ponyModel="pony" :isRunning="true" :marginLeft="`${pony.position - 5}%`" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useRaceService } from '@/composables/RaceService';
import { Connection, useWsService } from '@/composables/WsService';
import { onUnmounted } from 'vue';
import { LiveRaceModel, RaceModel } from '@/models/RaceModel';
import { ref } from 'vue';
import { computed } from 'vue';
import fromNow from '@/utils/FromNow';
import { PonyModelWithPositionModel } from '@/models/PonyModel';
import Pony from '@/components/Pony.vue';

let connection: Connection | null = null;
onUnmounted(() => connection?.disconnect());

const raceService = useRaceService();
const route = useRoute('live');
const raceId = route.params.raceId;
const raceModelInit = await raceService.get(parseInt(raceId as string));
const raceModel = ref<RaceModel>(raceModelInit);

const startInstant = computed(() => fromNow(raceModel.value.startInstant));

const runningPonies = ref<Array<PonyModelWithPositionModel>>([]);
const winners = computed(() => runningPonies.value.filter(pony => pony.position >= 100));
const betWon = computed(() => raceModel.value.status === 'FINISHED' && winners.value.some(pony => pony.id === raceModel.value.betPonyId));

const wsService = useWsService();
const error = ref<boolean>(false);

if (raceModel.value.status !== 'FINISHED') {
  try {
    connection = wsService.connect<LiveRaceModel>(`/race/${raceId}`, (liveRace: LiveRaceModel) => {
      runningPonies.value = liveRace.ponies;
      raceModel.value.status = liveRace.status;
      if (raceModel.value.status === 'FINISHED') {
        connection!.disconnect();
      }
    });
  } catch (e) {
    error.value = true;
  }
}

onUnmounted(() => {
  return null;
});
</script>
