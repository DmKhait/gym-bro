<script setup lang="ts">
import { Chart, CategoryScale, LineController, LineElement, LinearScale, PointElement, Tooltip } from 'chart.js'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { formatDate, type WeighIn } from './dashboard'

Chart.register(CategoryScale, LineController, LineElement, LinearScale, PointElement, Tooltip)

const props = defineProps<{ weights: WeighIn[] }>()
const canvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart<'line'> | undefined

function draw() {
  if (!canvas.value) return
  chart?.destroy()
  chart = new Chart(canvas.value, {
    type: 'line',
    data: {
      labels: props.weights.map(({ date }) => formatDate(date, true)),
      datasets: [{
        label: 'Вага, кг',
        data: props.weights.map(({ kg }) => kg),
        borderColor: '#dafe70',
        backgroundColor: '#dafe70',
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
        tension: 0.25,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { display: false }, ticks: { color: '#a8ad9c', maxTicksLimit: 5 } },
        y: { grid: { color: '#343a2f' }, ticks: { color: '#a8ad9c', maxTicksLimit: 6 } },
      },
    },
  })
}

onMounted(draw)
watch(() => props.weights, draw)
onBeforeUnmount(() => chart?.destroy())
</script>

<template>
  <div class="weight-chart">
    <canvas ref="canvas" role="img" aria-label="Графік середньої ваги за тижнями"></canvas>
  </div>
</template>
