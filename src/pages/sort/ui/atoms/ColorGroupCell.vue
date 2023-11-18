<script setup lang="ts">
import { RotateCcw } from 'lucide-vue-next';
import { toRefs } from 'vue';
import type { ImageColor } from '@/entities/color';
import type { ImageId } from '@/entities/image';
import { generatePivotId, useSortedColorsStore } from '@/features/color/sort-colors';

const props = defineProps<{ imageColor: ImageColor; imageId: ImageId; colorIndex: number }>();
const { imageColor, imageId, colorIndex } = toRefs(props);

const sortedColorsModel = useSortedColorsStore();
</script>

<template>
  <div class="w-10 h-10 relative 2xl:w-10 2xl:h-10 xl:w-8 xl:h-8 lg:w-6 lg:h-6">
    <Transition
      mode="out-in"
      name="color"
    >
      <div
        v-if="imageColor.isSorted"
        class="group/color hover:border-opacity-25 active:border-opacity-50 border-opacity-10 transition-all transform-gpu absolute text-red-500 top-0 left-0 w-full h-full rounded border-2 border-black border-dashed cursor-pointer flex items-center justify-center"
        @click="sortedColorsModel.removeColorFromGroups(imageId, colorIndex)"
      >
        <RotateCcw
          class="group-hover/color:opacity-75 group-active/color:opacity-100 opacity-0 transition-all transform-gpu"
          :size="16"
        />
      </div>
      <div
        v-else
        class="absolute top-0 left-0 w-full h-full rounded border-2 2xl:border-2 xl:border-2 lg:border border-black text-xs"
        draggable="true"
        :style="{ backgroundColor: imageColor.handpicked?.hex ?? imageColor.original.hex }"
        @dragstart="sortedColorsModel.dragStartHandler({ event: $event, pivotId: generatePivotId(imageId, colorIndex) })"
      />
    </Transition>
  </div>
</template>

<style scoped>
.color-enter-active,
.color-leave-active {
  transition: all 0.25s ease-in-out;
}

.color-enter-from,
.color-leave-to {
  opacity: 0;
  transform: rotateY(90deg);
}
</style>
