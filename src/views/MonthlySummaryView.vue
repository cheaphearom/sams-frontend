<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 uppercase">Monthly Summary</h2>
      <div class="text-sm text-gray-600">
        Total: <span class="font-semibold">{{ rows.length }}</span> classes
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Month</label>
          <input v-model="filters.ym" type="month"
            class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent" />
        </div>

        <div class="flex items-end">
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
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Month</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Class</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Sessions</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Present</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Absent</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Late</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Total Marked</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Present %</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-200">
            <tr v-for="(r, idx) in rows" :key="idx" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-3 text-gray-900">{{ r.ym }}</td>
              <td class="px-6 py-3 text-gray-900 font-medium">{{ r.class_name }}</td>
              <td class="px-6 py-3 text-center">{{ r.sessions_count }}</td>
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
              <td colspan="8" class="px-6 py-12 text-center text-gray-500">
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
  ym: ''
});

const fetchData = async () => {
  try {
    error.value = '';
    const params = { ...filters.value };
    // <input type="month"> gives "YYYY-MM" already
    const { data } = await api.get('/reports/monthly-summary', { params });
    rows.value = data;
  } catch (err) {
    console.error(err);
    error.value = err.response?.data?.message || 'Failed to load report';
  }
};
</script>
