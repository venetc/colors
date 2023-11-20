<script setup lang="ts">
import { useClipboard } from '@vueuse/core';
import { Check, ClipboardCopy } from 'lucide-vue-next';
import { NPopover } from 'naive-ui';
import { computed, toRefs } from 'vue';

import type { ImageColor } from '@/entities/color';

interface Props {
  imageColor: ImageColor;
}

const props = defineProps<Props>();
const { imageColor } = toRefs(props);

const hex = computed(() => imageColor.value.handpicked?.hex ?? imageColor.value.original.hex);

const {
  copy,
  copied,
  isSupported,
} = useClipboard({ source: hex.value });
</script>

<template>
  <NPopover
    trigger="hover"
    class="!font-mono rounded-lg"
    raw
    displayDirective="show"
  >
    <template #trigger>
      <div
        :style="{ backgroundColor: hex }"
        class="text-xs font-mono w-full grid place-items-center group/color h-10"
        :class="{ 'cursor-pointer': isSupported }"
        @click="copy()"
      >
        <div
          v-if="isSupported"
          class="border border-black/10 p-1 rounded shadow backdrop-blur bg-black/10 text-white opacity-0 transition duration-300 group-hover/color:opacity-100"
        >
          <Transition
            name="fade"
            mode="out-in"
          >
            <Component
              :is="copied ? Check : ClipboardCopy"
              :size="16"
            />
          </Transition>
        </div>
      </div>
    </template>
    <div class="bg-white flex text-xs gap-1.5 py-1 px-1.5 rounded items-center justify-center">
      <div
        :style="{ backgroundColor: hex }"
        class="w-3 h-3"
      />
      <span>{{ hex }}</span>
    </div>
  </NPopover>
</template>
