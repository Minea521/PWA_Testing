import { defineStore } from 'pinia';
import { api } from './../boot/axios';
import { useTaskStore } from './task-store';

interface User {
  id: number;
  email: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    isLoggedIn: false,
  }),

  actions: {
    async login(email: string, password: string) {
      const response = await api.post('/auth/login', { email, password });
      this.user = response.data.user;
      this.isLoggedIn = true;
      localStorage.setItem('wasLoggedIn', 'true');
    },

    async register(email: string, password: string) {
      await api.post('/auth/register', { email, password });
    },

    async logout() {
      await api.post('/auth/logout');
      this.user = null;
      this.isLoggedIn = false;
      localStorage.removeItem('wasLoggedIn');

      const taskStore = useTaskStore();
      await taskStore.clearCache();
    },
    async checkAuth() {
      try {
        const response = await api.get('/auth/me');
        this.user = response.data.user;
        this.isLoggedIn = true;
        localStorage.setItem('wasLoggedIn', 'true'); // remember success
      } catch (error: any) {
        if (error.response?.status === 401) {
          // Genuinely invalid/expired session — real logout
          this.user = null;
          this.isLoggedIn = false;
          localStorage.removeItem('wasLoggedIn');
        } else {
          // Network error (offline) — don't log out, trust last known state
          const wasLoggedIn = localStorage.getItem('wasLoggedIn') === 'true';
          this.isLoggedIn = wasLoggedIn;
          // user object stays null/stale, but isLoggedIn reflects last known truth
        }
      }
    },
  },
});
