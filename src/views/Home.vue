<template>
  <div class="home-page">
    <div class="hero-section">
      <h1 class="hero-title">Welcome to MyApps</h1>
      <p class="hero-subtitle">A collection of useful applications</p>
    </div>

    <div class="apps-grid">
      <div 
        v-for="app in apps" 
        :key="app.id"
        class="app-card"
        @click="navigateToApp(app.route)"
      >
        <div class="app-icon">
          <span class="icon-emoji">{{ app.icon }}</span>
        </div>
        <h2 class="app-title">{{ app.name }}</h2>
        <p class="app-description">{{ app.description }}</p>
        <button class="app-button">Open App</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

interface App {
  id: string
  name: string
  description: string
  icon: string
  route: string
}

const router = useRouter()

const apps = ref<App[]>([
  {
    id: 'read-tracker',
    name: 'Read Tracker',
    description: 'Track your reading time, manage books, set goals, and build better reading habits.',
    icon: '📚',
    route: '/read-tracker'
  }
  // More apps can be added here in the future
])

const navigateToApp = (route: string): void => {
  router.push(route)
}
</script>

<style scoped>
.home-page {
  padding: 2rem 0;
}

.hero-section {
  text-align: center;
  margin-bottom: 3rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #666;
}

.apps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.app-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.app-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.app-icon {
  margin-bottom: 1rem;
}

.icon-emoji {
  font-size: 3rem;
  display: inline-block;
}

.app-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.75rem;
}

.app-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.app-button {
  background-color: #6366f1;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
}

.app-button:hover {
  background-color: #4f46e5;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .apps-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>
