<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Not Logged In -->
    <div v-if="!user" class="bg-white rounded-lg shadow-sm p-8 text-center">
      <i class="fa-solid fa-user-slash text-4xl text-gray-300 mb-4"></i>
      <p class="text-gray-600">Please login to view your classes.</p>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-800 uppercase">My Classes</h2>
          <p class="text-sm text-gray-600 mt-1">
            Teacher: <span class="font-semibold">{{ user.name || "N/A" }}</span>
          </p>
        </div>

        <button
          class="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
          :disabled="loading"
          @click="loadClasses"
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

      <!-- Table -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-100 border-b border-gray-200">
                <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">NO</th>
                <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Class</th>
                <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Major</th>
                <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Year</th>
                <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Term</th>
                <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Students</th>
                <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Action</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="(c, idx) in classes"
                :key="c.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-3 text-gray-900">{{ idx + 1 }}</td>
                <td class="px-6 py-3">
                  <div class="font-semibold text-gray-800">{{ c.name }}</div>
                  <div class="text-xs text-gray-500">Grade: {{ c.grade_level ?? "-" }}</div>
                </td>
                <td class="px-6 py-3 text-gray-700">{{ c.major_name || "-" }}</td>
                <td class="px-6 py-3 text-gray-700">{{ c.school_year_name || "-" }}</td>
                <td class="px-6 py-3 text-gray-700">{{ c.term_name || "-" }}</td>
                <td class="px-6 py-3 text-gray-700">
                  <span class="px-2 py-0.5 rounded-full text-xs border bg-slate-50 border-slate-200">
                    {{ c.student_count ?? 0 }}
                  </span>
                </td>
                <td class="px-6 py-3">
                  <div class="flex flex-wrap gap-2">
                    <button
                      class="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm"
                      @click="openStudents(c)"
                    >
                      <i class="fa-solid fa-users"></i>
                      Students
                    </button>

                    <RouterLink
                      class="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
                      :to="{ path: '/teacher-take-attendance', query: { class_id: c.id } }"
                    >
                      <i class="fa-solid fa-clipboard-check"></i>
                      Take Attendance
                    </RouterLink>
                  </div>
                </td>
              </tr>

              <tr v-if="!loading && classes.length === 0">
                <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                  <i class="fa-solid fa-landmark text-3xl mb-2 block text-gray-300"></i>
                  No classes found.
                </td>
              </tr>

              <tr v-if="loading">
                <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                  Loading classes...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Students Modal -->
      <div
        v-if="studentsModalOpen"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      >
        <div class="bg-white w-[720px] max-w-[95vw] rounded-lg shadow p-4">
          <div class="flex items-center justify-between mb-2">
            <div>
              <h3 class="font-semibold text-gray-800">Students • {{ selectedClass?.name }}</h3>
              <p class="text-xs text-gray-500">
                Total: {{ students.length }}
              </p>
            </div>
            <button class="text-gray-500 hover:text-gray-800" @click="closeStudents">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="border rounded-lg overflow-hidden">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-slate-100 border-b border-gray-200">
                  <th class="px-4 py-2 text-left font-semibold text-gray-700 uppercase">Code</th>
                  <th class="px-4 py-2 text-left font-semibold text-gray-700 uppercase">Name</th>
                  <th class="px-4 py-2 text-left font-semibold text-gray-700 uppercase">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="s in students" :key="s.id" class="hover:bg-gray-50">
                  <td class="px-4 py-2 text-gray-700">{{ s.student_code || "-" }}</td>
                  <td class="px-4 py-2 text-gray-800 font-medium">
                    {{ (s.first_name || "") + " " + (s.last_name || "") }}
                  </td>
                  <td class="px-4 py-2">
                    <span
                      class="px-2 py-0.5 rounded-full text-xs border"
                      :class="(s.status || '').toLowerCase() === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200'"
                    >
                      {{ s.status || "N/A" }}
                    </span>
                  </td>
                </tr>

                <tr v-if="studentsLoading">
                  <td colspan="3" class="px-4 py-8 text-center text-gray-500">
                    Loading students...
                  </td>
                </tr>

                <tr v-if="!studentsLoading && students.length === 0">
                  <td colspan="3" class="px-4 py-8 text-center text-gray-500">
                    No students found.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-3 flex justify-end">
            <button
              class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
              @click="closeStudents"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../../services/api";

const user = ref(null);

const classes = ref([]);
const loading = ref(false);
const message = ref("");
const messageType = ref("success");

// students modal
const studentsModalOpen = ref(false);
const selectedClass = ref(null);
const students = ref([]);
const studentsLoading = ref(false);

onMounted(() => {
  const userData = localStorage.getItem("sams_user");
  if (userData) user.value = JSON.parse(userData);
  if (user.value) loadClasses();
});

const loadClasses = async () => {
  loading.value = true;
  message.value = "";
  try {
    const res = await api.get(`/teacher-classes/by-teacher/${user.value.id}`);
    classes.value = res.data || [];
    if (!classes.value.length) {
      messageType.value = "error";
      message.value = "No classes found.";
    }
  } catch (err) {
    messageType.value = "error";
    message.value = err.response?.data?.message || "Failed to load classes.";
    classes.value = [];
  } finally {
    loading.value = false;
  }
};

const openStudents = async (c) => {
  selectedClass.value = c;
  studentsModalOpen.value = true;
  students.value = [];
  studentsLoading.value = true;

  try {
    const res = await api.get(`/teacher-classes/${c.id}/students`);    
    students.value = res.data || [];
  } catch (err) {
    students.value = [];
  } finally {
    studentsLoading.value = false;
  }
};

const closeStudents = () => {
  studentsModalOpen.value = false;
  selectedClass.value = null;
  students.value = [];
};
</script>
