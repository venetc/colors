import { defineAsyncComponent } from 'vue';

export const ColorsGroupCard = defineAsyncComponent(() => (import('./ColorsGroupCard.vue')));
export const ColorsGroupDropdown = defineAsyncComponent(() => (import('./ColorsGroupDropdown.vue')));
