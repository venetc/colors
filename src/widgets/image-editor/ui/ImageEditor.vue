<script setup lang="ts">
import { storeToRefs } from 'pinia';
import type { CSSProperties } from 'vue';
import { ref } from 'vue';
import { NButton, NSwitch } from 'naive-ui';
import { Lasso } from 'lucide-vue-next';
import { useImageEditorStore } from '../model';
import type { ExposedCropperData } from '@/features/image/crop-image';
import { ImageCropper } from '@/features/image/crop-image';

const emit = defineEmits<{
  onClose: [];
}>();

const imageEditorStore = useImageEditorStore();
const {
  isEditorActive,
  activeImage,
} = storeToRefs(imageEditorStore);
const { setEditorState } = imageEditorStore;

const cropper = ref<InstanceType<typeof ImageCropper> & ExposedCropperData>();

function railStyle({
  focused,
  checked,
}: {
  focused: boolean;
  checked: boolean;
}) {
  const style: CSSProperties = {};
  if (checked) {
    style.background = '#d03050';
    if (focused) {
      style.boxShadow = '0 0 0 2px #d0305040';
    }
  } else {
    style.background = '#18a058';
    if (focused) {
      style.boxShadow = '0 0 0 2px #18a058';
    }
  }
  return style;
}
</script>

<template>
  <Transition
    name="fade"
  >
    <div
      v-if="isEditorActive && activeImage"
      class="fixed w-full h-full top-0 left-0 flex flex-nowrap items-center justify-center"
    >
      <div
        class="absolute top-0 left-0 w-full h-full bg-opacity-75 bg-black"
        @click="setEditorState('closed'); emit('onClose')"
      />
      <div
        class="w-10/12 h-5/6 relative flex flex-col"
      >
        <ImageCropper
          ref="cropper"
          :image="activeImage"
        />
      </div>
      <div
        v-if="cropper"
        class="relative h-5/6 ml-5"
      >
        <div class="bg-gradient-to-br from-gray-100/25 to-gray-400/25 rounded-lg shadow-lg px-2 py-2 flex flex-col gap-2">
          <NSwitch
            size="medium"
            :round="false"
            :disabled="!cropper.isEditing"
            :value="cropper.isDrawingMode.value"
            @update:value="cropper.toggleDrawing"
          >
            <template #icon>
              <Lasso :size="16" />
            </template>
          </NSwitch>
          <NButton
            type="primary"
            class="!font-mono"
            size="tiny"
            @click="cropper.crop"
          >
            Crop
          </NButton>
        </div>
      </div>
    </div>
  </Transition>
</template>
