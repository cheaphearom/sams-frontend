<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">My Schedule</h2>
      <div class="text-sm text-gray-600">
        Total: <span class="font-semibold">{{ schedules.length }}</span> sessions
      </div>
    </div>

    <!-- Calendar Navigation & View Selector -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex justify-between items-center mb-4">
        <button 
          class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2" 
          @click="navigate(-1)"
        >
          <i class="fa-solid fa-chevron-left"></i>
          Previous
        </button>
        <h3 class="text-xl font-semibold text-gray-800">
          {{ currentViewTitle }}
        </h3>
        <button 
          class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2" 
          @click="navigate(1)"
        >
          Next
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>

      <!-- View Toggle Buttons -->
      <div class="flex justify-center gap-2">
        <button 
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="viewMode === 'week' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          @click="viewMode = 'week'"
        >
          <i class="fa-solid fa-calendar-week mr-1"></i>
          Week
        </button>
        <button 
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="viewMode === 'month' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          @click="viewMode = 'month'"
        >
          <i class="fa-solid fa-calendar-days mr-1"></i>
          Month
        </button>
        <button 
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="viewMode === 'year' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          @click="viewMode = 'year'"
        >
          <i class="fa-solid fa-calendar mr-1"></i>
          Year
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-lg shadow-sm p-12 text-center">
      <i class="fa-solid fa-spinner fa-spin text-3xl text-slate-900 mb-4"></i>
      <p class="text-gray-600">Loading schedules...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-white rounded-lg shadow-sm p-6">
      <div class="text-center p-6">
        <i class="fa-solid fa-circle-exclamation text-3xl text-red-500 mb-4 block"></i>
        <p class="text-red-600 font-medium mb-4">{{ error }}</p>
        <button 
          class="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
          @click="fetchSchedules"
        >
          <i class="fa-solid fa-rotate-right mr-2"></i>
          Retry
        </button>
      </div>
    </div>

    <!-- Week View -->
    <div v-else-if="viewMode === 'week'" class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-100 border-b border-gray-200">
              <th class="px-4 py-3 text-left font-semibold text-gray-700 w-20 uppercase">Time</th>
              <th v-for="day in weekDays" :key="day.date" class="px-4 py-3 text-center font-semibold text-gray-700">
                <div>{{ day.name }}</div>
                <div class="text-xs font-normal text-gray-500">{{ day.dateStr }}</div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="hour in timeSlots" :key="hour" class="border-b border-gray-200">
              <td class="px-4 py-2 text-gray-600 font-medium bg-gray-50">{{ hour }}</td>
              <td v-for="day in weekDays" :key="day.date" class="px-2 py-2 align-top relative">
                <div class="space-y-1">
                  <div 
                    v-for="event in getWeekEvents(day, hour)" 
                    :key="event.attendance_session_id || event.id"
                    class="text-xs p-2 rounded transition-opacity"
                    :class="isPastEvent(event) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'"
                    :style="{ backgroundColor: getEventColor(event) }"
                    @click="!isPastEvent(event) && showEventDetails(event)"
                  >
                    <div class="text-white font-medium">{{ event.subject_name }}</div>
                    <div class="text-white text-[10px]">{{ event.room_name }}</div>
                    <div class="text-white text-[10px]">
                      {{ getEventStartTime(event).slice(0, 5) }} - {{ getEventEndTime(event).slice(0, 5) }}
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Month View -->
    <div v-else-if="viewMode === 'month'" class="bg-white rounded-lg shadow-sm overflow-hidden">
      <!-- Day Headers -->
      <div class="grid grid-cols-7 border-b border-gray-200 bg-slate-100">
        <div 
          v-for="day in dayNames" 
          :key="day" 
          class="px-2 py-3 text-center font-semibold text-gray-700 text-sm"
        >
          {{ day }}
        </div>
      </div>

      <!-- Calendar Days -->
      <div class="grid grid-cols-7 divide-x divide-y divide-gray-200">
        <!-- Empty cells before month starts -->
        <div 
          v-for="empty in startingDayOfWeek" 
          :key="'empty-' + empty" 
          class="bg-gray-50 min-h-[120px] p-2"
        ></div>

        <!-- Days with events -->
        <div 
          v-for="day in daysInMonth" 
          :key="day" 
          class="min-h-[120px] p-2 hover:bg-gray-50 transition-colors"
          :class="{
            'bg-blue-50 border-2 border-blue-500': isToday(day),
            'bg-white': !isToday(day)
          }"
        >
          <div 
            class="text-sm font-semibold mb-2"
            :class="{
              'text-blue-600': isToday(day),
              'text-gray-700': !isToday(day)
            }"
          >
            {{ day }}
          </div>
          
          <!-- Events for this day -->
          <div class="space-y-1">
            <div 
              v-for="event in getEventsForDay(day)" 
              :key="event.attendance_session_id || event.id"
              class="text-xs p-1.5 rounded transition-opacity"
              :class="isPastEvent(event) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'"
              :style="{ backgroundColor: getEventColor(event) }"
              @click="!isPastEvent(event) && showEventDetails(event)"
            >
              <div class="text-white font-medium truncate">
                <i class="fa-solid fa-clock mr-1"></i>
                {{ getEventStartTime(event).slice(0, 5) }} - {{ getEventEndTime(event).slice(0, 5) }}
              </div>
              <div class="text-white text-[10px] truncate">
                {{ event.subject_name }}
              </div>
              <div class="text-white text-[10px] truncate">
                {{ event.first_name }} {{ event.last_name }}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>

    <!-- Year View -->
    <div v-else-if="viewMode === 'year'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div v-for="month in 12" :key="month" class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="bg-slate-100 px-4 py-2 border-b border-gray-200">
          <h4 class="font-semibold text-gray-800 text-sm">{{ monthNames[month - 1] }}</h4>
        </div>
        <div class="p-2">
          <!-- Mini calendar -->
          <div class="grid grid-cols-7 gap-1 text-xs">
            <div v-for="day in dayNamesShort" :key="day" class="text-center font-semibold text-gray-500 py-1">
              {{ day }}
            </div>
            
            <!-- Empty cells -->
            <div 
              v-for="empty in getMonthStartDay(month)" 
              :key="'empty-' + month + '-' + empty"
              class="aspect-square"
            ></div>
            
            <!-- Days -->
            <div 
              v-for="day in getDaysInSpecificMonth(month)" 
              :key="'day-' + month + '-' + day"
              class="aspect-square flex items-center justify-center rounded"
              :class="{
                'bg-blue-100 text-blue-600 font-semibold': hasEventsOnDate(month, day),
                'text-gray-400': !hasEventsOnDate(month, day),
                'bg-blue-500 text-white': isTodayInYear(month, day)
              }"
            >
              {{ day }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Session List -->
    <div class="bg-white rounded-lg shadow-sm mt-6 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 bg-slate-100">
        <h3 class="text-lg font-semibold text-gray-900">
          <i class="fa-solid fa-list mr-2"></i>
          Session Details
        </h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 border-b border-gray-200">
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Date</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Time</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Subject</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Room</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Requested</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Teacher</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
              <tr 
                v-for="item in sortedSchedules.filter(item => new Date(item.session_date) >= new Date())" 
                :key="item.attendance_session_id || item.id" 
                class="hover:bg-gray-50 transition-colors"
                :class="{
                  'bg-red-200': item.leave_request_status === 'Requested' && item.leave_approval_status === 'Not Approved'
                }"
              >
              <td class="px-6 py-3 text-gray-900">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                  {{ formatSessionDayLabel(item) }}
                </span>
              </td>
              <td class="px-6 py-3 text-gray-900 font-medium">
                {{ getEventStartTime(item).slice(0, 5) }} - {{ getEventEndTime(item).slice(0, 5) }}
              </td>
              <td class="px-6 py-3 text-gray-900">
                <div class="font-medium">{{ item.subject_name }}</div>
                <div class="text-xs text-gray-500">{{ item.subject_code }}</div>
              </td>
              <td class="px-6 py-3 text-gray-900">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <i class="fa-solid fa-door-open mr-1"></i>
                  {{ item.room_name }}
                </span>
              </td>
              <td class="px-6 py-3 text-gray-900">
                {{ item.leave_request_status }} 
                <span v-if="item && item.leave_request_status === 'Requested' && item.leave_approval_status === 'Not Approved'"
                class="rounded-full text-xs font-medium bg-slate-100 text-slate-800 px-2">{{ item.leave_approval_status }}</span>
              </td>
              <td class="px-6 py-3 text-gray-900">
                {{ item.first_name }} {{ item.last_name }}
              </td>
            </tr>
            <tr v-if="!sortedSchedules || sortedSchedules.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                <i class="fa-solid fa-calendar-xmark text-3xl mb-2 block text-gray-300"></i>
                No sessions found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Event Details Modal -->
    <div
      v-if="selectedEvent && !showLeaveForm"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      @click="selectedEvent = null"
    >
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all" @click.stop>
        <div
          class="px-6 py-4 border-b border-gray-200"
          :style="{ backgroundColor: getEventColor(selectedEvent), color: 'white' }"
        >
          <h3 class="text-lg font-semibold">
            <i class="fa-solid fa-calendar-day mr-2"></i>
            {{ selectedEvent.subject_name }}
          </h3>
          <div class="text-sm font-medium mt-2 rounded-sm p-2" v-if="selectedEvent && selectedEvent.leave_request_status === 'Requested' && selectedEvent.leave_approval_status === 'Not Approved'">
            <span class="bg-red-900 text-white p-2 rounded-xl">
              Your Request is not approved!!
            </span>
          </div>
        </div>
        
        <div class="px-6 py-4 space-y-3">
          <div class="flex justify-start gap-20">
            <div class="flex items-start gap-3 w-full sm:w-auto">
              <i class="fa-solid fa-clock text-slate-600 mt-0.5"></i>
              <div>
                <div class="text-sm font-medium text-gray-700">Time</div>
                <div class="text-sm text-gray-900">
                  {{ getEventStartTime(selectedEvent).slice(0, 5) }} - {{ getEventEndTime(selectedEvent).slice(0, 5) }}
                </div>
              </div>
            </div>
  
            <div class="flex items-start gap-3 w-full sm:w-auto" v-if="selectedEvent.session_date">
              <i class="fa-solid fa-calendar-check text-slate-600 mt-0.5"></i>
              <div>
                <div class="text-sm font-medium text-gray-700">Session Date</div>
                <div class="text-sm text-gray-900">
                  {{ formatSessionDate(selectedEvent) }}
                </div>
              </div>
            </div>
          </div>
          <div class="flex justify-start gap-20">
            <div class="flex items-start gap-3 w-full sm:w-auto">
              <i class="fa-solid fa-calendar text-slate-600 mt-0.5"></i>
              <div>
                <div class="text-sm font-medium text-gray-700">Day</div>
                <div class="text-sm text-gray-900">
                  {{ formatSessionDayName(selectedEvent) }}
                </div>
              </div>
            </div>
  
            <div class="flex items-start gap-3 w-full sm:w-auto" v-if="selectedEvent.session_status">
              <i class="fa-solid fa-circle text-slate-600 mt-0.5"></i>
              <div>
                <div class="text-sm font-medium text-gray-700">Session Status</div>
                <div class="text-sm text-gray-900">
                  {{ selectedEvent.session_status }}
                </div>
              </div>
            </div>
          </div>
          <div class="flex justify-start gap-20">
            <div class="flex items-start gap-3 w-full sm:w-auto">
              <i class="fa-solid fa-door-open text-slate-600 mt-0.5"></i>
              <div>
                <div class="text-sm font-medium text-gray-700">Room</div>
                <div class="text-sm text-gray-900">{{ selectedEvent.room_name }}</div>
              </div>
            </div>
  
            <div class="flex items-start gap-3 w-full sm:w-auto">
              <i class="fa-solid fa-book text-slate-600 mt-0.5"></i>
              <div>
                <div class="text-sm font-medium text-gray-700">Subject Code</div>
                <div class="text-sm text-gray-900">{{ selectedEvent.subject_code }}</div>
              </div>
            </div>
          </div>

          <div class="flex justify-start gap-20">
            <div class="flex items-start gap-3 w-full sm:w-auto">
              <i class="fa-solid fa-chalkboard-user text-slate-600 mt-0.5"></i>
              <div>
                <div class="text-sm font-medium text-gray-700">Teacher</div>
                <div class="text-sm text-gray-900">
                  {{ selectedEvent.first_name }} {{ selectedEvent.last_name }}
                </div>
              </div>
            </div>
            <div class="flex items-start gap-3 w-full sm:w-auto">
              <i class="fa-solid fa-square-poll-horizontal text-slate-600 mt-0.5"></i>
              <div>
                <div class="text-sm font-medium text-gray-700">Status</div>
                <div class="text-sm bg-blue-400 text-white p-1 rounded-xl">
                  {{ selectedEvent.leave_request_status }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
          <button 
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
            @click="selectedEvent = null"
          >
            <i class="fa-solid fa-xmark mr-2"></i>
            Close
          </button>
          <button 
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="canRequestLeave 
              ? 'bg-slate-900 text-white hover:bg-slate-800' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'"
            :disabled="!canRequestLeave"
            @click="canRequestLeave && showFormRequest()"
          >
            <i class="fa-solid fa-file-medical mr-2"></i>
            Request Leave
          </button>
        </div>
      </div>
    </div>

    <!-- Leave Request Form Modal -->
    <div
      v-if="showLeaveForm"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      @click="closeLeaveForm"
    >
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all" @click.stop>
        <div class="px-6 py-4 border-b border-gray-200 bg-slate-900 text-white">
          <h3 class="text-lg font-semibold">
            <i class="fa-solid fa-file-medical mr-2"></i>
            Request Leave
          </h3>
        </div>
        
        <!-- Success Message -->
        <div v-if="leaveRequestSuccess" class="mx-6 mt-4 p-4 bg-green-100 border border-green-300 rounded-lg">
          <div class="flex items-center gap-2 text-green-800">
            <i class="fa-solid fa-circle-check text-lg"></i>
            <p class="font-medium">Leave request submitted successfully!</p>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="leaveRequestError" class="mx-6 mt-4 p-4 bg-red-100 border border-red-300 rounded-lg">
          <div class="flex items-center gap-2 text-red-800">
            <i class="fa-solid fa-circle-exclamation text-lg"></i>
            <p class="font-medium">{{ leaveRequestError }}</p>
          </div>
        </div>
        
        <form @submit.prevent="submitLeaveRequest" class="px-6 py-4 space-y-4">
          <!-- Session Info (Read-only) -->
          <div class="bg-gray-50 p-3 rounded-lg">
            <div class="text-sm font-medium text-gray-700 mb-2">Session Information</div>
            <div class="text-sm text-gray-900">
              <div style="display: none;"><strong>Session ID:</strong> {{ leaveFormData.attendance_session_id }}</div>
              <div><strong>Subject:</strong> {{ leaveFormData.subject_name }}</div>
              <div><strong>Date:</strong> {{ leaveFormData.date_label }}</div>
              <div><strong>Day:</strong> {{ leaveFormData.day_name }}</div>
              <div><strong>Time:</strong> {{ leaveFormData.time_range }}</div>
            </div>
          </div>

          <!-- Status Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fa-solid fa-user-check mr-1"></i>
              Attendance Status
            </label>
            <select 
              v-model="leaveFormData.status" 
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="">Select status</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="excused">Excused</option>
            </select>
          </div>
          <!-- Reason for Leave Selection (Dropdown) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fa-solid fa-comment mr-1"></i>
              Reason for Leave
            </label>
            <select 
              v-model="leaveFormData.reason" 
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="attendance_records">Attendance Records</option>
              <option value="personal">Personal</option>
              <option value="health">Health</option>
              <option value="family_emergency">Family Emergency</option>
              <option value="other">Other</option>
            </select>
          </div>
          <!-- Remark/Reason -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fa-solid fa-comment mr-1"></i>
              Reason for Leave
            </label>
            <textarea 
              v-model="leaveFormData.remark"
              rows="4"
              placeholder="Please provide a reason for your leave request..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
            ></textarea>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end gap-2 pt-2">
            <button 
              type="button"
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
              @click="closeLeaveForm"
              :disabled="submittingLeave"
            >
              <i class="fa-solid fa-xmark mr-2"></i>
              Cancel
            </button>
            <button 
              type="submit"
              class="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="submittingLeave"
            >
              <i class="fa-solid fa-spinner fa-spin mr-2" v-if="submittingLeave"></i>
              <i class="fa-solid fa-paper-plane mr-2" v-else></i>
              {{ submittingLeave ? 'Submitting...' : 'Submit Request' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../../services/api';

const schedules = ref([]);
const loading = ref(true);
const error = ref('');

const currentDate = ref(new Date());
const selectedEvent = ref(null);
const viewMode = ref('month'); // 'week', 'month', 'year'

// user
const user = ref(null);
const loadUser = () => {
  const raw = localStorage.getItem('sams_user');
  user.value = raw ? JSON.parse(raw) : null;
};

// date labels
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dayNamesShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth());
const currentMonthName = computed(() => monthNames[currentMonth.value]);

const currentViewTitle = computed(() => {
  if (viewMode.value === 'week') {
    const weekStart = getWeekStart(currentDate.value);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  } else if (viewMode.value === 'month') {
    return `${currentMonthName.value} ${currentYear.value}`;
  } else {
    return `${currentYear.value}`;
  }
});

const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate();
});

