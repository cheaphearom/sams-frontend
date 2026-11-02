<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="max-w-4xl w-full bg-white shadow-lg rounded-lg overflow-hidden">
      <div class="flex flex-col md:flex-row">
        <!-- Left side - Image -->
        <div class="md:w-1/2 bg-slate-100 flex items-center justify-center p-8">
          <img
          v-if="faculties && faculties.image"
          :src="imageFacultiesUrl(faculties.image)"
          alt="Faculties image"
          class="w-100 h-100 object-cover borde"
        />
      </div>
      
      <!-- Right side - Login Form -->
      <div class="md:w-1/2 p-8 md:p-12">
        <h1 class="text-2xl font-semibold mb-6 uppercase text-slate-900">
          Login TO
          <h2 class="font-bold text-lg text-blue-600 uppercase" v-if="faculties && faculties.name">{{faculties.name}}</h2>
        </h1>
          <form @submit.prevent="handleLogin" class="space-y-4">
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-700">Email</label>
              <input 
                v-model="email" 
                type="email" 
                class="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" 
                required
              />
            </div>
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-700">Password</label>
              <input 
                v-model="password" 
                type="password" 
                class="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" 
                required
              />
            </div>
            <button
              type="submit"
              class="w-full bg-slate-900 text-white py-2 rounded hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="loading"
            >
              {{ loading ? 'Logging in...' : 'Login' }}
            </button>
            <p v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</p>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api, { IMAGE_URL } from '../services/api';
import { useRouter } from 'vue-router';

const email = ref('admin@sams.edu.kh');
const password = ref('1234');
const loading = ref(false);
const error = ref('');
const router = useRouter();
const faculties = ref(null);

const LoadFa = async () => {
  try {
    const { data } = await api.get('/schools/1');
    faculties.value = data;
    console.log(faculties);
    
  } catch (err) {
    error.value = 'Failed to load classes';
  }
};
const imageFacultiesUrl = (filename) => {
  if (!filename) return "";
  return `${IMAGE_URL}/uploads/schools/${filename}`;
};
const handleLogin = async () => {
  error.value = '';
  loading.value = true;
  try {
    const { data } = await api.post('/auth/login', {
      email: email.value,
      password: password.value,
    });

    localStorage.setItem('sams_token', data.token);
    localStorage.setItem('sams_user', JSON.stringify(data.user));
    window.location.href = '/';
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed';
  } finally {
    loading.value = false;
  }
};
onMounted(() => {
  LoadFa();
});
</script>