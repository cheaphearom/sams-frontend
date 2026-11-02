<template>
  <div 
    v-if="show" 
    class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
  >
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all max-h-[90vh] overflow-y-auto">
      <div class="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ isEdit ? 'Edit User' : 'New User' }}
        </h3>
      </div>
      
      <form @submit.prevent="onSubmit" class="px-6 py-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
            <input 
              v-model="localForm.name" 
              class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent" 
              placeholder="Enter full name"
              required
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input 
              v-model="localForm.email" 
              type="email"
              :disabled="isEdit"
              class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500" 
              placeholder="user@example.com"
              required
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
            <select 
              v-model="localForm.role"
              class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              required
            >
              <option value="">Select role</option>
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Password
              <span v-if="isEdit" class="text-xs text-gray-500 font-normal ml-1">(leave blank to keep current)</span>
            </label>
            <input 
              v-model="localForm.password" 
              type="password"
              class="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent" 
              placeholder="Enter password"
              :required="!isEdit"
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
            
            <div v-if="previewUrl || localForm.image" class="mt-3">
              <p class="text-sm text-gray-600 mb-2">Preview:</p>
              <img
                :src="previewUrl || imageUrl(localForm.image)"
                alt="User image preview"
                class="w-32 h-32 rounded-lg object-cover border border-gray-200"
              />
            </div>
          </div>

          <div class="md:col-span-2 flex items-center gap-2">
            <input 
              v-model="localForm.is_active" 
              type="checkbox"
              id="is_active"
              class="w-4 h-4 text-slate-900 border-gray-300 rounded focus:ring-slate-500"
            />
            <label for="is_active" class="text-sm font-medium text-gray-700">Active User</label>
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
            @click="onClose"
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
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { IMAGE_URL } from '../../services/api';

const props = defineProps({
  show: { type: Boolean, default: false },
  user: { type: Object, default: null },      // user to edit or null
  error: { type: String, default: '' }
});

const emit = defineEmits(['close', 'save']);

const fileInput = ref(null);
const previewUrl = ref(null);
const selectedImageFile = ref(null);

const localForm = ref({
  id: null,
  name: '',
  email: '',
  role: '',
  password: '',
  is_active: true,
  image: null
});

const isEdit = computed(() => !!localForm.value.id);

const imageUrl = (filename) => {
  if (!filename) return '';
  return `${IMAGE_URL}/uploads/users/${filename}`;
};

// sync props.user → localForm when opening
watch(
  () => props.user,
  (val) => {
    if (val) {
      localForm.value = {
        id: val.id,
        name: val.name,
        email: val.email,
        role: val.role,
        password: '',
        is_active: val.is_active ?? true,
        image: val.image || null
      };
    } else {
      localForm.value = {
        id: null,
        name: '',
        email: '',
        role: '',
        password: '',
        is_active: true,
        image: null
      };
    }
    selectedImageFile.value = null;
    previewUrl.value = null;
    if (fileInput.value) fileInput.value.value = '';
  },
  { immediate: true }
);

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

const onClose = () => {
  emit('close');
};

const onSubmit = () => {
  // emit the form data + selected file back to parent
  emit('save', {
    form: { ...localForm.value },
    imageFile: selectedImageFile.value
  });
};
</script>
