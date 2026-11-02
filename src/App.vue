<template>
  <div class="h-screen flex flex-col bg-slate-50">
    <!-- Header -->
    <header
      v-if="!route.meta.hideSidebar"
      class="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex justify-between items-center"
    >
      <div class="flex items-center gap-3">
        <!-- Mobile Menu Toggle -->
        <button
          @click="toggleMobileSidebar"
          class="md:hidden p-2 hover:bg-slate-100 rounded-lg"
        >
          <i class="fa-solid fa-bars text-slate-900"></i>
        </button>

        <div
          class="w-10 h-10 bg-slate-400 rounded-lg flex items-center justify-center"
        >
          <span class="text-white font-bold text-sm">        
            <img
          v-if="faculties && faculties.image"
          :src="imageFacultiesUrl(faculties.image)"
          alt="Faculties image"
          class="w-10 h-10 rounded-full object-cover border border-gray-200"
        /></span>
        </div>
        <h1 class="font-bold text-lg text-blue-900 uppercase" v-if="faculties && faculties.name">{{faculties.name}}</h1>
      </div>

      <div class="flex items-center gap-2 md:gap-4">
        <button class="p-2 hover:bg-slate-100 rounded-lg">
          <i class="fa-solid fa-bell text-slate-600"></i>
        </button>
        <button class="p-2 hover:bg-slate-100 rounded-lg hidden sm:block">
          <i class="fa-solid fa-comment text-slate-600"></i>
        </button>
        <button class="p-2 hover:bg-slate-100 rounded-lg hidden sm:block">
          <i class="fa-solid fa-gear text-slate-600"></i>
        </button>
        <img
          v-if="user && user.image"
          :src="imageUrl(user.image)"
          alt="User image"
          class="w-10 h-10 rounded-full object-cover border border-gray-200"
        />

        <div
          v-else-if="user"
          class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center cursor-pointer"
        >
          <span class="text-white text-sm font-semibold">
            {{ user.name?.charAt(0) }}
          </span>
        </div>

        <div
          v-else
          class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"
        >
          <i class="fa-solid fa-user text-gray-400"></i>
        </div>

      </div>
    </header>

    <!-- Content area: sidebar + main -->
    <div class="flex flex-1 overflow-hidden relative">
      <!-- Mobile Sidebar Overlay -->
      <div
        v-if="mobileMenuOpen && !route.meta.hideSidebar"
        @click="closeMobileSidebar"
        class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
      ></div>

      <!-- Sidebar -->
      <aside
        v-if="!route.meta.hideSidebar"
        :class="[
          'bg-slate-800 flex flex-col transition-transform duration-300 ease-in-out z-50',
          'w-80 md:relative fixed inset-y-0 left-0',
          mobileMenuOpen
            ? 'translate-x-0'
            : '-translate-x-full md:translate-x-0',
        ]"
      >
        <!-- Mobile Close Button -->
        <div class="md:hidden flex justify-end p-4">
          <button
            @click="closeMobileSidebar"
            class="p-2 hover:bg-slate-800 rounded-lg text-slate-300"
          >
            <i class="fa-solid fa-times text-xl"></i>
          </button>
        </div>

        <!-- ================= ADMIN SIDEBAR ================= -->
        <nav v-if="isAdmin" class="space-y-1 pt-4 flex-1 overflow-y-auto">
          <RouterLink
            @click="closeMobileSidebar"
            class="flex items-center gap-3 px-4 py-3 text-slate-300 transition-all nav-link"
            active-class="active-nav"
            to="/"
          >
            <span class="text-base w-5">
              <i class="fa-solid fa-chart-area"></i>
            </span>
            <span class="text-m">Dashboard</span>
          </RouterLink>

          <!-- Academic Management -->
          <div>
            <button
              @click="toggleSubmenu('academicManagement')"
              class="w-full flex items-center justify-between px-4 py-3 text-slate-300 transition-all nav-link"
              :class="{ 'active-nav': academicManagementActive }"
            >
              <div class="flex items-center gap-3">
                <span class="text-base w-5">
                  <i class="fa-solid fa-bars-progress"></i>
                </span>
                <span class="text-m">Academic Management</span>
              </div>
              <i
                class="fa-solid fa-chevron-down text-xs transition-transform"
                :class="{ 'rotate-180': openSubmenu === 'academicManagement' }"
              ></i>
            </button>

            <div
              v-show="openSubmenu === 'academicManagement'"
              class="bg-slate-800 py-1"
            >
              <RouterLink
                @click="closeMobileSidebar"
                to="/school-years"
                class="flex items-center gap-3 px-4 py-2 pl-12 text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors"
                active-class="text-white bg-slate-700"
              >
                School Years & Terms
              </RouterLink>
              <RouterLink
                @click="closeMobileSidebar"
                to="/faculties"
                class="flex items-center gap-3 px-4 py-2 pl-12 text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors"
                active-class="text-white bg-slate-700"
              >
                Faculties
              </RouterLink>
              <RouterLink
                @click="closeMobileSidebar"
                to="/departments"
                class="flex items-center gap-3 px-4 py-2 pl-12 text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors"
                active-class="text-white bg-slate-700"
              >
                Departments
              </RouterLink>
              <RouterLink
                @click="closeMobileSidebar"
                to="/majors"
                class="flex items-center gap-3 px-4 py-2 pl-12 text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors"
                active-class="text-white bg-slate-700"
              >
                Majors
              </RouterLink>
              <RouterLink
                @click="closeMobileSidebar"
                to="/rooms"
                class="flex items-center gap-3 px-4 py-2 pl-12 text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors"
                active-class="text-white bg-slate-700"
              >
                Rooms
              </RouterLink>
              <RouterLink
                @click="closeMobileSidebar"
                to="/subjects"
                class="flex items-center gap-3 px-4 py-2 pl-12 text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors"
                active-class="text-white bg-slate-700"
              >
                Subjects
              </RouterLink>
            </div>
          </div>

          <!-- Classes & Curriculum -->
          <div>
            <button
              @click="toggleSubmenu('classesAndCurriculum')"
              class="w-full flex items-center justify-between px-4 py-3 text-slate-300 transition-all nav-link"
              :class="{ 'active-nav': classesAndCurriculumActive }"
            >
              <div class="flex items-center gap-3">
                <span class="text-base w-5">
                  <i class="fa-solid fa-bars-progress"></i>
                </span>
                <span class="text-m">Classes & Curriculum</span>
              </div>
              <i
                class="fa-solid fa-chevron-down text-xs transition-transform"
                :class="{
                  'rotate-180': openSubmenu === 'classesAndCurriculum',
                }"
              ></i>
            </button>

            <div
              v-show="openSubmenu === 'classesAndCurriculum'"
              class="bg-slate-800 py-1"
            >
              <RouterLink
                @click="closeMobileSidebar"
                to="/classes"
                class="flex items-center gap-3 px-4 py-2 pl-12 text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors"
                active-class="text-white bg-slate-700"
              >
                Classes
              </RouterLink>
              <RouterLink
                @click="closeMobileSidebar"
                to="/class-subjects"
                class="flex items-center gap-3 px-4 py-2 pl-12 text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors"
                active-class="text-white bg-slate-700"
              >
                Class Subjects (Class – Subject – Teacher)
              </RouterLink>
              <RouterLink
                @click="closeMobileSidebar"
                to="/schedules"
                class="flex items-center gap-3 px-4 py-2 pl-12 text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors"
                active-class="text-white bg-slate-700"
              >
                Schedules (Timetable)
              </RouterLink>
            </div>
          </div>

          <!-- Users Management -->
          <div>
            <button
              @click="toggleSubmenu('userManagement')"
              class="w-full flex items-center justify-between px-4 py-3 text-slate-300 transition-all nav-link"
              :class="{ 'active-nav': userManagementActive }"
            >
              <div class="flex items-center gap-3">
                <span class="text-base w-5">
                  <i class="fa-solid fa-bars-progress"></i>
                </span>
                <span class="text-m">Users Management</span>
              </div>
              <i
                class="fa-solid fa-chevron-down text-xs transition-transform"
                :class="{ 'rotate-180': openSubmenu === 'userManagement' }"
              ></i>
            </button>

            <div
              v-show="openSubmenu === 'userManagement'"
              class="bg-slate-800 py-1"
            >
              <RouterLink
                @click="closeMobileSidebar"
                to="/users"
                class="flex items-center gap-3 px-4 py-2 pl-12 text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors"
                active-class="text-white bg-slate-700"
              >
                Users (all users)
              </RouterLink>
              <RouterLink
                @click="closeMobileSidebar"
                to="/teachers"
                class="flex items-center gap-3 px-4 py-2 pl-12 text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors"
                active-class="text-white bg-slate-700"
              >
                Teachers
              </RouterLink>
              <RouterLink
                @click="closeMobileSidebar"
                to="/students"
                class="flex items-center gap-3 px-4 py-2 pl-12 text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors"
                active-class="text-white bg-slate-700"
              >
                Students
              </RouterLink>
              <RouterLink
                @click="closeMobileSidebar"
                to="/teacher-class"
                class="flex items-center gap-3 px-4 py-2 pl-12 text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors"
                active-class="text-white bg-slate-700"
              >
                Teacher – Classes (Homeroom / Advisor)
              </RouterLink>
            </div>
          </div>

          <!-- Attendance Management -->
          <div>
            <button
              @click="toggleSubmenu('attendanceManagement')"
              class="w-full flex items-center justify-between px-4 py-3 text-slate-300 transition-all nav-link"
              :class="{ 'active-nav': attendanceManagementActive }"
            >
              <div class="flex items-center gap-3">
                <span class="text-base w-5">
                  <i class="fa-solid fa-bars-progress"></i>
                </span>
                <span class="text-m">Attendance Management</span>
              </div>
              <i
                class="fa-solid fa-chevron-down text-xs transition-transform"
                :class="{
                  'rotate-180': openSubmenu === 'attendanceManagement',
                }"
              ></i>
            </button>

            <div
              v-show="openSubmenu === 'attendanceManagement'"
              class="bg-slate-800 py-1"
            >
              <RouterLink
                @click="closeMobileSidebar"
                to="/attendance-sessions"
                class="flex items-center gap-3 px-4 py-2 pl-12 text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors"
                active-class="text-white bg-slate-700"
              >
                Attendance Sessions
              </RouterLink>
              <RouterLink
                @click="closeMobileSidebar"
                to="/attendance-requested"
                class="flex items-center gap-3 px-4 py-2 pl-12 text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors"
                active-class="text-white bg-slate-700"
              >
                Attendance Requested
              </RouterLink>
              <RouterLink
                @click="closeMobileSidebar"
                to="/take-attendance"
                class="flex items-center gap-3 px-4 py-2 pl-12 text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors"
                active-class="text-white bg-slate-700"
              >
                Take Attendance (class / subject)
              </RouterLink>
              <RouterLink
                @click="closeMobileSidebar"
                to="/teacher-attendance"
                class="flex items-center gap-3 px-4 py-2 pl-12 text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors"
                active-class="text-white bg-slate-700"
              >
                Teacher Attendance (check)
              </RouterLink>
              <RouterLink
                @click="closeMobileSidebar"
                to="/fix-attendance"
                class="flex items-center gap-3 px-4 py-2 pl-12 text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors"
                active-class="text-white bg-slate-700"
              >
                Fix Attendance (edit wrong records)
              </RouterLink>
            </div>
          </div>

          <!-- Reports Management -->
          <div>
            <button
              @click="toggleSubmenu('reportManagement')"
              class="w-full flex items-center justify-between px-4 py-3 text-slate-300 transition-all nav-link"
              :class="{ 'active-nav': reportManagementActive }"
            >
              <div class="flex items-center gap-3">
                <span class="text-base w-5">
                  <i class="fa-solid fa-bars-progress"></i>
                </span>
                <span class="text-m">Reports Management</span>
              </div>
              <i
                class="fa-solid fa-chevron-down text-xs transition-transform"
                :class="{ 'rotate-180': openSubmenu === 'reportManagement' }"
              ></i>
            </button>

            <div
              v-show="openSubmenu === 'reportManagement'"
              class="bg-slate-800 py-1"
            >
              <RouterLink
                @click="closeMobileSidebar"
                to="/student-attendance-report"
                class="flex items-center gap-3 px-4 py-2 pl-12 text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors"
                active-class="text-white bg-slate-700"
              >
                Student Attendance Report
              </RouterLink>
              <RouterLink
                @click="closeMobileSidebar"
                to="/class-attendance-report"
                class="flex items-center gap-3 px-4 py-2 pl-12 text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors"
                active-class="text-white bg-slate-700"
              >
                Class Attendance Report
              </RouterLink>
              <RouterLink
                @click="closeMobileSidebar"
                to="/subject-attendance-report"
                class="flex items-center gap-3 px-4 py-2 pl-12 text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors"
                active-class="text-white bg-slate-700"
              >
                Subject Attendance Report
              </RouterLink>
              <RouterLink
                @click="closeMobileSidebar"
                to="/teacher-attendance-report"
                class="flex items-center gap-3 px-4 py-2 pl-12 text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors"
                active-class="text-white bg-slate-700"
              >
                Teacher Attendance Report
              </RouterLink>
              <RouterLink
                @click="closeMobileSidebar"
                to="/monthly-summary"
                class="flex items-center gap-3 px-4 py-2 pl-12 text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors"
                active-class="text-white bg-slate-700"
              >
                Monthly Summary
              </RouterLink>
            </div>
          </div>

          <!-- Settings Management -->
          <!-- <div>
            <button
              @click="toggleSubmenu('settingManagement')"
              class="w-full flex items-center justify-between px-4 py-3 text-slate-300 transition-all nav-link"
              :class="{ 'active-nav': settingManagementActive }"
            >
              <div class="flex items-center gap-3">
                <span class="text-base w-5">
                  <i class="fa-solid fa-bars-progress"></i>
                </span>
                <span class="text-m">Settings Management</span>
              </div>
              <i
                class="fa-solid fa-chevron-down text-xs transition-transform"
                :class="{ 'rotate-180': openSubmenu === 'settingManagement' }"
              ></i>
            </button>

            <div
              v-show="openSubmenu === 'settingManagement'"
              class="bg-slate-800 py-1"
            >
              <RouterLink
                @click="closeMobileSidebar"
                to="/edit-profile"
                class="flex items-center gap-3 px-4 py-2 pl-12 text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors"
                active-class="text-white bg-slate-700"
              >
                Profile (change password, avatar)
              </RouterLink>
              <RouterLink
                @click="closeMobileSidebar"
                to="/roles-permissions"
                class="flex items-center gap-3 px-4 py-2 pl-12 text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors"
                active-class="text-white bg-slate-700"
              >
                Roles & Permissions (if you implement RBAC)
              </RouterLink>
              <RouterLink
                @click="closeMobileSidebar"
                to="/system-settings"
                class="flex items-center gap-3 px-4 py-2 pl-12 text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors"
                active-class="text-white bg-slate-700"
              >
                System Settings (logo, school name, academic year)
              </RouterLink>
              <RouterLink
                @click="closeMobileSidebar"
                to="/audit-log"
                class="flex items-center gap-3 px-4 py-2 pl-12 text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors"
                active-class="text-white bg-slate-700"
              >
                Audit Log / Activity Log (optional)
              </RouterLink>
            </div>
          </div> -->
          <RouterLink
            @click="closeMobileSidebar"
            class="flex items-center gap-3 px-4 py-3 text-slate-300 transition-all nav-link"
            active-class="active-nav"
            to="/school"
          >
            <span class="text-base w-5">
              <i class="fa-solid fa-gear"></i>
            </span>
            <span class="text-m">Setting</span>
          </RouterLink>
        </nav>

        <!-- ================= TEACHER SIDEBAR ================= -->
        <nav
          v-else-if="isTeacher"
          class="space-y-1 pt-4 flex-1 overflow-y-auto"
        >
          <RouterLink
            @click="closeMobileSidebar"
            class="flex items-center gap-3 px-4 py-3 text-slate-300 transition-all nav-link"
            active-class="active-nav"
            to="/"
          >
            <span class="text-base w-5">
              <i class="fa-solid fa-chart-area"></i>
            </span>
            <span class="text-m">Dashboard</span>
          </RouterLink>
          <RouterLink
            @click="closeMobileSidebar"
            class="flex items-center gap-3 px-4 py-3 text-slate-300 transition-all nav-link"
            active-class="active-nav"
            to="/teacher-class-list"
          >
            <span class="text-base w-5">
              <i class="fa-solid fa-landmark"></i>
            </span>
            <span class="text-m">My Classes</span>
          </RouterLink>
          <!-- Attendance Management -->
          <div>
            <button
              @click="toggleSubmenu('attendanceTeacher')"
              class="w-full flex items-center justify-between px-4 py-3 text-slate-300 transition-all nav-link"
              :class="{ 'active-nav': attendanceTeacherActive }"
            >
              <div class="flex items-center gap-3">
                <span class="text-base w-5">
                  <i class="fa-solid fa-bars-progress"></i>
                </span>
                <span class="text-m">Attendance</span>
              </div>
              <i
                class="fa-solid fa-chevron-down text-xs transition-transform"
                :class="{ 'rotate-180': openSubmenu === 'attendanceTeacher' }"
              ></i>
            </button>

            <div
              v-show="openSubmenu === 'attendanceTeacher'"
              class="bg-slate-800 py-1"
            >
              <RouterLink
                @click="closeMobileSidebar"
                to="teacher-take-attendance"
                class="flex items-center gap-3 px-4 py-2 pl-12 text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors"
                active-class="text-white bg-slate-700"
              >
                Take Attendance
              </RouterLink>
              <RouterLink
                @click="closeMobileSidebar"
                to="teacher-teacher-attendance"
                class="flex items-center gap-3 px-4 py-2 pl-12 text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors"
                active-class="text-white bg-slate-700"
              >
                Teacher Attendance
              </RouterLink>
            </div>
          </div>

          <!-- Schedule Management -->
          <div>
            <button
              @click="toggleSubmenu('scheduleTeacher')"
              class="w-full flex items-center justify-between px-4 py-3 text-slate-300 transition-all nav-link"
              :class="{ 'active-nav': scheduleTeacherActive }"
            >
              <div class="flex items-center gap-3">
                <span class="text-base w-5">
                  <i class="fa-solid fa-bars-progress"></i>
                </span>
                <span class="text-m">Schedule</span>
              </div>
              <i
                class="fa-solid fa-chevron-down text-xs transition-transform"
                :class="{ 'rotate-180': openSubmenu === 'scheduleTeacher' }"
              ></i>
            </button>

            <div
              v-show="openSubmenu === 'scheduleTeacher'"
              class="bg-slate-800 py-1"
            >
              <RouterLink
                @click="closeMobileSidebar"
                to="teacher-my-timetable"
                class="flex items-center gap-3 px-4 py-2 pl-12 text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors"
                active-class="text-white bg-slate-700"
              >
                My Timetable (weekly view)
              </RouterLink>
              <RouterLink
                @click="closeMobileSidebar"
                to="teacher-upcoming-sessions"
                class="flex items-center gap-3 px-4 py-2 pl-12 text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors"
                active-class="text-white bg-slate-700"
              >
                Upcoming Sessions
              </RouterLink>
            </div>
          </div>

          <!-- <RouterLink
            @click="closeMobileSidebar"
            class="flex items-center gap-3 px-4 py-3 text-slate-300 transition-all nav-link"
            active-class="active-nav"
            to="/attendance-reports"
          >
            <span class="text-base w-5">
              <i class="fa-solid fa-file-lines"></i>
            </span>
            <span class="text-m">Reports</span>
          </RouterLink> -->
        </nav>

        <!-- ================= STUDENT SIDEBAR ================= -->
        <nav
          v-else-if="isStudent"
          class="space-y-1 pt-4 flex-1 overflow-y-auto"
        >
          <RouterLink
            @click="closeMobileSidebar"
            class="flex items-center gap-3 px-4 py-3 text-slate-300 transition-all nav-link"
            active-class="active-nav"
            to="/student-dashboard-view"
          >
            <span class="text-base w-5">
              <i class="fa-solid fa-chart-area"></i>
            </span>
            <span class="text-m">Dashboard</span>
          </RouterLink>

          <RouterLink
            @click="closeMobileSidebar"
            class="flex items-center gap-3 px-4 py-3 text-slate-300 transition-all nav-link"
            active-class="active-nav"
            to="/student-my-attendance"
          >
            <span class="text-base w-5">
              <i class="fa-solid fa-clipboard-check"></i>
            </span>
            <span class="text-m">My Attendance</span>
          </RouterLink>

          <RouterLink
            @click="closeMobileSidebar"
            class="flex items-center gap-3 px-4 py-3 text-slate-300 transition-all nav-link"
            active-class="active-nav"
            to="/student-schedules-view"
          >
            <span class="text-base w-5">
              <i class="fa-solid fa-calendar-week"></i>
            </span>
            <span class="text-m">Schedules</span>
          </RouterLink>

          <RouterLink
            @click="closeMobileSidebar"
            class="flex items-center gap-3 px-4 py-3 text-slate-300 transition-all nav-link"
            active-class="active-nav"
            to="/student-pf"
          >
            <span class="text-base w-5">
              <i class="fa-solid fa-gears"></i>
            </span>
            <span class="text-m">Setting</span>
          </RouterLink>
        </nav>

        <!-- ================= FALLBACK (no role) ================= -->
        <nav v-else class="space-y-1 pt-4 flex-1 overflow-y-auto">
          <RouterLink
            @click="closeMobileSidebar"
            class="flex items-center gap-3 px-4 py-3 text-slate-300 transition-all nav-link"
            active-class="active-nav"
            to="/"
          >
            <span class="text-base w-5">
              <i class="fa-solid fa-chart-area"></i>
            </span>
            <span class="text-m">Dashboard</span>
          </RouterLink>
        </nav>

        <!-- Logout (shared) -->
        <div class="p-4">
          <button
            @click="logout"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 border border-slate-700 transition-colors"
          >
            <span class="text-base w-5">
              <i class="fa-solid fa-arrow-right-from-bracket"></i>
            </span>
            <span class="text-m">Log Out</span>
          </button>
        </div>
      </aside>

      <!-- Main Content: ONLY this scrolls -->
      <main class="flex-1 bg-slate-50 overflow-y-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import api, { IMAGE_URL } from './services/api';

