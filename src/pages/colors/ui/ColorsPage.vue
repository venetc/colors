<script setup lang="ts">
import { Settings } from 'lucide-vue-next';
import { NButton, NCard } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import ImageCropper from '@/features/image/crop-image/ui/ImageCropper.vue';
import type { Img } from '@/entities/image';
import { ImagePreview, useImagesStore } from '@/entities/image';
import { useColorsStore } from '@/entities/color';

const imagesStore = useImagesStore();
const { images } = storeToRefs(imagesStore);

const colorsStore = useColorsStore();
const { colors } = storeToRefs(colorsStore);
const { grabColorsFromSrc } = colorsStore;

const modalActive = ref(false);
const activeImage = ref<Img>();

function on(img: Img) {
  activeImage.value = img;
  modalActive.value = true;
}
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
              @click="on(image)"
            >
              <template #icon>
                <Settings />
              </template>
            </NButton>
          </div>
        </template>
      </NCard>
    </div>

    <Transition name="fade">
      <div
        v-if="modalActive"
        class="fixed w-full h-full top-0 left-0 flex items-center justify-center"
      >
        <div
          class="absolute top-0 left-0 w-full h-full bg-opacity-50 bg-black"
          @click="modalActive = false"
        />
        <div class="bg-white rounded w-11/12 h-5/6 relative">
          <ImageCropper :image="activeImage!" />
        </div>
      </div>
    </Transition>
  </section>
</template>
