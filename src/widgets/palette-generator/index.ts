import { defineAsyncComponent } from 'vue';

export const PaletteGenerator = defineAsyncComponent(() => (import('./ui/PaletteGenerator.vue')));

export * from './model';
