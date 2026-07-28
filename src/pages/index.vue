<template>
  <q-page class="q-pa-md">
    <q-pull-to-refresh @refresh="onRefresh">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h5">My Tasks</div>
        <q-btn label="Logout" color="negative" flat @click="onLogout" />
      </div>

      <q-banner v-if="taskStore.isOffline" class="bg-warning text-white q-mb-md">
        You're offline — showing cached tasks. Some data may be outdated.
      </q-banner>

      <!-- Create form -->
      <q-form @submit="onCreate" class="row q-col-gutter-sm items-start q-mb-md">
        <div class="col-12 col-sm-4">
          <q-input v-model="newTitle" label="Title" dense outlined />
        </div>
        <div class="col-12 col-sm-4">
          <q-input v-model="newDescription" label="Description" dense outlined />
        </div>
        <div class="col-12 col-sm-3">
          <q-input v-model="newScheduledAt" label="Scheduled time (optional)" type="datetime-local" dense outlined />
        </div>
        <div class="col-12 col-sm-1 flex items-center">
          <q-btn type="submit" color="primary" label="Add Task" class="full-width" />
        </div>
      </q-form>

      <!-- Active tasks -->
      <div class="text-subtitle1 q-mb-sm">Active Tasks</div>
      <q-list bordered separator v-if="!taskStore.loading" class="q-mb-lg">
        <q-item v-for="task in activeTasks" :key="task.id">
          <q-item-section side top>
            <q-checkbox :model-value="false" @update:model-value="onComplete(task.id)" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ task.title }}</q-item-label>
            <q-item-label caption>{{ task.description }}</q-item-label>
            <q-item-label caption v-if="task.scheduledAt">
              Scheduled: {{ formatDate(task.scheduledAt) }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="text-caption text-grey">{{ formatDate(task.createdAt) }}</div>
          </q-item-section>
          <q-item-section side>
            <q-btn icon="edit" flat round color="primary" @click="openEdit(task)" />
            <q-btn icon="delete" flat round color="negative" @click="onDelete(task.id)" />
          </q-item-section>
        </q-item>
        <q-item v-if="activeTasks.length === 0">
          <q-item-section class="text-grey">No active tasks</q-item-section>
        </q-item>
      </q-list>

      <q-spinner v-else color="primary" size="2em" />

      <!-- History section -->
      <q-expansion-item label="History" icon="history" class="q-mb-md">
        <q-list bordered separator>
          <q-item v-for="task in historyTasks" :key="task.id">
            <q-item-section side top>
              <q-checkbox :model-value="true" @update:model-value="onUncomplete(task.id)" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-strike text-grey">{{ task.title }}</q-item-label>
              <q-item-label caption>{{ task.description }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="text-caption text-grey">Completed: {{ formatDate(task.completedAt) }}</div>
            </q-item-section>
          </q-item>
          <q-item v-if="historyTasks.length === 0">
            <q-item-section class="text-grey">No completed tasks yet</q-item-section>
          </q-item>
        </q-list>
      </q-expansion-item>

      <!-- Edit dialog -->
      <q-dialog v-model="editDialog">
        <q-card style="width: 350px">
          <q-card-section>
            <div class="text-h6">Edit Task</div>
          </q-card-section>
          <q-card-section>
            <q-input v-model="editTitle" label="Title" />
            <q-input v-model="editDescription" label="Description" class="q-mt-sm" />
            <q-input
              v-model="editScheduledAt"
              label="Scheduled time"
              type="datetime-local"
              class="q-mt-sm"
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cancel" v-close-popup />
            <q-btn flat label="Save" color="primary" @click="onSaveEdit" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-pull-to-refresh>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTaskStore } from '@/stores/task-store';
import { useAuthStore } from '@/stores/auth-store';

const taskStore = useTaskStore();
const authStore = useAuthStore();
const router = useRouter();

const newTitle = ref('');
const newDescription = ref('');
const newScheduledAt = ref('');

const editDialog = ref(false);
const editTaskId = ref('');
const editTitle = ref('');
const editDescription = ref('');
const editScheduledAt = ref('');

const activeTasks = computed(() => taskStore.tasks.filter((t) => !t.completed));
const historyTasks = computed(() => taskStore.tasks.filter((t) => t.completed));

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

onMounted(async () => {
  taskStore.fetchTasks();

  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }

  startReminderCheck();
});

async function onCreate() {
  if (!newTitle.value) return;

  const scheduledAtUtc = newScheduledAt.value
    ? new Date(newScheduledAt.value).toISOString()
    : undefined;

  await taskStore.createTask(newTitle.value, newDescription.value, scheduledAtUtc);
  newTitle.value = '';
  newDescription.value = '';
  newScheduledAt.value = '';
}

async function onDelete(id: string) {
  try {
    await taskStore.deleteTask(id);
  } catch (error: any) {
    console.error(error.message);
  }
}

async function onComplete(id: string) {
  try {
    await taskStore.completeTask(id);
  } catch (error: any) {
    console.error(error.message);
  }
}

async function onUncomplete(id: string) {
  try {
    await taskStore.updateTask(id, { completed: false, completedAt: null });
  } catch (error: any) {
    console.error(error.message);
  }
}

function toLocalDatetimeInput(isoString?: string | null) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function openEdit(task: any) {
  editTaskId.value = task.id;
  editTitle.value = task.title;
  editDescription.value = task.description || '';
  editScheduledAt.value = toLocalDatetimeInput(task.scheduledAt); // convert back for the input
  editDialog.value = true;
}

async function onSaveEdit() {
  const scheduledAtUtc = editScheduledAt.value
    ? new Date(editScheduledAt.value).toISOString()
    : null;

  try {
    await taskStore.updateTask(editTaskId.value, {
      title: editTitle.value,
      description: editDescription.value,
      scheduledAt: scheduledAtUtc,
    });
  } catch (error: any) {
    console.error(error.message);
  }
}

let reminderInterval: ReturnType<typeof setInterval> | null = null;

function startReminderCheck() {
  reminderInterval = setInterval(checkDueTasks, 30000); // check every 30s
  checkDueTasks();
}

function stopReminderCheck() {
  if (reminderInterval) clearInterval(reminderInterval);
}

async function checkDueTasks() {
  const now = new Date();

  for (const task of taskStore.tasks) {
    if (task.completed || task.notified || !task.scheduledAt) continue;

    const scheduledTime = new Date(task.scheduledAt);
    if (scheduledTime <= now) {
      fireNotification(task);
      await taskStore.markNotified(task.id); 
    }
  }
}

function fireNotification(task: any) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Task Reminder', {
      body: task.title,
      icon: '/icons/favicon-128x128.png',
    });
  }
}


async function onLogout() {
  await authStore.logout();
  router.push('/login');
}

async function onRefresh(done: () => void) {
  try {
    await taskStore.fetchTasks();
  } catch (error: any) {
    console.error(error.message);
  } finally {
    done();
  }
}

onUnmounted(() => {
  stopReminderCheck();
});
</script>