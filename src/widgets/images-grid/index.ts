import { defineAsyncComponent } from 'vue';

export const ImagesGrid = defineAsyncComponent(() => (import('./ui.vue')));
