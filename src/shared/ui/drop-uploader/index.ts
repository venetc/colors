import { defineAsyncComponent } from 'vue';

export const DropUploader = defineAsyncComponent(() => (import('./ui.vue')));