const startingDayOfWeek = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1).getDay();
});

// time helpers
const getEventStartTime = (event) => {
  return event.session_start_time || event.start_time;
};

const getEventEndTime = (event) => {
  return event.session_end_time || event.end_time;
};

// is past?
const isPastEvent = (event) => {
  if (!event.session_date) return false;

  const endTime = getEventEndTime(event) || getEventStartTime(event) || '23:59:59';
  const [hStr, mStr, sStr] = endTime.split(':');

  const d = new Date(event.session_date);
  d.setHours(
    parseInt(hStr || '0', 10),
    parseInt(mStr || '0', 10),
    parseInt(sStr || '0', 10),
    0
  );

  return d.getTime() < Date.now();
};

// sorted upcoming sessions for table
const sortedSchedules = computed(() => {
  const upcoming = schedules.value.filter((item) => !isPastEvent(item));

  return upcoming.sort((a, b) => {
    const ad = a.session_date ? new Date(a.session_date) : new Date(a.start_date);
    const bd = b.session_date ? new Date(b.session_date) : new Date(b.start_date);
    if (ad.getTime() !== bd.getTime()) {
      return ad - bd;
    }
    const aStart = getEventStartTime(a) || '';
    const bStart = getEventStartTime(b) || '';
    return aStart.localeCompare(bStart);
  });
});

