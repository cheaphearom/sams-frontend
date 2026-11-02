<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div v-if="!user" class="bg-white rounded-lg shadow-sm p-8 text-center">
      <i class="fa-solid fa-user-slash text-4xl text-gray-300 mb-4"></i>
      <p class="text-gray-600">Please login to view teacher attendance.</p>
    </div>

    <template v-else>
      <div class="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-800 uppercase">Teacher Attendance</h2>
          <p class="text-sm text-gray-600 mt-1">
            Teacher: <span class="font-semibold">{{ user.name || "N/A" }}</span>
          </p>
        </div>

        <div class="flex gap-2">
          <button
            class="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
            :disabled="loadingUpcoming"
            @click="loadUpcoming"
          >
            <i class="fa-solid fa-rotate"></i>
            Refresh Upcoming
          </button>

          <button
            class="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
            :disabled="loadingTable"
            @click="loadTable"
          >
            <i class="fa-solid fa-rotate"></i>
            Refresh Table
          </button>
        </div>
      </div>

      <!-- Quick mark -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div class="flex flex-wrap gap-4 items-end">
          <div class="flex-1 min-w-[240px]">
            <label class="block text-sm font-medium text-gray-700 mb-2">Select upcoming session</label>
            <select
              v-model="selectedSessionId"
              class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Choose session --</option>
              <option v-for="s in upcoming" :key="s.id" :value="s.id">
                #{{ s.id }} • {{ s.session_date }} • {{ s.subject_name }} • {{ s.class_name }}
              </option>
            </select>
          </div>

          <div class="min-w-[180px]">
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              v-model="teacherStatus"
              class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="present">present</option>
              <option value="absent">absent</option>
            </select>
          </div>

          <div class="flex-1 min-w-[240px]">
            <label class="block text-sm font-medium text-gray-700 mb-2">Remark</label>
            <input
              v-model="teacherRemark"
              type="text"
              placeholder="Remark..."
              class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-60"
            :disabled="!selectedSessionId || saving"
            @click="submitTeacherAttendance"
          >
            <i class="fa-solid fa-circle-check"></i>
            {{ saving ? "Submitting..." : "Submit" }}
          </button>
        </div>

        <p
          v-if="msg"
          class="mt-3 text-sm"
          :class="msgType === 'error' ? 'text-red-600' : 'text-green-600'"
        >
          <i
            :class="msgType === 'error' ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-circle-check'"
            class="mr-1"
          ></i>
          {{ msg }}
        </p>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-100 border-b border-gray-200">
                <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Date</th>
                <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Session</th>
                <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Class</th>
                <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Subject</th>
                <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Teacher Status</th>
                <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Remark</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-200">
              <tr v-for="r in rows" :key="r.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-3 text-gray-700">{{ r.session_date }}</td>
                <td class="px-6 py-3 text-gray-700">#{{ r.attendance_session_id || r.session_id || "-" }}</td>
                <td class="px-6 py-3 text-gray-800 font-medium">{{ r.class_name || "-" }}</td>
                <td class="px-6 py-3 text-gray-700">{{ r.subject_name || "-" }}</td>
                <td class="px-6 py-3">
                  <span class="px-2 py-0.5 rounded-full text-xs border" :class="getTeacherColor(r.teacher_status || r.status)">
                    {{ (r.teacher_status || r.status || "N/A") }}
                  </span>
                </td>
                <td class="px-6 py-3 text-gray-600">{{ r.teacher_remark || r.remark || "-" }}</td>
              </tr>

              <tr v-if="loadingTable">
                <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                  Loading teacher attendance...
                </td>
              </tr>

              <tr v-if="!loadingTable && rows.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                  No teacher attendance records.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../../services/api";

const user = ref(null);

const upcoming = ref([]);
const loadingUpcoming = ref(false);

const selectedSessionId = ref("");
const teacherStatus = ref("present");
const teacherRemark = ref("");

const saving = ref(false);

const rows = ref([]);
const loadingTable = ref(false);

const msg = ref("");
const msgType = ref("success");

onMounted(() => {
  const userData = localStorage.getItem("sams_user");
  if (userData) user.value = JSON.parse(userData);

  if (user.value) {
    loadUpcoming();
    loadTable();
  }
});

const loadUpcoming = async () => {
  loadingUpcoming.value = true;
  try {
    const from = new Date().toISOString().slice(0, 10);
    const res = await api.get("/teacher-schedule/sessions/upcoming", { params: { from, limit: 30 } });
    upcoming.value = res.data || [];
  } catch (_) {
    upcoming.value = [];
  } finally {
    loadingUpcoming.value = false;
  }
};

const loadTable = async () => {
  loadingTable.value = true;
  rows.value = [];
  try {
    const res = await api.get("/teacher-attendance/teacher-attendance", {
      params: { from: "2000-01-01", to: null },
    });
    rows.value = res.data || [];
  } catch (_) {
    rows.value = [];
  } finally {
    loadingTable.value = false;
  }
};

const submitTeacherAttendance = async () => {
  if (!selectedSessionId.value) return;
  saving.value = true;
  msg.value = "";

  try {
    await api.post(`/teacher-attendance/sessions/${selectedSessionId.value}/teacher-attendance`, {
      status: teacherStatus.value,
      remark: teacherRemark.value,
    });

    msgType.value = "success";
    msg.value = "Teacher attendance submitted.";
    teacherRemark.value = "";
    await loadTable();
  } catch (err) {
    msgType.value = "error";
    msg.value = err.response?.data?.message || "Failed to submit teacher attendance.";
  } finally {
    saving.value = false;
  }
};

const getTeacherColor = (status) => {
  switch ((status || "").toLowerCase()) {
    case "present":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "absent":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
};
</script>
