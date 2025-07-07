<template>
  <div class="pagination mb-3">
    <button class="btn btn-lg btn-outline-primary previous" @click="loadPage(currentPage - 1)">&lt;&lt;</button>
    <button
      v-for="page in lastPage"
      class="btn btn-lg btn-outline-primary page"
      :class="{ active: page === currentPage }"
      :key="page"
      @click="loadPage(page)"
    >
      {{ page }}
    </button>
    <button class="btn btn-lg btn-outline-primary next" @click="loadPage(currentPage + 1)">&gt;&gt;</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  collection: Array<unknown>;
  currentPage: number;
}

interface Emits {
  pageChange: [number];
}

const { collection } = defineProps<Props>();

const emit = defineEmits<Emits>();
const lastPage = computed(() => Math.ceil(collection.length / 10));

const loadPage = (page: number) => {
  if (page < 1 || page > lastPage.value) {
    return;
  }
  emit('pageChange', page);
};
</script>
