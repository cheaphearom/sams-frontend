<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 uppercase">Schools Management</h2>
      <div class="text-sm text-gray-600">
        Total: <span class="font-semibold">{{ totalItems }}</span> schools
      </div>
    </div>

    <!-- Search + New -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6 flex justify-between items-end gap-4">
      <div class="flex-1">
        <label class="block text-sm font-medium mb-2">Search</label>
        <input
          v-model.trim="search"
          class="w-full border px-3 py-2 rounded-lg text-sm"
          placeholder="Search by name"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-slate-100">
          <tr>
            <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">NO</th>
            <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Image</th>
            <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Name</th>
            <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Lat</th>
            <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Lng</th>
            <th class="px-6 py-3 text-left font-semibold text-gray-700 uppercase">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(row, i) in paginatedItems" :key="row.id" class="border-t hover:bg-gray-50">
            <td class="px-4 py-2">{{ i + 1 }}</td>

            <td class="px-4 py-2">
              <img
                v-if="row.image"
                :src="imageUrl(row.image)"
                class="w-10 h-10 rounded-full object-cover border"
              />
              <div v-else class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <i class="fa fa-image text-gray-400"></i>
              </div>
            </td>

            <td class="px-4 py-2 font-medium">{{ row.name }}</td>

            <td class="px-4 py-2 text-gray-700">
              {{ row.latitude ?? '-' }}
            </td>

            <td class="px-4 py-2 text-gray-700">
              {{ row.longitude ?? '-' }}
            </td>

            <td class="px-4 py-2 text-center whitespace-nowrap">
              <button
                class="inline-flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-md font-medium"
                @click="openForm(row)"
              >
                <i class="fa fa-edit"></i>
                Edit
              </button>

              <button
                class="inline-flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md font-medium"
                @click="askDelete(row)"
              >
                <i class="fa fa-trash"></i>
                Delete
              </button>
            </td>
          </tr>

          <tr v-if="paginatedItems.length === 0">
            <td colspan="6" class="py-10 text-center text-gray-400">
              No schools found
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Form Modal -->
    <div v-if="showForm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl w-full max-w-md shadow-xl">
        <div class="px-6 py-4 border-b font-semibold">
          {{ form.id ? 'Edit School' : 'New School' }}
        </div>

        <form @submit.prevent="save" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Name</label>
            <input v-model.trim="form.name" required class="w-full border px-3 py-2 rounded-lg text-sm" />
          </div>

          <!-- Lat / Lng -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Latitude</label>
              <input
                v-model.number="form.latitude"
                type="number"
                step="0.0000001"
                placeholder="11.5563732"
                class="w-full border px-3 py-2 rounded-lg text-sm"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Longitude</label>
              <input
                v-model.number="form.longitude"
                type="number"
                step="0.0000001"
                placeholder="104.9282099"
                class="w-full border px-3 py-2 rounded-lg text-sm"
              />
            </div>
          </div>

          <!-- Map buttons -->
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="px-3 py-2 rounded-lg text-sm font-semibold border bg-white hover:bg-gray-50"
              @click="openMapPicker"
            >
              <i class="fa-solid fa-map-location-dot mr-2"></i>
              Pick from map
            </button>

            <button
              type="button"
              class="px-3 py-2 rounded-lg text-sm font-semibold border bg-white hover:bg-gray-50"
              @click="useMyLocation"
            >
              <i class="fa-solid fa-location-crosshairs mr-2"></i>
              My location
            </button>

            <button
              type="button"
              class="px-3 py-2 rounded-lg text-sm font-semibold border bg-white hover:bg-gray-50"
              @click="openInGoogleMaps"
            >
              <i class="fa-solid fa-arrow-up-right-from-square mr-2"></i>
              Open map
            </button>
          </div>

          <!-- Image Edit -->
          <div>
            <label class="block text-sm font-medium mb-1">Image</label>

            <div class="flex items-center gap-3">
              <input ref="fileInput" type="file" accept="image/*" @change="onImageChange" />

              <button
                v-if="form.id && form.image"
                type="button"
                @click="toggleRemoveImage"
                class="px-3 py-1.5 rounded-lg text-xs font-semibold border"
                :class="removeImage ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
              >
                <i class="fa-solid mr-1" :class="removeImage ? 'fa-rotate-left' : 'fa-trash'"></i>
                {{ removeImage ? 'Undo remove' : 'Remove image' }}
              </button>
            </div>

            <!-- Preview -->
            <div class="mt-3 flex items-start gap-3">
              <div v-if="imagePreview" class="relative">
                <img :src="imagePreview" class="w-24 h-24 rounded-lg object-cover border" />

                <button
                  type="button"
                  class="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center hover:bg-gray-50"
                  title="Clear selected image"
                  @click="clearSelectedImage"
                >
                  <i class="fa-solid fa-xmark text-gray-600"></i>
                </button>
              </div>

              <div v-else class="text-sm text-gray-500">
                <div v-if="form.id && form.image && !removeImage">
                  Current image is kept (no change).
                </div>
                <div v-else-if="form.id && form.image && removeImage">
                  Image will be removed when you click Save.
                </div>
                <div v-else>
                  No image selected.
                </div>
              </div>
            </div>
          </div>

          <p v-if="modalError" class="text-red-600 text-sm">{{ modalError }}</p>

          <div class="flex justify-end gap-3 pt-4 border-t">
            <button type="button" @click="closeForm" class="px-4 py-2 border rounded-lg" :disabled="saving">
              Cancel
            </button>
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg" :disabled="saving">
              <i v-if="saving" class="fa-solid fa-spinner fa-spin mr-2"></i>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Map Picker Modal -->
    <div v-if="showMapPicker" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl w-full max-w-3xl shadow-xl">
        <div class="px-6 py-4 border-b font-semibold flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-map"></i>
            Pick Location
          </div>

          <button
            type="button"
            class="w-9 h-9 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-center"
            @click="closeMapPicker"
            title="Close"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="p-4">
          <div ref="mapEl" class="w-full h-[420px] rounded-lg border"></div>

          <div class="mt-3 text-sm text-gray-600 flex flex-wrap items-center justify-between gap-3">
            <div>
              Selected:
              <span class="font-semibold">{{ form.latitude ?? '-' }}</span>,
              <span class="font-semibold">{{ form.longitude ?? '-' }}</span>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                class="px-3 py-2 rounded-lg text-sm font-semibold border bg-white hover:bg-gray-50"
                @click="useMyLocation"
              >
                <i class="fa-solid fa-location-crosshairs mr-2"></i>
                My location
              </button>

              <button
                type="button"
                class="px-3 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700"
                @click="closeMapPicker"
              >
                <i class="fa-solid fa-check mr-2"></i>
                Use this
              </button>
            </div>
          </div>

          <p v-if="mapError" class="mt-2 text-sm text-red-600">{{ mapError }}</p>
        </div>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <div v-if="showDelete" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl w-full max-w-sm shadow-xl">
        <div class="px-6 py-4 border-b font-semibold flex items-center gap-2">
          <i class="fa-solid fa-triangle-exclamation text-amber-500"></i>
          Delete School
        </div>

        <div class="p-6 text-sm text-gray-600">
          Are you sure you want to delete:
          <div class="mt-2 font-semibold text-gray-800">
            {{ deleteTarget?.name || '-' }}
          </div>
        </div>

        <div class="px-6 py-4 border-t flex justify-end gap-3">
          <button class="px-4 py-2 border rounded-lg" @click="cancelDelete" :disabled="deleting">
            Cancel
          </button>
          <button class="px-4 py-2 bg-red-600 text-white rounded-lg" @click="confirmDelete" :disabled="deleting">
            <i v-if="deleting" class="fa-solid fa-spinner fa-spin mr-2"></i>
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import api, { IMAGE_URL } from '../services/api';

