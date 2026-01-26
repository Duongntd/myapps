<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-2xl font-semibold text-gray-900">{{ $t('settings.title') }}</h2>
      <p class="text-sm text-gray-600 mt-1">{{ $t('settings.subtitle') }}</p>
    </div>

    <!-- Account Settings -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('settings.account') }}</h3>
      <div class="space-y-4">
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p class="font-medium text-gray-900">{{ $t('settings.signedInAs') }}</p>
            <p class="text-sm text-gray-600 mt-1">{{ authStore.user?.email }}</p>
            <p v-if="authStore.user?.displayName" class="text-sm text-gray-600">{{ authStore.user.displayName }}</p>
          </div>
          <div v-if="authStore.user?.photoURL" class="flex-shrink-0">
            <img
              :src="authStore.user.photoURL"
              :alt="authStore.user.displayName || 'User'"
              class="w-16 h-16 rounded-full"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- App Information -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('settings.about') }}</h3>
      <div class="space-y-3 text-sm text-gray-600">
        <p><strong>{{ $t('readTracker.title') }}</strong> - {{ $t('settings.aboutDesc') }}</p>
        <p>{{ $t('settings.version') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const authStore = useAuthStore()
</script>
