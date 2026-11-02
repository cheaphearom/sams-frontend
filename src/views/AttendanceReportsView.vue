<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 uppercase">Attendance Report</h2>
      <div class="text-sm text-gray-600">
        <span v-if="reportRows.length">
          Total: <span class="font-semibold">{{ reportRows.length }}</span> students
        </span>
      </div>
    </div>

    <!-- Filters and Actions Bar -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-2">Filter by Class ID</label>
          <input 
            v-model.number="classId" 
            type="number" 
            placeholder="Enter class ID"
            class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          />
        </div>
        
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-2">Schedule</label>
          <select 
            v-model.number="selectedScheduleId" 
            class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option disabled value="">-- Select schedule --</option>
            <option v-for="s in schedules" :key="s.id" :value="s.id">
              {{ s.day_of_week }} | {{ s.start_time }} - {{ s.end_time }} | Subject: {{ s.subject_name || s.class_subject_id }}
            </option>
          </select>
        </div>

        <button 
          class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm" 
          @click="loadSchedules"
        >
          <i class="fa-solid fa-rotate"></i>
          Load Schedules
        </button>

        <button 
          class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors flex items-center gap-2 shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
          :disabled="!selectedScheduleId || loading"
          @click="loadReport"
        >
          <i class="fa-solid fa-chart-column"></i>
          {{ loading ? 'Loading Report...' : 'Load Report' }}
        </button>
      </div>

      <p v-if="message" class="mt-3 text-sm" :class="messageType === 'error' ? 'text-red-600' : 'text-green-600'">
        <i :class="messageType === 'error' ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-circle-check'" class="mr-1"></i>
        {{ message }}
      </p>
    </div>

    <!-- Table Container -->
    <div v-if="reportRows.length" class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-100 border-b border-gray-200">
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">NO</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Student Name</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 text-center uppercase">Present</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 text-center uppercase">Absent</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 text-center uppercase">Late</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 text-center uppercase">Total Sessions</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 text-center uppercase">Attendance %</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr 
              v-for="(row, index) in reportRows" 
              :key="row.student_id" 
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-3 text-gray-900">{{ index + 1 }}</td>
              <td class="px-6 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {{ (row.student_name || '').charAt(0).toUpperCase() }}
                  </div>
                  <span class="text-sm font-medium text-gray-800">
                    {{ row.student_name }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-3 text-center">
                <span class="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                  {{ row.present_count }}
                </span>
              </td>
              <td class="px-6 py-3 text-center">
                <span class="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                  {{ row.absent_count }}
                </span>
              </td>
              <td class="px-6 py-3 text-center">
                <span class="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">
                  {{ row.late_count }}
                </span>
              </td>
              <td class="px-6 py-3 text-center text-gray-800 font-medium">
                {{ totalSessions(row) }}
              </td>
              <td class="px-6 py-3 text-center">
                <span 
                  class="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold border"
                  :class="attendancePercent(row) >= 80 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-orange-50 text-orange-700 border-orange-200'"
                >
                  {{ attendancePercent(row).toFixed(1) }}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center text-sm text-gray-600">
        <span>
          Showing {{ reportRows.length }} students for schedule 
          <span class="font-semibold">#{{ selectedScheduleId }}</span>
        </span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="px-6 py-12 text-center text-gray-500">
        <i class="fa-solid fa-chart-simple text-3xl mb-2 block text-gray-300"></i>
        No report data yet. Load schedules, select one, then click "Load Report".
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '../services/api';

const classId = ref(null);
const schedules = ref([]);
const selectedScheduleId = ref('');
const reportRows = ref([]);
const loading = ref(false);
const message = ref('');
const messageType = ref('success');

const loadSchedules = async () => {
  message.value = '';

  if (!classId.value) {
    messageType.value = 'error';
    message.value = 'Please enter a class ID.';
    return;
  }

  try {
    const schedRes = await api.get(`/schedules/by-class/${classId.value}`);
    schedules.value = schedRes.data || [];
    if (!schedules.value.length) {
      messageType.value = 'error';
      message.value = 'No schedules found for this class.';
    } else {
      messageType.value = 'success';
      message.value = 'Schedules loaded. Please select one and click "Load Report".';
    }
  } catch (err) {
    messageType.value = 'error';
    message.value = err.response?.data?.message || 'Failed to load schedules.';
  }
};

const loadReport = async () => {
  if (!selectedScheduleId.value) {
    messageType.value = 'error';
    message.value = 'Please select a schedule.';
    return;
  }

  loading.value = true;
  message.value = '';
  reportRows.value = [];

  try {
    const res = await api.get(`/attendance-report/schedule/${selectedScheduleId.value}`);
    // Depending on your backend response format:
    // { schedule_id, count, students: [...] }  or direct array
    const data = res.data?.students || res.data || [];
    reportRows.value = data;

    if (!data.length) {
      messageType.value = 'error';
      message.value = 'No attendance records found for this schedule.';
    } else {
      messageType.value = 'success';
      message.value = 'Report loaded successfully.';
    }
  } catch (err) {
    messageType.value = 'error';
    message.value = err.response?.data?.message || 'Failed to load report.';
  } finally {
    loading.value = false;
  }
};

// helpers for totals / percentages
const totalSessions = (row) => {
  const p = Number(row.present_count || 0);
  const a = Number(row.absent_count || 0);
  const l = Number(row.late_count || 0);
  return p + a + l;
};

const attendancePercent = (row) => {
  const total = totalSessions(row);
  if (!total) return 0;
  const present = Number(row.present_count || 0);
  return (present / total) * 100;
};
</script>
