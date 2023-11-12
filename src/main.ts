import { createApp, markRaw } from 'vue';
import type { Router } from 'vue-router';
import type { PiniaPluginContext } from 'pinia';
import { AppRoot } from '@/app';
import { highlight, pinia, router } from '@/app/providers';
import '@/style.css';

declare module 'pinia' {
  export interface PiniaCustomProperties {
    router: Router;
  }
}

pinia.use(({ store }: PiniaPluginContext) => {
  store.router = markRaw(router);
});

const meta = document.createElement('meta');
meta.name = 'naive-ui-style';
document.head.appendChild(meta);

createApp(AppRoot)
  .use(pinia)
  .use(router)
  .use(highlight)
  .mount('#app');
