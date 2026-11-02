<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 uppercase">Academic Terms Management</h2>
      <div class="text-sm text-gray-600">
        Total: <span class="font-semibold">{{ totalTerms }}</span> terms
      </div>
    </div>

    <!-- Actions Bar -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex flex-wrap gap-4 items-end justify-between">
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-2">Search Terms</label>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search by term name or year..."
            class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent" 
          />
        </div>
        
        <button 
          class="bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-500 transition-colors flex items-center gap-2 shadow-sm" 
          @click="openForm()"
        >
          <i class="fa-solid fa-plus"></i>
          New Term
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
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Term Name</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Start Date</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">End Date</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Status</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="(t,index) in paginatedTerms" :key="t.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-3 text-gray-900">{{ index + 1 + (currentPage - 1) * itemsPerPage }}</td>
              <td class="px-6 py-3 text-gray-900 font-medium">{{ t.name }}</td>
              <td class="px-6 py-3 text-gray-600">{{ formatDate(t.start_date) }}</td>
              <td class="px-6 py-3 text-gray-600">{{ formatDate(t.end_date) }}</td>
              <td class="px-6 py-3 text-center">
                <span :class="[
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                  getStatusClass(t)
                ]">
                  {{ getStatusText(t) }}
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
            <tr v-if="!filteredTerms || filteredTerms.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                <i class="fa-solid fa-inbox text-3xl mb-2 block text-gray-300"></i>
                No terms found
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="filteredTerms && filteredTerms.length > 0" class="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <!-- Showing info -->
          <div class="text-sm text-gray-600">
            Showing 
            <span class="font-medium">{{ startItem }}</span>
            to 
            <span class="font-medium">{{ endItem }}</span>
            of 
            <span class="font-medium">{{ totalTerms }}</span>
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
              class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
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
            {{ form.id ? 'Edit Term' : 'New Term' }}
          </h3>
        </div>
        
        <form @submit.prevent="save" class="px-6 py-4">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Term Name</label>
              <input 
                v-model="form.name" 
                class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent" 
                placeholder="e.g., Fall 2024, Spring 2025"
                required
              />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                <input 
                  v-model="form.start_date" 
                  type="date"
                  class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent" 
                  @change="calculateEndDate"
                  required
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
                <input 
                  v-model="form.end_date" 
                  type="date"
                  class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent" 
                  required
                />
              </div>
            </div>

            <!-- Term 1 Dates -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Start Date Term 1</label>
                <input 
                  v-model="form.start_date_term1"
                  type="date"
                  class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  readonly
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">End Date Term 1</label>
                <input 
                  v-model="form.end_date_term1"
                  type="date"
                  class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  readonly
                />
              </div>
            </div>

            <!-- Term 2 Dates -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Start Date Term 2</label>
                <input 
                  v-model="form.start_date_term2"
                  type="date"
                  class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  readonly
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">End Date Term 2</label>
                <input 
                  v-model="form.end_date_term2"
                  type="date"
                  class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  readonly
                />
              </div>
            </div>

          </div>

          <!-- Error display -->
          <p v-if="error" class="text-red-600 text-sm mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <i class="fa-solid fa-circle-exclamation mr-1"></i>
            {{ error }}
          </p>

          <!-- Submit buttons -->
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
import { ref, computed, watch, onMounted } from 'vue';
import api from '../services/api';

const terms = ref([]);
const searchQuery = ref('');
const showForm = ref(false);
const error = ref('');
const loading = ref(false); // Add loading state

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);

const form = ref({
  id: null,
  name: '',
  school_year_name: '',
  start_date: '',
  end_date: '',
  start_date_term1: '',
  end_date_term1: '',
  start_date_term2: '',
  end_date_term2: '',
});

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getStatusText = (term) => {
  const today = new Date();
  const start = new Date(term.start_date);
  const end = new Date(term.end_date);
  
  if (today < start) return 'Upcoming';
  if (today > end) return 'Completed';
  return 'Active';
};

const getStatusClass = (term) => {
  const status = getStatusText(term);
  if (status === 'Active') return 'bg-green-100 text-green-800';
  if (status === 'Upcoming') return 'bg-amber-100 text-amber-800';
  return 'bg-gray-100 text-gray-800';
};

