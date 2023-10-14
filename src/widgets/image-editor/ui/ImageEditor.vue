<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { NButton, NPopover, NSwitch } from 'naive-ui';
import { Crop, Lasso, Redo2, RotateCcw, Scaling, Undo2, X } from 'lucide-vue-next';
import { useImageEditorStore } from '../model';
import { ColorsEditor, useColorsStore } from '@/entities/color';
import type { ExposedCropperData } from '@/features/image/crop-image';
import {
  ImageCropper,
  ratioSelectHandler,
  ratios,
  selectedRatio,
} from '@/features/image/crop-image';

const emit = defineEmits<{
  onClose: [];
  onReset: [];
}>();

const imageEditorStore = useImageEditorStore();
const {
  isEditorActive,
  activeImage,
  activeImageToken,
} = storeToRefs(imageEditorStore);
const {
  setEditorState,
  setActiveImage,
  setImageCroppedSrc,
} = imageEditorStore;

const colorsStore = useColorsStore();
const { amountOfColors } = colorsStore;

const cropper = ref<InstanceType<typeof ImageCropper> & ExposedCropperData>();

const cropperData = ref({
  currentPointers: 0,
  undoPointers: 0,
  redoPointers: 0,
  isDrawingMode: false,
  isEditing: true,
  isCropped: false,
  canvasIsHidden: false,
});

function setCropperData(payload: typeof cropperData.value) {
  cropperData.value = payload;
}
</script>

<template>
  <Transition
    name="fade"
  >
    <div
      v-if="isEditorActive && activeImage && activeImageToken"
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
          @onCrop="setImageCroppedSrc"
          @onResize="setImageCroppedSrc"
          @onDataChange="setCropperData($event)"
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
              :disabled="!cropperData.isEditing"
              :value="cropper.isDrawingMode.value"
              @update:value="setImageCroppedSrc(); cropper.toggleDrawing()"
            >
              <template #icon>
                <Lasso :size="16" />
              </template>
            </NSwitch>
            <NButton
              type="primary"
              class="!font-mono"
              size="tiny"
              :disabled="cropperData.currentPointers < 3"
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
              :disabled="cropperData.isDrawingMode || cropperData.undoPointers < 1"
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
              :disabled="cropperData.isDrawingMode || cropperData.redoPointers <= 0"
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
            @click="setImageCroppedSrc(); cropper.reset()"
          >
            <span class="px-1.5">
              <RotateCcw :size="16" />
            </span>
          </NButton>
        </div>

        <div
          v-if="amountOfColors(activeImageToken) > 0"
          class="bg-gradient-to-br from-slate-100/25 to-slate-400/25 rounded-lg shadow-lg px-2 py-2 flex flex-col gap-2 w-full transition-all"
        >
          <ColorsEditor
            :imageToken="activeImageToken"
            :compact="true"
          />
        </div>

        <div
          class="bg-gradient-to-br from-slate-100/25 to-slate-400/25 rounded-lg shadow-lg px-2 py-2 flex flex-col gap-2"
        >
          <NPopover
            trigger="hover"
            class="!font-mono"
            placement="left"
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
              class="flex flex-col gap-2 bg-gradient-to-br from-slate-100/25 to-slate-400/25 rounded-lg shadow-lg pl-2 pr-3.5 py-2 flex-nowrap"
            >
              <div
                v-for="variant in ratios"
                :key="variant.label"
                class="text-white text-sm cursor-pointer flex flex-nowrap justify-between items-center gap-1 transition-all"
                :class="[selectedRatio.value === variant.value ? 'opacity-100 translate-x-1' : 'opacity-50']"
                @click="cropper.reset(); ratioSelectHandler(variant)"
              >
                {{ variant.label }}
              </div>
            </div>
          </NPopover>
          <NButton
            type="error"
            class="!font-mono"
            size="tiny"
            iconPlacement="left"
            @click="setEditorState('closed'); setActiveImage(undefined); emit('onClose')"
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