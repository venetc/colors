import { defineAsyncComponent } from 'vue';
import SortColorsPage from './ui/SortColorsPage.vue';

export const SortPageHeader = defineAsyncComponent(() => (import('./ui/SortPageHeader.vue')));

export default SortColorsPage;
