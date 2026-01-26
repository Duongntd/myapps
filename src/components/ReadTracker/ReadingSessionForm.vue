<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h3 class="text-xl font-semibold text-gray-900">
          {{ editingSession ? 'Edit Reading Session' : 'Add Reading Session' }}
        </h3>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <!-- Date -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Date <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.date"
            type="date"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p v-if="errors.date" class="mt-1 text-sm text-red-600">{{ errors.date }}</p>
        </div>

        <!-- Reading Duration -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Reading Time <span class="text-red-500">*</span>
          </label>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-gray-500 mb-1">Hours</label>
              <input
                v-model.number="formData.hours"
                type="number"
                min="0"
                max="24"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Minutes</label>
              <input
                v-model.number="formData.minutes"
                type="number"
                min="0"
                max="59"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0"
              />
            </div>
          </div>
          <p v-if="totalMinutes > 0" class="mt-2 text-sm text-gray-600">
            Total: {{ formatDuration(totalMinutes) }}
          </p>
          <p v-if="errors.duration" class="mt-1 text-sm text-red-600">{{ errors.duration }}</p>
        </div>

        <!-- Book Selection (Optional) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Book (Optional)
          </label>
          <select
            v-model="formData.bookId"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">No book selected</option>
            <option
              v-for="book in readingBooks"
              :key="book.id"
              :value="book.id"
            >
              {{ book.title }} by {{ book.author }}
            </option>
          </select>
        </div>

        <!-- Error Message -->
        <div v-if="submitError" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-sm text-red-600">{{ submitError }}</p>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Saving...' : (editingSession ? 'Update Session' : 'Add Session') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useReadingSessionsStore } from '@/stores/readingSessions'
import { useBooksStore } from '@/stores/books'
import type { ReadingSession } from '@/firebase/firestore'
import { Timestamp } from 'firebase/firestore'
import { format } from 'date-fns'

interface Props {
  session?: ReadingSession | null
}

const props = withDefaults(defineProps<Props>(), {
  session: null
})

const emit = defineEmits<{
  close: []
  save: []
}>()

const sessionsStore = useReadingSessionsStore()
const booksStore = useBooksStore()

const loading = ref(false)
const submitError = ref('')
const errors = ref<Record<string, string>>({})

const editingSession = computed(() => props.session)

// Form data
const formData = ref({
  date: '',
  hours: 0,
  minutes: 0,
  bookId: ''
})

// Calculate total minutes
const totalMinutes = computed(() => {
  return (formData.value.hours || 0) * 60 + (formData.value.minutes || 0)
})

// Get books that are currently being read
const readingBooks = computed(() => {
  return booksStore.books.filter(book => book.status === 'reading')
})

// Initialize form with session data if editing
onMounted(() => {
  if (editingSession.value) {
    const session = editingSession.value
    if (session.date) {
      formData.value.date = format(session.date.toDate(), 'yyyy-MM-dd')
    }
    // Convert duration to hours and minutes
    const duration = session.duration || 0
    formData.value.hours = Math.floor(duration / 60)
    formData.value.minutes = duration % 60
    formData.value.bookId = session.bookId || ''
  } else {
    // Default to today
    formData.value.date = format(new Date(), 'yyyy-MM-dd')
    formData.value.hours = 0
    formData.value.minutes = 0
  }
})

// Watch for changes to validate
watch([() => formData.value.hours, () => formData.value.minutes], () => {
  if (totalMinutes.value <= 0) {
    errors.value.duration = 'Reading time must be greater than 0'
  } else {
    delete errors.value.duration
  }
})

const validateForm = (): boolean => {
  errors.value = {}

  if (!formData.value.date) {
    errors.value.date = 'Date is required'
  }

  if (totalMinutes.value <= 0) {
    errors.value.duration = 'Reading time must be greater than 0'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true
  submitError.value = ''

  try {
    const date = new Date(formData.value.date)
    // Set date to start of day for consistency
    date.setHours(0, 0, 0, 0)
    
    // Create start time (default to 9 AM)
    const startDateTime = new Date(date)
    startDateTime.setHours(9, 0, 0, 0)
    
    // Calculate end time based on duration
    const endDateTime = new Date(startDateTime)
    endDateTime.setMinutes(endDateTime.getMinutes() + totalMinutes.value)

    const sessionData: Omit<ReadingSession, 'id' | 'createdAt'> = {
      date: Timestamp.fromDate(date),
      startTime: Timestamp.fromDate(startDateTime),
      endTime: Timestamp.fromDate(endDateTime),
      duration: totalMinutes.value,
      ...(formData.value.bookId && { bookId: formData.value.bookId })
    }

    if (editingSession.value?.id) {
      // For updates, build the update object conditionally
      const updateData: Partial<ReadingSession> = {
        date: Timestamp.fromDate(date),
        startTime: Timestamp.fromDate(startDateTime),
        endTime: Timestamp.fromDate(endDateTime),
        duration: totalMinutes.value
      }
      
      // Only include bookId if it has a value
      if (formData.value.bookId) {
        updateData.bookId = formData.value.bookId
      }
      
      await sessionsStore.updateSession(editingSession.value.id, updateData)
    } else {
      await sessionsStore.createSession(sessionData)
    }

    emit('save')
  } catch (error) {
    console.error('Error saving session:', error)
    submitError.value = 'Failed to save session. Please try again.'
  } finally {
    loading.value = false
  }
}

const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} minutes`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours} hour${hours > 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}` : `${hours} hour${hours > 1 ? 's' : ''}`
}
</script>
