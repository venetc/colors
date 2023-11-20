<script setup lang="ts">
import hljsVuePlugin from '@highlightjs/vue-plugin';
import { toRefs } from 'vue';

const props = defineProps<{ code: string; raw?: boolean }>();

const { code, raw } = toRefs(props);
const { component: HighlightComponent } = hljsVuePlugin;
</script>

<template>
  <pre
    v-if="raw"
    :style="{ backgroundColor: '#1a1b26' }"
    class="text-xs p-3 text-navy-300"
  >{{ code }}</pre>

  <HighlightComponent
    v-else
    class="text-xs"
    :code="code"
    language="json"
  />
</template>
