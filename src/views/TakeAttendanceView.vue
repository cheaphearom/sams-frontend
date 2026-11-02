<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 uppercase">Take Attendance (Admin)</h2>
      <div class="text-sm text-gray-600">
        <span v-if="students.length">
          Total: <span class="font-semibold">{{ students.length }}</span> students
        </span>
      </div>
    </div>

    <!-- Filters and Actions Bar -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex flex-wrap gap-4 items-end">
        <!-- Class -->
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-2">Class ID</label>
          <input
            v-model.number="classId"
            type="number"
            placeholder="Enter class ID"
            class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          />
        </div>

        <!-- Subject -->
        <div class="flex-1 min-w-[260px]">
          <label class="block text-sm font-medium text-gray-700 mb-2">Subject</label>
          <select
            v-model.number="classSubjectId"
            class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
          >
            <option disabled :value="0">-- Select subject --</option>
            <option v-for="s in subjects" :key="s.class_subject_id" :value="s.class_subject_id">
              {{ s.subject_name }} ({{ s.subject_code }}) {{ s.teacher_name ? `• ${s.teacher_name}` : '' }}
            </option>
          </select>
        </div>

        <!-- Schedule -->
        <div class="flex-1 min-w-[260px]">
          <label class="block text-sm font-medium text-gray-700 mb-2">Schedule</label>
          <select
            v-model.number="scheduleId"
            class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
          >
            <option disabled :value="0">-- Select schedule --</option>
            <option v-for="sch in schedules" :key="sch.id" :value="sch.id">
              {{ sch.day_of_week }} | {{ sch.start_time }} - {{ sch.end_time }} | {{ sch.room_name || 'No room' }}
            </option>
          </select>
        </div>

        <!-- Date -->
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-2">Session Date</label>
          <input
            v-model="sessionDate"
            type="date"
            class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          />
        </div>

        <!-- Buttons -->
        <button
          class="bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-500 transition-colors flex items-center gap-2 shadow-sm"
          @click="loadSubjectsAndStudents"
        >
          <i class="fa-solid fa-rotate"></i>
          Load Subjects + Students
        </button>

        <button
          class="bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-500 transition-colors flex items-center gap-2 shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
          :disabled="!classSubjectId || loadingSchedules"
          @click="loadSchedules"
        >
          <i class="fa-solid fa-calendar-days"></i>
          {{ loadingSchedules ? 'Loading...' : 'Load Schedules' }}
        </button>

        <button
          class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors flex items-center gap-2 shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
          :disabled="!scheduleId || !sessionDate || loadingSession"
          @click="loadExistingAttendance"
        >
          <i class="fa-solid fa-folder-open"></i>
          {{ loadingSession ? 'Loading...' : 'Load Existing' }}
        </button>

        <button
          class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-500 transition-colors flex items-center gap-2 shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
          :disabled="!canSave || saving"
          @click="saveAttendance"
        >
          <i class="fa-solid fa-floppy-disk"></i>
          {{ saving ? 'Saving...' : 'Save Attendance' }}
        </button>
      </div>

      <!-- Quick actions -->
      <div class="flex flex-wrap gap-2 mt-4" v-if="students.length">
        <button
          class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          @click="setAll('present')"
        >
          All Present
        </button>
        <button
          class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          @click="setAll('absent')"
        >
          All Absent
        </button>
        <button
          class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          @click="setAll('late')"
        >
          All Late
        </button>

        <div class="flex-1 min-w-[240px]">
          <input
            v-model="topic"
            type="text"
            placeholder="Topic (optional)"
            class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          />
        </div>
      </div>

      <p v-if="message" class="mt-3 text-sm" :class="messageType === 'error' ? 'text-red-600' : 'text-green-600'">
        <i
          :class="messageType === 'error' ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-circle-check'"
          class="mr-1"
        ></i>
        {{ message }}
      </p>
    </div>

    <!-- Table Container -->
    <div v-if="students.length" class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-100 border-b border-gray-200">
              <th class="px-6 py-3 text-left font-semibold text-gray-700">NO</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700">Student</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 text-center">Status</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700">Remark</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-200">
            <tr v-for="(st, index) in students" :key="st.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-3 text-gray-900">{{ index + 1 }}</td>

              <td class="px-6 py-3">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                  >
                    {{ (fullName(st) || '').charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-800">
                      {{ fullName(st) }}
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ st.student_code || ('ID: ' + st.id) }}
                    </div>
                  </div>
                </div>
              </td>

              <td class="px-6 py-3 text-center">
                <select
                  v-model="recordsMap[st.id].status"
                  class="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
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
                  class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center text-sm text-gray-600">
        <span>
          Class <span class="font-semibold">#{{ classId || '-' }}</span> •
          Schedule <span class="font-semibold">#{{ scheduleId || '-' }}</span> •
          Date <span class="font-semibold">{{ sessionDate || '-' }}</span>
        </span>

        <span class="text-gray-500">
          Ready: <span class="font-semibold">{{ canSave ? 'Yes' : 'No' }}</span>
        </span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="px-6 py-12 text-center text-gray-500">
        <i class="fa-solid fa-clipboard-list text-3xl mb-2 block text-gray-300"></i>
        Enter a class ID, load subjects/students, then select subject + schedule + date.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import api from '../services/api';

