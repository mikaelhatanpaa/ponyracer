<template>
  <div>
    <h2>{{ raceModel.name }}</h2>
    <p>{{ startInstant }}</p>
    <!-- <ul>
      <li v-for="pony in raceModel.ponies" :key="pony.id">{{ pony.name }}</li>
    </ul> -->
    <div class="row">
      <div class="col" v-for="pony in raceModel.ponies" :key="pony.id">
        <Pony :pony-model="pony" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RaceModel } from '@/models/RaceModel';
import fromNow from '@/utils/FromNow';
import { computed, defineProps } from 'vue';
import Pony from './Pony.vue';

const { raceModel } = defineProps<{
  raceModel: RaceModel;
}>();

const startInstant = computed(() => fromNow(raceModel.startInstant));
</script>
