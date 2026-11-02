<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 uppercase">Attendance Management</h2>
      <div class="text-sm text-gray-600">
        <span v-if="items.length">
          Total: <span class="font-semibold">{{ items.length }}</span> Requested
        </span>
      </div>
    </div>

    <!-- Filters and Actions Bar -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex flex-wrap gap-4 items-end">


        <!-- ✅ Search Filter -->
        <div class="flex-1 min-w-[240px]">
          <label class="block text-xs font-semibold text-gray-600 uppercase mb-1">Search</label>

          <div class="relative">
            <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>

            <input
              v-model.trim="searchTerm"
              @input="onSearch"
              type="text"
              placeholder="Search class, subject, date, room, topic..."
              class="w-full pl-10 pr-10 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <button
              v-if="searchTerm"
              @click="clearSearch"
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              title="Clear"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
        <button
          class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-500 transition-colors flex items-center gap-2 shadow-sm"
          @click="fetchNotApproved"
        >
          <i class="fa-solid fa-rotate"></i>
          Fetch Not Approved
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
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Student</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Teacher</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Subject</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Date</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Time</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Status</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Action</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-200">
            <tr v-for="(x, index) in paginatedItems" :key="x.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-3 text-gray-900">
                {{ index + 1 + (currentPage - 1) * itemsPerPage }}
              </td>

              <td class="px-6 py-3 text-gray-900">{{ x.class_name || '-' }}</td>
              <td class="px-6 py-3 text-gray-600">
                {{ (x.student_first_name || '-') }} {{ (x.student_last_name || '-') }}
              </td>
              <td class="px-6 py-3 text-gray-600">
                {{ (x.teacher_first_name || '-') }} {{ (x.teacher_last_name || '-') }}
              </td>
              <td class="px-6 py-3 text-gray-900 font-medium">{{ x.subject_name || '-' }}</td>

              <td class="px-6 py-3 text-gray-900">{{ formatDate(x.session_date) || '-' }}</td>

              <td class="px-6 py-3 text-gray-600">
                {{ (x.session_start_time || '-') }} - {{ (x.session_end_time || '-') }}
              </td>

              <td class="px-6 py-3">
                <span
                  class="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold border"
                >
                  {{ x.status || '-' }}
                </span>
              </td>
              <td class="px-6 py-3">
                <button
                  v-if="x.status !== 'APPROVED' && x.status !== 'Approved'"
                  @click="approveAttendance(x)"
                  :disabled="!!approvingIds[x.id]"
                  class="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <i
                    class="fa-solid"
                    :class="approvingIds[x.id] ? 'fa-spinner fa-spin' : 'fa-check'"
                  ></i>
                  Approve
                </button>

                <span
                  v-else
                  class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                >
                  Approved
                </span>
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

    <!-- Empty State -->
    <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="px-6 py-12 text-center text-gray-500">
        <i class="fa-solid fa-inbox text-3xl mb-2 block text-gray-300"></i>
        No sessions found
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// ✅ Toast helper (top-right)
const toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2200,
  timerProgressBar: true,
});

const items = ref([]);
const message = ref('');
const messageType = ref('success');

const currentPage = ref(1);
const itemsPerPage = ref(10);

const searchTerm = ref('');

// Track which rows are being approved (by id)
const approvingIds = ref({});

// Track current view so we can remove rows after approving when "Not Approved" is shown
const currentView = ref('notApproved'); // 'notApproved' | 'all'

// ---------- Helpers ----------
const setMsg = (type, text) => {
  messageType.value = type;
  message.value = text;
};

const onSearch = () => {
  currentPage.value = 1;
};

const clearSearch = () => {
  searchTerm.value = '';
  currentPage.value = 1;
};

const changeItemsPerPage = () => {
  currentPage.value = 1;
};

// ---------- Filtering ----------
const filteredItems = computed(() => {
  const q = (searchTerm.value || '').toLowerCase().trim();
  if (!q) return items.value || [];

  return (items.value || []).filter((x) => {
    const haystack = [
      x.class_name,
      x.subject_name,
      x.session_date,
      x.start_time,
      x.end_time,
      x.status,
      x.topic,
      x.room_name,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(q);
  });
});

// ---------- Pagination ----------
const totalItems = computed(() => filteredItems.value.length || 0);
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value)));

