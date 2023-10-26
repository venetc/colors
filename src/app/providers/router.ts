import type { RouteRecordRaw, Router } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';
import { routes } from '@/pages';

export const router: Router = createRouter({
  history: createWebHistory('/'),
  routes: routes as RouteRecordRaw[],
});
