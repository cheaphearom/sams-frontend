<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 uppercase">Users Management</h2>
      <div class="text-sm text-gray-600">
        Total: <span class="font-semibold">{{ totalUsers }}</span> users
      </div>
    </div>

    <!-- Actions Bar -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex flex-wrap gap-4 items-end justify-between">
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search by name, email, or role..."
            class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent" 
          />
        </div>
        
        <button 
          class="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm" 
          @click="openForm()"
        >
          <i class="fa-solid fa-plus"></i>
          New User
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
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Image</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Name</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Email</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Role</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Status</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr 
              v-for="(user,index) in paginatedUsers" 
              :key="user.id" 
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-3 text-gray-900">
                {{ index + 1 + (currentPage - 1) * itemsPerPage }}
              </td>
              <td class="px-6 py-3">
                <img 
                  v-if="user.image"
                  :src="imageUrl(user.image)"
                  alt="User image"
                  class="w-10 h-10 rounded-full object-cover border border-gray-200"
                />
                <div v-else class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <i class="fa-solid fa-user text-gray-400"></i>
                </div>
              </td>
              <td class="px-6 py-3 text-gray-900 font-medium">{{ user.name }}</td>
              <td class="px-6 py-3 text-gray-600">{{ user.email }}</td>
              <td class="px-6 py-3">
                <span :class="[
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                  getRoleClass(user.role)
                ]">
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-3 text-center">
                <span :class="[
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                  user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                ]">
                  {{ user.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-3 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button 
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors font-medium" 
                    @click="openForm(user)"
                  >
                    <i class="fa-solid fa-pen-to-square"></i>
                    Edit
                  </button>
                  <button 
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium" 
                    @click="remove(user.id)"
                  >
                    <i class="fa-solid fa-trash"></i>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredUsers || filteredUsers.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                <i class="fa-solid fa-inbox text-3xl mb-2 block text-gray-300"></i>
                No users found
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination (child component) -->
      <UsersPagination
        v-if="filteredUsers && filteredUsers.length > 0"
        :current-page="currentPage"
        :total-pages="totalPages"
        :start-item="startItem"
        :end-item="endItem"
        :total-items="totalUsers"
        :items-per-page="itemsPerPage"
        @change-page="goToPage"
        @change-per-page="updateItemsPerPage"
      />
    </div>

    <!-- Modal (child component) -->
    <UserFormModal
      :show="showForm"
      :user="editingUser"
      :error="error"
      @close="closeForm"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api, { IMAGE_URL } from '../services/api';
import UsersPagination from '../components/user/UsersPagination.vue';
import UserFormModal from '../components/user/UserFormModal.vue';

const users = ref([]);
const searchQuery = ref('');
const showForm = ref(false);
const error = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const editingUser = ref(null);

// Helper functions
const getRoleClass = (role) => {
  const roleClasses = {
    admin: 'bg-purple-100 text-purple-800',
    teacher: 'bg-blue-100 text-blue-800',
    student: 'bg-green-100 text-green-800',
  };
  return roleClasses[role?.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

const imageUrl = (filename) => {
  if (!filename) return '';
  return `${IMAGE_URL}/uploads/users/${filename}`;
};

// Computed
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  const q = searchQuery.value.toLowerCase();
  return users.value.filter(u =>
    u.name?.toLowerCase().includes(q) ||
    u.email?.toLowerCase().includes(q) ||
    u.role?.toLowerCase().includes(q)
  );
});

const totalUsers = computed(() => filteredUsers.value?.length || 0);
const totalPages = computed(() => Math.ceil(totalUsers.value / itemsPerPage.value) || 1);

const startItem = computed(() => {
  if (totalUsers.value === 0) return 0;
  return (currentPage.value - 1) * itemsPerPage.value + 1;
});

const endItem = computed(() => {
  const end = currentPage.value * itemsPerPage.value;
  return end > totalUsers.value ? totalUsers.value : end;
});

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredUsers.value.slice(start, end);
});

// Pagination methods
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const updateItemsPerPage = (perPage) => {
  itemsPerPage.value = perPage;
  currentPage.value = 1;
};

// API
const fetchAllUsers = async () => {
  try {
    const { data } = await api.get('/users');
    users.value = data;
    currentPage.value = 1;
  } catch (err) {
    console.error('Failed to fetch users:', err);
    error.value = 'Failed to load users';
  }
};

// Modal control
const openForm = (user = null) => {
  error.value = '';
  editingUser.value = user ? { ...user } : null;
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  error.value = '';
  editingUser.value = null;
};

// Handle save from modal
const handleSave = async ({ form, imageFile }) => {
  try {
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('email', form.email);
    formData.append('role', form.role);
    formData.append('is_active', form.is_active);

    if (!form.id || form.password) {
      formData.append('password', form.password);
    }

    if (imageFile) {
      formData.append('image', imageFile);
    } else if (form.image && form.id) {
      formData.append('image', form.image);
    }

    if (form.id) {
      await api.put(`/users/${form.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } else {
      await api.post('/users', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }

    await fetchAllUsers();
    closeForm();
  } catch (err) {
    console.error('Failed to save user:', err);
    error.value = err.response?.data?.message || 'Failed to save';
  }
};

// Delete
const remove = async (id) => {
  if (!confirm('Delete this user? This action cannot be undone.')) return;
  try {
    await api.delete(`/users/${id}`);

    if (paginatedUsers.value.length === 1 && currentPage.value > 1) {
      currentPage.value--;
    }

    await fetchAllUsers();
  } catch (err) {
    console.error('Failed to delete user:', err);
    error.value = 'Failed to delete user';
  }
};

onMounted(fetchAllUsers);
</script>
