<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
    <main class="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from './AppHeader.vue'
</script>
