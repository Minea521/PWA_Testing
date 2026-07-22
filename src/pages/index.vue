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
          <div class="row q-gutter-xs">
            <q-btn icon="edit" flat round color="primary" @click="openEdit(task)" />
            <q-btn icon="delete" flat round color="negative" @click="onDelete(task.id)" />
          </div>
        </q-item-section>
      </q-item>

      <q-dialog v-model="editDialog">
        <q-card style="width: 350px">
          <q-card-section>
            <div class="text-h6">Edit Task</div>
          </q-card-section>
          <q-card-section>
            <q-input v-model="editTitle" label="Title" />
            <q-input v-model="editDescription" label="Description" class="q-mt-sm" />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cancel" v-close-popup />
            <q-btn flat label="Save" color="primary" @click="onSaveEdit" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
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

const editDialog = ref(false);
const editTaskId = ref('');
const editTitle = ref('');
const editDescription = ref('');

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
  try{
    await taskStore.deleteTask(id);
  } catch (error: any){
    console.error(error.message);
  }
}

async function onUpdate(id: number, update: Partial<Task>){
  try{
    await taskStore.updateTask(id, updates);
  } catch (error: any){
    console.error(error.message);
  }
}

function openEdit(task: any) {
  editTaskId.value = task.id;
  editTitle.value = task.title;
  editDescription.value = task.description || '';
  editDialog.value = true;
}

async function onSaveEdit() {
  await taskStore.updateTask(editTaskId.value, {
    title: editTitle.value,
    description: editDescription.value,
  });
}

async function onLogout() {
  await authStore.logout();
  router.push('/login');
}
</script>
