import '@/assets/main.css';
import { createApp } from 'vue';
import App from './App.vue';
import Alert from './components/Alert.vue';

createApp(App).component('Alert', Alert).mount('#app');
