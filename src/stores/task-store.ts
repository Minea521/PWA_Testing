import { defineStore } from 'pinia';
import { api } from '@/boot/axios';
import { getDb } from '@/boot/rxdb';

interface Task {
  id: number;
  title: string;
  description?: string;
  completed?: boolean;
}

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [] as Task[],
    loading: false,
    isOffline: false,
  }),

  actions: {
    async fetchTasks() {
      this.loading = true;
      this.isOffline = false;

      try {
        // Try the real server first
        const response = await api.get('/tasks');
        this.tasks = response.data;

        // Cache this fresh data into RxDB for offline use later
        await this.cacheTasks(response.data);
      } catch (error) {
        // Server unreachable — fall back to cached data
        console.error('fetchTasks failed:', error);
        this.isOffline = true;
        const cachedTasks = await this.loadCachedTasks();
        this.tasks = cachedTasks;
      } finally {
        this.loading = false;
      }
    },

    async cacheTasks(tasks: Task[]) {
      const db = await getDb();

      // Clear old cached tasks, then insert the fresh set
      await db.tasks.find().remove();

      for (const task of tasks) {
        await db.tasks.insert({
          id: String(task.id), // RxDB primary key must be a string
          title: task.title,
          description: task.description || '',
          completed: task.completed || false,
        });
      }
    },

    async loadCachedTasks(): Promise<Task[]> {
      const db = await getDb();
      const cachedDocs = await db.tasks.find().exec();

      return cachedDocs.map((doc: any) => ({
        id: Number(doc.id), // convert back to number to match your Task interface
        title: doc.title,
        description: doc.description,
        completed: doc.completed,
      }));
    },

    async createTask(title: string, description: string) {
      const response = await api.post('/tasks', { title, description });
      this.tasks.push(response.data);
      await this.cacheTasks(this.tasks); // keep cache in sync
    },

    async updateTask(id: number, updates: Partial<Task>) {
      const response = await api.patch(`/tasks/${id}`, updates);
      const index = this.tasks.findIndex((t) => t.id === id);
      if (index !== -1) {
        this.tasks[index] = response.data;
      }
      await this.cacheTasks(this.tasks);
    },

    async deleteTask(id: number) {
      await api.delete(`/tasks/${id}`);
      this.tasks = this.tasks.filter((t) => t.id !== id);
      await this.cacheTasks(this.tasks);
    },
  },
});