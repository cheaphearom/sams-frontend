<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Not Logged In -->
    <div v-if="!user" class="bg-white rounded-lg shadow-sm p-8 text-center">
      <i class="fa-solid fa-user-slash text-4xl text-gray-300 mb-4"></i>
      <p class="text-gray-600">Please login to take attendance.</p>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-800 uppercase">Take Attendance</h2>
          <p class="text-sm text-gray-600 mt-1">
            Teacher: <span class="font-semibold">{{ user.name || "N/A" }}</span>
          </p>
        </div>

        <button
          class="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
          :disabled="sessionsLoading"
          @click="loadSessions"
        >
          <i class="fa-solid fa-rotate"></i>
          Refresh Sessions
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div class="flex flex-wrap gap-4 items-end">
          <div class="flex-1 min-w-[180px]">
            <label class="block text-sm font-medium text-gray-700 mb-2">From</label>
            <input
              v-model="fromDate"
              type="date"
              class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div class="flex-1 min-w-[180px]">
            <label class="block text-sm font-medium text-gray-700 mb-2">To</label>
            <input
              v-model="toDate"
              type="date"
              class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div class="flex-1 min-w-[180px]">
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              v-model="statusFilter"
              class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All</option>
              <option value="planned">planned</option>
              <option value="completed">completed</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>

          <button
            class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            :disabled="sessionsLoading"
            @click="loadSessions"
          >
            <i class="fa-solid fa-magnifying-glass"></i>
            {{ sessionsLoading ? "Loading..." : "Load Sessions" }}
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

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Sessions list -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <div class="px-4 py-3 border-b bg-slate-50 flex items-center justify-between">
            <div class="font-semibold text-gray-800">Sessions</div>
            <div class="text-xs text-gray-500">Total: {{ sessions.length }}</div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-sm mt-4">
              <thead>
                <tr class="bg-slate-50 border-b border-gray-200">
                  <th class="px-4 py-3 text-left font-semibold text-gray-700 uppercase">Date</th>
                  <th class="px-4 py-3 text-left font-semibold text-gray-700 uppercase">Class</th>
                  <th class="px-4 py-3 text-left font-semibold text-gray-700 uppercase">Subject</th>
                  <th class="px-4 py-3 text-left font-semibold text-gray-700 uppercase">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr
                  v-for="s in sessions"
                  :key="s.id"
                  class="hover:bg-gray-50 transition-colors cursor-pointer"
                  :class="selectedSession?.id === s.id ? 'bg-slate-200' : ''"
                  @click="selectSession(s)"
                >
                  <td class="px-4 py-3 text-gray-700">
                    <div class="font-medium">{{ s.session_date }}</div>
                    <div class="text-xs text-gray-500">
                      {{ (s.start_time || s.scheduled_start_time || "-") }} - {{ (s.end_time || s.scheduled_end_time || "-") }}
                    </div>
                  </td>
                  <td class="px-4 py-3 text-gray-800 font-medium">{{ s.class_name }}</td>
                  <td class="px-4 py-3 text-gray-700">{{ s.subject_name }}</td>
                  <td class="px-4 py-3">
                    <span class="px-2 py-0.5 rounded-full text-xs border" :class="getSessionStatusColor(s.status)">
                      {{ s.status }}
                    </span>
                  </td>
                </tr>

                <tr v-if="sessionsLoading">
                  <td colspan="4" class="px-4 py-10 text-center text-gray-500">
                    Loading sessions...
                  </td>
                </tr>

                <tr v-if="!sessionsLoading && sessions.length === 0">
                  <td colspan="4" class="px-4 py-10 text-center text-gray-500">
                    No sessions found.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Attendance editor -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <div class="px-4 py-2 border-b bg-slate-50">
            <div class="flex items-center justify-between gap-2">
              <div>
                <div class="font-semibold text-gray-800">Attendance</div>
              </div>
              <div class="text-xs text-gray-500" v-if="selectedSession">
                #{{ selectedSession.id }} • {{ selectedSession.subject_name }} • {{ selectedSession.class_name }}
              </div>
              <div class="text-xs text-gray-500" v-else>Select a session to mark attendance.</div>
              <div class="flex gap-2">
                <!-- New button for generating QR code -->
                <button
                  class="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-60"
                  :disabled="!selectedSession || sessionsLoading"
                  @click="generateQrForSession"
                >
                  <i class="fa-solid fa-qrcode"></i>
                  Generate QR Code
                </button>
  
                <!-- Save Attendance Button -->
                <button
                  class="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-60"
                  :disabled="!selectedSession || studentsLoading || saving"
                  @click="saveAttendance"
                >
                  <i class="fa-solid fa-floppy-disk"></i>
                  {{ saving ? "Saving..." : "Save" }}
                </button>
              </div>
            </div>
          </div>

          <!-- Students list under selected session -->
          <div v-if="selectedSession" class="mt-4 px-4">            
            <div v-if="studentsLoading" class="py-10 text-center text-gray-500">
              Loading students...
            </div>
            
            <table v-else-if="students.length > 0" class="w-full text-sm mt-4">
              <thead>
                <tr class="bg-slate-50">
                  <th class="px-4 py-3 text-left font-semibold text-gray-700 uppercase">Student Name</th>
                  <th class="px-4 py-3 text-left font-semibold text-gray-700 uppercase">Status</th>
                  <th class="px-4 py-3 text-left font-semibold text-gray-700 uppercase">Remark</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="student in students" :key="student.student_id">
                  <td class="px-4 py-3 text-gray-700">{{ student.first_name }} {{ student.last_name }}</td>
                  <td class="px-4 py-3 text-gray-700">
                    <select
                      v-if="draft[student.student_id]"
                      :value="draft[student.student_id].status"
                      @change="updateStudentStatus(student.student_id, $event.target.value)"
                      class="border border-gray-300 px-3 py-1 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                    </select>
                    <span v-else class="text-gray-400">Loading...</span>
                  </td>
                  <td class="px-4 py-3 text-gray-700">
                    <input
                      v-if="draft[student.student_id]"
                      type="text"
                      :value="draft[student.student_id].remark"
                      @input="updateStudentRemark(student.student_id, $event.target.value)"
                      placeholder="Enter remark..."
                      class="border border-gray-300 px-3 py-1 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span v-else class="text-gray-400">Loading...</span>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div v-else class="py-10 text-center text-gray-500">
              No students found for this session.
            </div>
          </div>
        </div>
      </div>

      <!-- QR Code Modal -->
      <div v-if="qrCode" class="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
        <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-800 text-lg">QR Code for Attendance</h3>
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-clock text-slate-600"></i>
              <span 
                class="font-mono text-lg font-semibold"
                :class="qrCountdown <= 60 ? 'text-red-600' : 'text-slate-700'"
              >
                {{ formattedCountdown }}
              </span>
            </div>
          </div>
          
          <div class="flex justify-center">
            <img :src="qrCode" alt="QR Code" class="w-64 h-64 border border-gray-200 rounded" />
          </div>
          
          <!-- QR Token Display -->
          <div v-if="qrToken" class="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div class="flex items-center justify-between gap-2">
              <div class="flex-1 min-w-0">
                <label class="text-xs font-semibold text-slate-600 uppercase mb-1 block">QR Token</label>
                <p class="font-mono text-sm text-slate-800 truncate">{{ qrToken }}</p>
              </div>
              <button
                @click="copyToClipboard"
                class="flex-shrink-0 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium flex items-center gap-1"
                title="Copy to clipboard"
              >
                <i class="fa-solid fa-copy"></i>
                Copy
              </button>
            </div>
          </div>
          
          <div class="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p class="text-sm text-blue-800 text-center">
              <i class="fa-solid fa-info-circle mr-1"></i>
              This QR code will expire in <span class="font-semibold">{{ formattedCountdown }}</span>
            </p>
            <p class="text-xs text-blue-600 text-center mt-1">
              Students can scan this code to mark their attendance
            </p>
          </div>
          
          <button 
            @click="closeQrModal" 
            class="mt-6 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import api, { IMAGE_URL } from "../../services/api";

