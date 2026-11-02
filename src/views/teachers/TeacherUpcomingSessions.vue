<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div v-if="!user" class="bg-white rounded-lg shadow-sm p-8 text-center">
      <i class="fa-solid fa-user-slash text-4xl text-gray-300 mb-4"></i>
      <p class="text-gray-600">Please login to view upcoming sessions.</p>
    </div>

    <template v-else>
      <div class="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-800 uppercase">Upcoming Sessions</h2>
          <p class="text-sm text-gray-600 mt-1">
            Teacher: <span class="font-semibold">{{ user.name || "N/A" }}</span>
          </p>
        </div>

        <button
          class="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
          :disabled="loading"
          @click="loadUpcoming"
        >
          <i class="fa-solid fa-rotate"></i>
          Refresh
        </button>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div class="flex flex-wrap gap-4 items-end">
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-2">From</label>
            <input
              v-model="fromDate"
              type="date"
              class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>

          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-2">To</label>
            <input
              v-model="toDate"
              type="date"
              class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>

          <button
            class="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm"
            :disabled="loading"
            @click="loadUpcoming"
          >
            <i class="fa-solid fa-magnifying-glass"></i>
            {{ loading ? "Loading..." : "Load" }}
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

      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-100 border-b border-gray-200">
                <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Date</th>
                <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Time</th>
                <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Class</th>
                <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Subject</th>
                <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Room</th>
                <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Status</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-200">
              <tr v-for="s in sessions" :key="s.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-3 text-gray-700">{{ s.session_date }}</td>
                <td class="px-6 py-3 text-gray-700">
                  {{ (s.start_time || s.scheduled_start_time || "-") }} - {{ (s.end_time || s.scheduled_end_time || "-") }}
                </td>
                <td class="px-6 py-3 text-gray-800 font-medium">{{ s.class_name }}</td>
                <td class="px-6 py-3 text-gray-700">{{ s.subject_name }}</td>
                <td class="px-6 py-3 text-gray-700">{{ s.room_name || "-" }}</td>
                <td class="px-6 py-3">
                  <span class="px-2 py-0.5 rounded-full text-xs border" :class="getStatusColor(s.status)">
                    {{ s.status }}
                  </span>
                </td>
              </tr>

              <tr v-if="loading">
                <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                  Loading upcoming sessions...
                </td>
              </tr>

              <tr v-if="!loading && sessions.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                  <i class="fa-solid fa-calendar-xmark text-3xl mb-2 block text-gray-300"></i>
                  No upcoming sessions.
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

const fromDate = ref("");
const toDate = ref("");
const sessions = ref([]);

const loading = ref(false);
const message = ref("");
const messageType = ref("success");

onMounted(() => {
  const userData = localStorage.getItem("sams_user");
  if (userData) user.value = JSON.parse(userData);

  // default from today
  fromDate.value = new Date().toISOString().slice(0, 10);

  if (user.value) loadUpcoming();
});

const loadUpcoming = async () => {
  loading.value = true;
  message.value = "";
  sessions.value = [];

  try {
    const res = await api.get("/teacher-schedule/sessions/upcoming", {
      params: {
        from: fromDate.value || new Date().toISOString().slice(0, 10),
        to: toDate.value || null,
        limit: 50,
      },
    });

    sessions.value = res.data || [];
    if (!sessions.value.length) {
      messageType.value = "error";
      message.value = "No upcoming sessions found.";
    } else {
      messageType.value = "success";
      message.value = `Found ${sessions.value.length} upcoming session(s).`;
    }
  } catch (err) {
    messageType.value = "error";
    message.value = err.response?.data?.message || "Failed to load upcoming sessions.";
  } finally {
    loading.value = false;
  }
};

const getStatusColor = (status) => {
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
