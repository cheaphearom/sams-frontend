<template>
  <div ref="root" class="relative">
    <!-- Closed: shows the selected name. Open: becomes the search box -->
    <div class="relative">
      <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none"></i>
      <input
        ref="input"
        :value="open ? query : selectedLabel"
        @input="onType($event.target.value)"
        @focus="openList"
        @click="openList"
        @keydown.down.prevent="move(1)"
        @keydown.up.prevent="move(-1)"
        @keydown.enter.prevent="pickActive"
        @keydown.esc.prevent="close"
        @keydown.tab="close"
        :placeholder="loading ? 'Loading…' : placeholderText"
        :disabled="disabled"
        :required="required && !modelValue"
        autocomplete="off"
        role="combobox"
        :aria-expanded="open"
        class="w-full border border-gray-300 pl-8 pr-14 py-2 rounded-lg text-sm bg-white cursor-pointer"
      />
      <button
        v-if="hasValue && !disabled && !required"
        type="button"
        @mousedown.prevent="clear"
        title="Clear"
        class="absolute right-7 top-1/2 -translate-y-1/2 w-5 h-5 rounded text-slate-400 hover:text-slate-700"
      >
        <i class="fa-solid fa-xmark text-xs"></i>
      </button>
      <i
        :class="[
          'fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none transition-transform',
          open && 'rotate-180',
        ]"
      ></i>
    </div>

    <!-- The list is rendered on <body> so modals and cards with overflow don't cut it off -->
    <Teleport to="body">
      <ul
        v-if="open"
        ref="list"
        :style="listStyle"
        role="listbox"
        class="fixed z-[100] max-h-64 overflow-y-auto bg-white rounded-xl shadow-xl ring-1 ring-slate-200 py-1 text-sm"
      >
        <li v-if="error" class="px-3 py-2 text-red-600">{{ error }}</li>
        <li v-else-if="loading" class="px-3 py-2 text-slate-400">
          <i class="fa-solid fa-spinner fa-spin mr-1"></i> Loading…
        </li>
        <li v-else-if="filtered.length === 0" class="px-3 py-2 text-slate-400">
          {{ query ? `No ${noun} matches "${query}"` : `No ${noun} found` }}
        </li>
        <li
          v-for="(opt, i) in filtered"
          :key="opt.id"
          role="option"
          :aria-selected="sameId(opt.id, modelValue)"
          @mousedown.prevent="pick(opt)"
          @mouseenter="active = i"
          :class="[
            'px-3 py-2 cursor-pointer flex items-center gap-2',
            i === active ? 'bg-blue-50' : '',
          ]"
        >
          <div class="min-w-0 flex-1">
            <p :class="['truncate', sameId(opt.id, modelValue) ? 'font-semibold text-blue-700' : 'text-slate-800']">
              {{ opt.label }}
            </p>
            <p v-if="opt.hint" class="truncate text-xs text-slate-400">{{ opt.hint }}</p>
          </div>
          <i v-if="sameId(opt.id, modelValue)" class="fa-solid fa-check text-blue-600 text-xs"></i>
        </li>
      </ul>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { LOOKUPS, loadOptions } from '../services/lookups';

const props = defineProps({
  modelValue: { type: [Number, String], default: '' },
  type: { type: String, required: true }, // a key of LOOKUPS: class, subject, teacher, room, ...
  placeholder: { type: String, default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});
const emit = defineEmits(['update:modelValue', 'change']);

const root = ref(null);
const input = ref(null);
const list = ref(null);

const options = ref([]);
const loading = ref(false);
const error = ref('');
const open = ref(false);
const query = ref('');
const active = ref(0);
const listStyle = ref({});

const noun = computed(() => LOOKUPS[props.type]?.noun || 'item');
const placeholderText = computed(() => props.placeholder || `Select ${noun.value}`);
const hasValue = computed(() => props.modelValue !== '' && props.modelValue !== null && props.modelValue !== undefined);
const sameId = (a, b) => b !== '' && b !== null && b !== undefined && String(a) === String(b);

const selectedLabel = computed(() => {
  if (!hasValue.value) return '';
  const opt = options.value.find((o) => sameId(o.id, props.modelValue));
  return opt ? opt.label : loading.value ? '' : `#${props.modelValue}`;
});

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return options.value;
  return options.value.filter(
    (o) => o.label.toLowerCase().includes(q) || o.hint.toLowerCase().includes(q) || String(o.id) === q
  );
});

async function load() {
  loading.value = true;
  error.value = '';
  try {
    options.value = await loadOptions(props.type);
  } catch (err) {
    options.value = [];
    error.value =
      err.response?.status === 403
        ? `You don't have access to the ${noun.value} list`
        : `Couldn't load ${noun.value} list`;
  } finally {
    loading.value = false;
  }
}

function place() {
  const el = input.value;
  if (!el) return;
  const r = el.getBoundingClientRect();
  const below = window.innerHeight - r.bottom;
  const style = { left: `${r.left}px`, width: `${Math.max(r.width, 220)}px` };
  // Open upwards when there isn't room below
  if (below < 270 && r.top > below) style.bottom = `${window.innerHeight - r.top + 4}px`;
  else style.top = `${r.bottom + 4}px`;
  listStyle.value = style;
}

function openList() {
  if (props.disabled || open.value) return;
  open.value = true;
  query.value = '';
  const i = filtered.value.findIndex((o) => sameId(o.id, props.modelValue));
  active.value = i >= 0 ? i : 0;
  place();
  nextTick(scrollActiveIntoView);
}

function close() {
  open.value = false;
  query.value = '';
}

function onType(value) {
  query.value = value;
  active.value = 0;
  if (!open.value) openList();
}

function move(step) {
  if (!open.value) return openList();
  const n = filtered.value.length;
  if (!n) return;
  active.value = (active.value + step + n) % n;
  nextTick(scrollActiveIntoView);
}

function scrollActiveIntoView() {
  list.value?.children[active.value]?.scrollIntoView({ block: 'nearest' });
}

function pick(opt) {
  emit('update:modelValue', opt.id);
  emit('change', opt.id);
  close();
  input.value?.blur();
}

function pickActive() {
  const opt = filtered.value[active.value];
  if (open.value && opt) pick(opt);
}

function clear() {
  emit('update:modelValue', '');
  emit('change', '');
  close();
}

function onOutside(e) {
  if (!open.value) return;
  if (root.value?.contains(e.target) || list.value?.contains(e.target)) return;
  close();
}
function onScrollOrResize(e) {
  if (!open.value) return;
  if (list.value && e?.target && list.value.contains(e.target)) return; // scrolling the list itself
  place();
}

watch(() => props.type, load);

onMounted(() => {
  load();
  document.addEventListener('mousedown', onOutside);
  window.addEventListener('resize', onScrollOrResize);
  window.addEventListener('scroll', onScrollOrResize, true);
});
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onOutside);
  window.removeEventListener('resize', onScrollOrResize);
  window.removeEventListener('scroll', onScrollOrResize, true);
});
</script>