// week view
const timeSlots = [
  '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00', '18:00'
];

const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

const weekDays = computed(() => {
  const weekStart = getWeekStart(currentDate.value);
  const days = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    
    days.push({
      name: dayNames[date.getDay()],
      date: date.getTime(),
      dateStr: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  }
  
  return days;
});

const fetchSchedules = async () => {
  try {
    if (!user.value?.id) {
      loading.value = false;
      return;
    }
    loading.value = true;
    error.value = '';
    
    const { data } = await api.get(`/schedules/by-user/${user.value.id}`);
    console.log(data);
    
    schedules.value = data;
  } catch (err) {
    console.error('Failed to fetch schedules:', err);
    error.value = err.response?.data?.message || 'Failed to load schedules';
  } finally {
    loading.value = false;
  }
};

const navigate = (offset) => {
  if (viewMode.value === 'week') {
    currentDate.value = new Date(currentDate.value.setDate(currentDate.value.getDate() + (offset * 7)));
  } else if (viewMode.value === 'month') {
    currentDate.value = new Date(currentYear.value, currentMonth.value + offset, 1);
  } else {
    currentDate.value = new Date(currentYear.value + offset, 0, 1);
  }
};

const isToday = (day) => {
  const today = new Date();
  return today.getDate() === day &&
         today.getMonth() === currentMonth.value &&
         today.getFullYear() === currentYear.value;
};

// Month view: use session_date
const getEventsForDay = (day) => {
  const date = new Date(currentYear.value, currentMonth.value, day);

  return schedules.value.filter((schedule) => {
    if (!schedule.session_date) return false;
    const sessionDate = new Date(schedule.session_date);
    return (
      sessionDate.getFullYear() === date.getFullYear() &&
      sessionDate.getMonth() === date.getMonth() &&
      sessionDate.getDate() === date.getDate()
    );
  });
};

// Week view: use session_date + session times
const getWeekEvents = (weekDay, timeSlot) => {
  const [hour] = timeSlot.split(':');
  const date = new Date(weekDay.date);

  return schedules.value.filter((schedule) => {
    if (!schedule.session_date) return false;

    const sessionDate = new Date(schedule.session_date);
    const sameDate =
      sessionDate.getFullYear() === date.getFullYear() &&
      sessionDate.getMonth() === date.getMonth() &&
      sessionDate.getDate() === date.getDate();

    if (!sameDate) return false;

    const startTime = getEventStartTime(schedule);
    const endTime = getEventEndTime(schedule);

    if (!startTime || !endTime) return false;

    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    const slotHour = parseInt(hour);

    return slotHour >= startHour && slotHour < endHour;
  });
};

const getDayName = (dayOfWeek) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days[dayOfWeek - 1] || 'Unknown';
};

