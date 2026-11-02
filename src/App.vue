<template>
  <!-- Pages like /login render on their own, without the app shell -->
  <RouterView v-if="route.meta.hideSidebar" />

  <div v-else class="h-screen flex bg-slate-100 text-slate-800">
    <!-- Mobile overlay -->
    <Transition name="fade">
      <div
        v-if="mobileMenuOpen"
        @click="closeMobileSidebar"
        class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
      ></div>
    </Transition>

    <!-- ================= SIDEBAR ================= -->
    <aside
      :class="[
        'fixed md:relative inset-y-0 left-0 z-50 flex flex-col bg-slate-900 text-slate-300',
        'transition-all duration-300 ease-in-out shrink-0',
        collapsed ? 'md:w-20' : 'md:w-72',
        'w-72',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      ]"
    >
      <!-- Brand -->
      <div class="h-16 flex items-center gap-3 px-4 border-b border-white/5 shrink-0">
        <div
          class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 overflow-hidden shadow-lg shadow-blue-900/40"
        >
          <img
            v-if="school?.image && !logoFailed"
            :src="imageSchoolUrl(school.image)"
            alt=""
            class="w-full h-full object-cover"
            @error="logoFailed = true"
          />
          <i v-else class="fa-solid fa-graduation-cap text-white"></i>
        </div>
        <div v-show="!collapsed || mobileMenuOpen" class="min-w-0 flex-1">
          <p class="text-white font-semibold text-sm leading-tight truncate" :title="school?.name">
            {{ school?.name || 'SAMS' }}
          </p>
          <p class="text-[11px] text-slate-400 leading-tight">Attendance System</p>
        </div>
        <button
          @click="closeMobileSidebar"
          class="md:hidden w-8 h-8 rounded-lg hover:bg-white/10 text-slate-400"
          aria-label="Close menu"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Menu -->
      <nav class="flex-1 overflow-y-auto px-3 py-4 sidebar-scroll">
        <p
          v-show="!collapsed || mobileMenuOpen"
          class="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
        >
          Menu
        </p>

        <ul class="space-y-1">
          <li v-for="item in menu" :key="item.label">
            <!-- Single link -->
            <RouterLink
              v-if="item.to"
              :to="item.to"
              @click="closeMobileSidebar"
              :title="isCollapsed ? item.label : undefined"
              :class="[
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive(item.to)
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                  : 'hover:bg-white/5 hover:text-white',
                isCollapsed && 'justify-center',
              ]"
            >
              <i :class="['fa-solid w-5 text-center', item.icon]"></i>
              <span v-show="!isCollapsed" class="truncate">{{ item.label }}</span>
            </RouterLink>

            <!-- Group with sub-links -->
            <template v-else>
              <button
                @click="toggleGroup(item.label)"
                :title="isCollapsed ? item.label : undefined"
                :class="[
                  'w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  groupActive(item)
                    ? 'text-white bg-white/5'
                    : 'hover:bg-white/5 hover:text-white',
                  isCollapsed && 'justify-center',
                ]"
              >
                <i
                  :class="[
                    'fa-solid w-5 text-center',
                    item.icon,
                    groupActive(item) && 'text-blue-400',
                  ]"
                ></i>
                <span v-show="!isCollapsed" class="flex-1 text-left truncate">{{ item.label }}</span>
                <i
                  v-show="!isCollapsed"
                  :class="[
                    'fa-solid fa-chevron-down text-[10px] text-slate-500 transition-transform duration-200',
                    openGroup === item.label && 'rotate-180',
                  ]"
                ></i>
              </button>

              <div
                class="grid transition-all duration-200 ease-in-out"
                :class="openGroup === item.label && !isCollapsed ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
              >
                <ul class="overflow-hidden ml-5 pl-4 border-l border-white/10 space-y-0.5">
                  <li v-for="child in item.children" :key="child.to" class="first:mt-1 last:mb-1">
                    <RouterLink
                      :to="child.to"
                      @click="closeMobileSidebar"
                      :title="child.hint"
                      :class="[
                        'relative flex items-center rounded-lg px-3 py-2 text-[13px] transition-colors',
                        isActive(child.to)
                          ? 'text-white bg-blue-600/20 font-medium'
                          : 'text-slate-400 hover:text-white hover:bg-white/5',
                      ]"
                    >
                      <span
                        v-if="isActive(child.to)"
                        class="absolute -left-[21px] w-2 h-2 rounded-full bg-blue-500 ring-4 ring-slate-900"
                      ></span>
                      <span class="truncate">{{ child.label }}</span>
                    </RouterLink>
                  </li>
                </ul>
              </div>
            </template>
          </li>
        </ul>
      </nav>

      <!-- User card + logout -->
      <div class="p-3 border-t border-white/5 shrink-0">
        <div :class="['flex items-center gap-3 rounded-xl p-2', isCollapsed && 'justify-center']">
          <img
            v-if="user?.image && !avatarFailed"
            :src="imageUserUrl(user.image)"
            alt=""
            class="w-9 h-9 rounded-full object-cover ring-2 ring-white/10 shrink-0"
            @error="avatarFailed = true"
          />
          <div
            v-else
            class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold shrink-0"
          >
            {{ initials }}
          </div>
          <div v-show="!isCollapsed" class="min-w-0 flex-1">
            <p class="text-sm text-white font-medium truncate">{{ user?.name || 'Guest' }}</p>
            <p class="text-xs text-slate-400 capitalize">{{ user?.role || '' }}</p>
          </div>
          <button
            v-show="!isCollapsed"
            @click="logout"
            title="Log out"
            class="w-9 h-9 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
          </button>
        </div>
        <button
          v-if="isCollapsed"
          @click="logout"
          title="Log out"
          class="mt-1 w-full h-9 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <i class="fa-solid fa-arrow-right-from-bracket"></i>
        </button>
      </div>
    </aside>

    <!-- ================= MAIN ================= -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Header -->
      <header
        class="h-16 bg-white/80 backdrop-blur border-b border-slate-200 px-4 md:px-6 flex items-center gap-3 shrink-0"
      >
        <button
          @click="toggleMobileSidebar"
          class="md:hidden w-9 h-9 rounded-lg hover:bg-slate-100 text-slate-600"
          aria-label="Open menu"
        >
          <i class="fa-solid fa-bars"></i>
        </button>
        <button
          @click="toggleCollapsed"
          class="hidden md:flex w-9 h-9 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500"
          :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        >
          <i :class="['fa-solid', collapsed ? 'fa-angles-right' : 'fa-angles-left']"></i>
        </button>

        <div class="min-w-0">
          <p v-if="current.group" class="text-xs text-slate-400 leading-tight truncate">
            {{ current.group }}
          </p>
          <h1 class="text-base md:text-lg font-semibold text-slate-800 leading-tight truncate">
            {{ current.title }}
          </h1>
        </div>

        <div class="ml-auto flex items-center gap-3">
          <span class="hidden sm:block text-sm text-slate-500">{{ today }}</span>

          <!-- User menu -->
          <div class="relative" ref="userMenuRef">
            <button
              @click="userMenuOpen = !userMenuOpen"
              class="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-slate-100 transition-colors"
            >
              <img
                v-if="user?.image && !avatarFailed"
                :src="imageUserUrl(user.image)"
                alt=""
                class="w-8 h-8 rounded-full object-cover"
                @error="avatarFailed = true"
              />
              <div
                v-else
                class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold"
              >
                {{ initials }}
              </div>
              <i class="fa-solid fa-chevron-down text-[10px] text-slate-400"></i>
            </button>

            <Transition name="pop">
              <div
                v-if="userMenuOpen"
                class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl ring-1 ring-slate-200 py-2 z-50"
              >
                <div class="px-4 py-2 border-b border-slate-100">
                  <p class="text-sm font-semibold text-slate-800 truncate">{{ user?.name }}</p>
                  <p class="text-xs text-slate-500 truncate">{{ user?.email }}</p>
                  <span
                    class="inline-block mt-1.5 text-[11px] font-medium capitalize px-2 py-0.5 rounded-full bg-blue-50 text-blue-600"
                  >
                    {{ user?.role }}
                  </span>
                </div>
                <button
                  @click="logout"
                  class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <i class="fa-solid fa-arrow-right-from-bracket w-4"></i>
                  Log out
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </header>

      <!-- Page content: only this area scrolls -->
      <main class="flex-1 overflow-y-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import api, { IMAGE_URL } from './services/api';

