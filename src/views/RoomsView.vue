<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 uppercase">Rooms Management</h2>
      <div class="text-sm text-gray-600">
        Total: <span class="font-semibold">{{ rooms.length }}</span> rooms
      </div>
    </div>

    <!-- Actions Bar -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex justify-end">
        <button 
          class="bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-500 transition-colors flex items-center gap-2 shadow-sm" 
          @click="openForm()"
        >
          <i class="fa-solid fa-plus"></i>
          New Room
        </button>
      </div>
    </div>

    <!-- Table Container -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-100 border-b border-gray-200">
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">NO</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Name</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Capacity</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="(item, index) in rooms" :key="item.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-3 text-gray-900">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                  {{ index + 1 }}
                </span>
              </td>
              <td class="px-6 py-3 text-gray-900 font-medium">{{ item.name }}</td>
              <td class="px-6 py-3 text-gray-900">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <i class="fa-solid fa-users mr-1"></i>
                  {{ item.capacity }} people
                </span>
              </td>
              <td class="px-6 py-3 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button 
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors font-medium" 
                    @click="openForm(item)"
                  >
                    <i class="fa-solid fa-pen-to-square"></i>
                    Edit
                  </button>
                  <button 
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium" 
                    @click="remove(item.id)"
                  >
                    <i class="fa-solid fa-trash"></i>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!rooms || rooms.length === 0">
              <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                <i class="fa-solid fa-inbox text-3xl mb-2 block text-gray-300"></i>
                No rooms found
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
            {{ form.id ? 'Edit Room' : 'New Room' }}
          </h3>
        </div>
        
        <form @submit.prevent="save" class="px-6 py-4">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Room Name</label>
              <input 
                v-model="form.name" 
                class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent" 
                placeholder="Enter room name"
                required
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Capacity</label>
              <input 
                v-model.number="form.capacity" 
                type="number" 
                min="1"
                class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent" 
                placeholder="Enter room capacity"
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
              class="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm"
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
import { ref, onMounted } from 'vue';
import api from '../services/api';

const rooms = ref([]);
const showForm = ref(false);
const error = ref('');

const form = ref({
  id: null,
  name: '',
  capacity: 1,
});

const fetchRooms = async () => {
  try {
    const { data } = await api.get('/rooms');
    rooms.value = data;
  } catch (err) {
    console.error('Failed to fetch rooms:', err);
    error.value = 'Failed to load rooms';
  }
};

const openForm = (item = null) => {
  error.value = '';
  if (item) {
    form.value = { ...item };
  } else {
    form.value = { 
      id: null, 
      name: '', 
      capacity: 1, 
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
    if (form.value.id) {
      await api.put(`/rooms/${form.value.id}`, form.value);
    } else {
      await api.post('/rooms', form.value);
    }
    await fetchRooms();
    closeForm();
  } catch (err) {
    console.error('Failed to save room:', err);
    error.value = err.response?.data?.message || 'Failed to save';
  }
};

const remove = async (id) => {
  if (!confirm('Delete this room?')) return;
  try {
    await api.delete(`/rooms/${id}`);
    await fetchRooms();
  } catch (err) {
    console.error('Failed to delete room:', err);
    error.value = 'Failed to delete room';
  }
};

onMounted(fetchRooms);
</script>