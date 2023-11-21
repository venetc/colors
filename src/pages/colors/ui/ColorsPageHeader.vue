<script setup lang="ts">
import NoColorsError from './NoColorsError.vue';

import { markRaw } from 'vue';
import { useRouter } from 'vue-router';
import { MoveLeft, MoveRight } from 'lucide-vue-next';
import { NButton } from 'naive-ui';

import { useNotificationManager } from '@/shared/ui/notification';
import { useColors } from '@/entities/color';

const {
  callNotification,
  deleteNotifications,
} = useNotificationManager({
  type: 'error',
  title: 'No colors!',
  content: markRaw(NoColorsError),
});
const colorsModel = useColors();

const router = useRouter();

function navigateHandler() {
  const amountOfColors = colorsModel.getGlobalAmountOfColors();

  if (amountOfColors > 0) {
    deleteNotifications();
    router.push({ name: 'Sort' });
  } else {
    callNotification();
  }
}
</script>

<template>
  <div class="w-full flex flex-nowrap items-center justify-between">
    <RouterLink
      v-slot="{ navigate }"
      :to="{ name: 'Main' }"
      custom
    >
      <NButton
        size="large"
        text
        @click="navigate"
      >
        <template #icon>
          <MoveLeft />
        </template>
      </NButton>
    </RouterLink>

    <NButton
      size="medium"
      text
      class="!font-mono"
      iconPlacement="right"
      @click="navigateHandler"
    >
      Sort colors!
      <template #icon>
        <MoveRight />
      </template>
    </NButton>
  </div>
</template>