const route = useRoute();

// ---------- Menus per role ----------
// `to` = single link, `children` = collapsible group. `hint` shows as a tooltip.
const MENUS = {
  admin: [
    { label: 'Dashboard', icon: 'fa-gauge-high', to: '/' },
    {
      label: 'Academic',
      icon: 'fa-building-columns',
      children: [
        { label: 'School Years & Terms', to: '/school-years' },
        { label: 'Faculties', to: '/faculties' },
        { label: 'Departments', to: '/departments' },
        { label: 'Majors', to: '/majors' },
        { label: 'Rooms', to: '/rooms' },
        { label: 'Subjects', to: '/subjects' },
      ],
    },
    {
      label: 'Classes & Curriculum',
      icon: 'fa-chalkboard',
      children: [
        { label: 'Classes', to: '/classes' },
        { label: 'Class Subjects', to: '/class-subjects', hint: 'Class – Subject – Teacher' },
        { label: 'Schedules', to: '/schedules', hint: 'Timetable' },
      ],
    },
    {
      label: 'Users',
      icon: 'fa-users',
      children: [
        { label: 'All Users', to: '/users' },
        { label: 'Teachers', to: '/teachers' },
        { label: 'Students', to: '/students' },
        { label: 'Teacher – Classes', to: '/teacher-class', hint: 'Homeroom / Advisor' },
      ],
    },
    {
      label: 'Attendance',
      icon: 'fa-clipboard-check',
      children: [
        { label: 'Attendance Sessions', to: '/attendance-sessions' },
        { label: 'Attendance Requests', to: '/attendance-requested' },
        { label: 'Take Attendance', to: '/take-attendance', hint: 'By class / subject' },
        { label: 'Teacher Attendance', to: '/teacher-attendance' },
        { label: 'Fix Attendance', to: '/fix-attendance', hint: 'Edit wrong records' },
      ],
    },
    {
      label: 'Reports',
      icon: 'fa-chart-pie',
      children: [
        { label: 'Student Report', to: '/student-attendance-report' },
        { label: 'Class Report', to: '/class-attendance-report' },
        { label: 'Subject Report', to: '/subject-attendance-report' },
        { label: 'Teacher Report', to: '/teacher-attendance-report' },
        { label: 'Monthly Summary', to: '/monthly-summary' },
      ],
    },
    { label: 'Settings', icon: 'fa-gear', to: '/school' },
  ],
  teacher: [
    { label: 'Dashboard', icon: 'fa-gauge-high', to: '/' },
    { label: 'My Classes', icon: 'fa-chalkboard-user', to: '/teacher-class-list' },
    {
      label: 'Attendance',
      icon: 'fa-clipboard-check',
      children: [
        { label: 'Take Attendance', to: '/teacher-take-attendance' },
        { label: 'My Attendance', to: '/teacher-teacher-attendance' },
      ],
    },
    {
      label: 'Schedule',
      icon: 'fa-calendar-days',
      children: [
        { label: 'My Timetable', to: '/teacher-my-timetable', hint: 'Weekly view' },
        { label: 'Upcoming Sessions', to: '/teacher-upcoming-sessions' },
      ],
    },
  ],
  student: [
    { label: 'Dashboard', icon: 'fa-gauge-high', to: '/student-dashboard-view' },
    { label: 'My Attendance', icon: 'fa-clipboard-check', to: '/student-my-attendance' },
    { label: 'Schedules', icon: 'fa-calendar-week', to: '/student-schedules-view' },
  ],
};

