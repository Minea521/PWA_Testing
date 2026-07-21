import { defineRouter } from '#q-app';
import routes from './routes';
import { useAuthStore } from '@/stores/auth-store';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';

export default defineRouter(() => {
  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : (import.meta.env.QUASAR_VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory);

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE),
  });

  let authChecked = false;

  Router.beforeEach(async (to, from) => {
    const authStore = useAuthStore();

    if (!authChecked) {
      await authStore.checkAuth();
      authChecked = true;
    }

    if (to.meta.requiresAuth && !authStore.isLoggedIn) {
      return '/login';
    }
    // implicitly returns undefined/true, meaning "allow navigation"
  });

  return Router;
});
