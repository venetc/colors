<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
  <main class="grow container mx-auto py-10">
    <RouterView v-slot="{ Component, route }">
      <Transition
        mode="out-in"
        name="fade"
        appear
      >
        <component
          :is="Component"
          :key="route.fullPath"
        />
      </Transition>
    </RouterView>
  </main>
</template>
