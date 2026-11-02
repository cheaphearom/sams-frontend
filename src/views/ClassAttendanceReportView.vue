<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 uppercase">Class Attendance Report</h2>
      <div class="text-sm text-gray-600">
        Total: <span class="font-semibold">{{ rows.length }}</span> students
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Class ID</label>
          <input v-model="filters.class_id" type="number"
            class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            placeholder="e.g. 1" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">From</label>
          <input v-model="filters.from" type="date"
            class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">To</label>
          <input v-model="filters.to" type="date"
            class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent" />
        </div>

        <div class="flex items-end gap-2">
          <button
            class="w-full bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-500 transition-colors shadow-sm"
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
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Student</th>
              <th class="px-6 py-3 text-center font-semibold text-gray-700 uppercase">Present</th>
              <th class="px-6 py-3 text-center font-semibold text-gray-700 uppercase">Absent</th>
              <th class="px-6 py-3 text-center font-semibold text-gray-700 uppercase">Late</th>
              <th class="px-6 py-3 text-center font-semibold text-gray-700 uppercase">Total</th>
              <th class="px-6 py-3 text-center font-semibold text-gray-700 uppercase">Present %</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-200">
            <tr v-for="(r, idx) in rows" :key="idx" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-3 text-gray-900 font-medium">
                {{ r.student_name }} <span class="text-gray-500">({{ r.student_code }})</span>
              </td>
              <td class="px-6 py-3 text-center">{{ r.present_count }}</td>
              <td class="px-6 py-3 text-center">{{ r.absent_count }}</td>
              <td class="px-6 py-3 text-center">{{ r.late_count }}</td>
              <td class="px-6 py-3 text-center">{{ r.total_marked }}</td>
              <td class="px-6 py-3 text-center">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {{ r.present_percent }}%
                </span>
              </td>
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
  class_id: '',
  from: '',
  to: ''
});

const fetchData = async () => {
  try {
    error.value = '';
    const { data } = await api.get('/reports/class-attendance', { params: filters.value });
    rows.value = data;
  } catch (err) {
    console.error(err);
    error.value = err.response?.data?.message || 'Failed to load report';
  }
};
</script>
