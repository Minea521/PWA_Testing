<template>
  <q-banner v-if="taskStore.isOffline" class="bg-warning text-white q-mb-md">
    You're offline — showing cached tasks. Some data may be outdated.
  </q-banner>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5">My Tasks</div>
      <q-btn label="Logout" color="negative" flat @click="onLogout" />
    </div>

    <q-form @submit="onCreate" class="q-mb-md row q-gutter-sm">
      <q-input v-model="newTitle" label="Title" dense outlined class="col" />
      <q-input v-model="newDescription" label="Description" dense outlined class="col" />
      <q-btn type="submit" color="primary" label="Add Task" />
    </q-form>

    <q-list bordered separator v-if="!taskStore.loading">
      <q-item v-for="task in taskStore.tasks" :key="task.id">
        <q-item-section>
          <q-item-label>{{ task.title }}</q-item-label>
          <q-item-label caption>{{ task.description }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn icon="delete" flat round color="negative" @click="onDelete(task.id)" />
        </q-item-section>
      </q-item>
    </q-list>

    <q-spinner v-else color="primary" size="2em" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTaskStore } from '@/stores/task-store';
import { useAuthStore } from '@/stores/auth-store';

const taskStore = useTaskStore();
const authStore = useAuthStore();
const router = useRouter();

const newTitle = ref('');
const newDescription = ref('');

onMounted(() => {
  taskStore.fetchTasks();
});

async function onCreate() {
  if (!newTitle.value) return;
  await taskStore.createTask(newTitle.value, newDescription.value);
  newTitle.value = '';
  newDescription.value = '';
}

async function onDelete(id: number) {
  await taskStore.deleteTask(id);
}

async function onLogout() {
  await authStore.logout();
  router.push('/login');
}
</script>
