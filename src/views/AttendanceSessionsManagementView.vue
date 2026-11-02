 <template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 uppercase">Attendance Sessions Management</h2>
      <div class="text-sm text-gray-600">
        <span v-if="items.length">
          Total: <span class="font-semibold">{{ items.length }}</span> sessions
        </span>
      </div>
    </div>

    <!-- Filters and Actions Bar -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-2">Filter by Schedule ID</label>
          <input
            v-model.number="filterScheduleId"
            type="number"
            placeholder="Enter schedule ID"
            class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-2">Filter by Class ID</label>
          <input
            v-model.number="filterClassId"
            type="number"
            placeholder="Enter class ID"
            class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-500 transition-colors flex items-center gap-2 shadow-sm"
          @click="applyFilters"
        >
          <i class="fa-solid fa-filter"></i>
          Filter
        </button>
        <button
          class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors flex items-center gap-2 shadow-sm"
          @click="fetchAll"
        >
          <i class="fa-solid fa-rotate"></i>
          All
        </button>


        <button
          class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
          @click="openForm()"
        >
          <i class="fa-solid fa-plus"></i>
          New Session
        </button>
      </div>

      <p v-if="message" class="mt-3 text-sm" :class="messageType === 'error' ? 'text-red-600' : 'text-green-600'">
        <i
          :class="messageType === 'error' ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-circle-check'"
          class="mr-1"
        ></i>
        {{ message }}
      </p>
    </div>

    <!-- Table -->
    <div v-if="items.length" class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-100 border-b border-gray-200">
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">NO</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Class</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Subject</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Date</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Time</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Status</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Topic</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Room</th>
              <th class="px-6 py-3 text-center font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-200">
            <tr v-for="(x, index) in paginatedItems" :key="x.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-3 text-gray-900">
                {{ index + 1 + (currentPage - 1) * itemsPerPage }}
              </td>

              <td class="px-6 py-3 text-gray-900">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {{ x.class_name || '-' }}
                </span>
              </td>

              <td class="px-6 py-3 text-gray-900 font-medium">{{ x.subject_name || '-' }}</td>

              <td class="px-6 py-3 text-gray-900">{{ x.session_date || '-' }}</td>

              <td class="px-6 py-3 text-gray-600">
                {{ (x.start_time || '-') }} - {{ (x.end_time || '-') }}
              </td>

              <td class="px-6 py-3">
                <span
                  class="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold border"
                  :class="statusClass(x.status)"
                >
                  {{ x.status || '-' }}
                </span>
              </td>

              <td class="px-6 py-3 text-gray-900">{{ x.topic || '-' }}</td>

              <td class="px-6 py-3 text-gray-900">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800"
                >
                  {{ x.room_name || '-' }}
                </span>
              </td>

              <td class="px-6 py-3 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors font-medium"
                    @click="openForm(x)"
                  >
                    <i class="fa-solid fa-pen-to-square"></i> Edit
                  </button>
                  <button
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium"
                    @click="removeItem(x.id)"
                  >
                    <i class="fa-solid fa-trash"></i> Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="text-sm text-gray-600">
            Showing <span class="font-medium">{{ startItem }}</span>
            to <span class="font-medium">{{ endItem }}</span>
            of <span class="font-medium">{{ totalItems }}</span> results
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
                    page === currentPage ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
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

    <!-- Empty State -->
    <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="px-6 py-12 text-center text-gray-500">
        <i class="fa-solid fa-inbox text-3xl mb-2 block text-gray-300"></i>
        No sessions found
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showForm" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ form.id ? 'Edit Session' : 'New Session' }}
          </h3>
        </div>

        <form @submit.prevent="save" class="px-6 py-4">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Schedule ID</label>
              <input
                v-model.number="form.schedule_id"
                type="number"
                class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter schedule_id"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Session Date</label>
              <input
                v-model="form.session_date"
                type="date"
                class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Start Time</label>
                <input
                  v-model="form.start_time"
                  type="time"
                  class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">End Time</label>
                <input
                  v-model="form.end_time"
                  type="time"
                  class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select
                v-model="form.status"
                class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                required
              >
                <option value="planned">planned</option>
                <option value="completed">completed</option>
                <option value="canceled">canceled</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Topic</label>
              <input
                v-model="form.topic"
                type="text"
                maxlength="255"
                class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter topic"
              />
            </div>
          </div>

          <div v-if="modalError" class="text-red-600 text-sm mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <i class="fa-solid fa-circle-exclamation mr-1"></i>
            {{ modalError }}
          </div>

          <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
              @click="closeForm"
            >
              <i class="fa-solid fa-xmark"></i> Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <i class="fa-solid fa-floppy-disk"></i> Save
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';

