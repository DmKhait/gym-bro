<script setup lang="ts">
import { computed } from 'vue'
import { formatNumber } from './dashboard'

const props = defineProps<{
  name: string
  value: number | null
  goal: number | null
  unit: string
  color: string
  large?: boolean
}>()

const percent = computed(() =>
  props.value !== null && props.goal !== null && props.goal > 0
    ? Math.round((props.value / props.goal) * 100)
    : null,
)
</script>

<template>
  <article class="metric-card" :class="{ 'metric-large': large }" :style="{ '--accent': color }">
    <div class="flex items-center justify-between gap-1">
      <h3 class="metric-label"><span class="metric-dot"></span>{{ name }}</h3>
      <span v-if="percent !== null" class="metric-percent">{{ percent }}%</span>
    </div>
    <div class="metric-value">{{ formatNumber(value) }} <small v-if="value !== null">{{ unit }}</small></div>
    <div v-if="goal !== null" class="metric-goal">Ціль {{ formatNumber(goal, unit) }}</div>
    <div v-if="percent !== null" class="progress-track" aria-hidden="true">
      <span :style="{ width: Math.min(100, Math.max(0, percent)) + '%' }"></span>
    </div>
  </article>
</template>
