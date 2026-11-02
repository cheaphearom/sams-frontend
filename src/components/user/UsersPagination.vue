<template>
  <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <!-- Showing info -->
      <div class="text-sm text-gray-600">
        Showing 
        <span class="font-medium">{{ startItem }}</span>
        to 
        <span class="font-medium">{{ endItem }}</span>
        of 
        <span class="font-medium">{{ totalItems }}</span>
        results
      </div>

      <!-- Pagination controls -->
      <div class="flex items-center gap-2">
        <!-- Previous button -->
        <button 
          @click="$emit('change-page', currentPage - 1)"
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

        <!-- Page numbers -->
        <div class="flex items-center gap-1">
          <template v-for="page in visiblePages" :key="page + '-' + currentPage">
            <span v-if="page === '...'" class="px-2 text-gray-400">...</span>
            <button
              v-else
              @click="$emit('change-page', page)"
              :class="[ 
                'min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors',
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              ]"
            >
              {{ page }}
            </button>
          </template>
        </div>

        <!-- Next button -->
        <button 
          @click="$emit('change-page', currentPage + 1)"
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

      <!-- Items per page -->
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">Per page:</label>
        <select 
          :value="itemsPerPage"
          @change="$emit('change-per-page', +$event.target.value)"
          class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  startItem: { type: Number, required: true },
  endItem: { type: Number, required: true },
  totalItems: { type: Number, required: true },
  itemsPerPage: { type: Number, required: true }
});

const visiblePages = computed(() => {
  const pages = [];
  const total = props.totalPages;
  const current = props.currentPage;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);

    if (current > 3) pages.push('...');

    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }

    if (current < total - 2) pages.push('...');

    pages.push(total);
  }

  return pages;
});
</script>
