<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div class="flex justify-between items-start mb-6">
        <h2 class="text-2xl font-bold text-gray-800 uppercase">Attendance</h2>
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-600">Taking attendance for</span>
          <input 
            v-model="date" 
            type="date" 
            class="border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- Filters -->
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
          class="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm" 
          @click="loadClassData"
        >
          Load Class
        </button>
      </div>
    </div>

    <!-- Attendance Table -->
    <div v-if="students.length" class="bg-white rounded-lg shadow-sm overflow-hidden">
      <!-- Table Header -->
      <div class="grid grid-cols-[300px_1fr_120px] gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 font-semibold text-sm text-gray-700">
        <div>Students</div>
        <div class="flex items-center justify-between">
          <span>Attendance Codes</span>
          <label class="flex items-center gap-2 cursor-pointer">
            <input 
              v-model="shortName" 
              type="checkbox" 
              class="sr-only peer"
            />
            <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            <span class="text-sm font-normal text-gray-600">Short Name</span>
          </label>
        </div>
        <div>Comments</div>
      </div>

      <!-- Student Rows -->
      <div class="divide-y divide-gray-200">
        <div 
          v-for="(s, index) in students" 
          :key="s.id" 
          class="grid grid-cols-[300px_1fr_120px] gap-4 px-6 py-4 hover:bg-gray-50 transition-colors items-center"
        >
          <!-- Student Info -->
          <div class="flex items-center gap-3">
            <img 
              :src="s.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.user_name)}&background=3b82f6&color=fff&size=48`"
              :alt="s.user_name"
              class="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <div class="font-medium text-gray-900">{{ s.user_name }}</div>
              <div class="text-xs text-gray-500">#{{ s.student_number || index + 13 }} • Grade {{ s.grade || 10 }}</div>
            </div>
          </div>

          <!-- Attendance Codes -->
          <div class="flex items-center gap-4">
            <label 
              v-for="code in attendanceCodes" 
              :key="code.value"
              class="flex items-center gap-2 cursor-pointer group"
            >
              <input 
                type="radio" 
                :name="`attendance-${s.id}`"
                :value="code.value"
                v-model="attendanceMap[s.id].status"
                class="sr-only"
              />
              <div 
                class="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all"
                :class="[
                  attendanceMap[s.id].status === code.value 
                    ? `${code.bgActive} ${code.borderActive} ${code.textActive}` 
                    : `${code.bg} ${code.border} ${code.text} group-hover:border-gray-400`
                ]"
              >
                <span v-if="attendanceMap[s.id].status === code.value && code.value !== 'late' && code.value !== 'half_day'" class="text-xs">✓</span>
                {{ code.label }}
              </div>
            </label>
          </div>

          <!-- Comments -->
          <div class="flex justify-center">
            <button 
              @click="openCommentModal(s.id)"
              class="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors relative"
              :class="{ 'bg-blue-100': attendanceMap[s.id].remark }"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <span v-if="attendanceMap[s.id].remark" class="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
        <p v-if="message" class="text-sm" :class="messageType === 'error' ? 'text-red-600' : 'text-green-600'">
          {{ message }}
        </p>
        <div v-else></div>
        <button 
          @click="saveAttendance" 
          :disabled="saving || !selectedScheduleId"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {{ saving ? 'Saving...' : 'Submit' }}
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="px-6 py-12 text-center text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p class="text-lg font-medium">No students loaded yet</p>
        <p class="text-sm mt-1">Enter a class ID and click "Load Class" to get started.</p>
      </div>
    </div>

    <!-- Comment Modal -->
    <div 
      v-if="commentModalOpen" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeCommentModal"
    >
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">Add Comment</h3>
        <textarea 
          v-model="currentComment"
          class="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows="4"
          placeholder="Enter your comment here..."
        ></textarea>
        <div class="flex justify-end gap-3 mt-4">
          <button 
            @click="closeCommentModal"
            class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            @click="saveComment"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '../services/api';

