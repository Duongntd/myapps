<template>
  <div class="h-64">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

interface Props {
  data: {
    labels: string[]
    data: number[]
  }
  period: 'week' | 'month' | 'year'
}

const props = defineProps<Props>()

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const createChart = () => {
  if (!chartCanvas.value) return

  if (chartInstance) {
    chartInstance.destroy()
  }

  chartInstance = new Chart(chartCanvas.value, {
    type: 'line',
    data: {
      labels: props.data.labels,
      datasets: [
        {
          label: 'Reading Time (minutes)',
          data: props.data.data,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.4,
          fill: true
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
              const minutes = context.parsed.y
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
        y: {
          beginAtZero: true,
          ticks: {
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

watch(() => props.data, () => {
  createChart()
}, { deep: true })

watch(() => props.period, () => {
  createChart()
})
</script>
