import type { RouteRecordRaw } from 'vue-router';
import { defineAsyncComponent } from 'vue';
import { storeToRefs } from 'pinia';
import { ColorsPageHeader } from './colors';
import { SortPageHeader } from './sort';
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
      header: () => import(/* webpackChunkName: "MainPageHeader" */'../widgets/header'),
    },
    props: {
      header: { content: ColorsPageHeader },
    },
    beforeEnter: () => {
      const store = useImagesStore();
      const { images } = storeToRefs(store);

      if (images.value.size < 1) return { path: '/' };
    },
  },
  {
    path: '/sort',
    name: 'Sort',
    components: {
      default: () => import(/* webpackChunkName: "SortColorsPage" */'./sort'),
      header: () => import(/* webpackChunkName: "SortPageHeader" */'../widgets/header'),
    },
    props: {
      header: { content: SortPageHeader },
    },
  },
];

export const AppRouting = defineAsyncComponent(() => (import('./AppRouting.vue')));
