import { createRouter, createWebHistory, RouteLocationNormalized } from 'vue-router';
import Home from '@/views/Home.vue';
import Register from '@/views/Register.vue';
import Login from '@/views/Login.vue';
import { useUserStore } from './composables/UserStore';

const Live = () => import('@/views/Live.vue');
const Bet = () => import('@/views/Bet.vue');
const FinishedRaces = () => import('@/views/FinishedRaces.vue');
const PendingRaces = () => import('@/views/PendingRaces.vue');
const Races = () => import('@/views/Races.vue');
const ScoreHistory = () => import('@/views/ScoreHistory.vue');

const routerPlugin = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/score-history',
      name: 'score',
      component: ScoreHistory
    },
    {
      path: '/races',
      component: Races,
      children: [
        {
          path: '',
          name: 'races',
          redirect: {
            name: 'pendingRaces'
          }
        },
        {
          path: 'pending',
          name: 'pendingRaces',
          component: PendingRaces
        },
        {
          path: 'finished',
          name: 'finishedRaces',
          component: FinishedRaces
        }
      ]
    },
    {
      path: '/races/:raceId',
      name: 'bet',
      component: Bet
    },
    {
      path: '/races/:raceId/live',
      name: 'live',
      component: Live
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

export function isLoggedIn(to: RouteLocationNormalized) {
  if (to.name === 'home' || to.name === 'login' || to.name === 'register') {
    return true;
  }

  const userStore = useUserStore();

  if (userStore.userModel) {
    return true;
  }

  return '/';
}

routerPlugin.beforeEach(isLoggedIn);

export default routerPlugin;
