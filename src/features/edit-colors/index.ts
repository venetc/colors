import { defineAsyncComponent } from 'vue';

export const ReadColorsModal = defineAsyncComponent(() => (import('./ui/ReadColorsModal.vue')));
export const ColorEditor = defineAsyncComponent(() => (import('./ui/ColorEditor.vue')));

export * from './model.ts';
