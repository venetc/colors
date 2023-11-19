<script setup lang="ts">
import RatioSliders from './RatioSliders.vue';

import { useImageEditor } from '../model';

import { storeToRefs } from 'pinia';
import { computed, provide, ref } from 'vue';
import { NButton, NPopover, NSwitch } from 'naive-ui';
import { Crop, Lasso, Redo2, RotateCcw, Scaling, Undo2, X } from 'lucide-vue-next';

import type { Color } from '@/entities/color';
import type { ExposedCropperData } from '@/features/image/crop-image';

import ColorEditor from '@/features/color/edit-colors/ui/ColorEditor.vue';
import ColorCell from '@/entities/color/ui/ColorCell.vue';
import { useEditColors } from '@/features/color/edit-colors';
import { ColorsList, useColors } from '@/entities/color';
import {
  ImageCropper,
  cropperInfrastructureData,
  useCropperInfraData,
} from '@/features/image/crop-image';

const emit = defineEmits<{
  onClose: [];
  onReset: [];
}>();

const imageEditorModel = useImageEditor();
const editColorsModel = useEditColors();
const colorsModel = useColors();

const {
  isEditorActive,
  activeImage,
} = storeToRefs(imageEditorModel);

const {
  setEditorState,
  setActiveImage,
  setImageCroppedSrc,
} = imageEditorModel;

const cropper = ref<InstanceType<typeof ImageCropper> & ExposedCropperData>();

const cropperInfraData = useCropperInfraData();

provide(cropperInfrastructureData, cropperInfraData);

const notEnoughPointersToCrop = computed(() => (cropperInfraData?.currentPointersAmount.value < 3));
const cantUndo = computed(() => (cropperInfraData.isDrawingModeFlag.value || cropperInfraData.undoPointersAmount.value < 1));
const cantRedo = computed(() => (cropperInfraData.isDrawingModeFlag.value || cropperInfraData.redoPointersAmount.value <= 0));
const cantResetColors = computed(() => ((activeImage.value && editColorsModel.cantResetColor(activeImage.value.id)) ?? true));
const hasSomeColors = computed(() => {
  const image = activeImage.value;

  if (!image) return false;

  return colorsModel.amountOfColors(image.id) > 0;
});

function colorPickHandler(newColor: Color, indexKey: number) {
  if (!activeImage.value) return;
  editColorsModel.handpickColor(newColor, indexKey, activeImage.value.id);
}

function colorsResetHandler() {
  if (!activeImage.value) return;
  if (activeImage.value.croppedSrc) return;
  if (cantResetColors.value) return;

  editColorsModel.readColorsFromImage(activeImage.value.id);
}

const cantResetEditor = computed(() => {
  if (!activeImage.value) return true;
  const noCroppedImage = activeImage.value.croppedSrc === null;

  return cantResetColors.value && noCroppedImage && notEnoughPointersToCrop.value;
});

const widthPercent = ref(100);
const heightPercent = ref(100);
</script>

<template>
  <Transition
    name="fade"
  >
    <div
      v-if="isEditorActive && activeImage"
      class="fixed w-full h-full top-0 left-0 flex flex-nowrap items-center justify-center z-30"
    >
      <div
        class="absolute top-0 left-0 w-full h-full bg-opacity-75 bg-black"
      />
      <div
        class="w-10/12 h-5/6 relative flex flex-col"
      >
        <ImageCropper
          ref="cropper"
          :image="activeImage"
          :size="{ width: widthPercent, height: heightPercent }"
          @onCrop="setImageCroppedSrc"
          @onResize="setImageCroppedSrc(null)"
        />
      </div>
      <div
        v-if="cropper"
        class="relative h-5/6 ml-5 flex flex-col gap-2 justify-between items-stretch"
      >
        <div
          class="bg-gradient-to-br from-slate-100/25 to-slate-400/25 rounded-lg shadow-lg px-2 py-2 flex flex-col gap-2"
        >
          <div class="flex flex-nowrap gap-2">
            <NSwitch
              size="medium"
              :round="false"
              :disabled="!cropperInfraData.isEditingModeFlag.value"
              :value="cropperInfraData.isDrawingModeFlag.value"
              :defaultValue="cropperInfraData.isDrawingModeFlag.value"
              @update:value="setImageCroppedSrc(null); cropper.toggleDrawing()"
            >
              <template #icon>
                <Lasso :size="16" />
              </template>
            </NSwitch>
            <NButton
              type="primary"
              class="!font-mono"
              size="tiny"
              :disabled="notEnoughPointersToCrop"
              @click="cropper.crop"
            >
              <span class="px-1.5">
                <Crop :size="16" />
              </span>
            </NButton>
          </div>

          <div class="flex flex-nowrap gap-2">
            <NButton
              type="error"
              class="!font-mono"
              size="tiny"
              :disabled="cantUndo"
              @click="cropper.undo"
            >
              <span class="px-1.5">
                <Undo2 :size="16" />
              </span>
            </NButton>
            <NButton
              type="error"
              class="!font-mono"
              size="tiny"
              :disabled="cantRedo"
              @click="cropper.redo"
            >
              <span class="px-1.5">
                <Redo2 :size="16" />
              </span>
            </NButton>
          </div>
          <NButton
            type="error"
            class="!font-mono"
            size="tiny"
            :disabled="cantResetEditor"
            @click=" colorsResetHandler(); setImageCroppedSrc(null); cropper.reset()"
          >
            <span class="px-1.5">
              <RotateCcw :size="16" />
            </span>
          </NButton>
        </div>

        <div
          v-if="hasSomeColors"
          class="bg-gradient-to-br from-slate-100/25 to-slate-400/25 rounded-lg shadow-lg px-2 py-2 flex flex-col gap-2 w-full transition-all"
        >
          <ColorsList
            :colors="editColorsModel.getColorsByImageId(activeImage.id)"
            compact
          >
            <template #color="{ imageColor, indexKey }">
              <ColorEditor
                :colorIndex="indexKey"
                :imageColor="imageColor"
                compact
                @onDelete="colorsModel.removeColor(activeImage.id, indexKey)"
                @onColorPick="(newColor) => colorPickHandler(newColor, indexKey)"
                @onResetHandpicked="editColorsModel.clearHandpickedColor"
              >
                <ColorCell :color="imageColor" />
              </ColorEditor>
            </template>
          </ColorsList>
        </div>

        <div
          class="bg-gradient-to-br from-slate-100/25 to-slate-400/25 rounded-lg shadow-lg px-2 py-2 flex flex-col gap-2"
        >
          <NPopover
            displayDirective="show"
            trigger="hover"
            class="!font-mono"
            placement="left-start"
            raw
            :showArrow="false"
            :style="{ marginRight: '0.75rem' }"
          >
            <template #trigger>
              <NButton
                size="tiny"
                type="info"
                class="!font-mono"
              >
                Ratio
                <template #icon>
                  <Scaling :size="16" />
                </template>
              </NButton>
            </template>

            <div
              class="bg-gradient-to-br from-slate-100/25 to-slate-400/25 rounded-lg shadow-lg py-2 px-3.5 flex-nowrap w-56"
            >
              <RatioSliders
                v-model:width="widthPercent"
                v-model:height="heightPercent"
              />
            </div>
          </NPopover>
          <NButton
            type="error"
            class="!font-mono"
            size="tiny"
            iconPlacement="left"
            @click="setEditorState('closed'); setActiveImage(null); emit('onClose')"
          >
            Close
            <template #icon>
              <X :size="16" />
            </template>
          </NButton>
        </div>
      </div>
    </div>
  </Transition>
</template>
