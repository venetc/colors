import type { RouteRecordRaw } from 'vue-router';
import { defineAsyncComponent } from 'vue';
import { storeToRefs } from 'pinia';
import { ColorsPageHeader } from './colors';
import { SortPageHeader } from './sort';
import { SavePageHeader } from './save';
import { useColorsStore } from '@/entities/color';
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
      const imagesStore = useImagesStore();
      const { images } = storeToRefs(imagesStore);

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
    beforeEnter: () => {
      const colorsStore = useColorsStore();
      const { colors } = storeToRefs(colorsStore);

      if (colors.value.size < 1) return { path: '/' };
    },
    props: {
      header: { content: SortPageHeader },
    },
  },
  {
    path: '/save',
    name: 'Save',
    components: {
      default: () => import(/* webpackChunkName: "SaveColorsPage" */'./save'),
      header: () => import(/* webpackChunkName: "SavePageHeader" */'../widgets/header'),
    },
    beforeEnter: () => {
      const colorsStore = useColorsStore();
      const { colors } = storeToRefs(colorsStore);

      if (colors.value.size < 1) return { path: '/' };
    },
    props: {
      header: { content: SavePageHeader },
    },
  },
];

export const AppRouting = defineAsyncComponent(() => (import('./AppRouting.vue')));
