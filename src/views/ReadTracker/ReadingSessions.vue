<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Header with Today's Reading Time -->
    <div class="bg-white rounded-lg shadow p-4 sm:p-6">
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4">
        <h2 class="text-xl sm:text-2xl font-semibold text-gray-900">Reading Sessions</h2>
        <button
          @click="showForm = true"
          class="bg-primary-600 text-white px-4 py-2.5 sm:py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Session</span>
        </button>
      </div>
      
      <!-- Today's Reading Time -->
      <div class="bg-primary-50 rounded-lg p-3 sm:p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs sm:text-sm text-gray-600">Today's Reading Time</p>
            <p class="text-2xl sm:text-3xl font-bold text-primary-700">{{ formatDuration(todayTotalMinutes) }}</p>
          </div>
          <div class="text-3xl sm:text-4xl">📖</div>
        </div>
      </div>
    </div>

    <!-- Session Form Modal -->
    <ReadingSessionForm
      v-if="showForm"
      :session="editingSession"
      @close="handleFormClose"
      @save="handleSaveSession"
    />

    <!-- Sessions List -->
    <div class="bg-white rounded-lg shadow">
      <div class="p-4 sm:p-6 border-b border-gray-200">
        <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
          <h3 class="text-base sm:text-lg font-semibold text-gray-900">Session History</h3>
          <select
            v-model="dateFilter"
            @change="applyFilters"
            class="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="sessionsStore.error && !sessionsStore.loading" class="p-4 sm:p-6 bg-red-50 border border-red-200 rounded-lg mx-4 sm:mx-6 my-4">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="flex-1">
            <p class="text-sm font-medium text-red-800">Error loading sessions</p>
            <p class="text-xs sm:text-sm text-red-600 mt-1">{{ sessionsStore.error }}</p>
            <button
              @click="sessionsStore.fetchSessions()"
              class="mt-2 text-xs sm:text-sm text-red-700 underline hover:text-red-800"
            >
              Try again
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="sessionsStore.loading" class="p-8 sm:p-12 text-center">
        <div class="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p class="text-sm sm:text-base text-gray-600">Loading sessions...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredSessions.length === 0" class="p-8 sm:p-12 text-center">
        <div class="text-5xl sm:text-6xl mb-4">📚</div>
        <p class="text-gray-600 text-base sm:text-lg mb-2">No reading sessions yet</p>
        <p class="text-gray-500 text-sm">Start tracking your reading by adding your first session!</p>
      </div>

      <!-- Sessions List -->
      <div v-else class="divide-y divide-gray-200">
        <div
          v-for="session in filteredSessions"
          :key="session.id"
          class="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <span class="text-base sm:text-lg font-semibold text-gray-900">
                  {{ formatDate(session.date) }}
                </span>
                <span class="px-2 sm:px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-xs sm:text-sm font-medium inline-block w-fit">
                  {{ formatDuration(session.duration) }}
                </span>
              </div>
              <div v-if="session.bookId" class="text-xs sm:text-sm text-gray-600 mt-1">
                <span class="text-gray-500">Book:</span>
                <span class="ml-1">{{ getBookTitle(session.bookId) }}</span>
              </div>
            </div>
            <div class="flex gap-1 sm:gap-2 flex-shrink-0">
              <button
                @click="editSession(session)"
                class="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors touch-manipulation"
                title="Edit session"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="deleteSession(session.id!)"
                class="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors touch-manipulation"
                title="Delete session"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useReadingSessionsStore } from '@/stores/readingSessions'
import { useBooksStore } from '@/stores/books'
import ReadingSessionForm from '@/components/ReadTracker/ReadingSessionForm.vue'
import type { ReadingSession } from '@/firebase/firestore'
import { Timestamp } from 'firebase/firestore'
import { format, isToday, isThisWeek, isThisMonth, isThisYear } from 'date-fns'

const sessionsStore = useReadingSessionsStore()
const booksStore = useBooksStore()

const showForm = ref(false)
const editingSession = ref<ReadingSession | null>(null)
const dateFilter = ref('all')

// Fetch data on mount
onMounted(async () => {
  await sessionsStore.fetchSessions()
  await booksStore.fetchBooks()
})

// Calculate today's total reading time
const todayTotalMinutes = computed(() => {
  const today = new Date()
  return sessionsStore.sessions
    .filter(session => {
      if (!session.date) return false
      const sessionDate = session.date.toDate()
      return isToday(sessionDate)
    })
    .reduce((total, session) => total + (session.duration || 0), 0)
})

// Filter sessions based on date filter
const filteredSessions = computed(() => {
  let sessions = sessionsStore.sessions

  if (dateFilter.value === 'today') {
    sessions = sessions.filter(s => s.date && isToday(s.date.toDate()))
  } else if (dateFilter.value === 'week') {
    sessions = sessions.filter(s => s.date && isThisWeek(s.date.toDate()))
  } else if (dateFilter.value === 'month') {
    sessions = sessions.filter(s => s.date && isThisMonth(s.date.toDate()))
  } else if (dateFilter.value === 'year') {
    sessions = sessions.filter(s => s.date && isThisYear(s.date.toDate()))
  }

  return sessions
})

const applyFilters = () => {
  // Filter is reactive, no action needed
}

const editSession = (session: ReadingSession) => {
  editingSession.value = { ...session }
  showForm.value = true
}

const handleFormClose = () => {
  showForm.value = false
  editingSession.value = null
}

const handleSaveSession = async () => {
  showForm.value = false
  editingSession.value = null
  await sessionsStore.fetchSessions()
}

const deleteSession = async (sessionId: string) => {
  if (confirm('Are you sure you want to delete this reading session?')) {
    try {
      await sessionsStore.removeSession(sessionId)
    } catch (error) {
      console.error('Error deleting session:', error)
      alert('Failed to delete session. Please try again.')
    }
  }
}

// Format helpers
const formatDate = (timestamp: Timestamp | undefined): string => {
  if (!timestamp) return ''
  return format(timestamp.toDate(), 'MMM d, yyyy')
}

const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

const getBookTitle = (bookId: string): string => {
  const book = booksStore.books.find(b => b.id === bookId)
  return book ? `${book.title} by ${book.author}` : 'Unknown Book'
}
</script>
