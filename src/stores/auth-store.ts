import { defineStore } from 'pinia';
import { api } from './../boot/axios';

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
    },

    async register(email: string, password: string) {
      await api.post('/auth/register', { email, password });
    },

    async logout() {
      await api.post('/auth/logout');
      this.user = null;
      this.isLoggedIn = false;
    },
    async checkAuth() {
      try {
        const response = await api.get('/auth/me');
        this.user = response.data.user;
        this.isLoggedIn = true;
      } catch {
        this.user = null;
        this.isLoggedIn = false;
      }
    },
  },
});
