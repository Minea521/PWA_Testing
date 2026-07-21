<template>
  <q-page class="flex flex-center">
    <q-card style="width: 350px" class="q-pa-md">
      <q-card-section>
        <div class="text-h6">Register</div>
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
            :rules="[val => val.length >= 6 || 'Password must be at least 6 characters']"
            class="q-mt-sm"
          />
          <q-input
            v-model="confirmPassword"
            label="Confirm Password"
            type="password"
            :rules="[val => val === password || 'Passwords do not match']"
            class="q-mt-sm"
          />

          <div v-if="errorMessage" class="text-negative q-mt-sm">
            {{ errorMessage }}
          </div>
          <div v-if="successMessage" class="text-positive q-mt-sm">
            {{ successMessage }}
          </div>

          <q-btn
            label="Register"
            type="submit"
            color="primary"
            class="q-mt-md full-width"
            :loading="loading"
          />
        </q-form>
      </q-card-section>

      <q-card-section class="text-center">
        <router-link to="/login">Already have an account? Login</router-link>
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
const confirmPassword = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const loading = ref(false);

const authStore = useAuthStore();
const router = useRouter();

async function onSubmit() {
  errorMessage.value = '';
  successMessage.value = '';
  loading.value = true;

  try {
    await authStore.register(email.value, password.value);
    successMessage.value = 'Account created! Redirecting to login...';
    setTimeout(() => {
      router.push('/login');
    }, 1500);
  } catch (err: any) {
    if (err.response?.status === 409) {
      errorMessage.value = 'Email already in use';
    } else {
      errorMessage.value = 'Something went wrong. Please try again';
    }
  } finally {
    loading.value = false;
  }
}
</script>
