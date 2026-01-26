import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import { getGoals, addGoal, updateGoal, deleteGoal, type Goal } from '@/firebase/firestore'
import { useAuthStore } from './auth'
import type { DocumentReference, DocumentData } from 'firebase/firestore'

export const useGoalsStore = defineStore('goals', () => {
  const goals: Ref<Goal[]> = ref([])
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)

  const fetchGoals = async (): Promise<void> => {
    const authStore = useAuthStore()
    if (!authStore.user) return

    loading.value = true
    error.value = null
    try {
      goals.value = await getGoals(authStore.user.uid)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load goals'
      error.value = errorMessage
      console.error('Error fetching goals:', err)
    } finally {
      loading.value = false
    }
  }

  const createGoal = async (goalData: Omit<Goal, 'id'>): Promise<DocumentReference<DocumentData>> => {
    const authStore = useAuthStore()
    if (!authStore.user) throw new Error('User not authenticated')

    error.value = null
    try {
      const docRef = await addGoal(authStore.user.uid, goalData)
      await fetchGoals() // Refresh list
      return docRef
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create goal'
      error.value = errorMessage
      console.error('Error creating goal:', err)
      throw err
    }
  }

  const updateGoalData = async (goalId: string, updates: Partial<Goal>): Promise<void> => {
    const authStore = useAuthStore()
    if (!authStore.user) throw new Error('User not authenticated')

    error.value = null
    try {
      await updateGoal(authStore.user.uid, goalId, updates)
      await fetchGoals() // Refresh list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update goal'
      error.value = errorMessage
      console.error('Error updating goal:', err)
      throw err
    }
  }

  const removeGoal = async (goalId: string): Promise<void> => {
    const authStore = useAuthStore()
    if (!authStore.user) throw new Error('User not authenticated')

    error.value = null
    try {
      await deleteGoal(authStore.user.uid, goalId)
      await fetchGoals() // Refresh list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete goal'
      error.value = errorMessage
      console.error('Error deleting goal:', err)
      throw err
    }
  }

  return {
    goals,
    loading,
    error,
    fetchGoals,
    createGoal,
    updateGoalData,
    removeGoal
  }
})
