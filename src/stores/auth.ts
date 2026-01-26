import { defineStore } from 'pinia'
import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { onAuthChange, signInWithGoogle, logout } from '@/firebase/auth'
import type { User } from 'firebase/auth'

export const useAuthStore = defineStore('auth', () => {
  const user: Ref<User | null> = ref(null)
  const loading: Ref<boolean> = ref(true)

  // Initialize auth state listener
  onAuthChange((firebaseUser: User | null) => {
    user.value = firebaseUser
    loading.value = false
  })

  const isAuthenticated: ComputedRef<boolean> = computed(() => !!user.value)

  const login = async (): Promise<User> => {
    try {
      const userCredential = await signInWithGoogle()
      user.value = userCredential
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
    login,
    signOut
  }
})
