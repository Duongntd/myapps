<template>
  <header class="app-header">
    <div class="header-content">
      <router-link to="/" class="logo">
        <h1>MyApps</h1>
      </router-link>
      <nav class="nav">
        <router-link to="/" class="nav-link">Home</router-link>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
</script>

<style scoped>
.app-header {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  text-decoration: none;
  color: #333;
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #6366f1;
}

.nav {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: #666;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #6366f1;
}

.nav-link.router-link-active {
  color: #6366f1;
}

@media (max-width: 768px) {
  .header-content {
    padding: 1rem;
  }

  .logo h1 {
    font-size: 1.25rem;
  }
}
</style>
