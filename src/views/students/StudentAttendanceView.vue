<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Not Logged In State -->
    <div v-if="!user" class="bg-white rounded-lg shadow-sm p-8 text-center">
      <i class="fa-solid fa-user-slash text-4xl text-gray-300 mb-4"></i>
      <p class="text-gray-600">Please login to view your attendance records.</p>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">My Attendance History</h2>
          <p class="text-sm text-gray-600 mt-1">
            Student: <span class="font-semibold">{{ user.name || "N/A" }}</span>
          </p>
        </div>
        <div class="text-sm text-gray-600">
          Total: <span class="font-semibold">{{ totalRecords }}</span> records
        </div>
      </div>

      <!-- ✅ Current Session / Check-in -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-6 border border-slate-100">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div class="text-sm text-gray-600">Current Session</div>

            <div v-if="sessionLoading" class="mt-2 text-sm text-gray-500">
              Loading current session...
            </div>

            <div v-else-if="currentSession" class="mt-1">
              <div class="text-base font-semibold text-gray-800">
                #{{ currentSession.id }}
                <span class="text-gray-400">•</span>
                {{ currentSession.subject_name }}
                <span class="text-gray-400">•</span>
                {{ currentSession.class_name }}
              </div>

              <div class="text-xs text-gray-500 mt-1">
                {{ currentSession.session_date }}
                • {{ currentSession.start_time }} - {{ currentSession.end_time }}

                <span
                  class="ml-2 px-2 py-0.5 rounded-full text-[11px] border"
                  :class="
                    alreadyCheckedIn
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  "
                >
                  {{ alreadyCheckedIn ? "Checked In" : "Not Checked In" }}
                </span>
              </div>

              <div v-if="currentSession.topic" class="text-xs text-gray-500 mt-1">
                Topic: {{ currentSession.topic }}
              </div>
            </div>

            <div v-else class="mt-2 text-sm text-gray-500">
              No active session right now.
            </div>

            <p
              v-if="checkInMessage"
              class="mt-2 text-sm"
              :class="checkInMessageType === 'error' ? 'text-red-600' : 'text-green-600'"
            >
              <i
                :class="
                  checkInMessageType === 'error'
                    ? 'fa-solid fa-circle-exclamation'
                    : 'fa-solid fa-circle-check'
                "
                class="mr-1"
              ></i>
              {{ checkInMessage }}
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button
              class="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
              :disabled="sessionLoading"
              @click="loadCurrentSession"
            >
              <i class="fa-solid fa-rotate"></i>
              Refresh
            </button>

            <!-- ✅ QR Scan modal -->
            <button
              class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              :disabled="!currentSession || alreadyCheckedIn || checkingIn"
              @click="openQrModal"
            >
              <i class="fa-solid fa-qrcode"></i>
              {{
                checkingIn
                  ? "Checking in..."
                  : alreadyCheckedIn
                  ? "Checked In"
                  : "Check In (QR)"
              }}
            </button>
          </div>
        </div>
      </div>

      <!-- ✅ QR Modal -->
      <div
        v-if="qrModalOpen"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      >
        <div class="bg-white w-[420px] rounded-lg shadow p-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-semibold text-gray-800">Scan QR to Check In</h3>
            <button class="text-gray-500 hover:text-gray-800" @click="closeQrModal">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div v-if="scannerSupported" class="mb-3">
            <video
              ref="videoRef"
              autoplay
              playsinline
              class="w-full rounded border border-gray-200 bg-black"
            ></video>
            <p class="text-xs text-gray-500 mt-2">
              Point your camera at teacher QR.
            </p>
          </div>

          <div v-else class="text-sm text-gray-600 bg-slate-50 border border-slate-200 rounded p-3">
            Your browser does not support QR scanning. Please paste token.
          </div>

          <!-- Optional fallback paste -->
          <div class="mt-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">Or paste QR token</label>
            <input
              v-model="qrTokenInput"
              type="text"
              placeholder="Paste token here..."
              class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <p v-if="qrError" class="mt-2 text-sm text-red-600">
            <i class="fa-solid fa-circle-exclamation mr-1"></i>
            {{ qrError }}
          </p>

          <div class="mt-3 flex gap-2">
            <button
              class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
              :disabled="checkingIn"
              @click="submitQrCheckIn(qrTokenInput)"
            >
              <i class="fa-solid fa-circle-check mr-1"></i>
              {{ checkingIn ? "Submitting..." : "Submit Check-in" }}
            </button>

            <button
              class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
              :disabled="checkingIn"
              @click="closeQrModal"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- Filters and Actions Bar -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div class="flex flex-wrap gap-4 items-end">
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              v-model="startDate"
              type="date"
              class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              v-model="endDate"
              type="date"
              class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            :disabled="loading"
            @click="loadAttendance"
          >
            <i class="fa-solid fa-magnifying-glass"></i>
            {{ loading ? "Loading..." : "Load Attendance" }}
          </button>
        </div>

        <p
          v-if="message"
          class="mt-3 text-sm"
          :class="messageType === 'error' ? 'text-red-600' : 'text-green-600'"
        >
          <i
            :class="
              messageType === 'error'
                ? 'fa-solid fa-circle-exclamation'
                : 'fa-solid fa-circle-check'
            "
            class="mr-1"
          ></i>
          {{ message }}
        </p>
      </div>

      <!-- Statistics Cards -->
      <div v-if="attendanceRecords.length" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-lg shadow-sm p-4">
          <div class="text-sm text-gray-600 mb-1">Total Records</div>
          <div class="text-2xl font-bold text-gray-800">{{ totalRecords }}</div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-4">
          <div class="text-sm text-gray-600 mb-1">Present</div>
          <div class="text-2xl font-bold text-green-600">{{ statusCounts.present }}</div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-4">
          <div class="text-sm text-gray-600 mb-1">Absent</div>
          <div class="text-2xl font-bold text-red-600">{{ statusCounts.absent }}</div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-4">
          <div class="text-sm text-gray-600 mb-1">Attendance Rate</div>
          <div
            class="text-2xl font-bold"
            :class="attendanceRate >= 80 ? 'text-emerald-600' : 'text-orange-600'"
          >
            {{ attendanceRate.toFixed(1) }}%
          </div>
        </div>
      </div>

      <!-- Table Container -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-100 border-b border-gray-200">
                <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">NO</th>
                <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Student Name</th>
                <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Session ID</th>
                <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Status</th>
                <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Remark</th>
                <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="(record, index) in paginatedRecords"
                :key="record.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-3 text-gray-900">
                  {{ index + 1 + (currentPage - 1) * itemsPerPage }}
                </td>
                <td class="px-6 py-3">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                    >
                      {{ (record.student_name || "").charAt(0).toUpperCase() }}
                    </div>
                    <span class="text-sm font-medium text-gray-800">
                      {{ record.student_name || "N/A" }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-3 text-gray-800">#{{ record.attendance_session_id }}</td>
                <td class="px-6 py-3 text-center">
                  <span
                    class="flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold border"
                    :class="getStatusColor(record.status)"
                  >
                    {{ record.status || "N/A" }}
                  </span>
                </td>
                <td class="px-6 py-3 text-gray-600">{{ record.remark || "-" }}</td>
                <td class="px-6 py-3 text-gray-600">{{ formatDate(record.created_at) }}</td>
              </tr>

              <tr v-if="!attendanceRecords || attendanceRecords.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                  <i class="fa-solid fa-clipboard-list text-3xl mb-2 block text-gray-300"></i>
                  No attendance records yet. Click "Load Attendance" to view your records.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          v-if="attendanceRecords && attendanceRecords.length > 0"
          class="px-6 py-4 border-t border-gray-200 bg-gray-50"
        >
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="text-sm text-gray-600">
              Showing <span class="font-medium">{{ startItem }}</span>
              to <span class="font-medium">{{ endItem }}</span>
              of <span class="font-medium">{{ totalRecords }}</span> results
            </div>

            <div class="flex items-center gap-2">
              <button
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
                :class="[
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
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
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
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
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
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
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import api from "../../services/api";

const startDate = ref("");
const endDate = ref("");
const attendanceRecords = ref([]);
const loading = ref(false);
const message = ref("");
const messageType = ref("success");
const user = ref(null);

// Current session state
const currentSession = ref(null);
const alreadyCheckedIn = ref(false);
const checkingIn = ref(false);
const sessionLoading = ref(false);
const checkInMessage = ref("");
const checkInMessageType = ref("success");

// ✅ QR modal + camera
const qrModalOpen = ref(false);
const videoRef = ref(null);
const qrError = ref("");
const qrTokenInput = ref("");
let mediaStream = null;
let scanTimer = null;

const scannerSupported = ref(false);

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);

