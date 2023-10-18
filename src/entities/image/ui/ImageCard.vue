<script setup lang="ts">
import { toRefs } from 'vue';
import { NCard } from 'naive-ui';
import ImagePreview from '../ui/ImagePreview.vue';
import type { Img } from '../model';

const props = defineProps<{ image: Img; uuid: string }>();
const emit = defineEmits<{
  onLoad: [uuid: string, src: string];
}>();

const {
  uuid,
  image,
} = toRefs(props);

function loadHandler(src: string) {
  emit('onLoad', uuid.value, src);
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
