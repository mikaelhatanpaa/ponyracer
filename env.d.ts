/// <reference types="vite/client" />

import type { RouterLink, RouterView } from 'vue-router';
import type Alert from '@/components/Alert.vue';

declare module 'vue' {
  interface GlobalComponents {
    Alert: typeof Alert;
    RouterLink: typeof RouterLink;
    RouterView: typeof RouterView;
  }
}
