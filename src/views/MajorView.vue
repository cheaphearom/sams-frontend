<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 uppercase">Majors Management</h2>
      <div class="text-sm text-gray-600">
        Total: <span class="font-semibold">{{ totalMajors }}</span> majors
      </div>
    </div>

    <!-- Actions Bar -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex flex-wrap gap-4 items-end justify-between">
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-2">Search Majors</label>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search by name or code..."
            class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          />
        </div>
        
        <button 
          class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm" 
          @click="openForm()"
        >
          <i class="fa-solid fa-plus"></i>
          New Major
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
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Major Code</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Major Name</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Description</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Faculty</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="(m,index) in paginatedMajors" :key="m.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-3 text-gray-900">{{ index + 1 + (currentPage - 1) * itemsPerPage }}</td>
              <td class="px-6 py-3 text-gray-900">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {{ m.code }}
                </span>
              </td>
              <td class="px-6 py-3 text-gray-900 font-medium">{{ m.name }}</td>
              <td class="px-6 py-3 text-gray-600">
                <span class="line-clamp-2">{{ m.description || 'No description' }}</span>
              </td>
              <td class="px-6 py-3 text-gray-900">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  {{ m.faculty || 'N/A' }}
                </span>
              </td>
              <td class="px-6 py-3 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button 
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors font-medium" 
                    @click="openForm(m)"
                  >
                    <i class="fa-solid fa-pen-to-square"></i>
                    Edit
                  </button>
                  <button 
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium" 
                    @click="remove(m.id)"
                  >
                    <i class="fa-solid fa-trash"></i>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredMajors || filteredMajors.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                <i class="fa-solid fa-inbox text-3xl mb-2 block text-gray-300"></i>
                No majors found
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="filteredMajors && filteredMajors.length > 0" class="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <!-- Showing info -->
          <div class="text-sm text-gray-600">
            Showing 
            <span class="font-medium">{{ startItem }}</span>
            to 
            <span class="font-medium">{{ endItem }}</span>
            of 
            <span class="font-medium">{{ totalMajors }}</span>
            results
          </div>

          <!-- Pagination controls -->
          <div class="flex items-center gap-2">
            <!-- Previous button -->
            <button 
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              :class="[
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                currentPage === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              ]"
            >
              <i class="fa-solid fa-chevron-left"></i>
              <span class="hidden sm:inline ml-1">Previous</span>
            </button>

            <!-- Page numbers -->
            <div class="flex items-center gap-1">
              <template v-for="page in visiblePages" :key="page">
                <span v-if="page === '...'" class="px-2 text-gray-400">...</span>
                <button
                  v-else
                  @click="goToPage(page)"
                  :class="[
                    'min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors',
                    page === currentPage
                      ? 'bg-slate-500 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  ]"
                >
                  {{ page }}
                </button>
              </template>
            </div>

            <!-- Next button -->
            <button 
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              :class="[
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                currentPage === totalPages 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              ]"
            >
              <span class="hidden sm:inline mr-1">Next</span>
              <i class="fa-solid fa-chevron-right"></i>
            </button>
          </div>

          <!-- Items per page -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">Per page:</label>
            <select 
              v-model.number="itemsPerPage" 
              @change="changeItemsPerPage"
              class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showForm" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ form.id ? 'Edit Major' : 'New Major' }}
          </h3>
        </div>
        
        <form @submit.prevent="save" class="px-6 py-4">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Major Code</label>
              <input 
                v-model="form.major_code" 
                class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="e.g., CS, ENG, BUS"
                required
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Major Name</label>
              <input 
                v-model="form.major_name" 
                class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="e.g., Computer Science"
                required
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea 
                v-model="form.description" 
                rows="3"
                class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" 
                placeholder="Enter major description..."
              ></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Faculty</label>
              <input 
                v-model="form.faculty" 
                class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="e.g., Faculty of Engineering"
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
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';

const majors = ref([]);
const searchQuery = ref('');
const showForm = ref(false);
const error = ref('');

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);

const form = ref({
  id: null,
  major_code: '',
  major_name: '',
  description: '',
  faculty: '',
});

// Computed properties
const filteredMajors = computed(() => {
  if (!searchQuery.value) return majors.value;
  
  const query = searchQuery.value.toLowerCase();
  return majors.value.filter(m => 
    m.major_code?.toLowerCase().includes(query) ||
    m.major_name?.toLowerCase().includes(query) ||
    m.description?.toLowerCase().includes(query) ||
    m.faculty?.toLowerCase().includes(query)
  );
});

const totalMajors = computed(() => filteredMajors.value?.length || 0);

const totalPages = computed(() => Math.ceil(totalMajors.value / itemsPerPage.value));

const startItem = computed(() => {
  if (totalMajors.value === 0) return 0;
  return (currentPage.value - 1) * itemsPerPage.value + 1;
});

const endItem = computed(() => {
  const end = currentPage.value * itemsPerPage.value;
  return end > totalMajors.value ? totalMajors.value : end;
});

const paginatedMajors = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredMajors.value.slice(start, end);
});

const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value;
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    
    if (current > 3) {
      pages.push('...');
    }
    
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }
    
    if (current < total - 2) {
      pages.push('...');
    }
    
    pages.push(total);
  }
  
  return pages;
});

// Pagination methods
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const changeItemsPerPage = () => {
  currentPage.value = 1;
};

// API methods
const fetchAllMajors = async () => {
  try {
    const { data } = await api.get('/majors');
    majors.value = data;
    console.log(majors.value);
    currentPage.value = 1;
  } catch (err) {
    console.error('Failed to fetch majors:', err);
    error.value = 'Failed to load majors';
  }
};

const openForm = (m = null) => {
  error.value = '';
  if (m) {
    form.value = {
      id: m.id,
      major_code: m.major_code,
      major_name: m.major_name,
      description: m.description || '',
      faculty: m.faculty || ''
    };
  } else {
    form.value = {
      id: null,
      major_code: '',
      major_name: '',
      description: '',
      faculty: '',
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
    const payload = {
      major_code: form.value.major_code,
      major_name: form.value.major_name,
      description: form.value.description || undefined,
      faculty: form.value.faculty || undefined
    };
    
    if (form.value.id) {
      await api.put(`/majors/${form.value.id}`, payload);
    } else {
      await api.post('/majors', payload);
    }
    await fetchAllMajors();
    closeForm();
  } catch (err) {
    console.error('Failed to save major:', err);
    error.value = err.response?.data?.message || 'Failed to save';
  }
};

const remove = async (id) => {
  if (!confirm('Delete this major? This may affect related data.')) return;
  try {
    await api.delete(`/majors/${id}`);
    
    if (paginatedMajors.value.length === 1 && currentPage.value > 1) {
      currentPage.value--;
    }
    
    await fetchAllMajors();
  } catch (err) {
    console.error('Failed to delete major:', err);
    error.value = 'Failed to delete major';
  }
};

onMounted(fetchAllMajors);
</script>