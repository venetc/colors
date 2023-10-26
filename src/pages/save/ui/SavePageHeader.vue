<script setup lang="ts">
import { MoveLeft } from 'lucide-vue-next';
import { NButton } from 'naive-ui';
</script>

<template>
  <div class="w-full flex flex-nowrap items-center justify-between">
    <RouterLink
      v-slot="{ navigate }"
      :to="{ name: 'Sort' }"
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
  </div>
</template>
