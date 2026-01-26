<template>
  <div class="py-4 sm:py-6 lg:py-8">
    <div class="text-center mb-8 sm:mb-12">
      <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2">{{ $t('app.welcome') }}</h1>
      <p class="text-base sm:text-xl text-gray-600">{{ $t('app.subtitle') }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="authStore.loading" class="mb-8 sm:mb-12">
      <div class="max-w-2xl mx-auto text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p class="text-sm text-gray-600">{{ $t('common.loading') }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      <div
        v-for="app in apps"
        :key="app.id"
        class="bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all cursor-pointer border border-gray-200 hover:border-primary-300 touch-manipulation"
        @click="navigateToApp(app.route)"
      >
        <div class="text-4xl sm:text-5xl mb-3 sm:mb-4">{{ app.icon }}</div>
        <h2 class="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">{{ app.name }}</h2>
        <p class="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">{{ app.description }}</p>
          <button class="w-full bg-primary-600 text-white py-2.5 sm:py-2 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors text-sm sm:text-base touch-manipulation">
            {{ $t('home.readTracker.openApp') }}
          </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

interface App {
  id: string
  name: string
  description: string
  icon: string
  route: string
}

const router = useRouter()
const authStore = useAuthStore()

const { t } = useI18n()

const apps = ref<App[]>([
  {
    id: 'read-tracker',
    name: t('home.readTracker.name'),
    description: t('home.readTracker.description'),
    icon: '📚',
    route: '/read-tracker'
  }
  // More apps can be added here in the future
])

const navigateToApp = (route: string): void => {
  router.push(route)
}
</script>
