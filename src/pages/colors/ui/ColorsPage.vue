<script setup lang="ts">
import { Settings } from 'lucide-vue-next';
import { NButton, NCard } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { ImageEditor, useImageEditorStore } from '@/widgets/image-editor';
import type { Img } from '@/entities/image';
import { ImagePreview, useImagesStore } from '@/entities/image';
import { useColorsStore } from '@/entities/color';

const imagesStore = useImagesStore();
const { images } = storeToRefs(imagesStore);

const colorsStore = useColorsStore();
const { colors } = storeToRefs(colorsStore);
const { grabColorsFromSrc } = colorsStore;

const imageEditorStore = useImageEditorStore();
const { setActiveImage, setEditorState } = imageEditorStore;
</script>

<template>
  <section>
    <div class="grid grid-cols-3 gap-5">
      <NCard
        v-for="[imageKey, image] in images"
        :key="imageKey"
        hoverable
        :footerStyle="{ padding: 0 }"
        class="group/card"
      >
        <template #cover>
          <ImagePreview
            :image="image"
            class="w-full h-80"
            @onLoad="(img: Img) => grabColorsFromSrc({ token: imageKey, src: img.blobSrc })"
          />
        </template>

        <template #footer>
          <div class="flex items-center justify-between py-2 px-3 before:content-[''] before:w-10 before:h-10">
            <div class="flex justify-center items-center gap-3">
              <div
                v-for="color in colors.get(imageKey)"
                :key="color.manuallySelected?.hex ?? color.original.hex"
                class="w-10 h-10 rounded-full"
                :style="{ backgroundColor: color.manuallySelected?.hex ?? color.original.hex }"
              />
            </div>
            <NButton
              quaternary
              type="info"
              circle
              size="large"
              class="opacity-0 group-hover/card:opacity-100"
              @click="setActiveImage(image); setEditorState('opened')"
            >
              <template #icon>
                <Settings />
              </template>
            </NButton>
          </div>
        </template>
      </NCard>
    </div>

    <ImageEditor />
  </section>
</template>
