<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 uppercase">Students Management</h2>
      <div class="text-sm text-gray-600">
        Total: <span class="font-semibold">{{ totalStudents }}</span> students
      </div>
    </div>

    <!-- Filters and Actions Bar -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-2">Filter by Class ID</label>
          <div class="flex gap-2">
            <input 
              v-model.number="filterClassId" 
              type="number" 
              placeholder="Enter class ID"
              class="flex-1 border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent" 
            />
            <button
              class="bg-green-600 text-white px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
              @click="fetchStudentsByClass"
            >
              <i class="fa-solid fa-filter"></i>
              Filter
            </button>
            <button
              class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm"
              @click="fetchAllStudents"
            >
              <i class="fa-solid fa-rotate"></i>
              All
            </button>
          </div>
        </div>
        
        <button 
          class="bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-500 transition-colors flex items-center gap-2 shadow-sm" 
          @click="openForm()"
        >
          <i class="fa-solid fa-plus"></i>
          New Student
        </button>
      </div>
    </div>
 
    <!-- Table Container -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-100 border-b border-gray-200">
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">NO</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Image</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Name</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Email</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">STUDENT ID</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Class</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="(s,index) in paginatedStudents"
              :key="s.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-3 text-gray-900">{{ index + 1 }}</td>

              <!-- image column -->
              <td class="px-6 py-3">
                <img
                  v-if="s.image"
                  :src="imageUrl(s.image)"
                  class="w-10 h-10 rounded-full object-cover border border-gray-200"
                  alt="Student image"
                />
              </td>

              <td class="px-6 py-3 text-gray-900 font-medium">{{ s.user_name }}</td>
              <td class="px-6 py-3 text-gray-600">{{ s.email }}</td>
              <td class="px-6 py-3 text-gray-900">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                  {{ s.student_code }}
                </span>
              </td>
              <td class="px-6 py-3 text-gray-900">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Class {{ s.class_id }}
                </span>
              </td>
              <td class="px-6 py-3 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button 
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors font-medium" 
                    @click="openForm(s)"
                  >
                    <i class="fa-solid fa-pen-to-square"></i>
                    Edit
                  </button>
                  <button 
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium" 
                    @click="remove(s.id)"
                  >
                    <i class="fa-solid fa-trash"></i>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!students || students.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                <i class="fa-solid fa-inbox text-3xl mb-2 block text-gray-300"></i>
                No students found
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="students && students.length > 0" class="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="text-sm text-gray-600">
            Showing 
            <span class="font-medium">{{ startItem }}</span>
            to 
            <span class="font-medium">{{ endItem }}</span>
            of 
            <span class="font-medium">{{ totalStudents }}</span>
            results
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
                      ? 'bg-slate-900 text-white'
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
              class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
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

    <!-- Modal -->
    <div v-if="showForm" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ form.id ? 'Edit Student' : 'New Student' }}
          </h3>
        </div>
        
        <form @submit.prevent="save" class="px-6 py-4">
          <div class="space-y-4">
            <div v-if="!form.id">
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
              <input 
                v-model="form.name" 
                class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent" 
                placeholder="Enter student username for login."
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
              <input 
                v-model="form.first_name" 
                class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent" 
                placeholder="Enter student First name."
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
              <input 
                v-model="form.last_name" 
                class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent" 
                placeholder="Enter student last name."
                required
              />
            </div>
            
            <div v-if="!form.id">
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input 
                v-model="form.email" 
                type="email" 
                class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent" 
                placeholder="student@example.com"
                required
              />
            </div>
            
            <div v-if="!form.id">
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Password
                <span v-if="form.id" class="text-xs text-gray-500 font-normal ml-1">(leave blank to keep current)</span>
              </label>
              <input 
                v-model="form.password" 
                type="password"
                class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent" 
                placeholder="Enter password"
                :required="!form.id"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Student Code</label>
              <input 
                v-model="form.student_code" 
                class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent" 
                placeholder="Enter student code"
                required
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Class ID</label>
              <input 
                v-model.number="form.class_id" 
                type="number" 
                class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent" 
                placeholder="Enter class ID"
                required
              />
            </div>

            <!-- Image Upload -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Profile Image</label>
              <input 
                type="file" 
                @change="onFileChange" 
                accept="image/*"
                ref="fileInput"
                class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
              />
              
              <div v-if="previewUrl || form.image" class="mt-3">
                <p class="text-sm text-gray-600 mb-2">Preview:</p>
                <img
                  :src="previewUrl || imageUrl(form.image)"
                  alt="Student image preview"
                  class="w-32 h-32 rounded-lg object-cover border border-gray-200"
                />
              </div>
            </div>
          </div>

          <p v-if="error" class="text-red-600 text-sm mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <i class="fa-solid fa-circle-exclamation mr-1"></i>
            {{ error }}
          </p>

          <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button 
              type="button" 
              class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2" 
              @click="closeForm"
            >
              <i class="fa-solid fa-xmark"></i>
              Cancel
            </button>
            <button 
              type="submit" 
              class="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm"
            >
              <i class="fa-solid fa-floppy-disk"></i>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api, { IMAGE_URL } from '../services/api';

