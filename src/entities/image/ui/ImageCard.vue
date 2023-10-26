<script setup lang="ts">
import { toRefs } from 'vue';
import { NCard } from 'naive-ui';
import ImagePreview from '../ui/ImagePreview.vue';
import type { ImageId, Img } from '../model';

const props = defineProps<{ image: Img }>();
const emit = defineEmits<{
  onLoad: [imageId: ImageId, imageElement: HTMLImageElement | undefined];
}>();

const { image } = toRefs(props);

function loadHandler(imageElement: HTMLImageElement | undefined) {
  emit('onLoad', image.value.id, imageElement);
}
</script>

<template>
  <NCard
    :footerStyle="{ padding: 0 }"
    class="group/card !rounded-md hover:shadow-xl shadow-md"
  >
    <template #cover>
      <ImagePreview
        :image="image"
        class="w-full h-80"
        @onLoad="loadHandler"
      />
    </template>

    <template #footer>
      <slot />
    </template>
  </NCard>
</template>
