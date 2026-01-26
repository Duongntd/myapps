<template>
  <div class="read-tracker-layout">
    <div class="read-tracker-header">
      <h1 class="app-title">📚 Read Tracker</h1>
      <p class="app-subtitle">Track your reading time and build better reading habits</p>
    </div>
    
    <nav class="read-tracker-nav">
      <router-link 
        v-for="item in navItems" 
        :key="item.route"
        :to="item.route"
        class="nav-item"
      >
        {{ item.label }}
      </router-link>
    </nav>

    <div class="read-tracker-content">
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

<style scoped>
.read-tracker-layout {
  width: 100%;
}

.read-tracker-header {
  margin-bottom: 2rem;
}

.app-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.app-subtitle {
  color: #666;
  font-size: 1rem;
}

.read-tracker-nav {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e5e7eb;
  overflow-x: auto;
}

.nav-item {
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  color: #666;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: color 0.2s;
  white-space: nowrap;
}

.nav-item:hover {
  color: #6366f1;
}

.nav-item.router-link-active {
  color: #6366f1;
  border-bottom-color: #6366f1;
}

.read-tracker-content {
  min-height: 400px;
}

@media (max-width: 768px) {
  .read-tracker-nav {
    gap: 0;
  }

  .nav-item {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
}
</style>
