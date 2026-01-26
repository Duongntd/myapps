<template>
  <div class="space-y-6">
    <!-- Overview Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Today's Reading -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-medium text-gray-600">Today</h3>
          <span class="text-2xl">📖</span>
        </div>
        <p class="text-3xl font-bold text-gray-900">{{ formatDuration(todayTotal) }}</p>
        <p class="text-xs text-gray-500 mt-1">{{ todaySessions }} session{{ todaySessions !== 1 ? 's' : '' }}</p>
      </div>

      <!-- This Week -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-medium text-gray-600">This Week</h3>
          <span class="text-2xl">📅</span>
        </div>
        <p class="text-3xl font-bold text-gray-900">{{ formatDuration(weekTotal) }}</p>
        <p class="text-xs text-gray-500 mt-1">{{ weekSessions }} session{{ weekSessions !== 1 ? 's' : '' }}</p>
      </div>

      <!-- This Month -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-medium text-gray-600">This Month</h3>
          <span class="text-2xl">📆</span>
        </div>
        <p class="text-3xl font-bold text-gray-900">{{ formatDuration(monthTotal) }}</p>
        <p class="text-xs text-gray-500 mt-1">{{ monthSessions }} session{{ monthSessions !== 1 ? 's' : '' }}</p>
      </div>

      <!-- Reading Streak -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-medium text-gray-600">Streak</h3>
          <span class="text-2xl">🔥</span>
        </div>
        <p class="text-3xl font-bold text-gray-900">{{ readingStreak }}</p>
        <p class="text-xs text-gray-500 mt-1">day{{ readingStreak !== 1 ? 's' : '' }} in a row</p>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Average Reading Time -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Average Reading Time</h3>
        <div class="space-y-4">
          <div>
            <div class="flex justify-between items-center mb-1">
              <span class="text-sm text-gray-600">Daily Average (This Week)</span>
              <span class="text-lg font-semibold text-gray-900">{{ formatDuration(weekDailyAverage) }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-primary-600 h-2 rounded-full transition-all"
                :style="{ width: `${Math.min((weekDailyAverage / 120) * 100, 100)}%` }"
              ></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between items-center mb-1">
              <span class="text-sm text-gray-600">Daily Average (This Month)</span>
              <span class="text-lg font-semibold text-gray-900">{{ formatDuration(monthDailyAverage) }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-primary-600 h-2 rounded-full transition-all"
                :style="{ width: `${Math.min((monthDailyAverage / 120) * 100, 100)}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Books Stats -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Books</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Currently Reading</span>
            <span class="text-2xl font-bold text-blue-600">{{ readingBooksCount }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Completed</span>
            <span class="text-2xl font-bold text-green-600">{{ completedBooksCount }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Want to Read</span>
            <span class="text-2xl font-bold text-gray-600">{{ wantToReadBooksCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Goals Section -->
    <div v-if="activeGoals.length > 0" class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Active Goals</h3>
      <div class="space-y-4">
        <div
          v-for="goal in activeGoals"
          :key="goal.id"
          class="p-4 bg-gray-50 rounded-lg"
        >
          <div class="flex justify-between items-center mb-2">
            <span class="font-medium text-gray-900">{{ formatGoalType(goal.type) }} Goal</span>
            <span class="text-sm font-semibold text-gray-700">
              {{ formatDuration(goalProgress(goal).current) }} / {{ formatDuration(goal.targetMinutes) }}
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2 mb-1">
            <div
              :class="[
                'h-2 rounded-full transition-all',
                goalProgress(goal).percentage >= 100 ? 'bg-green-500' : 'bg-primary-600'
              ]"
              :style="{ width: `${Math.min(goalProgress(goal).percentage, 100)}%` }"
            ></div>
          </div>
          <p class="text-xs text-gray-500">
            {{ Math.round(goalProgress(goal).percentage) }}% complete
            <span v-if="goalProgress(goal).percentage >= 100"> 🎉</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Weekly Reading Chart -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900">This Week's Reading</h3>
          <select
            v-model="chartPeriod"
            @change="updateCharts"
            class="text-sm px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
        <ReadingChart :data="chartData" :period="chartPeriod" />
      </div>

      <!-- Daily Breakdown -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Daily Breakdown</h3>
        <DailyBreakdownChart :sessions="sessionsStore.sessions" :period="chartPeriod" />
      </div>
    </div>

    <!-- Yearly Total -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-1">This Year</h3>
          <p class="text-3xl font-bold text-primary-600">{{ formatDuration(yearTotal) }}</p>
          <p class="text-sm text-gray-500 mt-1">{{ yearSessions }} total sessions</p>
        </div>
        <div class="text-6xl">📚</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useReadingSessionsStore } from '@/stores/readingSessions'
import { useBooksStore } from '@/stores/books'
import { useGoalsStore } from '@/stores/goals'
import ReadingChart from '@/components/ReadTracker/ReadingChart.vue'
import DailyBreakdownChart from '@/components/ReadTracker/DailyBreakdownChart.vue'
import {
  isToday,
  isThisWeek,
  isThisMonth,
  isThisYear,
  startOfWeek,
  startOfMonth,
  startOfYear,
  eachDayOfInterval,
  isSameDay,
  format as formatDate,
  getWeek,
  getYear
} from 'date-fns'
import type { ReadingSession, Goal } from '@/firebase/firestore'

const sessionsStore = useReadingSessionsStore()
const booksStore = useBooksStore()
const goalsStore = useGoalsStore()

const chartPeriod = ref<'week' | 'month' | 'year'>('week')

// Fetch data on mount
onMounted(async () => {
  await sessionsStore.fetchSessions()
  await booksStore.fetchBooks()
  await goalsStore.fetchGoals()
})

// Calculate today's total
const todayTotal = computed(() => {
  return sessionsStore.sessions
    .filter(session => session.date && isToday(session.date.toDate()))
    .reduce((total, session) => total + (session.duration || 0), 0)
})

const todaySessions = computed(() => {
  return sessionsStore.sessions.filter(session => session.date && isToday(session.date.toDate())).length
})

// Calculate week's total
const weekTotal = computed(() => {
  return sessionsStore.sessions
    .filter(session => session.date && isThisWeek(session.date.toDate()))
    .reduce((total, session) => total + (session.duration || 0), 0)
})

const weekSessions = computed(() => {
  return sessionsStore.sessions.filter(session => session.date && isThisWeek(session.date.toDate())).length
})

// Calculate month's total
const monthTotal = computed(() => {
  return sessionsStore.sessions
    .filter(session => session.date && isThisMonth(session.date.toDate()))
    .reduce((total, session) => total + (session.duration || 0), 0)
})

const monthSessions = computed(() => {
  return sessionsStore.sessions.filter(session => session.date && isThisMonth(session.date.toDate())).length
})

// Calculate year's total
const yearTotal = computed(() => {
  return sessionsStore.sessions
    .filter(session => session.date && isThisYear(session.date.toDate()))
    .reduce((total, session) => total + (session.duration || 0), 0)
})

const yearSessions = computed(() => {
  return sessionsStore.sessions.filter(session => session.date && isThisYear(session.date.toDate())).length
})

// Calculate averages
const weekDailyAverage = computed(() => {
  const weekSessions = sessionsStore.sessions.filter(s => s.date && isThisWeek(s.date.toDate()))
  if (weekSessions.length === 0) return 0
  
  const daysWithReading = new Set(
    weekSessions.map(s => formatDate(s.date!.toDate(), 'yyyy-MM-dd'))
  ).size
  
  return Math.round(weekTotal.value / Math.max(daysWithReading, 1))
})

const monthDailyAverage = computed(() => {
  const monthSessions = sessionsStore.sessions.filter(s => s.date && isThisMonth(s.date.toDate()))
  if (monthSessions.length === 0) return 0
  
  const daysWithReading = new Set(
    monthSessions.map(s => formatDate(s.date!.toDate(), 'yyyy-MM-dd'))
  ).size
  
  return Math.round(monthTotal.value / Math.max(daysWithReading, 1))
})

// Calculate reading streak
const readingStreak = computed(() => {
  if (sessionsStore.sessions.length === 0) return 0
  
  const sortedSessions = [...sessionsStore.sessions]
    .filter(s => s.date)
    .sort((a, b) => b.date!.toDate().getTime() - a.date!.toDate().getTime())
  
  if (sortedSessions.length === 0) return 0
  
  const uniqueDates = new Set(
    sortedSessions.map(s => formatDate(s.date!.toDate(), 'yyyy-MM-dd'))
  )
  
  const dates = Array.from(uniqueDates).sort().reverse()
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let i = 0; i < dates.length; i++) {
    const date = new Date(dates[i])
    date.setHours(0, 0, 0, 0)
    
    const expectedDate = new Date(today)
    expectedDate.setDate(expectedDate.getDate() - i)
    
    if (formatDate(date, 'yyyy-MM-dd') === formatDate(expectedDate, 'yyyy-MM-dd')) {
      streak++
    } else {
      break
    }
  }
  
  return streak
})

// Books counts
const readingBooksCount = computed(() => {
  return booksStore.books.filter(b => b.status === 'reading').length
})

const completedBooksCount = computed(() => {
  return booksStore.books.filter(b => b.status === 'completed').length
})

const wantToReadBooksCount = computed(() => {
  return booksStore.books.filter(b => b.status === 'wantToRead').length
})

// Chart data
const chartData = computed(() => {
  const now = new Date()
  let startDate: Date
  let endDate = now
  
  if (chartPeriod.value === 'week') {
    startDate = startOfWeek(now)
  } else if (chartPeriod.value === 'month') {
    startDate = startOfMonth(now)
  } else {
    startDate = startOfYear(now)
  }
  
  const days = eachDayOfInterval({ start: startDate, end: endDate })
  const sessionsByDate = new Map<string, number>()
  
  sessionsStore.sessions.forEach(session => {
    if (!session.date) return
    const dateKey = formatDate(session.date.toDate(), 'yyyy-MM-dd')
    const dayDate = new Date(dateKey)
    
    if (dayDate >= startDate && dayDate <= endDate) {
      sessionsByDate.set(dateKey, (sessionsByDate.get(dateKey) || 0) + (session.duration || 0))
    }
  })
  
  return {
    labels: days.map(d => formatDate(d, chartPeriod.value === 'year' ? 'MMM' : 'EEE')),
    data: days.map(d => {
      const dateKey = formatDate(d, 'yyyy-MM-dd')
      return sessionsByDate.get(dateKey) || 0
    })
  }
})

const updateCharts = () => {
  // Charts will reactively update
}

const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

// Get active goals
const activeGoals = computed(() => {
  const now = new Date()
  const currentYear = getYear(now)
  const currentMonth = now.getMonth() + 1
  const currentWeek = getWeek(now)

  return goalsStore.goals.filter(goal => {
    if (goal.type === 'daily') {
      return true
    } else if (goal.type === 'weekly') {
      return goal.year === currentYear && goal.week === currentWeek
    } else if (goal.type === 'monthly') {
      return goal.year === currentYear && goal.month === currentMonth
    } else if (goal.type === 'yearly') {
      return goal.year === currentYear
    }
    return false
  })
})

// Calculate goal progress
const goalProgress = (goal: Goal) => {
  let currentMinutes = 0
  const now = new Date()

  if (goal.type === 'daily') {
    currentMinutes = sessionsStore.sessions
      .filter(session => session.date && isToday(session.date.toDate()))
      .reduce((total, session) => total + (session.duration || 0), 0)
  } else if (goal.type === 'weekly') {
    currentMinutes = sessionsStore.sessions
      .filter(session => session.date && isThisWeek(session.date.toDate()))
      .reduce((total, session) => total + (session.duration || 0), 0)
  } else if (goal.type === 'monthly') {
    currentMinutes = sessionsStore.sessions
      .filter(session => session.date && isThisMonth(session.date.toDate()))
      .reduce((total, session) => total + (session.duration || 0), 0)
  } else if (goal.type === 'yearly') {
    currentMinutes = sessionsStore.sessions
      .filter(session => session.date && isThisYear(session.date.toDate()))
      .reduce((total, session) => total + (session.duration || 0), 0)
  }

  const percentage = (currentMinutes / goal.targetMinutes) * 100

  return {
    current: currentMinutes,
    target: goal.targetMinutes,
    percentage
  }
}

const formatGoalType = (type: string): string => {
  const typeMap: Record<string, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly'
  }
  return typeMap[type] || type
}
</script>
