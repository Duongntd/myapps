import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import { getGoals, addGoal, updateGoal, deleteGoal, type Goal } from '@/firebase/firestore'
import { useAuthStore } from './auth'
import type { DocumentReference, DocumentData } from 'firebase/firestore'

export const useGoalsStore = defineStore('goals', () => {
  const goals: Ref<Goal[]> = ref([])
  const loading: Ref<boolean> = ref(false)

  const fetchGoals = async (): Promise<void> => {
    const authStore = useAuthStore()
    if (!authStore.user) return

    loading.value = true
    try {
      goals.value = await getGoals(authStore.user.uid)
    } catch (error) {
      console.error('Error fetching goals:', error)
    } finally {
      loading.value = false
    }
  }

  const createGoal = async (goalData: Omit<Goal, 'id'>): Promise<DocumentReference<DocumentData>> => {
    const authStore = useAuthStore()
    if (!authStore.user) throw new Error('User not authenticated')

    try {
      const docRef = await addGoal(authStore.user.uid, goalData)
      await fetchGoals() // Refresh list
      return docRef
    } catch (error) {
      console.error('Error creating goal:', error)
      throw error
    }
  }

  const updateGoalData = async (goalId: string, updates: Partial<Goal>): Promise<void> => {
    const authStore = useAuthStore()
    if (!authStore.user) throw new Error('User not authenticated')

    try {
      await updateGoal(authStore.user.uid, goalId, updates)
      await fetchGoals() // Refresh list
    } catch (error) {
      console.error('Error updating goal:', error)
      throw error
    }
  }

  const removeGoal = async (goalId: string): Promise<void> => {
    const authStore = useAuthStore()
    if (!authStore.user) throw new Error('User not authenticated')

    try {
      await deleteGoal(authStore.user.uid, goalId)
      await fetchGoals() // Refresh list
    } catch (error) {
      console.error('Error deleting goal:', error)
      throw error
    }
  }

  return {
    goals,
    loading,
    fetchGoals,
    createGoal,
    updateGoalData,
    removeGoal
  }
})
