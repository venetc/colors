<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { useThemeVars } from 'naive-ui';
import { ref } from 'vue';

const activePane = ref<'left' | 'right'>('left');

function switchPane() {
  activePane.value = activePane.value === 'left' ? 'right' : 'left';
}

const themeVars = useThemeVars();
</script>

<template>
  <div class="pb-3 pt-6 overflow-hidden w-full">
    <div
      class="w-[200%] relative flex flex-nowrap font-mono transition-transform duration-500"
      :class="{ '-translate-x-1/2': activePane === 'right' }"
    >
      <button
        class="absolute border rounded h-6 top-5 px-0.5 right-1/2 text-white text-xs flex items-center justify-center gap-1 transition-transform ease-in-out duration-500"
        :class="[activePane === 'right' ? 'translate-x-[110%]' : '-translate-x-[10%]']"
        :style="{ backgroundColor: themeVars.infoColor, borderColor: themeVars.infoColor }"
        @click="switchPane"
      >
        <transition
          name="fade"
          mode="out-in"
        >
          <Component
            :is="activePane === 'left' ? ChevronRight : ChevronLeft"
            :size="14"
            :strokeWidth="2"
          />
        </transition>
      </button>
      <div class="px-6 max-w-[50%] w-full h-fit">
        <transition
          v-show="activePane === 'left'"
          name="fade-slower"
          mode="out-in"
        >
          <slot
            name="left"
          />
        </transition>
      </div>
      <div class="px-6 max-w-[50%] w-full h-fit">
        <transition
          v-show="activePane === 'right'"
          name="fade-slower"
          mode="out-in"
        >
          <slot
            name="right"
          />
        </transition>
      </div>
    </div>
  </div>
</template>
