import { defineAsyncComponent } from 'vue';
import ColorsPage from './ui/ColorsPage.vue';

export const ColorsPageHeader = defineAsyncComponent(() => (import('./ui/ColorsPageHeader.vue')));
export default ColorsPage;
