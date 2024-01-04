<script setup lang="ts">
import { RouterView } from 'vue-router'
import {ref} from "vue";
import {darkTheme, type GlobalTheme, NConfigProvider} from "naive-ui";

const theme = ref<GlobalTheme | null>(darkTheme);
</script>

<template>
  <Suspense>
    <n-config-provider :theme="theme">
      <RouterView />
    </n-config-provider>
  </Suspense>
</template>
