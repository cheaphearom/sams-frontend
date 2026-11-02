<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 uppercase">Fix Attendance</h2>
      <div class="text-sm text-gray-600">
        <span v-if="students.length">
          Total: <span class="font-semibold">{{ students.length }}</span> students
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

        <div class="flex-1 min-w-[260px]">
          <label class="block text-sm font-medium text-gray-700 mb-2">Schedule</label>
          <select
            v-model.number="selectedScheduleId"
            class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option disabled :value="0">-- Select schedule --</option>
            <option v-for="s in schedules" :key="s.schedule_id" :value="s.schedule_id">
              {{ s.day_of_week }} | {{ s.start_time }} - {{ s.end_time }} | Subject: {{ s.subject_name || s.class_subject_id }}
            </option>
          </select>
        </div>

        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-2">Session Date</label>
          <input
            v-model="sessionDate"
            type="date"
            class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
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
          :disabled="!selectedScheduleId || !sessionDate || loading"
          @click="loadFixData"
        >
          <i class="fa-solid fa-folder-open"></i>
          {{ loading ? 'Loading...' : 'Load Records' }}
        </button>

        <button
          class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-500 transition-colors flex items-center gap-2 shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
          :disabled="!students.length || saving"
          @click="saveFix"
        >
          <i class="fa-solid fa-floppy-disk"></i>
          {{ saving ? 'Saving...' : 'Save Fix' }}
        </button>
      </div>

      <p v-if="message" class="mt-3 text-sm" :class="messageType === 'error' ? 'text-red-600' : 'text-green-600'">
        <i :class="messageType === 'error' ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-circle-check'" class="mr-1"></i>
        {{ message }}
      </p>
    </div>

    <!-- Table Container -->
    <div v-if="students.length" class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-100 border-b border-gray-200">
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">NO</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Student</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Status</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Remark</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-200">
            <tr v-for="(st, index) in students" :key="st.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-3 text-gray-900">{{ index + 1 }}</td>

              <td class="px-6 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {{ (fullName(st) || '').charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-800">{{ fullName(st) }}</div>
                    <div class="text-xs text-gray-500">{{ st.student_code || ('ID: ' + st.id) }}</div>
                  </div>
                </div>
              </td>

              <td class="px-6 py-3 text-center">
                <select
                  v-model="recordsMap[st.id].status"
                  class="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="present">present</option>
                  <option value="absent">absent</option>
                  <option value="late">late</option>
                </select>

                <div class="mt-2">
                  <span
                    class="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold border"
                    :class="badgeClass(recordsMap[st.id].status)"
                  >
                    {{ recordsMap[st.id].status }}
                  </span>
                </div>
              </td>

              <td class="px-6 py-3">
                <input
                  v-model="recordsMap[st.id].remark"
                  type="text"
                  placeholder="optional"
                  class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center text-sm text-gray-600">
        <span>
          Schedule <span class="font-semibold">#{{ selectedScheduleId }}</span> • Date <span class="font-semibold">{{ sessionDate }}</span>
        </span>
        <span class="text-gray-500">
          Present: <span class="font-semibold">{{ countStatus('present') }}</span> •
          Absent: <span class="font-semibold">{{ countStatus('absent') }}</span> •
          Late: <span class="font-semibold">{{ countStatus('late') }}</span>
        </span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="px-6 py-12 text-center text-gray-500">
        <i class="fa-solid fa-pen-to-square text-3xl mb-2 block text-gray-300"></i>
        Enter class ID, load schedules, select schedule + date, then load records.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import api from '../services/api';

const classId = ref(null);
const schedules = ref([]);
const selectedScheduleId = ref(0);
const sessionDate = ref(new Date().toISOString().slice(0, 10));

const students = ref([]);
const recordsMap = reactive({}); // { [student_id]: { status, remark } }

const loading = ref(false);
const saving = ref(false);

const message = ref('');
const messageType = ref('success');

const setMsg = (type, text) => {
  messageType.value = type;
  message.value = text;
};

const fullName = (st) => `${st.first_name || ''} ${st.last_name || ''}`.trim();

const badgeClass = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'present') return 'bg-green-50 text-green-700 border-green-200';
  if (s === 'absent') return 'bg-red-50 text-red-700 border-red-200';
  return 'bg-yellow-50 text-yellow-700 border-yellow-200'; // late
};

const resetRecordsDefaults = () => {
  Object.keys(recordsMap).forEach((k) => delete recordsMap[k]);
  students.value.forEach((st) => {
    recordsMap[st.id] = { status: 'present', remark: '' };
  });
};

const mergeExistingRecords = (records) => {
  (records || []).forEach((r) => {
    if (recordsMap[r.student_id]) {
      recordsMap[r.student_id].status = r.status;
      recordsMap[r.student_id].remark = r.remark || '';
    }
  });
};

const countStatus = (status) => {
  const s = String(status || '').toLowerCase();
  let n = 0;
  students.value.forEach((st) => {
    if ((recordsMap[st.id]?.status || '').toLowerCase() === s) n++;
  });
  return n;
};

const loadSchedules = async () => {
  message.value = '';
  schedules.value = [];
  selectedScheduleId.value = 0;
  students.value = [];
  Object.keys(recordsMap).forEach((k) => delete recordsMap[k]);

  if (!classId.value) {
    setMsg('error', 'Please enter a class ID.');
    return;
  }

  try {
    const res = await api.get(`/fix-attendance/schedules/by-class/${classId.value}`);
    schedules.value = res.data || [];
    if (!schedules.value.length) setMsg('error', 'No schedules found for this class.');
    else setMsg('success', 'Schedules loaded. Select one and load records.');
  } catch (err) {
    setMsg('error', err.response?.data?.message || 'Failed to load schedules.');
  }
};

const loadFixData = async () => {
  message.value = '';
  students.value = [];
  Object.keys(recordsMap).forEach((k) => delete recordsMap[k]);

  if (!selectedScheduleId.value || !sessionDate.value) {
    setMsg('error', 'Please select schedule and date.');
    return;
  }

  loading.value = true;
  try {
    const res = await api.get('/fix-attendance/data', {
      params: { schedule_id: selectedScheduleId.value, session_date: sessionDate.value },
    });

    const data = res.data || {};
    students.value = data.students || [];

    resetRecordsDefaults();
    mergeExistingRecords(data.records || []);

    if (!students.value.length) setMsg('error', 'No students found for this session/class.');
    else setMsg('success', 'Records loaded. Edit wrong records and click "Save Fix".');
  } catch (err) {
    setMsg('error', err.response?.data?.message || 'Failed to load records.');
  } finally {
    loading.value = false;
  }
};

const saveFix = async () => {
  message.value = '';
  if (!students.value.length) return;

  saving.value = true;
  try {
    const payload = {
      schedule_id: selectedScheduleId.value,
      session_date: sessionDate.value,
      records: students.value.map((st) => ({
        student_id: st.id,
        status: recordsMap[st.id]?.status || 'present',
        remark: recordsMap[st.id]?.remark || '',
      })),
    };

    await api.post('/fix-attendance/submit', payload);
    setMsg('success', 'Attendance fixed successfully.');
  } catch (err) {
    setMsg('error', err.response?.data?.message || 'Failed to save fix.');
  } finally {
    saving.value = false;
  }
};
</script>
