<template>
  <div :class="alertClasses">
    <slot></slot>
    <button v-if="dismissible" @click="dismiss" type="button" class="btn-close" aria-label="Close"></button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ dismissible: boolean; variant: 'danger' | 'success' | 'warning' }>();
const emits = defineEmits<(e: 'dismissed') => void>();

function dismiss() {
  emits('dismissed');
}

const alertClasses = computed(() => ['alert', `alert-${props.variant}`, { 'alert-dismissible': props.dismissible }]);

defineSlots<{
  default: (props: Record<string, never>) => void;
}>();
</script>
