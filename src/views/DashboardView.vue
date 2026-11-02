<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800 uppercase">System Dashboard</h2>
      <p class="text-sm text-gray-600 mt-1">Overview of attendance and system statistics</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white rounded-lg shadow-sm p-12 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600"></div>
      <p class="text-sm text-gray-500 mt-4">Loading dashboard...</p>
    </div>

    <!-- Content -->
    <div v-else-if="dashboardData" class="space-y-6">
      <!-- Top summary cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 shadow-sm text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs uppercase opacity-90 mb-1">Students</p>
              <p class="text-3xl font-bold">{{ dashboardData.counters.students }}</p>
            </div>
            <div class="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 shadow-sm text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs uppercase opacity-90 mb-1">Teachers</p>
              <p class="text-3xl font-bold">{{ dashboardData.counters.teachers }}</p>
            </div>
            <div class="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 shadow-sm text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs uppercase opacity-90 mb-1">Classes</p>
              <p class="text-3xl font-bold">{{ dashboardData.counters.classes }}</p>
            </div>
            <div class="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 shadow-sm text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs uppercase opacity-90 mb-1">Subjects</p>
              <p class="text-3xl font-bold">{{ dashboardData.counters.subjects }}</p>
            </div>
            <div class="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Today attendance summary -->
      <div>
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Today's Attendance</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
            <p class="text-sm text-gray-600 mb-1">Present Today</p>
            <p class="text-3xl font-bold text-green-600">{{ todayStats.present_count }}</p>
          </div>

          <div class="bg-white rounded-lg p-6 shadow-sm border-l-4 border-red-500">
            <p class="text-sm text-gray-600 mb-1">Absent Today</p>
            <p class="text-3xl font-bold text-red-600">{{ todayStats.absent_count }}</p>
          </div>

          <div class="bg-white rounded-lg p-6 shadow-sm border-l-4 border-yellow-500">
            <p class="text-sm text-gray-600 mb-1">Late Today</p>
            <p class="text-3xl font-bold text-yellow-600">{{ todayStats.late_count }}</p>
          </div>

          <div class="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500">
            <p class="text-sm text-gray-600 mb-1">Attendance Rate</p>
            <div class="flex items-baseline gap-2">
              <p class="text-3xl font-bold text-blue-600">{{ todayStats.attendanceRate }}%</p>
              <span class="text-sm text-gray-500">today</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Weekly trend + class performance -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Weekly Trend Chart -->
        <div class="bg-white rounded-lg p-6 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-800">Weekly Attendance Trend</h3>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div id="weeklyChart" class="w-full" style="height: 300px;"></div>
        </div>

        <!-- Class Performance Chart -->
        <div class="bg-white rounded-lg p-6 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-800">Class Attendance Performance</h3>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div id="classChart" class="w-full" style="height: 300px;"></div>
        </div>
      </div>

      <!-- Top absentees + recent activity -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Absentees -->
        <div class="bg-white rounded-lg p-6 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-800">Top Absentees</h3>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="px-4 py-3 text-left font-semibold text-gray-700 uppercase">Student</th>
                  <th class="px-4 py-3 text-center font-semibold text-gray-700 uppercase">Total Absent</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-if="(dashboardData.topAbsentees || []).length === 0">
                  <td colspan="2" class="px-4 py-8 text-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    No absentee data available
                  </td>
                </tr>
                <tr
                  v-for="s in dashboardData.topAbsentees"
                  :key="s.id"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {{ (s.first_name || '').charAt(0).toUpperCase() }}
                      </div>
                      <span class="font-medium text-gray-900">{{ s.first_name }} {{ s.last_name }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span class="inline-flex items-center justify-center w-10 h-10 bg-red-100 text-red-700 rounded-full font-bold">
                      {{ s.absent_count }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white rounded-lg p-6 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-800">Recent Attendance Activity</h3>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="px-4 py-3 text-left font-semibold text-gray-700 uppercase">Student</th>
                  <th class="px-4 py-3 text-center font-semibold text-gray-700 uppercase">Status</th>
                  <th class="px-4 py-3 text-right font-semibold text-gray-700 uppercase">Time</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-if="(dashboardData.recentActivity || []).length === 0">
                  <td colspan="3" class="px-4 py-8 text-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    No recent activity
                  </td>
                </tr>
                <tr
                  v-for="r in dashboardData.recentActivity"
                  :key="r.id"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {{ (r.first_name || '').charAt(0).toUpperCase() }}
                      </div>
                      <span class="font-medium text-gray-900">{{ r.first_name }} {{ r.last_name }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span
                      class="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                      :class="statusBadgeClass(r.status)"
                    >
                      {{ r.status }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right text-gray-600 text-xs">
                    {{ formatDateTime(r.created_at) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- No data state -->
    <div v-else class="bg-white rounded-lg shadow-sm p-12 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p class="text-gray-500">No dashboard data available</p>
    </div>

    <!-- Message -->
    <div
      v-if="message"
      class="mt-6 p-4 rounded-lg"
      :class="messageType === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'"
    >
      <div class="flex items-center gap-2">
        <svg v-if="messageType === 'error'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-sm font-medium">{{ message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import Highcharts from 'highcharts';
import api from '../services/api';

const dashboardData = ref(null);
const loading = ref(false);
const message = ref('');
const messageType = ref('success');

let weeklyChartInstance = null;
let classChartInstance = null;

// Computed for today's stats + rate
const todayStats = computed(() => {
  if (!dashboardData.value || !dashboardData.value.todayAttendance) {
    return {
      present_count: 0,
      absent_count: 0,
      late_count: 0,
      excused_count: 0,
      attendanceRate: 0
    };
  }

  const t = dashboardData.value.todayAttendance;

  const present = Number(t.present_count || 0);
  const absent = Number(t.absent_count || 0);
  const late = Number(t.late_count || 0);
  const excused = Number(t.excused_count || 0);

  const total = present + absent + late + excused;
  const rate = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

  return {
    present_count: present,
    absent_count: absent,
    late_count: late,
    excused_count: excused,
    attendanceRate: rate
  };
});

// Load dashboard from /dashboard
const loadDashboard = async () => {
  message.value = '';
  loading.value = true;

  try {
    const res = await api.get('/dashboard');
    dashboardData.value = res.data;

    // Wait for DOM to be ready
    await nextTick();
    
    // Add a small delay to ensure elements are fully rendered
    setTimeout(() => {
      renderCharts();
    }, 100);
  } catch (err) {
    messageType.value = 'error';
    message.value = err.response?.data?.message || 'Failed to load dashboard.';
  } finally {
    loading.value = false;
  }
};

const renderCharts = () => {
  console.log('renderCharts called');
  console.log('Highcharts available:', typeof Highcharts);
  console.log('dashboardData:', dashboardData.value);
  
  if (!dashboardData.value) {
    console.log('No dashboard data');
    return;
  }
  
  if (typeof Highcharts === 'undefined') {
    console.error('Highcharts is not loaded!');
    messageType.value = 'error';
    message.value = 'Chart library not loaded. Please refresh the page.';
    return;
  }

  // Weekly Trend Chart
  const weeklyChartElement = document.getElementById('weeklyChart');
  console.log('weeklyChartElement:', weeklyChartElement);
  console.log('weeklyChartElement dimensions:', weeklyChartElement?.offsetWidth, weeklyChartElement?.offsetHeight);
  
  if (weeklyChartElement) {
    const trend = dashboardData.value.weeklyTrend || [];
    console.log('Weekly trend data:', trend);
    console.log('Weekly trend length:', trend.length);

    // Destroy previous instance if it exists
    if (weeklyChartInstance) {
      weeklyChartInstance.destroy();
      weeklyChartInstance = null;
    }

    // Create new chart
    try {
      // Check if we have data
      if (trend.length === 0) {
        weeklyChartElement.innerHTML = '<div class="flex items-center justify-center h-full text-gray-400"><p>No weekly data available</p></div>';
        console.log('No weekly trend data to display');
        return;
      }
      
      weeklyChartInstance = Highcharts.chart(weeklyChartElement, {
      chart: { 
        type: 'line',
        style: { fontFamily: 'inherit' }
      },
      title: { text: null },
      xAxis: {
        categories: trend.map(d => d.date),
        labels: { 
          rotation: -45,
          style: { fontSize: '11px' }
        }
      },
      yAxis: {
        title: { 
          text: 'Students',
          style: { fontSize: '12px' }
        }
      },
      tooltip: {
        shared: true,
        crosshairs: true
      },
      plotOptions: {
        line: { 
          marker: { 
            radius: 4, 
            symbol: 'circle' 
          } 
        }
      },
      series: [
        {
          name: 'Present',
          data: trend.map(d => Number(d.present_count || 0)),
          color: '#16a34a',
          lineWidth: 3
        },
        {
          name: 'Absent',
          data: trend.map(d => Number(d.absent_count || 0)),
          color: '#dc2626',
          lineWidth: 3
        }
      ],
      credits: { enabled: false },
      legend: {
        align: 'center',
        verticalAlign: 'bottom'
      }
    });
    console.log('Weekly chart created:', weeklyChartInstance);
  } catch (error) {
    console.error('Error creating weekly chart:', error);
  }
} else {
  console.log('weeklyChartElement not found');
}

  // Class Performance Chart
  const classChartElement = document.getElementById('classChart');
  console.log('classChartElement:', classChartElement);
  
  if (classChartElement) {
    const classes = dashboardData.value.classPerformance || [];
    console.log('Class performance data:', classes);

    // Destroy previous instance if it exists
    if (classChartInstance) {
      classChartInstance.destroy();
      classChartInstance = null;
    }

    // Create new chart
    try {
      // Check if we have data
      if (classes.length === 0) {
        classChartElement.innerHTML = '<div class="flex items-center justify-center h-full text-gray-400"><p>No class data available</p></div>';
        console.log('No class performance data to display');
        return;
      }
      
      classChartInstance = Highcharts.chart(classChartElement, {
      chart: { 
        type: 'column',
        style: { fontFamily: 'inherit' }
      },
      title: { text: null },
      xAxis: {
        categories: classes.map(c => c.class_name),
        labels: { style: { fontSize: '11px' } }
      },
      yAxis: {
        min: 0,
        title: { 
          text: 'Records', 
          style: { fontSize: '12px' } 
        }
      },
      tooltip: {
        shared: true
      },
      plotOptions: {
        column: { 
          borderRadius: 4,
          dataLabels: {
            enabled: false
          }
        }
      },
      series: [
        {
          name: 'Present',
          data: classes.map(c => Number(c.present_count || 0)),
          color: '#16a34a'
        },
        {
          name: 'Absent',
          data: classes.map(c => Number(c.absent_count || 0)),
          color: '#dc2626'
        }
      ],
      credits: { enabled: false },
      legend: {
        align: 'center',
        verticalAlign: 'bottom'
      }
    });
    console.log('Class chart created:', classChartInstance);
  } catch (error) {
    console.error('Error creating class chart:', error);
  }
} else {
  console.log('classChartElement not found');
}
};

const statusBadgeClass = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'present') return 'bg-green-100 text-green-700';
  if (s === 'absent') return 'bg-red-100 text-red-700';
  if (s === 'late') return 'bg-yellow-100 text-yellow-700';
  if (s === 'excused') return 'bg-blue-100 text-blue-700';
  return 'bg-gray-100 text-gray-700';
};

const formatDateTime = (dt) => {
  if (!dt) return '';
  try {
    const date = new Date(dt);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dt;
  }
};

onMounted(() => {
  loadDashboard();
});
</script>