const route = useRoute();

const user = ref(null);

const fromDate = ref("");
const toDate = ref("");
const statusFilter = ref("");

const sessions = ref([]);
const sessionsLoading = ref(false);

const selectedSession = ref(null);
const students = ref([]);
const studentsLoading = ref(false);

const draft = ref({}); // { [student_id]: { status, remark } }

const message = ref("");
const messageType = ref("success");

const saving = ref(false);
const saveMessage = ref("");
const saveMessageType = ref("success");

const qrCode = ref(null);  // Holds the generated QR Code image URL
const qrExpiresAt = ref(null);  // Holds the expiration timestamp
const qrCountdown = ref(0);  // Countdown in seconds
const qrCountdownInterval = ref(null);  // Interval for countdown
const qrToken = ref(null);  // Holds the QR token for display and copying

onMounted(() => {
  const userData = localStorage.getItem("sams_user");
  if (userData) user.value = JSON.parse(userData);

  if (user.value) loadSessions();
});

onUnmounted(() => {
  // Clean up countdown interval when component unmounts
  if (qrCountdownInterval.value) {
    clearInterval(qrCountdownInterval.value);
  }
});

const loadSessions = async () => {
  sessionsLoading.value = true;
  message.value = "";
  sessions.value = [];
  selectedSession.value = null;
  students.value = [];
  draft.value = {};

  try {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    const from = fromDate.value || formattedDate;
    const to = toDate.value || formattedDate;

    const res = await api.get("/teacher-attendance/sessions", {
      params: {
        from,
        to,
        status: statusFilter.value || null,
      },
    });

    sessions.value = res.data || [];
    if (!sessions.value.length) {
      messageType.value = "error";
      message.value = "No sessions found.";
    } else {
      messageType.value = "success";
      message.value = `Found ${sessions.value.length} session(s).`;
    }
  } catch (err) {
    messageType.value = "error";
    message.value = err.response?.data?.message || "Failed to load sessions.";
  } finally {
    sessionsLoading.value = false;
  }
};

