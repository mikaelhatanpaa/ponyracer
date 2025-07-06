<template>
  <div @click="clicked">
    <figure>
      <img :src="ponyImageURL" :alt="ponyModel.name" />
      <figcaption>{{ ponyModel.name }}</figcaption>
    </figure>
  </div>
</template>

<script setup lang="ts">
import { PonyModel } from '@/models/PonyModel';
import { computed, defineProps, defineEmits } from 'vue';

interface Props {
  ponyModel: PonyModel;
  isRunning?: boolean;
}

const { ponyModel, isRunning = false } = defineProps<Props>();

const emit = defineEmits<{
  ponySelected: [];
}>();

const ponyImageURL = computed(() => `/images/pony-${ponyModel.color.toLowerCase()}${isRunning ? '-running' : ''}.gif`);
const clicked = () => emit('ponySelected');
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
