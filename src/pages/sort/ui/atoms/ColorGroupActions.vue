<script setup lang="ts">
import { ChevronUp, Image, RotateCcw } from 'lucide-vue-next';
import { NPopover } from 'naive-ui';
import { toRefs } from 'vue';

import type { ImageId } from '@/entities/image';

import { useImages } from '@/entities/image';
import { useColorsSort } from '@/features/color/sort-colors';

const props = defineProps<{ imageId: ImageId }>();
const { imageId } = toRefs(props);

const imagesModel = useImages();
const sortedColorsModel = useColorsSort();
</script>

<template>
  <div class="group/extra h-7 rounded-t-md">
    <div
      class="flex flex-nowrap w-full h-1/2 items-center justify-center group-hover/extra:translate-y-0 translate-y-[calc(100%_+_1px)] will-change-transform transition-transform bottom-full left-0 bg-white rounded-t-md"
    >
      <NPopover
        placement="right"
        style="padding: 0.25rem"
      >
        <template #trigger>
          <button
            class="bg-blue-500 text-white h-full basis-1/2 rounded-tl-md border border-blue-600 flex items-center justify-center cursor-pointer"
          >
            <Image :size="12" />
          </button>
        </template>

        <div
          v-if="imagesModel.getImageById(imageId)"
          class=" rounded-sm overflow-hidden"
        >
          <img
            :src="imagesModel.getImageById(imageId)?.croppedSrc ?? imagesModel.getImageById(imageId)?.blobSrc"
            :alt="imagesModel.getImageById(imageId)?.id"
            crossorigin="anonymous"
            class="object-contain max-w-[200px] max-h-[200px]"
          >
        </div>
      </NPopover>

      <button
        class="bg-red-500 text-white h-full basis-1/2 rounded-tr-md border border-red-600 flex items-center justify-center cursor-pointer"
        @click="sortedColorsModel.unsortColorsByImageId(imageId)"
      >
        <RotateCcw :size="12" />
      </button>
    </div>
    <div
      class="w-full h-[calc(50%_+_1px)] relative z-30 bg-white group-hover/extra:rounded-t-none rounded-t-md flex items-center justify-center"
    >
      <ChevronUp
        :size="16"
        class="opacity-50 cursor-pointer"
      />
    </div>
  </div>
</template>
