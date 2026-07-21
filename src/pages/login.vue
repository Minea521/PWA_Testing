<template>
  <q-page class="flex flex-center">
    <q-card style="width: 350px" class="q-pa-md">
      <q-card-section>
        <div class="text-h6">Login</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit">
          <q-input
            v-model="email"
            label="Email"
            type="email"
            :rules="[val => !!val || 'Email is required']"
          />
          <q-input
            v-model="password"
            label="Password"
            type="password"
            :rules="[val => !!val || 'Password is required']"
            class="q-mt-sm"
          />

          <div v-if="errorMessage" class="text-negative q-mt-sm">
            {{ errorMessage }}
          </div>

          <q-btn
            label="Login"
            type="submit"
            color="primary"
            class="q-mt-md full-width"
            :loading="loading"
          />
        </q-form>
      </q-card-section>

      <q-card-section class="text-center">
        <router-link to="/register">Don't have an account? Register</router-link>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth-store';

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const loading = ref(false);

const authStore = useAuthStore();
const router = useRouter();

async function onSubmit() {
  errorMessage.value = '';
  loading.value = true;
  try {
    await authStore.login(email.value, password.value);
    router.push('/');
  } catch (err) {
    errorMessage.value = 'Invalid email or password';
  } finally {
    loading.value = false;
  }
}
</script>
