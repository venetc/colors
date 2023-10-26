<script setup lang="ts">
import { RotateCcw, Settings2 } from 'lucide-vue-next';
import { NButton } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { nextTick, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useHeaderStore } from '@/widgets/header/model';
import { ColorsEditor, useColorsStore } from '@/entities/color';
import { ImageEditor, useImageEditorStore } from '@/widgets/image-editor';
import type { ImageId, Img } from '@/entities/image';
import { ImageCard, useImagesStore } from '@/entities/image';
import { ReadColorsModal, useEditColors } from '@/features/color/edit-colors';

const colorsModel = useColorsStore();
const imagesModel = useImagesStore();
const imageEditorModel = useImageEditorStore();
const editColorsModel = useEditColors();
const appHeaderModel = useHeaderStore();

const { images } = storeToRefs(imagesModel);
const { colors } = storeToRefs(colorsModel);
const { isHeaderActive } = storeToRefs(appHeaderModel);
const { isEditorActive } = storeToRefs(imageEditorModel);

function openEditor(image: Img, id: ImageId) {
  imageEditorModel.setActiveImage(image);
  imageEditorModel.setActiveImageId(id);
  imageEditorModel.setEditorState('opened');
  isHeaderActive.value = false;
}

function closeEditor() {
  imageEditorModel.setEditorState('closed');
  imageEditorModel.setActiveImage(null);
  imageEditorModel.setActiveImageId(null);
  isHeaderActive.value = true;
}

onUnmounted(closeEditor);

function loadHandler(imageId: ImageId, imageElement: HTMLImageElement | undefined) {
  if (!imageElement) return;

  const image = images.value.get(imageId);

  if (!image) return;

  const imageHasNoColors = !colors.value.get(imageId);

  if (imageHasNoColors || isEditorActive.value) editColorsModel.readColorsFromImage(imageId, imageElement);

  if (imageHasNoColors) {
    const src = image.croppedSrc;

    nextTick(() => {
      src && URL.revokeObjectURL(src);
      image.croppedSrc = null;
    });
  }
}

const router = useRouter();
router.beforeEach((to, _, next) => {
  if (to.name === 'Main') colorsModel.resetColorsStore();
  if (to.name === 'Sort' && images.value.size > colors.value.size) {
    editColorsModel.setColorReadModalIsActive(true);
    return;
  }
  next();
});
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
              :disabled="editColorsModel.cantResetColor(image.id)"
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

    <ReadColorsModal />
  </section>
</template>
