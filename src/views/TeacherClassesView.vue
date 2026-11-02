<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 uppercase">Teacher Classes Management</h2>
      <div class="text-sm text-gray-600">
        Total: <span class="font-semibold">{{ totalItems }}</span> records
      </div>
    </div>

    <!-- Filters + Actions -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[260px]">
          <label class="block text-sm font-medium text-gray-700 mb-2">Filter by Teacher</label>
          <div class="flex gap-2">
            <EntitySelect v-model="filterTeacherId" type="teacher" class="flex-1" />
            <button
              class="bg-green-600 text-white px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
              @click="fetchByTeacher"
            >
              <i class="fa-solid fa-filter"></i>
              Filter
            </button>
          </div>
        </div>

        <div class="flex-1 min-w-[260px]">
          <label class="block text-sm font-medium text-gray-700 mb-2">Filter by Class</label>
          <div class="flex gap-2">
            <EntitySelect v-model="filterClassId" type="class" class="flex-1" />
            <button
              class="bg-green-600 text-white px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
              @click="fetchByClass"
            >
              <i class="fa-solid fa-filter"></i>
              Filter
            </button>
          </div>
        </div>
            <button
              class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
              @click="fetchAll"
            >
              <i class="fa-solid fa-rotate"></i>
              All
            </button>       
        <button
          class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
          @click="openForm()"
        >
          <i class="fa-solid fa-plus"></i> New Assign
        </button>
      </div>

      <p v-if="error" class="mt-3 text-sm text-red-600">
        <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ error }}
      </p>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-100 border-b border-gray-200">
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">NO</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Teacher</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Class</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-200">
            <tr v-for="(x, index) in paginatedItems" :key="x.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-3 text-gray-900">
                {{ index + 1 + (currentPage - 1) * itemsPerPage }}
              </td>

              <td class="px-6 py-3 text-gray-900">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ x.teacher_name || (x.first_name ? `${x.first_name} ${x.last_name || ''}`.trim() : ('Teacher ID: ' + (x.teacher_id ?? '-'))) }}
                </span>
              </td>

              <td class="px-6 py-3 text-gray-900">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                  {{ x.class_name || ('Class ID: ' + (x.class_id ?? '-')) }}
                </span>
              </td>

              <td class="px-6 py-3 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors font-medium"
                    @click="openForm(x)"
                  >
                    <i class="fa-solid fa-pen-to-square"></i> Edit
                  </button>
                  <button
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium"
                    @click="removeItem(x.id)"
                  >
                    <i class="fa-solid fa-trash"></i> Delete
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!items || items.length === 0">
              <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                <i class="fa-solid fa-inbox text-3xl mb-2 block text-gray-300"></i>
                No records found
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="items && items.length > 0" class="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="text-sm text-gray-600">
            Showing <span class="font-medium">{{ startItem }}</span>
            to <span class="font-medium">{{ endItem }}</span>
            of <span class="font-medium">{{ totalItems }}</span> results
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              :class="[
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              ]"
            >
              <i class="fa-solid fa-chevron-left"></i>
              <span class="hidden sm:inline ml-1">Previous</span>
            </button>

            <div class="flex items-center gap-1">
              <template v-for="page in visiblePages" :key="page">
                <span v-if="page === '...'" class="px-2 text-gray-400">...</span>
                <button
                  v-else
                  @click="goToPage(page)"
                  :class="[
                    'min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors',
                    page === currentPage ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  ]"
                >
                  {{ page }}
                </button>
              </template>
            </div>

            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              :class="[
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              ]"
            >
              <span class="hidden sm:inline mr-1">Next</span>
              <i class="fa-solid fa-chevron-right"></i>
            </button>
          </div>

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
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ form.id ? 'Edit Assign' : 'New Assign' }}
          </h3>
        </div>

        <form @submit.prevent="save" class="px-6 py-4">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Teacher</label>
              <EntitySelect v-model="form.teacher_id" type="teacher" required />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Class</label>
              <EntitySelect v-model="form.class_id" type="class" required />
            </div>
          </div>

          <div v-if="modalError" class="text-red-600 text-sm mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <i class="fa-solid fa-circle-exclamation mr-1"></i>
            {{ modalError }}
          </div>

          <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
              @click="closeForm"
            >
              <i class="fa-solid fa-xmark"></i> Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <i class="fa-solid fa-floppy-disk"></i> Save
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import EntitySelect from '../components/EntitySelect.vue';
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';

const items = ref([]);
const filterTeacherId = ref(null);
const filterClassId = ref(null);
const showForm = ref(false);
const error = ref('');
const modalError = ref('');

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);

const form = ref({
  id: null,
  teacher_id: null,
  class_id: null,
});

// Pagination computed
const totalItems = computed(() => items.value?.length || 0);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

const startItem = computed(() => (totalItems.value === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1));
const endItem = computed(() => {
  const end = currentPage.value * itemsPerPage.value;
  return end > totalItems.value ? totalItems.value : end;
});

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return items.value.slice(start, start + itemsPerPage.value);
});

const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push('...');
    pages.push(total);
  }
  return pages;
});

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page;
};
const changeItemsPerPage = () => (currentPage.value = 1);

// API
const fetchAll = async () => {
  error.value = '';
  try {
    const { data } = await api.get('/teacher-classes');
    items.value = data;
    currentPage.value = 1;
  } catch (err) {
    console.error(err);
    error.value = err.response?.data?.message || 'Failed to load teacher classes';
  }
};

const fetchByTeacher = async () => {
  error.value = '';
  if (!filterTeacherId.value) return fetchAll();
  try {
    const { data } = await api.get(`/teacher-classes/by-teacher/${filterTeacherId.value}`);
    items.value = data;
    currentPage.value = 1;
  } catch (err) {
    console.error(err);
    error.value = err.response?.data?.message || 'Failed to filter by teacher';
  }
};

const fetchByClass = async () => {
  error.value = '';
  if (!filterClassId.value) return fetchAll();
  try {
    const { data } = await api.get(`/teacher-classes/by-class/${filterClassId.value}`);
    items.value = data;
    currentPage.value = 1;
  } catch (err) {
    console.error(err);
    error.value = err.response?.data?.message || 'Failed to filter by class';
  }
};

const openForm = (x = null) => {
  modalError.value = '';
  if (x) {
    form.value = {
      id: x.id,
      teacher_id: x.teacher_id,
      class_id: x.class_id,
    };
  } else {
    form.value = {
      id: null,
      teacher_id: null,
      class_id: null,
    };
  }
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  modalError.value = '';
};

const save = async () => {
  modalError.value = '';
  try {
    const payload = {
      teacher_id: form.value.teacher_id,
      class_id: form.value.class_id,
    };

    if (form.value.id) {
      await api.put(`/teacher-classes/${form.value.id}`, payload);
    } else {
      await api.post('/teacher-classes', payload);
    }

    await fetchAll();
    closeForm();
  } catch (err) {
    console.error(err);
    modalError.value = err.response?.data?.message || 'Failed to save';
  }
};

const removeItem = async (id) => {
  if (!confirm('Delete this assign?')) return;
  error.value = '';
  try {
    await api.delete(`/teacher-classes/${id}`);
    await fetchAll();
  } catch (err) {
    console.error(err);
    error.value = err.response?.data?.message || 'Failed to delete';
  }
};

onMounted(fetchAll);
</script>
