<script setup lang="ts">
import { computed, toRefs } from 'vue';
import { beforeLeaveWorkaround } from '@/shared/lib/crutch';
import type { ColorCollection, ImageColor } from '@/entities/color';

const props = defineProps<{ colors?: ColorCollection; compact?: boolean }>();

const { compact, colors } = toRefs(props);

const _colors = computed(() => {
  if (!colors?.value) return [] as Array<[number, ImageColor]>;

  return [...colors.value.entries()].filter(([_, value]) => (value !== null)) as Array<[number, ImageColor]>;
});
</script>

<template>
  <TransitionGroup
    v-if="colors"
    name="colors-list"
    appear
    @beforeLeave="beforeLeaveWorkaround"
  >
    <div
      v-for="[indexKey, imageColor] in _colors"
      :key="indexKey"
    >
      <template v-if="imageColor">
        <div :class="[compact ? 'w-[88px] h-9' : 'w-8 h-12 xl:w-12 xl:h-12']">
          <slot
            name="color"
            v-bind="{ imageColor, indexKey }"
          />
        </div>
      </template>
    </div>
  </TransitionGroup>
</template>

<style scoped>
.colors-list-move,
.colors-list-enter-active,
.colors-list-leave-active {
  transition: all 0.3s ease;
}

.colors-list-enter-from,
.colors-list-leave-to {
  opacity: 0;
}

.colors-list-leave-active {
  position: absolute;
}
</style>
