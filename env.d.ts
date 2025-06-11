/// <reference types="vite/client" />

import type Alert from '@/components/Alert.vue';

declare module 'vue' {
  interface GlobalComponents {
    Alert: typeof Alert;
  }
}
