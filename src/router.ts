import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';
import Races from '@/views/Races.vue';
import Register from '@/views/Register.vue';
import Login from '@/views/Login.vue';

const routerPlugin = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/races',
      name: 'races',
      component: Races
    },
    {
      path: '/register',
      name: 'register',
      component: Register
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    }
  ]
});

export default routerPlugin;
