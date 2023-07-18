<script setup lang="ts">
import { NConfigProvider, NGlobalStyle, NMessageProvider } from 'naive-ui';
import { AppRouting } from '@/pages';

const themeOverrides = {
  common: {
    fontFamily: 'Inter',
    fontFamilyMono: 'Fira Code',
  },
};
</script>

<template>
  <NConfigProvider
    :themeOverrides="themeOverrides"
    inlineThemeDisabled
    abstract
  >
    <NMessageProvider
      placement="top-left"
      :duration="10000"
    >
      <NGlobalStyle />
      <AppRouting />
    </NMessageProvider>
  </NConfigProvider>
</template>