const selectSession = async (s) => {
  selectedSession.value = s;
  studentsLoading.value = true;
  students.value = [];
  draft.value = {};
  saveMessage.value = "";

  try {
    const res = await api.get(`/teacher-attendance/sessions/${s.id}/students`);
    const data = res.data || [];
    students.value = data.students || [];
    console.log('Loaded students:', students.value);
    
    // Initialize draft immediately after loading students
    const newDraft = {};
    students.value.forEach(student => {
      newDraft[student.student_id] = {
        status: student.attendance_status || 'absent',
        remark: student.remark || ''
      };
    });
    console.log('Initialized draft:', newDraft);
    draft.value = newDraft;
  } catch (err) {
    console.error('Error loading students:', err);
    students.value = [];
    draft.value = {};
  } finally {
    studentsLoading.value = false;
  }
};

// New function to update individual student status
const updateStudentStatus = (studentId, newStatus) => {
  console.log(`Updating student ${studentId} to ${newStatus}`);
  if (draft.value[studentId]) {
    draft.value[studentId] = {
      ...draft.value[studentId],
      status: newStatus
    };
    console.log('Updated draft:', draft.value);
  }
};

// New function to update individual student remark
const updateStudentRemark = (studentId, newRemark) => {
  console.log(`Updating student ${studentId} remark to ${newRemark}`);
  if (draft.value[studentId]) {
    draft.value[studentId] = {
      ...draft.value[studentId],
      remark: newRemark
    };
    console.log('Updated draft:', draft.value);
  }
};

