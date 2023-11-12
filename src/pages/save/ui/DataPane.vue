<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { ref } from 'vue';

const activePane = ref<'left' | 'right'>('left');

function switchPane() {
  activePane.value = activePane.value === 'left' ? 'right' : 'left';
}
</script>

<template>
  <div
    class="h-[46rem] w-[200%] relative flex flex-nowrap font-mono transition-transform duration-500"
    :class="{ '-translate-x-1/2': activePane === 'right' }"
  >
    <button
      class="absolute border rounded-sm h-1/4 bg-slate-200 top-1/2 right-1/2 -translate-y-1/2 text-xs flex items-center justify-center gap-1 transition-transform ease-in-out duration-500"
      :class="[activePane === 'right' ? 'translate-x-[125%]' : '-translate-x-[25%]']"
      @click="switchPane"
    >
      <transition
        name="fade"
        mode="out-in"
      >
        <Component
          :is="activePane === 'left' ? ChevronRight : ChevronLeft"
          :size="14"
          :strokeWidth="1.5"
        />
      </transition>
    </button>
    <div class="w-1/2 px-6">
      <slot name="left" />
    </div>
    <div class="w-1/2 px-6">
      <slot name="right" />
    </div>
  </div>
</template>
