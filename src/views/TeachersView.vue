<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 uppercase">Teachers Management</h2>
      <div class="text-sm text-gray-600">
        Total: <span class="font-semibold">{{ teachers.length }}</span> teachers
      </div>
    </div>

    <!-- Actions Bar -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex justify-end">
        <button 
          class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm" 
          @click="openForm()"
        >
          <i class="fa-solid fa-plus"></i>
          New Teacher
        </button>
      </div>
    </div>

    <!-- Table Container -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-100 border-b border-gray-200">
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">ID</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Name</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Email</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Employee Code</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">User ID</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="t in teachers" :key="t.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-3 text-gray-900">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                  {{ t.id }}
                </span>
              </td>
              <td class="px-6 py-3 text-gray-900 font-medium">
                {{ t.name || t.full_name || t.user_name || '-' }}
              </td>
              <td class="px-6 py-3 text-gray-600">
                {{ t.email || t.user_email || '-' }}
              </td>
              <td class="px-6 py-3 text-gray-900">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {{ t.employee_code }}
                </span>
              </td>
              <td class="px-6 py-3 text-gray-900">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  User {{ t.user_id }}
                </span>
              </td>
              <td class="px-6 py-3 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button 
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors font-medium" 
                    @click="openForm(t)"
                  >
                    <i class="fa-solid fa-pen-to-square"></i>
                    Edit
                  </button>
                  <button 
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium" 
                    @click="remove(t.id)"
                  >
                    <i class="fa-solid fa-trash"></i>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!teachers || teachers.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                <i class="fa-solid fa-inbox text-3xl mb-2 block text-gray-300"></i>
                No teachers found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showForm" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ form.id ? 'Edit Teacher' : 'New Teacher' }}
          </h3>
        </div>
        
        <form @submit.prevent="save" class="px-6 py-4">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">User</label>
              <EntitySelect v-model="form.user_id" type="teacherUser" required />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Employee Code</label>
              <input 
                v-model="form.employee_code" 
                class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="Enter employee code"
                required
              />
            </div>
          </div>

          <p v-if="error" class="text-red-600 text-sm mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <i class="fa-solid fa-circle-exclamation mr-1"></i>
            {{ error }}
          </p>

          <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button 
              type="button" 
              class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2" 
              @click="closeForm"
            >
              <i class="fa-solid fa-xmark"></i>
              Cancel
            </button>
            <button 
              type="submit" 
              class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <i class="fa-solid fa-floppy-disk"></i>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import EntitySelect from '../components/EntitySelect.vue';
import { ref, onMounted } from 'vue';
import api from '../services/api';

const teachers = ref([]);
const showForm = ref(false);
const error = ref('');

const form = ref({
  id: null,
  user_id: null,
  employee_code: '',
});

const fetchTeachers = async () => {
  try {
    const { data } = await api.get('/teachers');
    teachers.value = data;
  } catch (err) {
    console.error('Failed to fetch teachers:', err);
    error.value = 'Failed to load teachers';
  }
};

const openForm = (t = null) => {
  error.value = '';
  if (t) {
    form.value = {
      id: t.id,
      user_id: t.user_id,
      employee_code: t.employee_code,
    };
  } else {
    form.value = {
      id: null,
      user_id: null,
      employee_code: '',
    };
  }
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  error.value = '';
};

const save = async () => {
  try {
    if (!form.value.user_id || !form.value.employee_code) {
      error.value = 'User and Employee Code are required.';
      return;
    }

    if (form.value.id) {
      await api.put(`/teachers/${form.value.id}`, form.value);
    } else {
      await api.post('/teachers', form.value);
    }

    await fetchTeachers();
    closeForm();
  } catch (err) {
    console.error('Failed to save teacher:', err);
    error.value = err.response?.data?.message || 'Failed to save teacher.';
  }
};

const remove = async (id) => {
  if (!confirm('Delete this teacher?')) return;
  try {
    await api.delete(`/teachers/${id}`);
    await fetchTeachers();
  } catch (err) {
    console.error('Failed to delete teacher:', err);
    error.value = 'Failed to delete teacher';
  }
};

onMounted(fetchTeachers);
</script>