// ---------- User & school ----------
const user = ref(null);
const school = ref(null);
const avatarFailed = ref(false);
const logoFailed = ref(false);

const loadUser = () => {
  try {
    const raw = localStorage.getItem('sams_user');
    user.value = raw ? JSON.parse(raw) : null;
  } catch {
    user.value = null;
  }
};

const loadSchool = async () => {
  if (!localStorage.getItem('sams_token')) return;
  try {
    const { data } = await api.get('/schools/1');
    school.value = data;
  } catch {
    school.value = null; // keep the default "SAMS" brand
  }
};

const menu = computed(() => MENUS[user.value?.role] || [{ label: 'Dashboard', icon: 'fa-gauge-high', to: '/' }]);

const initials = computed(() =>
  (user.value?.name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
);

const imageUserUrl = (f) => (f ? `${IMAGE_URL}/uploads/users/${f}` : '');
const imageSchoolUrl = (f) => (f ? `${IMAGE_URL}/uploads/schools/${f}` : '');

const today = new Date().toLocaleDateString(undefined, {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

// ---------- Active state ----------
const isActive = (to) => route.path === to;
const groupActive = (item) => item.children?.some((c) => isActive(c.to));

// Page title + group shown in the header, taken from the menu
const current = computed(() => {
  for (const item of menu.value) {
    if (item.to && isActive(item.to)) return { title: item.label, group: '' };
    const child = item.children?.find((c) => isActive(c.to));
    if (child) return { title: child.label, group: item.label };
  }
  return { title: String(route.name || '').replace(/([a-z])([A-Z])/g, '$1 $2'), group: '' };
});

// ---------- Sidebar state ----------
const openGroup = ref(null);
const mobileMenuOpen = ref(false);
const userMenuOpen = ref(false);
const userMenuRef = ref(null);

const readCollapsed = () => {
  try {
    return localStorage.getItem('sams_sidebar_collapsed') === '1';
  } catch {
    return false;
  }
};
const collapsed = ref(readCollapsed());
// The mobile drawer always shows full labels
const isCollapsed = computed(() => collapsed.value && !mobileMenuOpen.value);

const toggleCollapsed = () => {
  collapsed.value = !collapsed.value;
  try {
    localStorage.setItem('sams_sidebar_collapsed', collapsed.value ? '1' : '0');
  } catch {
    /* ignore */
  }
};

const toggleGroup = (label) => {
  if (isCollapsed.value) {
    // Clicking a group icon in the slim sidebar expands it and opens the group
    toggleCollapsed();
    openGroup.value = label;
    return;
  }
  openGroup.value = openGroup.value === label ? null : label;
};

const toggleMobileSidebar = () => (mobileMenuOpen.value = !mobileMenuOpen.value);
const closeMobileSidebar = () => (mobileMenuOpen.value = false);

// Open the group that holds the current page
watch(
  () => [route.path, menu.value],
  () => {
    const group = menu.value.find((item) => groupActive(item));
    if (group) openGroup.value = group.label;
    userMenuOpen.value = false;
  },
  { immediate: true }
);

const onClickOutside = (e) => {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target)) userMenuOpen.value = false;
};

onMounted(() => {
  loadUser();
  loadSchool();
  document.addEventListener('click', onClickOutside);
});
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside));

const logout = () => {
  localStorage.removeItem('sams_token');
  localStorage.removeItem('sams_user');
  window.location.href = '/login';
};
</script>

<style scoped>
.sidebar-scroll::-webkit-scrollbar {
  width: 6px;
}
.sidebar-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 9999px;
}
.sidebar-scroll:hover::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.16);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.pop-enter-active,
.pop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}
</style>
