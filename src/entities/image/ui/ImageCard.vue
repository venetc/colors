<script setup lang="ts">
import { toRefs } from 'vue';
import { NCard } from 'naive-ui';
import ImagePreview from '../ui/ImagePreview.vue';
import type { Img } from '../model';

const props = defineProps<{ image: Img; token: string }>();
const emit = defineEmits<{
  onLoad: [token: string, src: string];
}>();

const {
  token,
  image,
} = toRefs(props);

function loadHandler(src: string) {
  emit('onLoad', token.value, src);
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
        :token="token"
        class="w-full h-80"
        @onLoad="loadHandler"
      />
    </template>

    <template #footer>
      <slot />
    </template>
  </NCard>
</template>
