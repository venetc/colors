<script setup lang="ts">
import { Group, Plus, RotateCcw, Sparkles, Ungroup } from 'lucide-vue-next';
import { storeToRefs } from 'pinia';
import { computed, onBeforeMount, onMounted, ref } from 'vue';
import { NButton } from 'naive-ui';
import GroupCard from './ColorsGroupCard.vue';
import { ColorGroupsList, ColorsList } from './organisms';
import { beforeLeaveWorkaround } from '@/shared/lib/crutch';
import { useSortedColorsStore } from '@/features/color/sort-colors';
import type { ColorHex } from '@/entities/color';
import { useColorsStore } from '@/entities/color';
import type { SchemeId } from '@/features/color/sort-colors';

import {
  getLuminance,
  hexToRGB,
  hslToCss,
  rgbToCss,
  rgbToHSL,
} from '@/shared/lib/color';

const colorsStore = useColorsStore();
const sortedColorsStore = useSortedColorsStore();

const { colorSchemes } = storeToRefs(sortedColorsStore);
const { colors } = storeToRefs(colorsStore);

const _newScheme = [{
  title: 'Add new group',
  handler: sortedColorsStore.addColorScheme,
}];

function leadColorChangeHandler(hex: ColorHex, id: SchemeId) {
  const targetScheme = colorSchemes.value.get(id);
  if (!targetScheme) return;

  const rgbArray = hexToRGB(hex);
  const rgb = rgbToCss(rgbArray);
  const hslArray = rgbToHSL(rgbArray);
  const hsl = hslToCss(hslArray);
  const luminance = getLuminance(rgbArray);

  targetScheme.leadColor = {
    hex,
    luminance,
    hsl,
    rgb,
    rgbArray,
    hslArray,
  };
}

onMounted(sortedColorsStore.invalidateSchemes);

onBeforeMount(() => {
  if (colorSchemes.value.size > 0) return;

  for (let i = 0; i < 3; i++) {
    sortedColorsStore.addColorScheme();
  }
});

const showGroups = ref(true);
const showGroupsIcon = computed(() => {
  return showGroups.value ? Ungroup : Group;
});

function colorsViewToggleHandler() {
  showGroups.value = !showGroups.value;
}
</script>

<template>
  <section class="flex flex-col justify-between">
    <div
      class="flex flex-row justify-between font-mono text-xs h-full max-h-[calc(100vh-40px)]"
      @dragover="(e:Event) => e.preventDefault()"
      @drop.self="sortedColorsStore.dropHandler({ event: $event })"
    >
      <div
        class="custom-scroll will-change-transform pt-5 w-fit overflow-auto rounded-xl border-cyan scroll-space"
        dir="rtl"
        @dragover="(e:Event) => e.preventDefault()"
        @drop="sortedColorsStore.dropHandler({ event: $event })"
      >
        <Transition
          name="fade"
          mode="out-in"
        >
          <ColorGroupsList
            v-if="showGroups"
            :colors="colors"
          />
          <ColorsList
            v-else
            :colors="colors"
          />
        </Transition>
      </div>
      <div
        class="custom-scroll will-change-transform pt-5 overflow-auto rounded-xl border-cyan scroll-space"
        dir="ltr"
      >
        <div class="cards-container pb-16 pr-7 flex flex-col items-center gap-5 relative">
          <TransitionGroup
            name="cards-list"
            @beforeLeave="beforeLeaveWorkaround"
          >
            <GroupCard
              v-for="[id, scheme] in colorSchemes"
              :id="id"
              :key="id"
              :scheme="scheme"
              @onColorDrop="(event, targetSchemaId) => sortedColorsStore.dropHandler({ event, targetSchemaId })"
              @onColorDragStart="(event, pivotId, originSchemaId) => sortedColorsStore.dragStartHandler({ originSchemaId, pivotId, event })"
              @onDelete="sortedColorsStore.deleteColorSchemeById"
              @onLeadColorPick=" leadColorChangeHandler($event, id)"
              @onClear="sortedColorsStore.clearColorSchemeById"
            />

            <div
              v-for="cta in _newScheme"
              :key="cta.title"
              class="cursor-pointer p-2 auto-rows-[2.5rem] 2xl:auto-rows-[2.5rem] xl:auto-rows-[2rem] lg:auto-rows-[1.5rem] grid gap-1.5 justify-items-center items-center grid-cols-[repeat(26,_2.5rem)] 2xl:grid-cols-[repeat(26,_2.5rem)] xl:grid-cols-[repeat(26,_2rem)] lg:grid-cols-[repeat(26,_1.5rem)] border-2  border-dashed w-full transition-all rounded-md text-[rgba(32,_128,_240,_0.15)] hover:text-[rgba(32,_128,_240,_0.25)] active:text-[rgba(32,_128,_240,_0.5)] border-[rgba(32,_128,_240,_0.15)] hover:border-[rgba(32,_128,_240,_0.25)] active:border-[rgba(32,_128,_240,_0.5)]"
              @click="cta.handler"
            >
              <Plus
                class="col-[13_/span_1]"
                :size="26"
              />
            </div>
          </TransitionGroup>
        </div>
      </div>
    </div>
    <div
      class="p-2 flex flex-nowrap items-center justify-center gap-3 rounded-md shadow-md bg-slate-100 fixed z-20 font-mono bottom-3 left-1/2 -translate-x-1/2"
    >
      <NButton
        size="small"
        type="info"
        class="!font-mono"
        @click="colorsViewToggleHandler"
      >
        <template #icon>
          <Transition
            name="fade"
            mode="out-in"
          >
            <component :is="showGroupsIcon" />
          </Transition>
        </template>
        <template #default>
          <Transition
            name="fade"
            mode="out-in"
          >
            <span v-if="showGroups">Split</span>
            <span v-else>Group</span>
          </Transition>
        </template>
      </NButton>
      <NButton
        size="small"
        type="error"
        class="!font-mono"
        @click="sortedColorsStore.resetSorting"
      >
        <template #icon>
          <RotateCcw />
        </template>
        <template #default>
          Reset
        </template>
      </NButton>
      <NButton
        size="small"
        type="success"
        class="!font-mono"
        @click="sortedColorsStore.autoSort"
      >
        <template #icon>
          <Sparkles />
        </template>
        <template #default>
          AutoSort
        </template>
      </NButton>
    </div>
  </section>
</template>

<style scoped>
.cards-list-move,
.cards-list-enter-active,
.cards-list-leave-active {
  transition: all 0.25s ease-in-out;
}

.cards-list-enter-from,
.cards-list-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.cards-list-leave-active {
  position: absolute;
}
</style>
