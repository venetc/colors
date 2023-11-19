<script setup lang="ts">
import { storeToRefs } from 'pinia';

import type { Component } from 'vue';

import { useHeader } from '@/widgets/header/model';

const props = defineProps<{ content: Component }>();

const appHeaderModel = useHeader();
const { isHeaderActive } = storeToRefs(appHeaderModel);
</script>

<template>
  <header
    v-if="isHeaderActive"
    class="fixed w-full top-0 left-0 z-20 flex items-center justify-center pointer-events-none"
  >
    <div class="flex flex-nowrap shadow-md py-1 px-10 h-10 items-center bg-white rounded-bl-md rounded-br-md w-11/12 pointer-events-auto">
      <div class="container mx-auto">
        <Transition
          mode="out-in"
          name="fade"
          appear
        >
          <component :is="props.content" />
        </Transition>
      </div>
    </div>
  </header>
</template>
