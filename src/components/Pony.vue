<template>
  <div @click="clicked">
    <figure>
      <img :src="ponyImageURL" :alt="ponyModel.name" />
      <figcaption>{{ ponyModel.name }}</figcaption>
    </figure>
  </div>
</template>

<script lang="ts">
import { PonyModel } from '@/models/PonyModel';
import { defineComponent, PropType, computed } from 'vue';

export default defineComponent({
  name: 'Pony',
  props: {
    ponyModel: {
      type: Object as PropType<PonyModel>,
      required: true
    }
  },
  emits: ['ponySelected'],
  // Instead of setup(props, ctx) {
  // Do (much prettier):
  setup({ ponyModel }, { emit }) {
    const ponyImageURL = computed(() => '/images/pony-' + ponyModel.color.toLowerCase() + '.gif');
    const clicked = () => emit('ponySelected');
    return { ponyImageURL, clicked };
  }
});
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
