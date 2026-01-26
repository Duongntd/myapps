import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import { getReadingSessions, addReadingSession, updateReadingSession, deleteReadingSession, type ReadingSession } from '@/firebase/firestore'
import { useAuthStore } from './auth'
import type { DocumentReference, DocumentData } from 'firebase/firestore'

export const useReadingSessionsStore = defineStore('readingSessions', () => {
  const sessions: Ref<ReadingSession[]> = ref([])
  const loading: Ref<boolean> = ref(false)

  const fetchSessions = async (): Promise<void> => {
    const authStore = useAuthStore()
    if (!authStore.user) return

    loading.value = true
    try {
      sessions.value = await getReadingSessions(authStore.user.uid)
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      loading.value = false
    }
  }

  const createSession = async (sessionData: Omit<ReadingSession, 'id' | 'createdAt'>): Promise<DocumentReference<DocumentData>> => {
    const authStore = useAuthStore()
    if (!authStore.user) throw new Error('User not authenticated')

    try {
      const docRef = await addReadingSession(authStore.user.uid, sessionData)
      await fetchSessions() // Refresh list
      return docRef
    } catch (error) {
      console.error('Error creating session:', error)
      throw error
    }
  }

  const updateSession = async (sessionId: string, updates: Partial<ReadingSession>): Promise<void> => {
    const authStore = useAuthStore()
    if (!authStore.user) throw new Error('User not authenticated')

    try {
      await updateReadingSession(authStore.user.uid, sessionId, updates)
      await fetchSessions() // Refresh list
    } catch (error) {
      console.error('Error updating session:', error)
      throw error
    }
  }

  const removeSession = async (sessionId: string): Promise<void> => {
    const authStore = useAuthStore()
    if (!authStore.user) throw new Error('User not authenticated')

    try {
      await deleteReadingSession(authStore.user.uid, sessionId)
      await fetchSessions() // Refresh list
    } catch (error) {
      console.error('Error deleting session:', error)
      throw error
    }
  }

  return {
    sessions,
    loading,
    fetchSessions,
    createSession,
    updateSession,
    removeSession
  }
})
