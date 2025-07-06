<template>
  <figure @click="clicked()">
    <img :src="ponyImageUrl" :alt="ponyModel.name" />
    <figcaption>{{ ponyModel.name }}</figcaption>
  </figure>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { PonyModel } from '@/models/PonyModel';

const {
  ponyModel,
  isRunning = false,
  isBoosted = false
} = defineProps<{
  ponyModel: PonyModel;
  isRunning?: boolean;
  isBoosted?: boolean;
}>();

const emit = defineEmits<{
  ponySelected: [];
}>();

function clicked() {
  emit('ponySelected');
}

const ponyImageUrl = computed(
  () => `/images/pony-${ponyModel.color.toLowerCase()}${isBoosted ? '-rainbow' : isRunning ? '-running' : ''}.gif`
);
</script>

<style scoped>
figure {
  margin: 3px;
  padding: 3px;
  font-size: 12px;
}

img {
  height: 50px;
}
</style>
