import { defineAsyncComponent } from 'vue';

export const ReadColorsModal = defineAsyncComponent(() => (import('./ui/ReadColorsModal.vue')));

export * from './model';
