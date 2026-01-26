<template>
  <header class="bg-white shadow-sm sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
      <div class="flex justify-between items-center h-14 sm:h-16">
        <router-link to="/" class="flex items-center">
          <h1 class="text-lg sm:text-xl font-bold text-primary-600">MyApps</h1>
        </router-link>
        <nav class="flex items-center gap-2 sm:gap-4">
          <router-link
            to="/"
            class="text-sm sm:text-base text-gray-600 hover:text-primary-600 font-medium transition-colors px-2 py-1 rounded"
            active-class="text-primary-600"
          >
            <span class="hidden sm:inline">{{ $t('common.home') }}</span>
            <span class="sm:hidden">🏠</span>
          </router-link>
          <LanguageSelector />
          <div v-if="authStore.loading" class="px-2 sm:px-4">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
          </div>
          <GoogleLoginButton v-else-if="!authStore.isAuthenticated && !authStore.localMode" />
          <LocalModeProfile v-else-if="authStore.localMode || authStore.syncingFromLocal" />
          <UserProfile v-else-if="authStore.user && !authStore.syncingFromLocal" />
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import GoogleLoginButton from '@/components/auth/GoogleLoginButton.vue'
import UserProfile from '@/components/auth/UserProfile.vue'
import LocalModeProfile from '@/components/auth/LocalModeProfile.vue'
import LanguageSelector from '@/components/common/LanguageSelector.vue'

const authStore = useAuthStore()
</script>
