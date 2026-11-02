<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 uppercase">Faculties Management</h2>
      <div class="text-sm text-gray-600">
        Total: <span class="font-semibold">{{ totalItems }}</span> faculties
      </div>
    </div>

    <!-- Actions -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6 flex justify-between items-end gap-4">
      <div class="flex-1">
        <label class="block text-sm font-medium mb-2">Search</label>
        <input
          v-model="search"
          class="w-full border px-3 py-2 rounded-lg text-sm"
          placeholder="Search by code or name"
        />
      </div>

      <button
        class="bg-slate-600 text-white px-4 py-2 rounded-lg text-sm"
        @click="openForm()"
      >
        <i class="fa fa-plus mr-1"></i> New Faculty
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-slate-100">
          <tr>
            <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">NO</th>
            <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Image</th>
            <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Code</th>
            <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Name</th>
            <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(row, i) in paginatedItems"
            :key="row.id"
            class="border-t hover:bg-gray-50"
          >
            <td class="px-4 py-2">{{ i + 1 }}</td>

            <td class="px-4 py-2">
              <img
                v-if="row.image"
                :src="imageUrl(row.image)"
                class="w-10 h-10 rounded-full object-cover border"
              />
              <div
                v-else
                class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"
              >
                <i class="fa fa-image text-gray-400"></i>
              </div>
            </td>

            <td class="px-4 py-2">
              <span class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                {{ row.code }}
              </span>
            </td>

            <td class="px-4 py-2 font-medium">{{ row.name }}</td>

            <td class="px-4 py-2 text-center">
              <button class="inline-flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors font-medium" @click="openForm(row)">
                <i class="fa fa-edit"></i>
                Edit
              </button>
              <button class="inline-flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium" @click="removeRow(row.id)">
                <i class="fa fa-trash"></i>
                Delete
              </button>
            </td>
          </tr>

          <tr v-if="paginatedItems.length === 0">
            <td colspan="5" class="py-10 text-center text-gray-400">
              No faculties found
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div
      v-if="showForm"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl w-full max-w-md shadow-xl">
        <div class="px-6 py-4 border-b font-semibold">
          {{ form.id ? 'Edit Faculty' : 'New Faculty' }}
        </div>

        <form @submit.prevent="save" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Code</label>
            <input v-model="form.code" required class="w-full border px-3 py-2 rounded-lg text-sm" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Name</label>
            <input v-model="form.name" required class="w-full border px-3 py-2 rounded-lg text-sm" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Image</label>
            <input type="file" accept="image/*" @change="onImageChange" />
            <img
              v-if="imagePreview"
              :src="imagePreview"
              class="mt-2 w-24 h-24 rounded-lg object-cover border"
            />
          </div>

          <p v-if="modalError" class="text-red-600 text-sm">{{ modalError }}</p>

          <div class="flex justify-end gap-3 pt-4 border-t">
            <button type="button" @click="closeForm" class="px-4 py-2 border rounded-lg">
              Cancel
            </button>
            <button type="submit" class="px-4 py-2 bg-slate-900 text-white rounded-lg">
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

const API_BASE = import.meta.env.VITE_API_URL || '';

const items = ref([]);
const search = ref('');
const showForm = ref(false);
const modalError = ref('');

const imageFile = ref(null);
const imagePreview = ref(null);

const form = ref({
  id: null,
  code: '',
  name: '',
  image: null
});

const imageUrl = (img) => `${IMAGE_URL}/uploads/faculties/${img}`;

const filteredItems = computed(() => {
  const q = search.value.toLowerCase();
  return items.value.filter(
    i => i.code.toLowerCase().includes(q) || i.name.toLowerCase().includes(q)
  );
});

const totalItems = computed(() => filteredItems.value.length);
const paginatedItems = computed(() => filteredItems.value);

const fetchAll = async () => {
  const { data } = await api.get('/faculties');
  items.value = data;
};

const openForm = (row = null) => {
  modalError.value = '';
  imageFile.value = null;

  if (row) {
    form.value = { ...row };
    imagePreview.value = row.image ? imageUrl(row.image) : null;
  } else {
    form.value = { id: null, code: '', name: '', image: null };
    imagePreview.value = null;
  }

  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  modalError.value = '';
  imageFile.value = null;
  imagePreview.value = null;
};

const onImageChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  imageFile.value = file;
  imagePreview.value = URL.createObjectURL(file);
};

const save = async () => {
  modalError.value = '';

  try {
    const fd = new FormData();
    fd.append('code', form.value.code);
    fd.append('name', form.value.name);
    if (imageFile.value) fd.append('image', imageFile.value);

    if (form.value.id) {
      await api.put(`/faculties/${form.value.id}`, fd);
    } else {
      await api.post('/faculties', fd);
    }

    await fetchAll();
    closeForm();
  } catch (err) {
    modalError.value = err.response?.data?.message || 'Save failed';
  }
};

const removeRow = async (id) => {
  if (!confirm('Delete this faculty?')) return;
  await api.delete(`/faculties/${id}`);
  await fetchAll();
};

onMounted(fetchAll);
</script>
