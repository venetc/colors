<script setup lang="ts">
import { Group, Plus, RotateCcw, Sparkles, Ungroup } from 'lucide-vue-next';
import { storeToRefs } from 'pinia';
import { computed, markRaw, onBeforeMount, onMounted, ref } from 'vue';
import { NButton } from 'naive-ui';

import { beforeLeaveWorkaround } from '@/shared/lib/crutch';
import { useColors } from '@/entities/color';
import { ColorsGroupCard, useColorGroups } from '@/entities/colors-group';
import { useColorsSort } from '@/features/sort-colors';
import { SortableColorsChunks } from '@/widgets/sortable-colors-chunks';
import { SortableColorsList } from '@/widgets/sortable-colors-list';

const colorsModel = useColors();
const sortedColorsModel = useColorsSort();
const colorGroupsModel = useColorGroups();

const { colorGroups } = storeToRefs(colorGroupsModel);
const { colors } = storeToRefs(colorsModel);

const _newColorGroup = [{
  title: 'Add new group',
  handler: colorGroupsModel.addColorGroup,
}];

const showGroups = ref(true);
const showGroupsIcon = computed(() => showGroups.value ? markRaw(Ungroup) : markRaw(Group));

function colorsViewToggleHandler() {
  showGroups.value = !showGroups.value;
}

onMounted(sortedColorsModel.invalidateColorGroups);

onBeforeMount(() => {
  if (colorGroups.value.size > 0) return;

  for (let i = 0; i < 3; i++) {
    colorGroupsModel.addColorGroup();
  }
});
</script>

<template>
  <section class="flex flex-col justify-between">
    <div
      class="flex flex-row justify-between font-mono text-xs h-full max-h-[calc(100vh-40px)]"
      @dragover="(e:Event) => e.preventDefault()"
      @drop.self="sortedColorsModel.dropHandler({ event: $event })"
    >
      <div
        class="custom-scroll will-change-transform pt-5 w-fit overflow-auto rounded-xl border-cyan scroll-space"
        dir="rtl"
        @dragover="(e:Event) => e.preventDefault()"
        @drop="sortedColorsModel.dropHandler({ event: $event })"
      >
        <Transition
          name="fade"
          mode="out-in"
        >
          <SortableColorsChunks
            v-if="showGroups"
            :colors="colors"
            dir="ltr"
            class="pb-16 pl-7 pr-3.5 grid gap-5"
          />
          <SortableColorsList
            v-else
            :colors="colors"
            dir="ltr"
            class="pb-3.5 pl-9 pt-4 pr-3.5 grid gap-1.5 place-items-start grid-cols-[repeat(2,_2.5rem)] 2xl:grid-cols-[repeat(2,_2.5rem)] xl:grid-cols-[repeat(2,_2rem)] lg:grid-cols-[repeat(2,_1.5rem)]"
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
            <ColorsGroupCard
              v-for="[id, group] in colorGroups"
              :key="id"
              :colorGroupId="id"
              :colorGroup="group"
              @onColorDrop="(event, targetGroupId) => sortedColorsModel.dropHandler({ event, targetGroupId })"
              @onColorDragStart="(event, pivotId, originGroupId) => sortedColorsModel.dragStartHandler({ originGroupId, pivotId, event })"
              @onDelete="colorGroupsModel.deleteColorGroupById"
              @onLeadColorPick="colorGroupsModel.changeLeadColor($event, id)"
              @onClear="colorGroupsModel.clearColorGroupById"
            />

            <div
              v-for="cta in _newColorGroup"
              :key="cta.title"
              class="cursor-pointer p-2 auto-rows-[2.5rem] 2xl:auto-rows-[2.5rem] xl:auto-rows-[2rem] lg:auto-rows-[1.5rem] grid gap-1.5 justify-items-center items-center grid-cols-[repeat(26,_2.5rem)] 2xl:grid-cols-[repeat(26,_2.5rem)] xl:grid-cols-[repeat(26,_2rem)] lg:grid-cols-[repeat(26,_1.5rem)] border-2  border-dashed w-full transition-all rounded-md text-navy-500/25 hover:text-navy-500/50 active:text-navy-500/75 border-navy-500/25 hover:border-navy-500/50 active:border-navy-500/75"
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
        @click="sortedColorsModel.resetSorting"
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
        @click="sortedColorsModel.autoSort"
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
