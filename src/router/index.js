// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";

// Views
import LoginView from "../views/LoginView.vue";
import DashboardView from "../views/DashboardView.vue";
import ClassesView from "../views/ClassesView.vue";
import StudentsView from "../views/StudentsView.vue";
import TeachersView from "../views/TeachersView.vue";
import AttendanceView from "../views/AttendanceView.vue";
import RoomsView from "../views/RoomsView.vue";
import SubjectView from "../views/SubjectView.vue";
import SchedulesView from "../views/SchedulesView.vue";
import TeacherClassesView from "../views/TeacherClassesView.vue";
import MajorView from "../views/MajorView.vue";
import TermView from "../views/TermView.vue";
import SchoolYearsView from "../views/SchoolYearsView.vue";
import UsersView from "../views/UsersView.vue";
import AttendanceReportsView from "../views/AttendanceReportsView.vue";
import ClassSubjectsManagementView from "../views/ClassSubjectsManagementView.vue";
import FacultiesManagementView from "../views/FacultiesManagementView.vue";
import DepartmentsManagementView from "../views/DepartmentsManagementView.vue";
import AttendanceSessionsManagementView from "../views/AttendanceSessionsManagementView.vue";
import TakeAttendanceView from "../views/TakeAttendanceView.vue";
import TeacherAttendanceView from "../views/TeacherAttendanceView.vue";
import FixAttendanceView from "../views/FixAttendanceView.vue";
import StudentAttendanceReportView from "../views/StudentAttendanceReportView.vue";
import ClassAttendanceReportView from "../views/ClassAttendanceReportView.vue";
import SubjectAttendanceReportView from "../views/SubjectAttendanceReportView.vue";
import TeacherAttendanceReportView from "../views/TeacherAttendanceReportView.vue";
import MonthlySummaryView from "../views/MonthlySummaryView.vue";
import SchoolView from "../views/SchoolView.vue";
import AttendanceSessionsRequestView from "../views/AttendanceSessionsRequestView.vue";

// Student Views
import StudentsSchedulesView from "../views/students/StudentSchedulesView.vue";
import StudentAttendanceView from "../views/students/StudentAttendanceView.vue";
import StudentAttendanceDashboardView from "../views/students/StudentAttendanceDashboardView.vue";

// Teacher Views
import TeacherClassListView from "../views/teachers/TeacherClassListView.vue";
import TeacherTakeAttendanceView from "../views/teachers/TeacherTakeAttendanceView.vue";
import TeacherTeacherAttendanceView from "../views/teachers/TeacherTeacherAttendance.vue";
import TeacherMyTimetableView from "../views/teachers/TeacherMyTimetable.vue";
import TeacherUpcomingSessionsView from "../views/teachers/TeacherUpcomingSessions.vue";

