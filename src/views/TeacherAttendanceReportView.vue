<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 uppercase">Teacher Attendance Report</h2>
      <div class="text-sm text-gray-600">
        Total: <span class="font-semibold">{{ rows.length }}</span> sessions
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Teacher ID</label>
          <input v-model="filters.teacher_id" type="number"
            class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. 1" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">From</label>
          <input v-model="filters.from" type="date"
            class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">To</label>
          <input v-model="filters.to" type="date"
            class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>

        <div class="flex items-end">
          <button
            class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
            @click="fetchData">
            <i class="fa-solid fa-magnifying-glass mr-2"></i>
            Search
          </button>
        </div>
      </div>

      <p v-if="error" class="text-red-600 text-sm mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
        <i class="fa-solid fa-circle-exclamation mr-1"></i>
        {{ error }}
      </p>
    </div>

    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-100 border-b border-gray-200">
              <th class="px-6 py-3 text-left font-semibold text-gray-700">Date</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700">Teacher</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700">Class</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700">Subject</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700">Remark</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-200">
            <tr v-for="(r, idx) in rows" :key="idx" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-3 text-gray-900">{{ r.session_date }}</td>
              <td class="px-6 py-3 text-gray-900 font-medium">{{ r.teacher_name || '-' }}</td>
              <td class="px-6 py-3 text-gray-900">{{ r.class_name }}</td>
              <td class="px-6 py-3 text-gray-900">{{ r.subject_name }}</td>
              <td class="px-6 py-3 text-gray-900">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="badgeClass(r.teacher_status)">
                  {{ r.teacher_status || 'not_marked' }}
                </span>
              </td>
              <td class="px-6 py-3 text-gray-900">{{ r.teacher_remark || '-' }}</td>
            </tr>

            <tr v-if="rows.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                <i class="fa-solid fa-inbox text-3xl mb-2 block text-gray-300"></i>
                No records found
              </td>
            </tr>
          </tbody>

        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '../services/api';

const rows = ref([]);
const error = ref('');

const filters = ref({
  teacher_id: '',
  from: '',
  to: ''
});

const fetchData = async () => {
  try {
    error.value = '';
    const { data } = await api.get('/reports/teacher-attendance', { params: filters.value });
    rows.value = data;
  } catch (err) {
    console.error(err);
    error.value = err.response?.data?.message || 'Failed to load report';
  }
};

const badgeClass = (status) => {
  if (status === 'present') return 'bg-green-100 text-green-800';
  if (status === 'late') return 'bg-yellow-100 text-yellow-800';
  if (status === 'absent') return 'bg-red-100 text-red-800';
  if (status === 'on_leave') return 'bg-blue-100 text-blue-800';
  return 'bg-slate-100 text-slate-800';
};
</script>
