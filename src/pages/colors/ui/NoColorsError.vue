<script setup lang="ts">
import { RotateCcw } from 'lucide-vue-next';
import { NButton } from 'naive-ui';
</script>

<template>
  <div>
    Hover over any image card and click
    <NButton
      size="tiny"
      type="error"
      class="pointer-events-none inline-block align-top"
    >
      <template #icon>
        <RotateCcw :size="16" />
      </template>
    </NButton>
    to get some colors.
  </div>
</template>