// Automatically calculate Term 1 and Term 2 dates based on the start date
const calculateTermDates = () => {
  if (!form.value.start_date) return;

  const startDate = new Date(form.value.start_date);
  
  // Automatically generate End Date: add 30 days to the start date
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 30); // Adding 30 days
  form.value.end_date = endDate.toISOString().split('T')[0];
  
  // Term 1 Start Date: same as the main start date
  form.value.start_date_term1 = form.value.start_date;

  // Term 1 End Date: 15 weeks after the Term 1 start date (15 * 7 = 105 days)
  const endDateTerm1 = new Date(startDate);
  endDateTerm1.setDate(endDateTerm1.getDate() + 15 * 7); // 15 weeks after the start date
  form.value.end_date_term1 = endDateTerm1.toISOString().split('T')[0];
  
  // Term 2 Start Date: same as the end date of Term 1
  form.value.start_date_term2 = form.value.end_date_term1;

  // Term 2 End Date: 15 weeks after Term 2 Start Date
  const endDateTerm2 = new Date(form.value.start_date_term2);
  endDateTerm2.setDate(endDateTerm2.getDate() + 15 * 7); // 15 weeks after the start date of Term 2
  form.value.end_date_term2 = endDateTerm2.toISOString().split('T')[0];
};

// Watch for changes in the primary term's start date and automatically calculate Term 1 and Term 2 dates
watch(
  () => form.value.start_date,
  () => {
    calculateTermDates();
  },
  { immediate: true } // Run immediately when the component is mounted
);

// Computed properties
const filteredTerms = computed(() => {
  if (!searchQuery.value) return terms.value;
  
  const query = searchQuery.value.toLowerCase();
  return terms.value.filter(t => 
    t.name?.toLowerCase().includes(query) ||
    t.school_year_name?.toLowerCase().includes(query)
  );
});

const totalTerms = computed(() => filteredTerms.value?.length || 0);

const totalPages = computed(() => Math.ceil(totalTerms.value / itemsPerPage.value));

const startItem = computed(() => {
  if (totalTerms.value === 0) return 0;
  return (currentPage.value - 1) * itemsPerPage.value + 1;
});

const endItem = computed(() => {
  const end = currentPage.value * itemsPerPage.value;
  return end > totalTerms.value ? totalTerms.value : end;
});

const paginatedTerms = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredTerms.value.slice(start, end);
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
const fetchAllTerms = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/school-years');
    terms.value = data;
    currentPage.value = 1;
  } catch (err) {
    console.error('Failed to fetch terms:', err);
    error.value = 'Failed to load terms';
  } finally {
    loading.value = false;
  }
};

const openForm = (t = null) => {
  error.value = '';
  if (t) {
    form.value = {
      id: t.id,
      name: t.name,
      school_year_name: t.school_year_name,
      start_date: t.start_date?.split('T')[0] || '',
      end_date: t.end_date?.split('T')[0] || '',
      start_date_term1: t.start_date_term1?.split('T')[0] || '',
      end_date_term1: t.end_date_term1?.split('T')[0] || '',
      start_date_term2: t.start_date_term2?.split('T')[0] || '',
      end_date_term2: t.end_date_term2?.split('T')[0] || ''
    };
  } else {
    form.value = {
      id: null,
      name: '',
      school_year_name: '',
      start_date: '',
      end_date: '',
      start_date_term1: '',
      end_date_term1: '',
      start_date_term2: '',
      end_date_term2: '',
    };
  }
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  error.value = '';
};

const save = async () => {
  if (!form.value.start_date) {
    error.value = 'Please provide a start date for the term.';
    return;
  }
  
  try {
    const payload = {
      name: form.value.name,
      school_year_name: form.value.school_year_name,
      start_date: form.value.start_date,
      end_date: form.value.end_date,
      start_date_term1: form.value.start_date_term1,
      end_date_term1: form.value.end_date_term1,
      start_date_term2: form.value.start_date_term2,
      end_date_term2: form.value.end_date_term2
    };
    
    if (form.value.id) {
      await api.put(`/school-years/${form.value.id}`, payload);
    } else {
      await api.post('/school-years', payload);
    }
    await fetchAllTerms();
    closeForm();
  } catch (err) {
    console.error('Failed to save term:', err);
    error.value = err.response?.data?.message || 'Failed to save';
  }
};

const remove = async (id) => {
  if (!confirm('Delete this term? This may affect related data.')) return;
  try {
    await api.delete(`/school-years/${id}`);
    
    if (paginatedTerms.value.length === 1 && currentPage.value > 1) {
      currentPage.value--;
    }
    
    await fetchAllTerms();
  } catch (err) {
    console.error('Failed to delete term:', err);
    error.value = 'Failed to delete term';
  }
};

onMounted(fetchAllTerms);
</script>