import type { RouteRecordRaw } from 'vue-router';
import { defineAsyncComponent } from 'vue';
import { storeToRefs } from 'pinia';
import { useImagesStore } from '@/entities/image';

export const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Main',
    components: {
      default: () => import(/* webpackChunkName: "MainPage" */'./main'),
    },
  },
  {
    path: '/colors',
    name: 'Colors',
    components: {
      default: () => import(/* webpackChunkName: "ColorsPage" */'./colors'),
    },
    beforeEnter: () => {
      const store = useImagesStore();
      const { images } = storeToRefs(store);

      if (images.value.size < 1)
        return { path: '/' };
    },
  },
  {
    path: '/test',
    name: 'Test',
    components: {
      default: () => import(/* webpackChunkName: "TestPage" */'./test/TestPage.vue'),
    },
  },
];

export const AppRouting = defineAsyncComponent(() => (import('./AppRouting.vue')));
