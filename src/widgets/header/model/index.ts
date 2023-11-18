import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useHeader = defineStore('Widgets/AppHeader', () => {
  const isHeaderActive = ref(true);

  return { isHeaderActive };
});
