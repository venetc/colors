<script setup lang="ts">
import { RouterView } from 'vue-router';

import type { MemoryInfo } from '@vueuse/core';
import { useMediaQuery, useMemory } from '@vueuse/core';

function size(v: number) {
  const kb = v / 1024 / 1024;
  return `${kb.toFixed(2)} MB`;
}

const {
  isSupported,
  memory,
} = useMemory();
const isSmallScreen = useMediaQuery('(max-width: 1023px)');
</script>

<template>
  <template v-if="isSmallScreen">
    <div class="w-full my-auto flex flex-col items-center gap-5 justify-center text-3xl font-mono">
      <div>Screen too small</div>
      <div>😢</div>
    </div>
  </template>
  <template v-else>
    <RouterView
      v-slot="{ Component }"
      name="header"
    >
      <Transition
        mode="out-in"
        name="slide-up"
        type="animation"
        appear
      >
        <component
          :is="Component"
        />
      </Transition>
    </RouterView>

    <main class="grow container mx-auto pt-10 grid">
      <RouterView v-slot="{ Component, route }">
        <Transition
          mode="out-in"
          name="fade"
          appear
        >
          <component
            :is="Component"
            :key="route.fullPath"
          />
        </Transition>
      </RouterView>
    </main>

    <div
      v-if="isSupported && memory"
      class="fixed z-30 bottom-2 left-2 py-2 px-3 bg-white shadow-md rounded-md text-xs select-none"
    >
      <div
        class="inline-grid grid-cols-2 gap-x-1 gap-y-1 font-mono"
      >
        <template v-if="memory">
          <div class="opacity-70">
            Used
          </div>
          <div>{{ size((memory as MemoryInfo).usedJSHeapSize) }}</div>
          <div class="opacity-70">
            Allocated
          </div>
          <div>{{ size((memory as MemoryInfo).totalJSHeapSize) }}</div>
          <div class="opacity-70">
            Limit
          </div>
          <div>{{ size((memory as MemoryInfo).jsHeapSizeLimit) }}</div>
        </template>
      </div>
    </div>
  </template>
</template>
