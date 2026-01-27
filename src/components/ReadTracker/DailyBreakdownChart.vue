<template>
  <div class="h-48 sm:h-64">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { Chart, registerables } from 'chart.js'
import type { ReadingSession } from '@/firebase/firestore'
import { format as formatDate, startOfWeek, startOfMonth, startOfYear, eachDayOfInterval } from 'date-fns'

Chart.register(...registerables)

interface Props {
  sessions: ReadingSession[]
  period: 'week' | 'month' | 'year'
}

const props = defineProps<Props>()

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const chartData = computed(() => {
  const now = new Date()
  let startDate: Date
  
  if (props.period === 'week') {
    startDate = startOfWeek(now)
  } else if (props.period === 'month') {
    startDate = startOfMonth(now)
  } else {
    startDate = startOfYear(now)
  }
  
  const days = eachDayOfInterval({ start: startDate, end: now })
  const sessionsByDate = new Map<string, number>()
  
  props.sessions.forEach(session => {
    if (!session.date) return
    const dateKey = formatDate(session.date.toDate(), 'yyyy-MM-dd')
    const dayDate = new Date(dateKey)
    
    if (dayDate >= startDate && dayDate <= now) {
      sessionsByDate.set(dateKey, (sessionsByDate.get(dateKey) || 0) + (session.duration || 0))
    }
  })
  
  return {
    labels: days.map(d => formatDate(d, props.period === 'year' ? 'MMM d' : 'MMM d')),
    data: days.map(d => {
      const dateKey = formatDate(d, 'yyyy-MM-dd')
      return sessionsByDate.get(dateKey) || 0
    })
  }
})

const createChart = () => {
  if (!chartCanvas.value) return

  if (chartInstance) {
    chartInstance.destroy()
  }

  const data = chartData.value
  const isMobile = window.innerWidth < 640

  chartInstance = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [
        {
          label: 'Minutes',
          data: data.data,
          backgroundColor: 'rgba(99, 102, 241, 0.6)',
          borderColor: 'rgb(99, 102, 241)',
          borderWidth: 1,
          barThickness: isMobile ? 'flex' : undefined,
          maxBarThickness: isMobile ? 20 : 40
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const minutes = context.parsed.y ?? 0
              if (minutes === 0) return 'No reading'
              if (minutes < 60) {
                return `${minutes}m`
              }
              const hours = Math.floor(minutes / 60)
              const mins = minutes % 60
              return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            font: {
              size: isMobile ? 10 : 12
            },
            maxRotation: isMobile ? 45 : 0,
            minRotation: isMobile ? 45 : 0
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            font: {
              size: isMobile ? 10 : 12
            },
            callback: (value) => {
              const minutes = Number(value)
              if (minutes < 60) {
                return `${minutes}m`
              }
              const hours = Math.floor(minutes / 60)
              return `${hours}h`
            }
          }
        }
      }
    }
  })
}

onMounted(() => {
  createChart()
})

watch(() => chartData.value, () => {
  createChart()
}, { deep: true })

watch(() => props.period, () => {
  createChart()
})
</script>
