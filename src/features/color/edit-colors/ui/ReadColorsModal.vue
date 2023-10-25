<script setup lang="ts">
import { NCard, NModal, NProgress, useThemeVars } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useEditColors } from '@/features/color/edit-colors';
import { useColorsStore } from '@/entities/color';
import { useImagesStore } from '@/entities/image';
import { valueToPercent } from '@/shared/lib/number';

const colorsModel = useColorsStore();
const imagesModel = useImagesStore();
const editColorsModel = useEditColors();

const { colors } = storeToRefs(colorsModel);
const { images } = storeToRefs(imagesModel);
const { colorReadModalIsActive } = storeToRefs(editColorsModel);

const themeVars = useThemeVars();

const percentage = computed(() => (~~valueToPercent(colors.value.size, 0, images.value.size)));

/* TODO refactor */
function asyncWrap(cb: () => void): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      cb();
      resolve();
    }, 100);
  });
}

async function onInitHandler() {
  for await (const imageId of images.value.keys()) {
    if (!colors.value.has(imageId)) {
      await asyncWrap(() => {
        editColorsModel.readColorsFromImage(imageId);
      });
    }
  }

  editColorsModel.setColorReadModalIsActive(false);
}

const { push } = useRouter();

function leaveHandler() {
  push({ name: 'Sort' });
}
</script>

<template>
  <NModal
    displayDirective="if"
    :show="colorReadModalIsActive"
    :blockScroll="true"
    :closeOnEsc="false"
    :maskClosable="false"
    :onAfterEnter="onInitHandler"
    :onAfterLeave="leaveHandler"
  >
    <NCard
      style="width: 600px"
      title="Reading colors"
      :bordered="false"
      size="large"
      role="dialog"
      aria-modal="true"
      class="!font-mono"
    >
      <NProgress
        type="line"
        :showIndicator="false"
        :percentage="percentage"
        status="default"
        :color="themeVars.successColor"
        processing
      />
    </NCard>
  </NModal>
</template>
