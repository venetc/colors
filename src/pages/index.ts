import type { RouteRecordRaw } from 'vue-router';
import { storeToRefs } from 'pinia';
import { defineAsyncComponent } from 'vue';
import { useDataLoaderStore } from '@/widgets/data-loader';

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
      const store = useDataLoaderStore();
      const { parsedImagesCount } = storeToRefs(store);

      if (parsedImagesCount.value < 1)
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