const classId = ref(null);

const subjects = ref([]);
const classSubjectId = ref(0);

const schedules = ref([]);
const scheduleId = ref(0);

const sessionDate = ref(new Date().toISOString().slice(0, 10));
const topic = ref('');

const students = ref([]);
const recordsMap = reactive({}); // { [student_id]: { status, remark } }

const loadingSchedules = ref(false);
const loadingSession = ref(false);
const saving = ref(false);

const message = ref('');
const messageType = ref('success'); // 'success' | 'error'

const canSave = computed(() => {
  return !!classId.value && !!classSubjectId.value && !!scheduleId.value && !!sessionDate.value && students.value.length > 0;
});

const fullName = (st) => {
  return `${st.first_name || ''} ${st.last_name || ''}`.trim() || st.name || '';
};

const badgeClass = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'present') return 'bg-green-50 text-green-700 border-green-200';
  if (s === 'absent') return 'bg-red-50 text-red-700 border-red-200';
  return 'bg-yellow-50 text-yellow-700 border-yellow-200'; // late
};

const resetRecords = () => {
  Object.keys(recordsMap).forEach((k) => delete recordsMap[k]);
  students.value.forEach((st) => {
    recordsMap[st.id] = { status: 'present', remark: '' };
  });
};

const setMsg = (type, text) => {
  messageType.value = type;
  message.value = text;
};

const loadSubjectsAndStudents = async () => {
  message.value = '';
  subjects.value = [];
  schedules.value = [];
  classSubjectId.value = 0;
  scheduleId.value = 0;
  topic.value = '';
  students.value = [];
  Object.keys(recordsMap).forEach((k) => delete recordsMap[k]);

  if (!classId.value) {
    setMsg('error', 'Please enter a class ID.');
    return;
  }

  try {
    const [subRes, stuRes] = await Promise.all([
      api.get(`/take-attendance/subjects/${classId.value}`),
      api.get(`/take-attendance/students/${classId.value}`),
    ]);

    subjects.value = subRes.data || [];
    students.value = stuRes.data || [];
    resetRecords();

    if (!subjects.value.length) setMsg('error', 'No subjects found for this class.');
    else if (!students.value.length) setMsg('error', 'No students found for this class.');
    else setMsg('success', 'Loaded subjects & students. Select subject and load schedules.');
  } catch (err) {
    setMsg('error', err.response?.data?.message || 'Failed to load subjects/students.');
  }
};

const loadSchedules = async () => {
  message.value = '';
  schedules.value = [];
  scheduleId.value = 0;

  if (!classSubjectId.value) {
    setMsg('error', 'Please select a subject.');
    return;
  }

  loadingSchedules.value = true;
  try {
    const { data } = await api.get(`/take-attendance/schedules/${classSubjectId.value}`);
    schedules.value = data || [];

    if (!schedules.value.length) setMsg('error', 'No schedules found for this subject.');
    else setMsg('success', 'Schedules loaded. Select schedule + date, then load existing (optional) and save.');
  } catch (err) {
    setMsg('error', err.response?.data?.message || 'Failed to load schedules.');
  } finally {
    loadingSchedules.value = false;
  }
};

const loadExistingAttendance = async () => {
  message.value = '';

  if (!scheduleId.value || !sessionDate.value) {
    setMsg('error', 'Please select schedule and date.');
    return;
  }

  loadingSession.value = true;
  try {
    // reset to defaults first
    resetRecords();

    const { data } = await api.get('/take-attendance/session', {
      params: { schedule_id: scheduleId.value, session_date: sessionDate.value },
    });

    const records = data?.records || [];
    records.forEach((r) => {
      if (recordsMap[r.student_id]) {
        recordsMap[r.student_id].status = r.status;
        recordsMap[r.student_id].remark = r.remark || '';
      }
    });

    if (data?.session?.topic) topic.value = data.session.topic;

    if (!data?.session) setMsg('success', 'No previous attendance found. Ready to take new attendance.');
    else setMsg('success', 'Existing attendance loaded. You can edit and save again.');
  } catch (err) {
    setMsg('error', err.response?.data?.message || 'Failed to load existing attendance.');
  } finally {
    loadingSession.value = false;
  }
};

const saveAttendance = async () => {
  message.value = '';
  if (!canSave.value) {
    setMsg('error', 'Please complete class / subject / schedule / date and load students first.');
    return;
  }

  saving.value = true;
  try {
    const payload = {
      schedule_id: scheduleId.value,
      session_date: sessionDate.value,
      status: 'completed',
      topic: topic.value || null,
      records: students.value.map((st) => ({
        student_id: st.id,
        status: recordsMap[st.id]?.status || 'present',
        remark: recordsMap[st.id]?.remark || '',
      })),
    };

    await api.post('/take-attendance/submit', payload);
    setMsg('success', 'Attendance saved successfully.');
  } catch (err) {
    setMsg('error', err.response?.data?.message || 'Failed to save attendance.');
  } finally {
    saving.value = false;
  }
};

const setAll = (status) => {
  students.value.forEach((st) => {
    if (recordsMap[st.id]) recordsMap[st.id].status = status;
  });
};
</script>
