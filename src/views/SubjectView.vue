<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 uppercase">Subjects Management</h2>
      <div class="text-sm text-gray-600">
        Total: <span class="font-semibold">{{ totalSubjects }}</span> subjects
      </div>
    </div>

    <!-- Actions Bar -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex flex-wrap gap-4 items-end justify-between">
        <div class="flex-1 min-w-[260px]">
          <label class="block text-sm font-medium text-gray-700 mb-2">Search (Code or Name)</label>
          <input
            v-model="search"
            type="text"
            placeholder="Type subject code or name..."
            class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
          @click="openForm()"
        >
          <i class="fa-solid fa-plus"></i>
          New Subject
        </button>
      </div>

      <p
        v-if="message"
        class="mt-3 text-sm"
        :class="messageType === 'error' ? 'text-red-600' : 'text-green-600'"
      >
        <i
          :class="messageType === 'error' ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-circle-check'"
          class="mr-1"
        ></i>
        {{ message }}
      </p>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-100 border-b border-gray-200">
              <th class="px-6 py-3 text-left font-semibold text-gray-700">NO</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700">Code</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700">Name</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700">Credit</th>
              <th class="px-6 py-3 text-center font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="(s, index) in paginatedSubjects"
              :key="s.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-3 text-gray-900">
                {{ index + 1 + (currentPage - 1) * itemsPerPage }}
              </td>

              <td class="px-6 py-3 text-gray-900">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ s.code }}
                </span>
              </td>

              <td class="px-6 py-3 text-gray-900 font-medium">
                {{ s.name }}
              </td>

              <td class="px-6 py-3 text-gray-700">
                {{ s.credit }}
              </td>

              <td class="px-6 py-3 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors font-medium"
                    @click="openForm(s)"
                  >
                    <i class="fa-solid fa-pen-to-square"></i>
                    Edit
                  </button>

                  <button
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium"
                    @click="removeSubject(s.id)"
                  >
                    <i class="fa-solid fa-trash"></i>
                    Delete
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredSubjects.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                <i class="fa-solid fa-inbox text-3xl mb-2 block text-gray-300"></i>
                No subjects found
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="filteredSubjects.length > 0" class="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="text-sm text-gray-600">
            Showing
            <span class="font-medium">{{ startItem }}</span>
            to
            <span class="font-medium">{{ endItem }}</span>
            of
            <span class="font-medium">{{ totalSubjects }}</span>
            results
          </div>

          <div class="flex items-center gap-2">
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
            {{ form.id ? 'Edit Subject' : 'New Subject' }}
          </h3>
        </div>

        <form @submit.prevent="save" class="px-6 py-4">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Code</label>
              <input
                v-model.trim="form.code"
                class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. IT101"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
              <input
                v-model.trim="form.name"
                class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. Introduction to IT"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Credit</label>
              <input
                v-model.number="form.credit"
                type="number"
                min="0"
                class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. 3"
                required
              />
            </div>
          </div>

          <p v-if="modalError" class="text-red-600 text-sm mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <i class="fa-solid fa-circle-exclamation mr-1"></i>
            {{ modalError }}
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
import { ref, computed, onMounted, watch } from 'vue';
import api from '../services/api';

const subjects = ref([]);
const search = ref('');
const showForm = ref(false);

const message = ref('');
const messageType = ref('success');
const modalError = ref('');

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);

const form = ref({
  id: null,
  code: '',
  name: '',
  credit: 0,
});

// Computed
const filteredSubjects = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return subjects.value;

  return subjects.value.filter((s) => {
    const code = (s.code || '').toLowerCase();
    const name = (s.name || '').toLowerCase();
    return code.includes(q) || name.includes(q);
  });
});

const totalSubjects = computed(() => filteredSubjects.value.length);
const totalPages = computed(() => Math.ceil(totalSubjects.value / itemsPerPage.value));

const startItem = computed(() => (totalSubjects.value === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1));
const endItem = computed(() => {
  const end = currentPage.value * itemsPerPage.value;
  return end > totalSubjects.value ? totalSubjects.value : end;
});

const paginatedSubjects = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredSubjects.value.slice(start, start + itemsPerPage.value);
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

// Watch search to reset page
watch(search, () => {
  currentPage.value = 1;
});

// Methods
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page;
};
const changeItemsPerPage = () => (currentPage.value = 1);

const fetchAll = async () => {
  message.value = '';
  try {
    const { data } = await api.get('/subjects');
    subjects.value = data;
    currentPage.value = 1;
    messageType.value = 'success';
    message.value = `Loaded ${data.length} subject(s).`;
  } catch (err) {
    messageType.value = 'error';
    message.value = err.response?.data?.message || 'Failed to load subjects';
  }
};

const openForm = (s = null) => {
  modalError.value = '';
  if (s) {
    form.value = { id: s.id, code: s.code, name: s.name, credit: s.credit };
  } else {
    form.value = { id: null, code: '', name: '', credit: 0 };
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
    const payload = { code: form.value.code, name: form.value.name, credit: form.value.credit };

    if (form.value.id) {
      await api.put(`/subjects/${form.value.id}`, payload);
      messageType.value = 'success';
      message.value = 'Subject updated successfully.';
    } else {
      await api.post('/subjects', payload);
      messageType.value = 'success';
      message.value = 'Subject created successfully.';
    }

    await fetchAll();
    closeForm();
  } catch (err) {
    modalError.value = err.response?.data?.message || 'Failed to save subject';
  }
};

const removeSubject = async (id) => {
  if (!confirm('Delete this subject?')) return;

  try {
    await api.delete(`/subjects/${id}`);
    messageType.value = 'success';
    message.value = 'Subject deleted successfully.';
    await fetchAll();
  } catch (err) {
    messageType.value = 'error';
    message.value = err.response?.data?.message || 'Failed to delete subject';
  }
};

onMounted(fetchAll);
</script>
