<script setup lang="ts">
import hljsVuePlugin from '@highlightjs/vue-plugin';
import { toRefs } from 'vue';

const props = defineProps<{ code: string }>();

const { code } = toRefs(props);
const { component: HighlightComponent } = hljsVuePlugin;
</script>

<template>
  <HighlightComponent
    class="text-xs"
    :code="code"
  />
</template>
