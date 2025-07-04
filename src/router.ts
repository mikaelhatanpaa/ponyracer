import { createRouter, createWebHistory } from 'vue-router';
import Races from './views/Races.vue';
import Home from './views/Home.vue';

const routerPlugin = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/races', component: Races },
    { path: '/', component: Home }
  ]
});
export default routerPlugin;
