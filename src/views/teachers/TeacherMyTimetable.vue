<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div v-if="!user" class="bg-white rounded-lg shadow-sm p-8 text-center">
      <i class="fa-solid fa-user-slash text-4xl text-gray-300 mb-4"></i>
      <p class="text-gray-600">Please login to view your timetable.</p>
    </div>

    <template v-else>
      <div class="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-800 uppercase">My Timetable (Weekly)</h2>
          <p class="text-sm text-gray-600 mt-1">
            Teacher: <span class="font-semibold">{{ user.name || "N/A" }}</span>
          </p>
        </div>

        <button
          class="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
          :disabled="loading"
          @click="loadTimetable"
        >
          <i class="fa-solid fa-rotate"></i>
          Refresh
        </button>
      </div>

      <p
        v-if="message"
        class="mb-4 text-sm"
        :class="messageType === 'error' ? 'text-red-600' : 'text-green-600'"
      >
        <i
          :class="messageType === 'error' ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-circle-check'"
          class="mr-1"
        ></i>
        {{ message }}
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div
          v-for="day in days"
          :key="day.key"
          class="bg-white rounded-lg shadow-sm overflow-hidden"
        >
          <div class="px-4 py-3 bg-slate-100 border-b border-gray-200">
            <div class="font-semibold text-gray-800">{{ day.label }}</div>
            <div class="text-xs text-gray-500">
              {{ grouped[day.key]?.length || 0 }} session(s)
            </div>
          </div>

          <div class="p-4 space-y-3">
            <div
              v-for="item in (grouped[day.key] || [])"
              :key="item.schedule_id"
              class="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center justify-between gap-2">
                <div class="font-semibold text-gray-800">
                  {{ item.subject_name }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ item.start_time }} - {{ item.end_time }}
                </div>
              </div>
              <div class="text-sm text-gray-700 mt-1">
                {{ item.class_name }}
              </div>
              <div class="text-xs text-gray-500 mt-1">
                Room: {{ item.room_name || "-" }}
              </div>
            </div>

            <div v-if="!loading && !(grouped[day.key] || []).length" class="text-sm text-gray-500">
              No items.
            </div>

            <div v-if="loading" class="text-sm text-gray-500">
              Loading...
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../../services/api";

const user = ref(null);

const loading = ref(false);
const message = ref("");
const messageType = ref("success");

const timetable = ref([]);

const days = [
  { key: 1, label: "Monday" },
  { key: 2, label: "Tuesday" },
  { key: 3, label: "Wednesday" },
  { key: 4, label: "Thursday" },
  { key: 5, label: "Friday" },
  { key: 6, label: "Saturday" },
  { key: 7, label: "Sunday" },
];

onMounted(() => {
  const userData = localStorage.getItem("sams_user");
  if (userData) user.value = JSON.parse(userData);
  if (user.value) loadTimetable();
});

const loadTimetable = async () => {
  loading.value = true;
  message.value = "";
  timetable.value = [];

  try {
    const res = await api.get("/teacher-schedule/timetable");
    timetable.value = res.data || [];
    if (!timetable.value.length) {
      messageType.value = "error";
      message.value = "No timetable items found.";
    }
  } catch (err) {
    messageType.value = "error";
    message.value = err.response?.data?.message || "Failed to load timetable.";
  } finally {
    loading.value = false;
  }
};

const grouped = computed(() => {
  const g = {};
  for (const it of timetable.value) {
    const key = Number(it.day_of_week);
    if (!g[key]) g[key] = [];
    g[key].push(it);
  }
  return g;
});
</script>
