import SortColorsPage from './ui/SortColorsPage.vue';

import { defineAsyncComponent } from 'vue';

export const SortPageHeader = defineAsyncComponent(() => (import('./ui/SortPageHeader.vue')));

export default SortColorsPage;
