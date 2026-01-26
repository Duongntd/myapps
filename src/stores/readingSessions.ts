import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import { getReadingSessions, addReadingSession, updateReadingSession, deleteReadingSession, type ReadingSession } from '@/firebase/firestore'
import { useAuthStore } from './auth'
import type { DocumentReference, DocumentData } from 'firebase/firestore'

export const useReadingSessionsStore = defineStore('readingSessions', () => {
  const sessions: Ref<ReadingSession[]> = ref([])
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)

  const fetchSessions = async (): Promise<void> => {
    const authStore = useAuthStore()
    if (!authStore.user) return

    loading.value = true
    error.value = null
    try {
      sessions.value = await getReadingSessions(authStore.user.uid)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load reading sessions'
      error.value = errorMessage
      console.error('Error fetching sessions:', err)
    } finally {
      loading.value = false
    }
  }

  const createSession = async (sessionData: Omit<ReadingSession, 'id' | 'createdAt'>): Promise<DocumentReference<DocumentData>> => {
    const authStore = useAuthStore()
    if (!authStore.user) throw new Error('User not authenticated')

    error.value = null
    try {
      const docRef = await addReadingSession(authStore.user.uid, sessionData)
      await fetchSessions() // Refresh list
      return docRef
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create reading session'
      error.value = errorMessage
      console.error('Error creating session:', err)
      throw err
    }
  }

  const updateSession = async (sessionId: string, updates: Partial<ReadingSession>): Promise<void> => {
    const authStore = useAuthStore()
    if (!authStore.user) throw new Error('User not authenticated')

    error.value = null
    try {
      await updateReadingSession(authStore.user.uid, sessionId, updates)
      await fetchSessions() // Refresh list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update reading session'
      error.value = errorMessage
      console.error('Error updating session:', err)
      throw err
    }
  }

  const removeSession = async (sessionId: string): Promise<void> => {
    const authStore = useAuthStore()
    if (!authStore.user) throw new Error('User not authenticated')

    error.value = null
    try {
      await deleteReadingSession(authStore.user.uid, sessionId)
      await fetchSessions() // Refresh list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete reading session'
      error.value = errorMessage
      console.error('Error deleting session:', err)
      throw err
    }
  }

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    createSession,
    updateSession,
    removeSession
  }
})
