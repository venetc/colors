<script setup lang="ts">
import { useElementSize } from '@vueuse/core';
import { X } from 'lucide-vue-next';
import { NImage, NImageGroup } from 'naive-ui';
import { ref, toRefs } from 'vue';

import type { ImageId, Img } from '@/entities/image';

interface Props {
  images: Map<ImageId, Img>;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  onRemove: [id: ImageId];
}>();

const { images } = toRefs(props);

const imagesContainer = ref<HTMLElement>();
const { width: containerWidth } = useElementSize(imagesContainer);
</script>

<template>
  <div
    ref="imagesContainer"
    class="images-container"
  >
    <NImageGroup>
      <TransitionGroup name="images-list">
        <div
          v-for="[id, image] in images"
          :key="id"
          class="image aspect-square mb-2 mr-2 inline-block relative group rounded-md bg-slate-500 bg-opacity-10"
        >
          <NImage
            :src="image.blobSrc"
            objectFit="cover"
            :imgProps="{
              style: {
                marginInline: 'auto', position: 'absolute', width: '100%', height: '100%',
              },
            }"
            class="aspect-square select-none"
          />
          <i
            class="absolute cursor-pointer right-0 top-0 p-0.5 bg-opacity-25 bg-neutral-950 text-white rounded-bl-md border-white border-l border-b opacity-0 group-hover:opacity-100 transition-opacity"
            @click="emit('onRemove', id)"
          >
            <X
              :size="16"
              :stroke-width="1.5"
            />
          </i>
        </div>
      </TransitionGroup>
    </NImageGroup>
  </div>
</template>

<style scoped>
.images-list-enter-from,
.images-list-leave-to {
  opacity: 0;
  transform: scale(0);
}

.images-list-leave-active {
  position: absolute;
}

.images-container {
  --container-width: calc(v-bind(containerWidth) * 1px);
  font-size: 0;
}

.image {
  width: calc((var(--container-width) / 2) - 0.5rem);
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

@media (min-width: 1024px) {
  .image {
    width: calc((var(--container-width) / 4) - 0.5rem);
  }
}

@media (min-width: 1280px) {
  .image {
    width: calc((var(--container-width) / 5) - 0.5rem);
  }
}

@media (min-width: 1536px) {
  .image {
    width: calc((var(--container-width) / 7) - 0.5rem);
  }
}
</style>