const route = useRoute();

const user = ref(null);
const faculties = ref(null);
const mobileMenuOpen = ref(false);

const loadUser = () => {
  const raw = localStorage.getItem("sams_user");
  user.value = raw ? JSON.parse(raw) : null;
  LoadFa();
};

const LoadFa = async () => {
  try {
    const { data } = await api.get('/schools/1');
    faculties.value = data;
    console.log(faculties);
    
  } catch (err) {
    error.value = 'Failed to load classes';
  }
};

const imageUrl = (filename) => {
  if (!filename) return "";
  return `${IMAGE_URL}/uploads/users/${filename}`;
};
const imageFacultiesUrl = (filename) => {
  if (!filename) return "";
  return `${IMAGE_URL}/uploads/schools/${filename}`;
};

onMounted(() => {
  loadUser();
});

// role helpers
const role = computed(() => user.value?.role || null);
const isTopAdmin = computed(() => role.value === "top_admin");
const isAdmin = computed(() => role.value === "admin");
const isTeacher = computed(() => role.value === "teacher");
const isStudent = computed(() => role.value === "student");

const openSubmenu = ref(null);

const toggleSubmenu = (menu) => {
  openSubmenu.value = openSubmenu.value === menu ? null : menu;
};

const toggleMobileSidebar = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const closeMobileSidebar = () => {
  mobileMenuOpen.value = false;
};

