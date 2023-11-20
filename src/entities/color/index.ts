import { defineAsyncComponent } from 'vue';

export const ColorsList = defineAsyncComponent(() => (import('./ui/ColorsList.vue')));
export const ColorCell = defineAsyncComponent(() => (import('./ui/ColorCell.vue')));

export * from './model';
export * from './lib';