const routes = [
  // General Routes
  { path: "/", name: "Dashboard", component: DashboardView, meta: { requiresAuth: true, roles: ["admin", "teacher", "student"] } },
  { path: "/login", name: "Login", component: LoginView, meta: { hideSidebar: true } },

  // Admin & Teacher Routes
  { path: "/classes", name: "Classes", component: ClassesView, meta: { requiresAuth: true, roles: ["admin", "teacher"] } },
  { path: "/students", name: "Students", component: StudentsView, meta: { requiresAuth: true, roles: ["admin", "teacher"] } },
  { path: "/teachers", name: "Teachers", component: TeachersView, meta: { requiresAuth: true, roles: ["admin"] } },
  { path: "/attendances", name: "Attendance", component: AttendanceView, meta: { requiresAuth: true, roles: ["admin", "teacher"] } },
  { path: "/rooms", name: "Rooms", component: RoomsView, meta: { requiresAuth: true, roles: ["admin"] } },
  { path: "/subjects", name: "Subjects", component: SubjectView, meta: { requiresAuth: true, roles: ["admin"] } },
  { path: "/schedules", name: "Schedules", component: SchedulesView, meta: { requiresAuth: true, roles: ["admin", "teacher"] } },
  { path: "/teacher-class", name: "TeacherClass", component: TeacherClassesView, meta: { requiresAuth: true, roles: ["admin", "teacher"] } },
  { path: "/majors", name: "Majors", component: MajorView, meta: { requiresAuth: true, roles: ["admin"] } },
  { path: "/terms", name: "Terms", component: TermView, meta: { requiresAuth: true, roles: ["admin"] } },
  { path: "/school-years", name: "SchoolYears", component: SchoolYearsView, meta: { requiresAuth: true, roles: ["admin"] } },
  { path: "/users", name: "Users", component: UsersView, meta: { requiresAuth: true, roles: ["admin"] } },
  { path: "/attendance-reports", name: "AttendanceReports", component: AttendanceReportsView, meta: { requiresAuth: true, roles: ["admin", "teacher"] } },
  { path: "/class-subjects", name: "ClassSubjectsManagement", component: ClassSubjectsManagementView, meta: { requiresAuth: true, roles: ["admin", "teacher"] } },
  { path: "/faculties", name: "FacultiesManagement", component: FacultiesManagementView, meta: { requiresAuth: true, roles: ["admin", "teacher"] } },
  { path: "/departments", name: "DepartmentsManagement", component: DepartmentsManagementView, meta: { requiresAuth: true, roles: ["admin", "teacher"] } },
  { path: "/attendance-sessions", name: "AttendanceSessionsManagement", component: AttendanceSessionsManagementView, meta: { requiresAuth: true, roles: ["admin", "teacher"] } },
  { path: "/take-attendance", name: "TakeAttendance", component: TakeAttendanceView, meta: { requiresAuth: true, roles: ["admin", "teacher"] } },
  { path: "/teacher-attendance", name: "TeacherAttendance", component: TeacherAttendanceView, meta: { requiresAuth: true, roles: ["admin", "teacher"] } },
  { path: "/fix-attendance", name: "FixAttendance", component: FixAttendanceView, meta: { requiresAuth: true, roles: ["admin", "teacher"] } },

  // Attendance Reports
  { path: "/student-attendance-report", name: "StudentAttendanceReport", component: StudentAttendanceReportView, meta: { requiresAuth: true, roles: ["admin", "teacher"] } },
  { path: "/class-attendance-report", name: "ClassAttendanceReport", component: ClassAttendanceReportView, meta: { requiresAuth: true, roles: ["admin", "teacher"] } },
  { path: "/subject-attendance-report", name: "SubjectAttendanceReport", component: SubjectAttendanceReportView, meta: { requiresAuth: true, roles: ["admin", "teacher"] } },
  { path: "/teacher-attendance-report", name: "TeacherAttendanceReport", component: TeacherAttendanceReportView, meta: { requiresAuth: true, roles: ["admin", "teacher"] } },
  
  // Students Routes
  { path: "/student-dashboard-view", name: "StudentAttendanceDashboardView", component: StudentAttendanceDashboardView, meta: { requiresAuth: true, roles: ["student"] } },
  { path: "/student-schedules-view", name: "StudentSchedulesView", component: StudentsSchedulesView, meta: { requiresAuth: true, roles: ["student"] } },
  { path: "/student-my-attendance", name: "StudentAttendanceView", component: StudentAttendanceView, meta: { requiresAuth: true, roles: ["student"] } },

  // Teachers Routes
  { path: "/teacher-class-list", name: "TeacherClassList", component: TeacherClassListView, meta: { requiresAuth: true, roles: ["teacher"] } },
  { path: "/teacher-take-attendance", name: "TeacherTakeAttendance", component: TeacherTakeAttendanceView, meta: { requiresAuth: true, roles: ["teacher"] } },
  { path: "/teacher-teacher-attendance", name: "TeacherTeacherAttendance", component: TeacherTeacherAttendanceView, meta: { requiresAuth: true, roles: ["teacher"] } },
  { path: "/teacher-my-timetable", name: "TeacherMyTimetable", component: TeacherMyTimetableView, meta: { requiresAuth: true, roles: ["teacher"] } },
  { path: "/teacher-upcoming-sessions", name: "TeacherUpcomingSessions", component: TeacherUpcomingSessionsView, meta: { requiresAuth: true, roles: ["teacher"] } },

  // General Routes for Admin and Teacher
  { path: "/school", name: "School", component: SchoolView, meta: { requiresAuth: true, roles: ["admin", "teacher"] } },
  { path: "/attendance-requested", name: "AttendanceSessionsRequest", component: AttendanceSessionsRequestView, meta: { requiresAuth: true, roles: ["admin", "teacher"] } },

  // Monthly Summary
  { path: "/monthly-summary", name: "MonthlySummary", component: MonthlySummaryView, meta: { requiresAuth: true, roles: ["admin", "teacher"] } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

function getCurrentUser() {
  const json = localStorage.getItem("sams_user");
  if (!json) return null;

  try {
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("sams_token");
  const user = getCurrentUser();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const allowedRoles = to.matched
    .filter((record) => record.meta && record.meta.roles)
    .flatMap((record) => record.meta.roles);

  // Handle route guard logic here
  if (requiresAuth && !token) return next({ name: "Login", query: { redirect: to.fullPath } });
  if (requiresAuth && allowedRoles.length > 0) {
    const role = user?.role;
    if (!role || !allowedRoles.includes(role)) return next({ name: "Dashboard" });
  }
  if (to.name === "Login" && token) return next({ name: "Dashboard" });

  next();
});

export default router;