// admin
const academicManagementActive = computed(() => {
  return (
    route.path === "/school-years" ||
    route.path === "/faculties" ||
    route.path === "/departments" ||
    route.path === "/majors" ||
    route.path === "/rooms" ||
    route.path === "/subjects"
  );
});

const classesAndCurriculumActive = computed(() => {
  return (
    route.path === "/classes" ||
    route.path === "/class-subjects" ||
    route.path === "/schedules"
  );
});

const userManagementActive = computed(() => {
  return (
    route.path === "/users" ||
    route.path === "/teachers" ||
    route.path === "/students" ||
    route.path === "/teacher-class"
  );
});

const attendanceManagementActive = computed(() => {
  return (
    route.path === "/attendance-sessions" ||
    route.path === "/take-attendance" ||
    route.path === "/teacher-attendance" ||
    route.path === "/fix-attendance"
  );
});

const reportManagementActive = computed(() => {
  return (
    route.path === "/student-attendance-report" ||
    route.path === "/class-attendance-report" ||
    route.path === "/subject-attendance-report" ||
    route.path === "/teacher-attendance-report" ||
    route.path === "/monthly-summary"
  );
});

const settingManagementActive = computed(() => {
  return (
    route.path === "/edit-profile" ||
    route.path === "/roles-permissions" ||
    route.path === "/system-settings" ||
    route.path === "/teacher-attendance-report" ||
    route.path === "/audit-log"
  );
});

// teacher
const myClassesTeacherActive = computed(() => {
  return (
    route.path === "/teacher-class-list"
  );
});
const attendanceTeacherActive = computed(() => {
  return (
    route.path === "/teacher-take-attendance" ||
    route.path === "/teacher-teacher-attendance"
  );
});
const scheduleTeacherActive = computed(() => {
  return (
    route.path === "/teacher-my-timetable" ||
    route.path === "/teacher-upcoming-sessions"
  );
});

const logout = () => {
  localStorage.removeItem("sams_token");
  localStorage.removeItem("sams_user");
  window.location.href = "/login";
};
</script>

<style scoped>
.nav-link:hover {
  background-color: white !important;
  color: #0f172a !important;
  border-top-right-radius: 8999px;
  border-bottom-right-radius: 8999px;
  font-weight: 500;
  transition: 1s;
}

.active-nav {
  background-color: white !important;
  color: #0f172a !important;
  border-top-right-radius: 9999px;
  border-bottom-right-radius: 9999px;
  font-weight: 500;
}
</style>
