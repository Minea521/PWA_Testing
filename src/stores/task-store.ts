import { defineStore } from 'pinia';
import { api } from '@/boot/axios';
import { getDb } from '@/boot/rxdb';

interface Task {
  id: string; 
  title: string;
  description?: string;
  completed?: boolean;
}

function generateTempId() {
  return `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
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

      // Always load whatever's cached first, so state is never empty mid-process
      this.tasks = await this.loadCachedTasks();

      try {
        await this.syncPendingChanges();

        const response = await api.get('/tasks');
        this.tasks = response.data.map((t: any) => ({ ...t, id: String(t.id) }));
        await this.cacheTasks(this.tasks);
      } catch (error) {
        this.isOffline = true;
      } finally {
        this.loading = false;
      }
    },

    async cacheTasks(tasks: Task[]) {
      const db = await getDb();
      await db.tasks.find().remove();
      for (const task of tasks) {
        await db.tasks.insert({
          id: task.id,
          title: task.title,
          description: task.description || '',
          completed: task.completed || false,
        });
      }
    },

    async loadCachedTasks(): Promise<Task[]> {
      const db = await getDb();
      const docs = await db.tasks.find().exec();
      return docs.map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        description: doc.description,
        completed: doc.completed,
      }));
    },

    async queueOperation(operation: string, taskId: string, payload: any) {
      const db = await getDb();
      await db.syncQueue.insert({
        id: generateTempId(),
        operation,
        taskId,
        payload,
        createdAt: Date.now(),
      });
    },

    async createTask(title: string, description: string) {
      try {
        const response = await api.post('/tasks', { title, description });
        const newTask = { ...response.data, id: String(response.data.id) };
        this.tasks.push(newTask);
        await this.cacheTasks(this.tasks);
      } catch {
        // Offline: create locally with a temp ID, queue for later sync
        const tempId = generateTempId();
        const newTask: Task = { id: tempId, title, description, completed: false };
        this.tasks.push(newTask);
        await this.cacheTasks(this.tasks);
        await this.queueOperation('create', tempId, { title, description });
      }
    },

    async updateTask(id: string, updates: Partial<Task>) {
      const index = this.tasks.findIndex((t) => t.id === id);
      try {
        const response = await api.patch(`/tasks/${id}`, updates);
        if (index !== -1) this.tasks[index] = { ...response.data, id: String(response.data.id) };
        await this.cacheTasks(this.tasks);
      } catch {
        if (index !== -1) this.tasks[index] = { ...this.tasks[index], ...updates };
        await this.cacheTasks(this.tasks);
        await this.queueOperation('update', id, updates);
      }
    },

    async deleteTask(id: string) {
      try {
        await api.delete(`/tasks/${id}`);
        this.tasks = this.tasks.filter((t) => t.id !== id);
        await this.cacheTasks(this.tasks);
      } catch {
        this.tasks = this.tasks.filter((t) => t.id !== id);
        await this.cacheTasks(this.tasks);
        await this.queueOperation('delete', id, {});
      }
    },

    async syncPendingChanges() {
      const db = await getDb();
      const queueDocs = await db.syncQueue.find().exec();
      if (queueDocs.length === 0) return;

      const sorted = [...queueDocs].sort((a: any, b: any) => a.createdAt - b.createdAt);

      for (const entry of sorted) {
        try {
          if (entry.operation === 'create') {
            const response = await api.post('/tasks', entry.payload);
            const index = this.tasks.findIndex((t) => t.id === entry.taskId);
            if (index !== -1) {
              this.tasks[index] = { ...response.data, id: String(response.data.id) };
            }
          } else if (entry.operation === 'update') {
            if (!entry.taskId.startsWith('temp_')) {
              await api.patch(`/tasks/${entry.taskId}`, entry.payload);
            }
          } else if (entry.operation === 'delete') {
            if (!entry.taskId.startsWith('temp_')) {
              await api.delete(`/tasks/${entry.taskId}`);
            }
          }
          await entry.remove();
        } catch {
          break;
        }
      }
      // no trailing cacheTasks() call here anymore
    },
  },
});