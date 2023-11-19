<script setup lang="ts">
import ImagePreview from '../ui/ImagePreview.vue';

import { toRefs } from 'vue';
import { NCard } from 'naive-ui';

import type { ImageId, Img } from '../model';

const props = defineProps<{ image: Img }>();
const emit = defineEmits<{
  onLoad: [imageId: ImageId];
}>();

const { image } = toRefs(props);

function loadHandler(imageId: ImageId) {
  emit('onLoad', imageId);
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
