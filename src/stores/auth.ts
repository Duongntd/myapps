import { defineStore } from 'pinia'
import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { onAuthChange, signInWithGoogle, logout } from '@/firebase/auth'
import type { User } from 'firebase/auth'

const LOCAL_MODE_KEY = 'readTracker_localMode'

export const useAuthStore = defineStore('auth', () => {
  const user: Ref<User | null> = ref(null)
  const loading: Ref<boolean> = ref(true)
  const localMode: Ref<boolean> = ref(false)

  // Check for local mode preference on initialization
  const initializeLocalMode = () => {
    const stored = localStorage.getItem(LOCAL_MODE_KEY)
    localMode.value = stored === 'true'
    if (localMode.value) {
      loading.value = false
    }
  }

  // Initialize auth state listener
  onAuthChange((firebaseUser: User | null) => {
    user.value = firebaseUser
    loading.value = false
    // If user logs in, disable local mode
    if (firebaseUser) {
      localMode.value = false
      localStorage.removeItem(LOCAL_MODE_KEY)
    }
  })

  // Initialize on store creation
  initializeLocalMode()

  const isAuthenticated: ComputedRef<boolean> = computed(() => !!user.value || localMode.value)

  const enableLocalMode = (): void => {
    localMode.value = true
    localStorage.setItem(LOCAL_MODE_KEY, 'true')
    loading.value = false
  }

  const disableLocalMode = (): void => {
    localMode.value = false
    localStorage.removeItem(LOCAL_MODE_KEY)
  }

  const login = async (): Promise<User> => {
    try {
      const userCredential = await signInWithGoogle()
      user.value = userCredential
      disableLocalMode() // Disable local mode when logging in
      return userCredential
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      await logout()
      user.value = null
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  return {
    user,
    loading,
    isAuthenticated,
    localMode,
    enableLocalMode,
    disableLocalMode,
    login,
    signOut
  }
})
