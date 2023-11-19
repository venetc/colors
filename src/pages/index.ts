import { ColorsPageHeader } from './colors';
import { SortPageHeader } from './sort';
import { SavePageHeader } from './save';

import { storeToRefs } from 'pinia';
import { defineAsyncComponent } from 'vue';

import type { RouteRecordRaw } from 'vue-router';

import { useColors } from '@/entities/color';
import { useImages } from '@/entities/image';

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
      const imagesModel = useImages();
      const { images } = storeToRefs(imagesModel);

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
      const colorsModel = useColors();
      const { colors } = storeToRefs(colorsModel);

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
      const colorsModel = useColors();
      const { colors } = storeToRefs(colorsModel);

      if (colors.value.size < 1) return { path: '/' };
    },
    props: {
      header: { content: SavePageHeader },
    },
  },
];

export const AppRouting = defineAsyncComponent(() => (import('./AppRouting.vue')));
