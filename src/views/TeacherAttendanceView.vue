<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 uppercase">Teacher Attendance</h2>
      <div class="text-sm text-gray-600">
        <span v-if="detail">
          Schedule: <span class="font-semibold">#{{ selectedScheduleId }}</span>
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
              {{ s.day_of_week }} | {{ s.start_time }} - {{ s.end_time }} | {{ s.subject_name || s.class_subject_id }}
              | {{ s.teacher_name || (s.first_name ? (s.first_name + ' ' + (s.last_name || '')) : 'No teacher') }}
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
          @click="loadSession"
        >
          <i class="fa-solid fa-folder-open"></i>
          {{ loading ? 'Loading...' : 'Load Session' }}
        </button>

        <button
          class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-500 transition-colors flex items-center gap-2 shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
          :disabled="!detail || saving"
          @click="saveTeacherAttendance"
        >
          <i class="fa-solid fa-floppy-disk"></i>
          {{ saving ? 'Saving...' : 'Save' }}
        </button>
      </div>

      <p v-if="message" class="mt-3 text-sm" :class="messageType === 'error' ? 'text-red-600' : 'text-green-600'">
        <i :class="messageType === 'error' ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-circle-check'" class="mr-1"></i>
        {{ message }}
      </p>
    </div>

    <!-- Table Container -->
    <div v-if="detail" class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-100 border-b border-gray-200">
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Teacher</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Class / Subject</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Status</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Remark</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-200">
            <tr class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {{ (teacherDisplay || '?').charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-800">{{ teacherDisplay }}</div>
                    <div class="text-xs text-gray-500">{{ detail.employee_code || '' }}</div>
                  </div>
                </div>
              </td>

              <td class="px-6 py-3">
                <div class="text-sm font-medium text-gray-800">
                  {{ detail.class_name || ('Class ID: ' + detail.class_id) }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ detail.subject_name }} ({{ detail.subject_code }})
                </div>
              </td>

              <td class="px-6 py-3 text-center">
                <select
                  v-model="teacherStatus"
                  class="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="present">present</option>
                  <option value="absent">absent</option>
                  <option value="late">late</option>
                  <option value="on_leave">on_leave</option>
                </select>

                <div class="mt-2">
                  <span
                    class="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold border"
                    :class="badgeClass(teacherStatus)"
                  >
                    {{ teacherStatus }}
                  </span>
                </div>
              </td>

              <td class="px-6 py-3">
                <input
                  v-model="teacherRemark"
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
          Date <span class="font-semibold">{{ sessionDate }}</span> •
          Session <span class="font-semibold">#{{ detail.attendance_session_id }}</span>
        </span>
        <span class="text-gray-500">
          Room: <span class="font-semibold">{{ scheduleRoom }}</span>
        </span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="px-6 py-12 text-center text-gray-500">
        <i class="fa-solid fa-user-check text-3xl mb-2 block text-gray-300"></i>
        Enter class ID, load schedules, select schedule + date, then load session.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import api from '../services/api';

const classId = ref(null);
const schedules = ref([]);
const selectedScheduleId = ref(0);
const sessionDate = ref(new Date().toISOString().slice(0, 10));

const detail = ref(null);

const teacherStatus = ref('present');
const teacherRemark = ref('');

const loading = ref(false);
const saving = ref(false);

const message = ref('');
const messageType = ref('success');

const setMsg = (type, text) => {
  messageType.value = type;
  message.value = text;
};

const teacherDisplay = computed(() => {
  if (!detail.value) return '';
  return (
    detail.value.teacher_name ||
    `${detail.value.first_name || ''} ${detail.value.last_name || ''}`.trim() ||
    'No teacher'
  );
});

const scheduleRoom = computed(() => {
  const s = schedules.value.find(x => x.schedule_id === selectedScheduleId.value);
  return s?.room_name || 'N/A';
});

const badgeClass = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'present') return 'bg-green-50 text-green-700 border-green-200';
  if (s === 'absent') return 'bg-red-50 text-red-700 border-red-200';
  if (s === 'on_leave') return 'bg-slate-50 text-slate-700 border-slate-200';
  return 'bg-yellow-50 text-yellow-700 border-yellow-200'; // late
};

const loadSchedules = async () => {
  message.value = '';
  schedules.value = [];
  selectedScheduleId.value = 0;
  detail.value = null;

  if (!classId.value) {
    setMsg('error', 'Please enter a class ID.');
    return;
  }

  try {
    const res = await api.get(`/teacher-attendance/schedules/by-class/${classId.value}`);
    schedules.value = res.data || [];
    if (!schedules.value.length) setMsg('error', 'No schedules found for this class.');
    else setMsg('success', 'Schedules loaded. Select one and load session.');
  } catch (err) {
    setMsg('error', err.response?.data?.message || 'Failed to load schedules.');
  }
};

const loadSession = async () => {
  message.value = '';
  detail.value = null;

  if (!selectedScheduleId.value || !sessionDate.value) {
    setMsg('error', 'Please select schedule and date.');
    return;
  }

  loading.value = true;
  try {
    const res = await api.get('/teacher-attendance/session', {
      params: { schedule_id: selectedScheduleId.value, session_date: sessionDate.value },
    });

    detail.value = res.data?.detail || null;

    if (!detail.value) {
      setMsg('error', 'Session not found.');
      return;
    }

    teacherStatus.value = detail.value.teacher_status || 'present';
    teacherRemark.value = detail.value.teacher_remark || '';

    setMsg('success', 'Session loaded. You can update teacher status and save.');
  } catch (err) {
    setMsg('error', err.response?.data?.message || 'Failed to load session.');
  } finally {
    loading.value = false;
  }
};

const saveTeacherAttendance = async () => {
  message.value = '';
  if (!detail.value) return;

  saving.value = true;
  try {
    await api.post('/teacher-attendance/submit', {
      schedule_id: selectedScheduleId.value,
      session_date: sessionDate.value,
      teacher_status: teacherStatus.value,
      teacher_remark: teacherRemark.value || null,
    });

    setMsg('success', 'Teacher attendance saved successfully.');
    await loadSession(); // refresh saved data
  } catch (err) {
    setMsg('error', err.response?.data?.message || 'Failed to save teacher attendance.');
  } finally {
    saving.value = false;
  }
};
</script>