const students = ref([]);
const filterClassId = ref(null);
const showForm = ref(false);
const error = ref('');

// image state
const selectedImageFile = ref(null);
const previewUrl = ref(null);
const fileInput = ref(null);

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);

const form = ref({
  id: null,
  name: '',
  email: '',
  student_code: '',
  class_id: null,
  image: null, // existing filename when editing
});

// Computed properties for pagination
const totalStudents = computed(() => students.value?.length || 0);
const totalPages = computed(() => Math.ceil(totalStudents.value / itemsPerPage.value));

const imageUrl = (filename) => {
  if (!filename) return '';
  // adjust path if needed (e.g. /uploads/students)
  return `${IMAGE_URL}/uploads/students/${filename}`;
};

const onFileChange = (event) => {
  const file = event.target.files[0];
  if (!file) {
    selectedImageFile.value = null;
    previewUrl.value = null;
    return;
  }
  selectedImageFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
};

const startItem = computed(() => {
  if (totalStudents.value === 0) return 0;
  return (currentPage.value - 1) * itemsPerPage.value + 1;
});

const endItem = computed(() => {
  const end = currentPage.value * itemsPerPage.value;
  return end > totalStudents.value ? totalStudents.value : end;
});

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return students.value.slice(start, end);
});

const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value;
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    
    if (current > 3) {
      pages.push('...');
    }
    
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }
    
    if (current < total - 2) {
      pages.push('...');
    }
    
    pages.push(total);
  }
  
  return pages;
});

// Pagination methods
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const changeItemsPerPage = () => {
  currentPage.value = 1;
};

// API methods
const fetchAllStudents = async () => {
  try {
    const { data } = await api.get('/students');
    students.value = data;
    
    currentPage.value = 1;
  } catch (err) {
    console.error('Failed to fetch students:', err);
    error.value = 'Failed to load students';
  }
};

const fetchStudentsByClass = async () => {
  if (!filterClassId.value) return fetchAllStudents();
  try {
    const { data } = await api.get(`/students/by-class/${filterClassId.value}`);
    students.value = data;
    currentPage.value = 1;
  } catch (err) {
    console.error('Failed to filter students:', err);
    error.value = 'Failed to filter students';
  }
};

const openForm = (s = null) => {
  error.value = '';
  selectedImageFile.value = null;
  previewUrl.value = null;
    console.log(s);

  if (s) {
    form.value = {
      id: s.id,
      name: s.user_name,
      first_name: s.first_name,
      last_name: s.last_name,
      password: '',
      email: s.email,
      student_code: s.student_code,
      class_id: s.class_id,
      image: s.image || null,
    };
    if (s.image) {
      previewUrl.value = imageUrl(s.image);
    }
  } else {
    form.value = {
      id: null,
      name: '',
      email: '',
      student_code: '',
      class_id: null,
      image: null,
    };
  }

  if (fileInput.value) {
    fileInput.value.value = '';
  }

  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  error.value = '';
  selectedImageFile.value = null;
  previewUrl.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const save = async () => {
  try {
    error.value = '';

    const formData = new FormData();
    formData.append('name', form.value.name);
    formData.append('first_name', form.value.first_name);
    formData.append('last_name', form.value.last_name);
    formData.append('email', form.value.email);
    formData.append('student_code', form.value.student_code);
    formData.append('class_id', form.value.class_id);
    console.log(formData);

    // Handle password
    if (!form.value.id || form.value.password) {
      formData.append('password', form.value.password);
    }
    // send image
    if (selectedImageFile.value) {
      formData.append('image', selectedImageFile.value);
    } else if (form.value.image) {
      // keep old one (backend should handle string vs file)
      formData.append('image', form.value.image);
    }

    if (form.value.id) {
      await api.put(`/students/${form.value.id}`, formData);
    } else {
      await api.post('/students', formData);
    }

    await fetchAllStudents();
    closeForm();
  } catch (err) {
    console.error('Failed to save student:', err);
    error.value = err.response?.data?.message || 'Failed to save';
  }
};

const remove = async (id) => {
  if (!confirm('Delete this student?')) return;
  try {
    await api.delete(`/students/${id}`);
    if (paginatedStudents.value.length === 1 && currentPage.value > 1) {
      currentPage.value--;
    }
    await fetchAllStudents();
  } catch (err) {
    console.error('Failed to delete student:', err);
    error.value = 'Failed to delete student';
  }
};

onMounted(fetchAllStudents);
</script>