const getEventColor = (event) => {
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
  ];
  
  const hash = event.subject_code.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
};

const showEventDetails = (event) => {  
  if (isPastEvent(event)) return;
  selectedEvent.value = event;
};

// year view helpers
const getDaysInSpecificMonth = (month) => {
  return new Date(currentYear.value, month, 0).getDate();
};

const getMonthStartDay = (month) => {
  return new Date(currentYear.value, month - 1, 1).getDay();
};

const hasEventsOnDate = (month, day) => {
  const date = new Date(currentYear.value, month - 1, day);

  return schedules.value.some((schedule) => {
    if (!schedule.session_date) return false;
    const sessionDate = new Date(schedule.session_date);
    return (
      sessionDate.getFullYear() === date.getFullYear() &&
      sessionDate.getMonth() === date.getMonth() &&
      sessionDate.getDate() === date.getDate()
    );
  });
};

const isTodayInYear = (month, day) => {
  const today = new Date();
  return today.getDate() === day &&
         today.getMonth() === month - 1 &&
         today.getFullYear() === currentYear.value;
};

// display helpers
const formatSessionDate = (event) => {
  if (!event.session_date) return 'N/A';
  const d = new Date(event.session_date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatSessionDayName = (event) => {
  if (event.session_date) {
    const d = new Date(event.session_date);
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  }
  return getDayName(event.day_of_week);
};

const formatSessionDayLabel = (event) => {
  if (event.session_date) {
    const d = new Date(event.session_date);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }
  return getDayName(event.day_of_week);
};

// leave form
const showLeaveForm = ref(false);

const leaveFormData = ref({
  schedule_id: null,
  attendance_session_id: null,
  subject_name: '',
  day_name: '',
  date_label: '',
  time_range: '',
  status: '',
  remark: '',
});

const submittingLeave = ref(false);
const leaveRequestSuccess = ref(false);
const leaveRequestError = ref('');

// can request leave?
const canRequestLeave = computed(() => {  
  if (!selectedEvent.value) return false;
  if (selectedEvent.value.leave_request_status == 'Requested') return false;
  return !isPastEvent(selectedEvent.value);
});

// Open the leave request form, pre-fill from selectedEvent
const showFormRequest = () => {
  if (!selectedEvent.value || !canRequestLeave.value) return;

  const e = selectedEvent.value;
  
  leaveFormData.value.schedule_id = e.id;
  leaveFormData.value.attendance_session_id = e.attendance_session_id || null;
  leaveFormData.value.subject_name = e.subject_name;
  leaveFormData.value.day_name = formatSessionDayName(e);
  leaveFormData.value.date_label = formatSessionDate(e);

  const start = getEventStartTime(e);
  const end = getEventEndTime(e);
  leaveFormData.value.time_range = start && end
    ? `${start.slice(0, 5)} - ${end.slice(0, 5)}`
    : '';

  leaveFormData.value.status = '';
  leaveFormData.value.remark = '';

  leaveRequestSuccess.value = false;
  leaveRequestError.value = '';
  showLeaveForm.value = true;
};

// Close and reset form
const closeLeaveForm = () => {
  if (submittingLeave.value) return;
  showLeaveForm.value = false;
  leaveRequestError.value = '';
};

// Submit attendance / leave request
const submitLeaveRequest = async () => {
  if (!user.value?.id) {
    leaveRequestError.value = 'User not found. Please login again.';
    return;
  }

  if (!leaveFormData.value.status) {
    leaveRequestError.value = 'Please select an attendance status.';
    return;
  }

  if (!leaveFormData.value.reason) {
    leaveRequestError.value = 'Please select an attendance status.';
    return;
  }

  if (!leaveFormData.value.attendance_session_id) {
    leaveRequestError.value = 'No attendance session found for this class.';
    return;
  }

  try {
    submittingLeave.value = true;
    leaveRequestError.value = '';
    leaveRequestSuccess.value = false;
    
    await api.post('/attendance', {
      attendance_session_id: leaveFormData.value.attendance_session_id,
      schedule_id: leaveFormData.value.schedule_id,
      user_id: user.value.id,
      status: leaveFormData.value.status,
      remark: leaveFormData.value.remark,
      reason: leaveFormData.value.reason,
      approved: 0,
    });

    leaveRequestSuccess.value = true;

    // auto-close after success
    setTimeout(() => {
      showLeaveForm.value = false;
      selectedEvent.value = null;
    }, 1000);
  } catch (err) {
    console.error('Failed to submit leave request:', err);
    leaveRequestError.value =
      err.response?.data?.message || 'Failed to submit leave request. Please try again.';
  } finally {
    submittingLeave.value = false;
  }
};

onMounted(async () => {
  loadUser();
  await fetchSchedules();
});
</script>
