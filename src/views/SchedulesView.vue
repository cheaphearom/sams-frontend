<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 uppercase">Schedules Management</h2>
      <div class="text-sm text-gray-600">
        Total: <span class="font-semibold">{{ totalSchedules }}</span> schedules
      </div>
    </div>

    <!-- Filters and Actions Bar -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[260px]">
          <label class="block text-sm font-medium text-gray-700 mb-2">Filter by Class ID</label>
          <div class="flex gap-2">
            <input
              v-model.number="filterClassId"
              type="number"
              placeholder="Enter class ID"
              class="flex-1 border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              class="bg-green-600 text-white px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
              @click="fetchSchedulesByClass"
            >
              <i class="fa-solid fa-filter"></i>
              Filter
            </button>
            <button
              class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
              @click="fetchAllSchedules"
            >
              <i class="fa-solid fa-rotate"></i>
              All
            </button>
          </div>
        </div>

        <button
          class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
          @click="openForm()"
        >
          <i class="fa-solid fa-plus"></i>
          New Schedule
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
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Class</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Subject</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Day</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Time</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Room</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-200">
            <tr v-for="(s,index) in paginatedSchedules" :key="s.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-3 text-gray-900">
                {{ index + 1 + (currentPage - 1) * itemsPerPage }}
              </td>

              <td class="px-6 py-3 text-gray-900">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ s.class_name || ('Class ID: ' + (s.class_id ?? '-')) }}
                </span>
              </td>

              <td class="px-6 py-3 text-gray-900 font-medium">{{ s.subject_name || '-' }}</td>

              <td class="px-6 py-3 text-gray-900">
                {{ dayName(s.day_of_week) }}
              </td>

              <td class="px-6 py-3 text-gray-600">
                {{ s.start_time }} - {{ s.end_time }}
              </td>

              <td class="px-6 py-3 text-gray-900">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                  {{ s.room_name || ('Room ID: ' + (s.room_id ?? '-')) }}
                </span>
              </td>

              <td class="px-6 py-3 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors font-medium"
                    @click="openForm(s)"
                  >
                    <i class="fa-solid fa-pen-to-square"></i> Edit
                  </button>
                  <button
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium"
                    @click="removeSchedule(s.id)"
                  >
                    <i class="fa-solid fa-trash"></i> Delete
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!schedules || schedules.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                <i class="fa-solid fa-inbox text-3xl mb-2 block text-gray-300"></i>
                No schedules found
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="schedules && schedules.length > 0" class="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="text-sm text-gray-600">
            Showing <span class="font-medium">{{ startItem }}</span>
            to <span class="font-medium">{{ endItem }}</span>
            of <span class="font-medium">{{ totalSchedules }}</span> results
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
                    page === currentPage ? 'bg-slate-500 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
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
            {{ form.id ? 'Edit Schedule' : 'New Schedule' }}
          </h3>
        </div>

        <form @submit.prevent="save" class="px-6 py-4">
          <div class="space-y-4">
            <!-- ✅ what backend needs -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Class Subject ID</label>
              <input
                v-model.number="form.class_subject_id"
                type="number"
                class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter class_subject_id"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Room ID</label>
              <input
                v-model.number="form.room_id"
                type="number"
                class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter room_id"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Day of Week</label>
              <select
                v-model.number="form.day_of_week"
                class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option :value="0" disabled>Select day</option>
                <option :value="1">Monday</option>
                <option :value="2">Tuesday</option>
                <option :value="3">Wednesday</option>
                <option :value="4">Thursday</option>
                <option :value="5">Friday</option>
                <option :value="6">Saturday</option>
                <option :value="7">Sunday</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Start Time</label>
                <input
                  v-model="form.start_time"
                  type="time"
                  class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">End Time</label>
                <input
                  v-model="form.end_time"
                  type="time"
                  class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
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
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';

const schedules = ref([]);
const filterClassId = ref(null);
const showForm = ref(false);
const error = ref('');
const modalError = ref('');

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);

const form = ref({
  id: null,
  class_subject_id: null,
  room_id: null,
  day_of_week: 0,
  start_time: '',
  end_time: '',
});

const dayName = (d) => {
  const map = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 7: 'Sunday' };
  return map[Number(d)] || d || '-';
};

// Pagination computed
const totalSchedules = computed(() => schedules.value?.length || 0);
const totalPages = computed(() => Math.ceil(totalSchedules.value / itemsPerPage.value));

const startItem = computed(() => (totalSchedules.value === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1));
const endItem = computed(() => {
  const end = currentPage.value * itemsPerPage.value;
  return end > totalSchedules.value ? totalSchedules.value : end;
});

const paginatedSchedules = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return schedules.value.slice(start, start + itemsPerPage.value);
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
const fetchAllSchedules = async () => {
  error.value = '';
  try {
    const { data } = await api.get('/schedules');
    schedules.value = data;
    currentPage.value = 1;
  } catch (err) {
    console.error(err);
    error.value = err.response?.data?.message || 'Failed to load schedules';
  }
};

const fetchSchedulesByClass = async () => {
  error.value = '';
  if (!filterClassId.value) return fetchAllSchedules();
  try {
    const { data } = await api.get(`/schedules/by-class/${filterClassId.value}`);
    schedules.value = data;
    currentPage.value = 1;
  } catch (err) {
    console.error(err);
    error.value = err.response?.data?.message || 'Failed to filter schedules';
  }
};

const openForm = (s = null) => {
  modalError.value = '';
  if (s) {
    form.value = {
      id: s.id,
      class_subject_id: s.class_subject_id,
      room_id: s.room_id,
      day_of_week: Number(s.day_of_week) || 0,
      start_time: s.start_time,
      end_time: s.end_time,
    };
  } else {
    form.value = {
      id: null,
      class_subject_id: null,
      room_id: null,
      day_of_week: 0,
      start_time: '',
      end_time: '',
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
      class_subject_id: form.value.class_subject_id,
      room_id: form.value.room_id,
      day_of_week: form.value.day_of_week,
      start_time: form.value.start_time,
      end_time: form.value.end_time,
    };

    if (form.value.id) {
      await api.put(`/schedules/${form.value.id}`, payload);
    } else {
      await api.post('/schedules', payload);
    }

    await fetchAllSchedules();
    closeForm();
  } catch (err) {
    console.error(err);
    modalError.value = err.response?.data?.message || 'Failed to save schedule';
  }
};

const removeSchedule = async (id) => {
  if (!confirm('Delete this schedule?')) return;
  error.value = '';
  try {
    await api.delete(`/schedules/${id}`);
    await fetchAllSchedules();
  } catch (err) {
    console.error(err);
    error.value = err.response?.data?.message || 'Failed to delete schedule';
  }
};

onMounted(fetchAllSchedules);
</script>
