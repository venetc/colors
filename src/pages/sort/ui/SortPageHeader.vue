<script setup lang="ts">
import { MoveLeft, MoveRight } from 'lucide-vue-next';
import { NButton } from 'naive-ui';
</script>

<template>
  <div class="w-full flex flex-nowrap items-center justify-between">
    <RouterLink
      v-slot="{ navigate }"
      :to="{ name: 'Colors' }"
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

    <div class="select-none font-mono">
      Drag&Drop color cells in and out of groups.
    </div>

    <RouterLink
      v-slot="{ navigate }"
      :to="{ name: 'Save' }"
      custom
    >
      <NButton
        size="medium"
        text
        class="!font-mono"
        iconPlacement="right"
        @click="navigate"
      >
        Save your data!
        <template #icon>
          <MoveRight />
        </template>
      </NButton>
    </RouterLink>
  </div>
</template>