// Leaflet (OpenStreetMap)
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons for Vite
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const items = ref([]);
const search = ref('');

const showForm = ref(false);
const modalError = ref('');
const saving = ref(false);

const fileInput = ref(null);
const imageFile = ref(null);
const imagePreview = ref(null);
const previewObjectUrl = ref(null);

const removeImage = ref(false);

const form = ref({
  id: null,
  name: '',
  image: null,     // current filename from backend
  latitude: null,  // ✅ lat
  longitude: null, // ✅ lng
});

const showDelete = ref(false);
const deleteTarget = ref(null);
const deleting = ref(false);

// Map picker state
const showMapPicker = ref(false);
const mapEl = ref(null);
const mapError = ref('');

let mapInstance = null;
let mapMarker = null;

const imageUrl = (img) => `${IMAGE_URL}/uploads/schools/${img}`;

const filteredItems = computed(() => {
  const q = (search.value || '').toLowerCase().trim();
  if (!q) return items.value || [];
  return (items.value || []).filter((i) => (i?.name || '').toLowerCase().includes(q));
});

const totalItems = computed(() => filteredItems.value.length);
const paginatedItems = computed(() => filteredItems.value);

// ---------- API ----------
const fetchAll = async () => {
  const { data } = await api.get('/schools');
  items.value = data || [];
};

// ---------- Form ----------
const openForm = (row = null) => {
  modalError.value = '';
  saving.value = false;
  mapError.value = '';

  // reset image states
  clearSelectedImage();
  removeImage.value = false;

  if (row) {
    form.value = {
      id: row.id,
      name: row.name || '',
      image: row.image || null,
      latitude: row.latitude ?? null,
      longitude: row.longitude ?? null,
    };
    imagePreview.value = row.image ? imageUrl(row.image) : null;
  } else {
    form.value = { id: null, name: '', image: null, latitude: null, longitude: null };
    imagePreview.value = null;
  }

  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  modalError.value = '';
  saving.value = false;
  mapError.value = '';

  clearSelectedImage();
  removeImage.value = false;
};

const onImageChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  removeImage.value = false;

  if (previewObjectUrl.value) {
    URL.revokeObjectURL(previewObjectUrl.value);
    previewObjectUrl.value = null;
  }

  imageFile.value = file;
  previewObjectUrl.value = URL.createObjectURL(file);
  imagePreview.value = previewObjectUrl.value;
};