onMounted(() => {
  const userData = localStorage.getItem("sams_user");
  if (userData) {
    user.value = JSON.parse(userData);
    loadCurrentSession();
  }

  scannerSupported.value = typeof window !== "undefined" && "BarcodeDetector" in window;
});

onBeforeUnmount(() => {
  stopCamera();
  stopScanLoop();
});

const loadCurrentSession = async () => {
  if (!user.value?.id) return;

  sessionLoading.value = true;
  checkInMessage.value = "";
  currentSession.value = null;
  alreadyCheckedIn.value = false;

  try {
    const res = await api.get(`/attendance/current-session/by-user/${user.value.id}`);
    currentSession.value = res.data?.session || null;
    alreadyCheckedIn.value = !!res.data?.alreadyCheckedIn;
  } catch {
    currentSession.value = null;
  } finally {
    sessionLoading.value = false;
  }
};

const stopScanLoop = () => {
  if (scanTimer) {
    clearTimeout(scanTimer);
    scanTimer = null;
  }
};

const stopCamera = () => {
  stopScanLoop();
  if (mediaStream) {
    mediaStream.getTracks().forEach((t) => t.stop());
    mediaStream = null;
  }
  if (videoRef.value) videoRef.value.srcObject = null;
};

const closeQrModal = () => {
  stopCamera();
  qrModalOpen.value = false;
};

