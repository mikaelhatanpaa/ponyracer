<template>
  <div>
    <h2>{{ raceModel.name }}</h2>
    <p>{{ startInstant }}</p>
    <ul>
      <li v-for="pony in raceModel.ponies" :key="pony.id">{{ pony.name }}</li>
    </ul>
  </div>
</template>

<script lang="ts">
import RaceModel from '@/models/RaceModel';
import fromNow from '@/utils/FromNow';
import { computed, defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'Race',
  props: {
    raceModel: {
      type: Object as PropType<RaceModel>,
      required: true
    }
  },
  setup(props) {
    const startInstant = computed(() => fromNow(props.raceModel.startInstant));
    return { startInstant };
  }
});
</script>
