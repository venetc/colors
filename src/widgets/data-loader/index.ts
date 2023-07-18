import { defineAsyncComponent } from 'vue';

export const DataLoader = defineAsyncComponent(() => (import('./ui/DataLoader.vue')));
export { useDataLoaderStore } from './model';
