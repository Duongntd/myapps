<template>
  <div class="relative">
    <!-- User Profile Dropdown -->
    <div class="relative" ref="dropdownRef">
      <button
        @click="toggleDropdown"
        class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="User menu"
      >
        <img
          v-if="user?.photoURL"
          :src="user.photoURL"
          :alt="user.displayName || 'User'"
          class="w-8 h-8 rounded-full"
        />
        <div
          v-else
          class="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold"
        >
          {{ userInitials }}
        </div>
        <span v-if="user?.displayName" class="hidden md:block text-sm font-medium text-gray-700">
          {{ user.displayName }}
        </span>
        <svg
          class="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <!-- Dropdown Menu -->
      <div
        v-if="showDropdown"
        class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
      >
        <div class="px-4 py-3 border-b border-gray-200">
          <p class="text-sm font-medium text-gray-900">{{ user?.displayName || 'User' }}</p>
          <p class="text-xs text-gray-500 truncate">{{ user?.email }}</p>
        </div>
        <button
          @click="handleLogout"
          class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          {{ $t('common.signOut') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useClickOutside } from '@/composables/useClickOutside'
import type { User } from 'firebase/auth'

const authStore = useAuthStore()
const showDropdown = ref(false)
const dropdownRef = ref<HTMLElement>()

const user = computed<User | null>(() => authStore.user)

const userInitials = computed(() => {
  if (!user.value?.displayName) return 'U'
  const names = user.value.displayName.split(' ')
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase()
  }
  return user.value.displayName.substring(0, 2).toUpperCase()
})

const toggleDropdown = (): void => {
  showDropdown.value = !showDropdown.value
}

const closeDropdown = (): void => {
  showDropdown.value = false
}

const handleLogout = async (): Promise<void> => {
  try {
    await authStore.signOut()
    closeDropdown()
  } catch (error) {
    console.error('Logout error:', error)
  }
}

useClickOutside(dropdownRef, closeDropdown)
</script>
