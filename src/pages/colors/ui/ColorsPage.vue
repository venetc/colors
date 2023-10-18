<script setup lang="ts">
import { RotateCcw, Settings2 } from 'lucide-vue-next';
import { NButton } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useHeaderStore } from '@/widgets/header/model';
import { ColorsEditor, useColorsStore } from '@/entities/color';
import { ImageEditor, useImageEditorStore } from '@/widgets/image-editor';
import { ImageCard, useImagesStore } from '@/entities/image';

const imagesStore = useImagesStore();
const { images } = storeToRefs(imagesStore);

const colorsStore = useColorsStore();
const {
  readColorsFromImageBySrc,
  amountOfColors,
  checkIfSomeColorsAreSelected,
  resetColorsStore,
  MIN_COLORS,
} = colorsStore;

const imageEditorStore = useImageEditorStore();
const {
  setActiveImage,
  setEditorState,
} = imageEditorStore;

const appHeaderStore = useHeaderStore();
const { isHeaderActive } = storeToRefs(appHeaderStore);

const router = useRouter();
router.beforeEach((to, _, next) => {
  if (to.name === 'Main') resetColorsStore();
  next();
});

onUnmounted(() => {
  setEditorState('closed');
  setActiveImage(undefined);
  isHeaderActive.value = true;
});
</script>

<template>
  <section class="py-5">
    <div class="grid grid-cols-3 gap-5">
      <ImageCard
        v-for="[uuid, image] in images"
        :key="uuid"
        :image="image"
        :uuid="uuid"
        @onLoad="readColorsFromImageBySrc"
      >
        <div class="flex flex-nowrap items-stretch justify-between py-2 px-2 before:w-[26px]">
          <div class="flex justify-center items-center gap-2 h-12">
            <ColorsEditor :imageToken="uuid" />
          </div>

          <div
            class="flex flex-col flex-nowrap justify-between opacity-0 group-hover/card:opacity-100 transition-all duration-300"
          >
            <NButton
              :disabled="!(checkIfSomeColorsAreSelected(uuid) || (amountOfColors(uuid) < MIN_COLORS))"
              size="tiny"
              type="error"
              @click="readColorsFromImageBySrc(uuid, image.croppedSrc ?? image.blobSrc)"
            >
              <template #icon>
                <RotateCcw :size="16" />
              </template>
            </NButton>
            <NButton
              size="tiny"
              type="info"
              @click="setActiveImage(image, uuid); setEditorState('opened'); isHeaderActive = false"
            >
              <template #icon>
                <Settings2 :size="16" />
              </template>
            </NButton>
          </div>
        </div>
      </ImageCard>
    </div>

    <ImageEditor @onClose="isHeaderActive = true" />
  </section>
</template>
