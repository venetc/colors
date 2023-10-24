<script setup lang="ts">
import { RotateCcw, Settings2 } from 'lucide-vue-next';
import { NButton } from 'naive-ui';
import { storeToRefs } from 'pinia';
import type { MaybeRef } from 'vue';
import { nextTick, onUnmounted, unref } from 'vue';
import { useRouter } from 'vue-router';
import { useHeaderStore } from '@/widgets/header/model';
import { ColorsEditor, useColorsStore } from '@/entities/color';
import { ImageEditor, useImageEditorStore } from '@/widgets/image-editor';
import type { ImageId, Img } from '@/entities/image';
import { ImageCard, useImagesStore } from '@/entities/image';
import { useEditColors } from '@/features/color/edit-colors';

const colorsStore = useColorsStore();
const imagesStore = useImagesStore();
const imageEditorStore = useImageEditorStore();
const editColorsModel = useEditColors();
const appHeaderStore = useHeaderStore();

const { images } = storeToRefs(imagesStore);
const { colors } = storeToRefs(colorsStore);
const { isHeaderActive } = storeToRefs(appHeaderStore);
const { isEditorActive } = storeToRefs(imageEditorStore);

const router = useRouter();
router.beforeEach((to, _, next) => {
  if (to.name === 'Main') colorsStore.resetColorsStore();
  next();
});

function cantResetColor(image: Img) {
  const someAreHandpicked = editColorsModel.checkIfSomeColorsAreHandpicked(image.id);
  const someAreDeleted = colorsStore.amountOfColors(image.id) < editColorsModel.MIN_COLORS;

  return !someAreDeleted && !someAreHandpicked;
}

function openEditor(image: Img, id: ImageId) {
  imageEditorStore.setActiveImage(image);
  imageEditorStore.setActiveImageId(id);
  imageEditorStore.setEditorState('opened');
  isHeaderActive.value = false;
}

function closeEditor() {
  imageEditorStore.setEditorState('closed');
  imageEditorStore.setActiveImage(undefined);
  imageEditorStore.setActiveImageId(undefined);
  isHeaderActive.value = true;
}

onUnmounted(closeEditor);

function loadHandler(imageId: MaybeRef<ImageId>) {
  const id = unref(imageId);

  const image = images.value.get(id);

  if (!image) return;

  const imageHasNoColors = !colors.value.get(id);

  if (imageHasNoColors || isEditorActive.value) editColorsModel.readColorsFromImage(id);

  if (imageHasNoColors) {
    const src = image.croppedSrc;
    image.croppedSrc = null;

    nextTick(() => {
      src && URL.revokeObjectURL(src);
    });
  }
}
</script>

<template>
  <section class="py-5">
    <div class="grid grid-cols-3 gap-5">
      <ImageCard
        v-for="[, image] in images"
        :key="image.id"
        :image="image"
        @onLoad="loadHandler"
      >
        <div class="flex flex-nowrap justify-between py-2 px-2 before:w-[26px]">
          <div class="flex items-center gap-2 h-12 relative">
            <ColorsEditor
              :colors="editColorsModel.getColorsByImageId(image.id)"
              @onDelete="editColorsModel.removeColor(image.id, $event)"
              @onColorPick="(newColor, indexKey) => editColorsModel.handpickColor(newColor, indexKey, image.id)"
              @onResetHandpicked="editColorsModel.clearHandpickedColor"
            />
          </div>

          <div
            class="flex flex-col flex-nowrap justify-between opacity-0 group-hover/card:opacity-100 transition-all duration-300"
          >
            <NButton
              :disabled="cantResetColor(image)"
              size="tiny"
              type="error"
              @click="editColorsModel.readColorsFromImage(image.id)"
            >
              <template #icon>
                <RotateCcw :size="16" />
              </template>
            </NButton>
            <NButton
              size="tiny"
              type="info"
              @click="openEditor(image, image.id)"
            >
              <template #icon>
                <Settings2 :size="16" />
              </template>
            </NButton>
          </div>
        </div>
      </ImageCard>
    </div>

    <ImageEditor @onClose="closeEditor" />
  </section>
</template>