const saveAttendance = async () => {
  if (!selectedSession.value) return;

  saving.value = true;
  saveMessage.value = "";
  saveMessageType.value = "success";

  try {
    const records = Object.keys(draft.value).map((studentId) => ({
      student_id: Number(studentId),
      status: draft.value[studentId].status,
      remark: draft.value[studentId].remark || "",
    }));

    console.log('Saving attendance records:', records);

    await api.post(`/teacher-attendance/sessions/${selectedSession.value.id}/records`, {
      records,
    });

    messageType.value = "success";
    message.value = "Attendance saved successfully.";

    // Reload the session to get updated attendance data
    await selectSession(selectedSession.value);
  } catch (err) {
    messageType.value = "error";
    message.value = err.response?.data?.message || "Failed to save attendance.";
  } finally {
    saving.value = false;
  }
};

const generateQrForSession = async () => {
  if (!selectedSession.value) return;

  try {
    const ttlSeconds = 300; // 5 minutes expiration
    const res = await api.post('/attendance-scan/qr/create', {
      attendance_session_id: selectedSession.value.id,
      ttl_seconds: ttlSeconds,
    });

    if (res.data.success && res.data.qr_image_url) {
      qrCode.value = `${IMAGE_URL}${res.data.qr_image_url}`;
      qrExpiresAt.value = res.data.expires_at;
      qrCountdown.value = ttlSeconds;
      qrToken.value = res.data.qr_token || null;  // Store the QR token
      
      // Clear any existing interval
      if (qrCountdownInterval.value) {
        clearInterval(qrCountdownInterval.value);
      }
      
      // Start countdown
      qrCountdownInterval.value = setInterval(() => {
        if (qrCountdown.value > 0) {
          qrCountdown.value--;
        } else {
          clearInterval(qrCountdownInterval.value);
          qrCountdownInterval.value = null;
          // Auto-close QR code when expired
          qrCode.value = null;
          qrExpiresAt.value = null;
          qrToken.value = null;
          messageType.value = 'error';
          message.value = 'QR code has expired.';
          
          // Reload the selected session to refresh attendance data
          if (selectedSession.value) {
            selectSession(selectedSession.value);
          }
        }
      }, 1000);
      
      messageType.value = 'success';
      message.value = `QR code generated successfully. Expires at ${res.data.expires_at}`;
    } else {
      messageType.value = 'error';
      message.value = 'Failed to generate QR code.';
    }
  } catch (err) {
    messageType.value = 'error';
    message.value = err.response?.data?.message || 'Failed to generate QR code.';
  }
};

const closeQrModal = () => {
  if (qrCountdownInterval.value) {
    clearInterval(qrCountdownInterval.value);
    qrCountdownInterval.value = null;
  }
  qrCode.value = null;
  qrExpiresAt.value = null;
  qrCountdown.value = 0;
  qrToken.value = null;
  
  // Reload the selected session to refresh attendance data
  if (selectedSession.value) {
    selectSession(selectedSession.value);
  }
};

const copyToClipboard = async () => {
  if (!qrToken.value) return;
  
  try {
    await navigator.clipboard.writeText(qrToken.value);
    messageType.value = 'success';
    message.value = 'QR token copied to clipboard!';
  } catch (err) {
    console.error('Failed to copy:', err);
    messageType.value = 'error';
    message.value = 'Failed to copy token to clipboard.';
  }
};

const counts = computed(() => {
  const c = { present: 0, absent: 0, late: 0 };
  for (const k of Object.keys(draft.value)) {
    const s = (draft.value[k]?.status || "").toLowerCase();
    if (c[s] !== undefined) c[s]++;
  }
  return c;
});

const formattedCountdown = computed(() => {
  const minutes = Math.floor(qrCountdown.value / 60);
  const seconds = qrCountdown.value % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

const getSessionStatusColor = (status) => {
  switch ((status || "").toLowerCase()) {
    case "completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "planned":
      return "bg-slate-50 text-slate-700 border-slate-200";
    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};
</script>