const openQrModal = async () => {
  qrError.value = "";
  qrTokenInput.value = "";
  qrModalOpen.value = true;

  if (!scannerSupported.value) return;

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });

    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream;
      await videoRef.value.play();
      startQrScanLoop();
    }
  } catch {
    qrError.value = "Cannot access camera. Please allow camera permission.";
  }
};

const startQrScanLoop = () => {
  stopScanLoop();
  const detector = new window.BarcodeDetector({ formats: ["qr_code"] });

  const tick = async () => {
    try {
      const video = videoRef.value;
      if (!video || video.readyState < 2) {
        scanTimer = setTimeout(tick, 250);
        return;
      }

      const codes = await detector.detect(video);
      if (codes && codes.length > 0) {
        const value = codes[0]?.rawValue;
        if (value) {
          qrTokenInput.value = value;
          await submitQrCheckIn(value);
          return;
        }
      }
    } catch {
      // keep scanning
    }

    scanTimer = setTimeout(tick, 250);
  };

  tick();
};

// ✅ submit token + location to backend
const submitQrCheckIn = async (qrToken) => {
  if (!qrToken || !String(qrToken).trim()) {
    qrError.value = "QR token is empty.";
    return;
  }

  checkingIn.value = true;
  checkInMessage.value = "";
  checkInMessageType.value = "success";
  qrError.value = "";

  try {
    // 🔹 Get current user location
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 5000
      });
    });

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // 🔹 Send QR token + location
    await api.post(`/attendance-scan/qr/checkin`, {
      qr_token: qrToken,
      latitude,
      longitude,
    });
    
    checkInMessageType.value = "success";
    checkInMessage.value = "Checked in successfully!";
    alreadyCheckedIn.value = true;

    closeQrModal();
    await loadAttendance();
  } catch (err) {
    checkInMessageType.value = "error";

    if (err.code === 3) {
      checkInMessage.value =
        "Unable to get location. Please move to open area and try again.";
    } else if (err.code === 1) {
      checkInMessage.value = "Location permission is required.";
    } else {
      checkInMessage.value =
        err.response?.data?.message || "Check-in failed.";
    }

    qrError.value = checkInMessage.value;
  } finally {
    checkingIn.value = false;
  }
};


const loadAttendance = async () => {
  if (!user.value?.id) {
    messageType.value = "error";
    message.value = "User not found. Please login again.";
    return;
  }

  loading.value = true;
  message.value = "";
  attendanceRecords.value = [];

  try {
    const s = startDate.value || "1900-01-01";
    const e = endDate.value || "2999-12-31";

    const res = await api.get(`/attendance/by-user/${user.value.id}`, {
      params: { start_date: s, end_date: e },
    });

    const data = res.data || [];
    attendanceRecords.value = data;
    currentPage.value = 1;

    if (!data.length) {
      messageType.value = "error";
      message.value = "No attendance records found.";
    } else {
      messageType.value = "success";
      message.value = `Found ${data.length} attendance record(s).`;
    }
  } catch (err) {
    messageType.value = "error";
    message.value = err.response?.data?.message || "Failed to load attendance records.";
  } finally {
    loading.value = false;
  }
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "present":
      return "bg-green-50 text-green-700 border-green-200";
    case "absent":
      return "bg-red-50 text-red-700 border-red-200";
    case "late":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusCounts = computed(() => {
  const counts = { present: 0, absent: 0, late: 0 };
  attendanceRecords.value.forEach((record) => {
    const status = record.status?.toLowerCase();
    if (Object.prototype.hasOwnProperty.call(counts, status)) counts[status]++;
  });
  return counts;
});

const totalRecords = computed(() => attendanceRecords.value?.length || 0);

const attendanceRate = computed(() => {
  if (totalRecords.value === 0) return 0;
  return (statusCounts.value.present / totalRecords.value) * 100;
});

const totalPages = computed(() => Math.ceil(totalRecords.value / itemsPerPage.value));

const startItem = computed(() => {
  if (totalRecords.value === 0) return 0;
  return (currentPage.value - 1) * itemsPerPage.value + 1;
});

const endItem = computed(() => {
  const end = currentPage.value * itemsPerPage.value;
  return end > totalRecords.value ? totalRecords.value : end;
});

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return attendanceRecords.value.slice(start, end);
});

const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push("...");
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }
    if (current < total - 2) pages.push("...");
    pages.push(total);
  }
  return pages;
});

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page;
};

const changeItemsPerPage = () => {
  currentPage.value = 1;
};
</script>
