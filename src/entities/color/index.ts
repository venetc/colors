import { defineAsyncComponent } from 'vue';

export const ColorsList = defineAsyncComponent(() => (import('./ui/ColorsList.vue')));
export { default as ColorsChunkCell } from './ui/ColorsChunkCell.vue';

export * from './model';
export * from './lib';
