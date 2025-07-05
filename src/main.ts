import '@/assets/main.css';
import { createApp } from 'vue';
import App from './App.vue';
import Alert from './components/Alert.vue';
import routerPlugin from './router';
import { createPinia } from 'pinia';

createApp(App).use(createPinia()).component('Alert', Alert).use(routerPlugin).mount('#app');