const classId = ref(null);
const schedules = ref([]);
const students = ref([]);
const selectedScheduleId = ref('');
const date = ref(new Date().toISOString().slice(0, 10));
const attendanceMap = ref({});
const saving = ref(false);
const message = ref('');
const messageType = ref('success');
const shortName = ref(false);
const commentModalOpen = ref(false);
const currentStudentId = ref(null);
const currentComment = ref('');

const attendanceCodes = [
  { 
    value: 'present', 
    label: 'P', 
    bg: 'bg-white', 
    border: 'border-green-300', 
    text: 'text-green-600',
    bgActive: 'bg-green-500',
    borderActive: 'border-green-500',
    textActive: 'text-white'
  },
  { 
    value: 'absent', 
    label: 'A', 
    bg: 'bg-white', 
    border: 'border-red-300', 
    text: 'text-red-600',
    bgActive: 'bg-red-500',
    borderActive: 'border-red-500',
    textActive: 'text-white'
  },
  { 
    value: 'tardy', 
    label: 'T', 
    bg: 'bg-white', 
    border: 'border-green-300', 
    text: 'text-green-600',
    bgActive: 'bg-green-500',
    borderActive: 'border-green-500',
    textActive: 'text-white'
  },
  { 
    value: 'late', 
    label: 'L', 
    bg: 'bg-white', 
    border: 'border-gray-300', 
    text: 'text-gray-600',
    bgActive: 'bg-gray-500',
    borderActive: 'border-gray-500',
    textActive: 'text-white'
  },
  { 
    value: 'half_day', 
    label: 'HF', 
    bg: 'bg-white', 
    border: 'border-orange-300', 
    text: 'text-orange-600',
    bgActive: 'bg-orange-500',
    borderActive: 'border-orange-500',
    textActive: 'text-white'
  }
];

const loadClassData = async () => {
  message.value = '';
  attendanceMap.value = {};

  if (!classId.value) {
    messageType.value = 'error';
    message.value = 'Please enter a class ID.';
    return;
  }

  try {
    const [schedRes, studRes] = await Promise.all([
      api.get(`/schedules/by-class/${classId.value}`),
      api.get(`/students/by-class/${classId.value}`),
    ]);

    schedules.value = schedRes.data;
    students.value = studRes.data;

    // init attendance map
    students.value.forEach((s) => {
      attendanceMap.value[s.id] = { status: 'present', remark: '' };
    });
  } catch (err) {
    messageType.value = 'error';
    message.value = err.response?.data?.message || 'Failed to load class data.';
  }
};

const openCommentModal = (studentId) => {
  currentStudentId.value = studentId;
  currentComment.value = attendanceMap.value[studentId].remark || '';
  commentModalOpen.value = true;
};

const closeCommentModal = () => {
  commentModalOpen.value = false;
  currentStudentId.value = null;
  currentComment.value = '';
};

const saveComment = () => {
  if (currentStudentId.value) {
    attendanceMap.value[currentStudentId.value].remark = currentComment.value;
  }
  closeCommentModal();
};

const saveAttendance = async () => {
  if (!selectedScheduleId.value) {
    messageType.value = 'error';
    message.value = 'Please select a schedule.';
    return;
  }

  saving.value = true;
  message.value = '';

  try {
    const payloads = students.value.map((s) => ({
      schedule_id: selectedScheduleId.value,
      student_id: s.id,
      date: date.value,
      status: attendanceMap.value[s.id].status,
      remark: attendanceMap.value[s.id].remark || '',
    }));

    for (const p of payloads) {
      await api.post('/attendance', p);
    }

    messageType.value = 'success';
    message.value = 'Attendance saved successfully.';
  } catch (err) {
    messageType.value = 'error';
    message.value = err.response?.data?.message || 'Failed to save attendance.';
  } finally {
    saving.value = false;
  }
};
</script>