const startItem = computed(() =>
  totalItems.value === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1
);

const endItem = computed(() => {
  const end = currentPage.value * itemsPerPage.value;
  return end > totalItems.value ? totalItems.value : end;
});

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredItems.value.slice(start, start + itemsPerPage.value);
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
  const max = totalPages.value;
  if (page >= 1 && page <= max) currentPage.value = page;
};

// ---------- API ----------
const fetchNotApproved = async () => {
  currentView.value = 'notApproved';
  message.value = '';

  try {
    const { data } = await api.get('/attendance/not-approved');
    console.log(data);
    items.value = data || [];
    currentPage.value = 1;

    if (!items.value.length) {
      setMsg('error', 'No sessions found.');
    } else {
      setMsg('success', 'Loaded not-approved sessions.');
    }
  } catch (err) {
    console.error(err);
    const msg = err.response?.data?.message || 'Failed to load sessions';
    setMsg('error', msg);
    toast.fire({ icon: 'error', title: msg });
  }
};
const formatDate = (val) => {
  if (!val) return '-';
  const iso = String(val).split('T')[0];      // handles "2025-12-21T00:00:00.000Z"
  const parts = iso.split('-');              // ["2025","12","21"]
  if (parts.length !== 3) return val;
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;                   // 21/12/2025
};

// ✅ Approve one session (SweetAlert2 confirm + toast)
const approveAttendance = async (row) => {
  if (!row?.id) return;

  const result = await Swal.fire({
    icon: 'question',
    title: 'Approve attendance?',
    html: `
      <div class="text-left text-sm space-y-1">
        <div><span class="font-semibold">Class:</span> ${row.class_name || '-'}</div>
        <div><span class="font-semibold">Date:</span> ${formatDate(row.session_date)}</div>
        <div><span class="font-semibold">Subject:</span> ${row.subject_name || '-'}</div>
        <div><span class="font-semibold">Student:</span> ${
          `${row.student_first_name || ''} ${row.student_last_name || ''}`.trim() || '-'
        }</div>
      </div>
    `,
    width: 420,           // ✅ smaller modal
    padding: '1rem',      // ✅ tighter padding
    showCancelButton: true,
  confirmButtonText: `<i class="fa-solid fa-check mr-2"></i>Approve`,
  cancelButtonText: `<i class="fa-solid fa-xmark mr-2"></i>Cancel`,
    reverseButtons: true,

    // ✅ Use Tailwind button styles
    buttonsStyling: false,
    customClass: {
      popup: 'rounded-xl',
      title: 'text-base font-bold text-slate-800',
      htmlContainer: 'text-sm text-slate-600',
      actions: 'gap-2 mt-4',
      confirmButton:
        'bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold',
      cancelButton:
        'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold',
    },
  });


  if (!result.isConfirmed) return;

  // set loading
  approvingIds.value = { ...approvingIds.value, [row.id]: true };
  message.value = '';

  try {
    // ✅ Your approve endpoint (based on the fixed route)
    await api.put(`/attendance/approve/${row.id}`, { approved: 1 });

    toast.fire({ icon: 'success', title: 'Attendance approved' });
    setMsg('success', 'Attendance approved successfully.');

    // If viewing notApproved -> remove row
    if (currentView.value === 'notApproved') {
      items.value = items.value.filter((i) => i.id !== row.id);

      // keep page valid
      const tp = Math.max(1, Math.ceil((filteredItems.value.length || 0) / itemsPerPage.value));
      if (currentPage.value > tp) currentPage.value = tp;
    } else {
      // if viewing all -> mark approved
      row.status = 'APPROVED';
    }
  } catch (err) {
    console.error(err);
    const msg = err.response?.data?.message || 'Failed to approve attendance';
    setMsg('error', msg);

    Swal.fire({
      icon: 'error',
      title: 'Approve failed',
      text: msg,
    });
  } finally {
    // clear loading
    const copy = { ...approvingIds.value };
    delete copy[row.id];
    approvingIds.value = copy;
  }
};

onMounted(fetchNotApproved);
</script>