const clearSelectedImage = () => {
  imageFile.value = null;

  if (previewObjectUrl.value) {
    URL.revokeObjectURL(previewObjectUrl.value);
    previewObjectUrl.value = null;
  }

  if (form.value?.id && form.value?.image && !removeImage.value) {
    imagePreview.value = imageUrl(form.value.image);
  } else {
    imagePreview.value = null;
  }

  if (fileInput.value) fileInput.value.value = '';
};

const toggleRemoveImage = () => {
  removeImage.value = !removeImage.value;

  if (removeImage.value) {
    if (previewObjectUrl.value) {
      URL.revokeObjectURL(previewObjectUrl.value);
      previewObjectUrl.value = null;
    }
    imageFile.value = null;
    imagePreview.value = null;
    if (fileInput.value) fileInput.value.value = '';
  } else {
    imagePreview.value = form.value.image ? imageUrl(form.value.image) : null;
  }
};

// ---------- Map Picker ----------
const setLatLng = (lat, lng) => {
  const fixedLat = Number(Number(lat).toFixed(7));
  const fixedLng = Number(Number(lng).toFixed(7));

  form.value.latitude = fixedLat;
  form.value.longitude = fixedLng;

  if (mapMarker) mapMarker.setLatLng([fixedLat, fixedLng]);
  if (mapInstance) mapInstance.panTo([fixedLat, fixedLng]);
};

const initMap = () => {
  if (!mapEl.value) return;

  const lat = form.value.latitude ?? 11.5563732;
  const lng = form.value.longitude ?? 104.9282099;

  if (!mapInstance) {
    mapInstance = L.map(mapEl.value, { center: [lat, lng], zoom: 13 });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapInstance);

    mapMarker = L.marker([lat, lng], { draggable: true }).addTo(mapInstance);

    mapInstance.on('click', (e) => setLatLng(e.latlng.lat, e.latlng.lng));

    mapMarker.on('dragend', () => {
      const p = mapMarker.getLatLng();
      setLatLng(p.lat, p.lng);
    });
  } else {
    mapInstance.setView([lat, lng], 13);
    if (mapMarker) mapMarker.setLatLng([lat, lng]);
  }

  setTimeout(() => mapInstance?.invalidateSize(), 50);
};

const openMapPicker = async () => {
  mapError.value = '';
  showMapPicker.value = true;
  await nextTick();
  initMap();
};

const closeMapPicker = () => {
  showMapPicker.value = false;
};

const useMyLocation = () => {
  mapError.value = '';

  if (!navigator.geolocation) {
    mapError.value = 'Geolocation is not supported by this browser.';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      setLatLng(pos.coords.latitude, pos.coords.longitude);
      if (showMapPicker.value) initMap();
    },
    (err) => {
      mapError.value = err.message || 'Cannot get your location.';
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
};

const openInGoogleMaps = () => {
  const lat = form.value.latitude;
  const lng = form.value.longitude;

  const url =
    lat != null && lng != null
      ? `https://www.google.com/maps?q=${lat},${lng}`
      : `https://www.google.com/maps`;

  window.open(url, '_blank');
};

// ---------- Save ----------
const save = async () => {
  modalError.value = '';
  saving.value = true;

  try {
    const lat = form.value.latitude;
    const lng = form.value.longitude;

    if (lat !== null && lat !== '' && (lat < -90 || lat > 90)) {
      modalError.value = 'Latitude must be between -90 and 90';
      saving.value = false;
      return;
    }
    if (lng !== null && lng !== '' && (lng < -180 || lng > 180)) {
      modalError.value = 'Longitude must be between -180 and 180';
      saving.value = false;
      return;
    }

    const fd = new FormData();
    fd.append('name', form.value.name);

    if (lat !== null && lat !== '') fd.append('latitude', String(lat));
    if (lng !== null && lng !== '') fd.append('longitude', String(lng));

    if (imageFile.value) fd.append('image', imageFile.value);

    // backend must support this
    if (form.value.id && removeImage.value) fd.append('remove_image', '1');

    if (form.value.id) {
      await api.put(`/schools/${form.value.id}`, fd);
    } else {
      await api.post('/schools', fd);
    }

    await fetchAll();
    closeForm();
  } catch (err) {
    modalError.value = err.response?.data?.message || 'Save failed';
  } finally {
    saving.value = false;
  }
};

// ---------- Delete ----------
const askDelete = (row) => {
  deleteTarget.value = row;
  showDelete.value = true;
};

const cancelDelete = () => {
  showDelete.value = false;
  deleteTarget.value = null;
  deleting.value = false;
};

const confirmDelete = async () => {
  if (!deleteTarget.value?.id) return;

  deleting.value = true;
  try {
    await api.delete(`/schools/${deleteTarget.value.id}`);
    await fetchAll();
    cancelDelete();
  } catch (err) {
    console.error(err);
    deleting.value = false;
  }
};

onMounted(fetchAll);

onBeforeUnmount(() => {
  // image preview cleanup
  if (previewObjectUrl.value) URL.revokeObjectURL(previewObjectUrl.value);

  // leaflet cleanup
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
    mapMarker = null;
  }
});
</script>
