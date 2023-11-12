import { defineAsyncComponent } from 'vue';

export const ExportDataConfig = defineAsyncComponent(() => (import('./ui/ExportDataConfig.vue')));