const items = ref([]);
const filterScheduleId = ref(null);
const filterClassId = ref(null);

const showForm = ref(false);
const modalError = ref('');

const message = ref('');
const messageType = ref('success');

const currentPage = ref(1);
const itemsPerPage = ref(10);

const form = ref({
  id: null,
  schedule_id: null,
  session_date: '',
  start_time: '',
  end_time: '',
  status: 'planned',
  topic: '',
});

const setMsg = (type, text) => {
  messageType.value = type;
  message.value = text;
};

const statusClass = (s) => {
  const v = String(s || '').toLowerCase();
  if (v === 'completed') return 'bg-green-50 text-green-700 border-green-200';
  if (v === 'canceled') return 'bg-red-50 text-red-700 border-red-200';
  return 'bg-yellow-50 text-yellow-700 border-yellow-200';
};

// Pagination computed
const totalItems = computed(() => items.value?.length || 0);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));
const startItem = computed(() => (totalItems.value === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1));
const endItem = computed(() => {
  const end = currentPage.value * itemsPerPage.value;
  return end > totalItems.value ? totalItems.value : end;
});
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return items.value.slice(start, start + itemsPerPage.value);
});
const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push('...');
    pages.push(total);
  }
  return pages;
});

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page;
};
const changeItemsPerPage = () => (currentPage.value = 1);

// API
const fetchAll = async () => {
  message.value = '';
  try {
    const { data } = await api.get('/attendance-sessions');
    items.value = data || [];
    currentPage.value = 1;
    if (!items.value.length) setMsg('error', 'No sessions found.');
  } catch (err) {
    console.error(err);
    setMsg('error', err.response?.data?.message || 'Failed to load sessions');
  }
};

const applyFilters = async () => {
  message.value = '';
  if (filterScheduleId.value) {
    try {
      const { data } = await api.get(`/attendance-sessions/by-schedule/${filterScheduleId.value}`);
      items.value = data || [];
      currentPage.value = 1;
      if (!items.value.length) setMsg('error', 'No sessions found for this schedule.');
      else setMsg('success', 'Filtered by schedule.');
      return;
    } catch (err) {
      console.error(err);
      setMsg('error', err.response?.data?.message || 'Failed to filter by schedule');
      return;
    }
  }

  if (filterClassId.value) {
    try {
      const { data } = await api.get(`/attendance-sessions/by-class/${filterClassId.value}`);
      items.value = data || [];
      currentPage.value = 1;
      if (!items.value.length) setMsg('error', 'No sessions found for this class.');
      else setMsg('success', 'Filtered by class.');
      return;
    } catch (err) {
      console.error(err);
      setMsg('error', err.response?.data?.message || 'Failed to filter by class');
      return;
    }
  }

  await fetchAll();
};

const openForm = (x = null) => {
  modalError.value = '';
  message.value = '';
  if (x) {
    form.value = {
      id: x.id,
      schedule_id: x.schedule_id,
      session_date: x.session_date || '',
      start_time: (x.start_time || '').slice(0, 5),
      end_time: (x.end_time || '').slice(0, 5),
      status: x.status || 'planned',
      topic: x.topic || '',
    };
  } else {
    form.value = {
      id: null,
      schedule_id: null,
      session_date: '',
      start_time: '',
      end_time: '',
      status: 'planned',
      topic: '',
    };
  }
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  modalError.value = '';
};

const save = async () => {
  modalError.value = '';
  try {
    const payload = {
      schedule_id: form.value.schedule_id,
      session_date: form.value.session_date,
      start_time: form.value.start_time || null,
      end_time: form.value.end_time || null,
      status: form.value.status,
      topic: form.value.topic || null,
    };

    if (form.value.id) {
      await api.put(`/attendance-sessions/${form.value.id}`, payload);
      setMsg('success', 'Session updated successfully.');
    } else {
      await api.post('/attendance-sessions', payload);
      setMsg('success', 'Session created successfully.');
    }

    await fetchAll();
    closeForm();
  } catch (err) {
    console.error(err);
    modalError.value = err.response?.data?.message || 'Failed to save session';
  }
};

const removeItem = async (id) => {
  if (!confirm('Delete this session?')) return;
  message.value = '';
  try {
    await api.delete(`/attendance-sessions/${id}`);
    setMsg('success', 'Session deleted successfully.');
    await fetchAll();
  } catch (err) {
    console.error(err);
    setMsg('error', err.response?.data?.message || 'Failed to delete session');
  }
};

onMounted(fetchAll);
</script>
