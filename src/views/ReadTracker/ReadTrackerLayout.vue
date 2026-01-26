<template>
  <div class="w-full">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">📚 Read Tracker</h1>
      <p class="text-gray-600">Track your reading time and build better reading habits</p>
    </div>
    
    <nav class="flex gap-2 mb-8 border-b-2 border-gray-200 overflow-x-auto">
      <router-link
        v-for="item in navItems"
        :key="item.route"
        :to="item.route"
        class="px-4 py-3 text-gray-600 font-medium border-b-2 border-transparent -mb-0.5 transition-colors hover:text-primary-600 whitespace-nowrap"
        active-class="text-primary-600 border-primary-600"
      >
        {{ item.label }}
      </router-link>
    </nav>

    <div class="min-h-[400px]">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface NavItem {
  label: string
  route: string
}

const navItems = ref<NavItem[]>([
  { label: 'Dashboard', route: '/read-tracker/dashboard' },
  { label: 'Sessions', route: '/read-tracker/sessions' },
  { label: 'Books', route: '/read-tracker/books' },
  { label: 'Goals', route: '/read-tracker/goals' },
  { label: 'Settings', route: '/read-tracker/settings' }
])
</script>
