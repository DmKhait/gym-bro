<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import { formatDate, formatNumber, metrics, weeklyTotal } from './dashboard'
import { configured, useDashboard } from './store'
import MetricCard from './MetricCard.vue'

const WeightChart = defineAsyncComponent(() => import('./WeightChart.vue'))
const dashboard = useDashboard()
const tabs = [
  { id: 'day', label: 'Сьогодні' },
  { id: 'week', label: 'Тиждень' },
  { id: 'weight', label: 'Вага' },
] as const
const active = ref<typeof tabs[number]['id']>('day')
const week = computed(() => dashboard.data?.days ?? [])
const loggedDays = computed(() => week.value.filter(({ calories }) => calories !== null).length)
const weights = computed(() => dashboard.data?.weights ?? [])
const lastWeight = computed(() => weights.value.at(-1))
const previousWeight = computed(() => weights.value.at(-2))

onMounted(() => dashboard.connect())
</script>

<template>
  <main class="shell">
    <header class="topbar">
      <div class="brand"><img src="/icon-192.png" width="33" height="33" alt="" /> Gym Bro</div>
      <div v-if="dashboard.mode" class="flex flex-wrap justify-end gap-2">
        <button v-if="dashboard.mode === 'live'" class="action" type="button" :disabled="dashboard.loading" @click="dashboard.refresh">
          {{ dashboard.loading ? 'Читаємо…' : 'Оновити' }}
        </button>
        <button class="action" type="button" @click="dashboard.close">
          {{ dashboard.mode === 'demo' ? 'Закрити демо' : 'Вийти' }}
        </button>
      </div>
    </header>

    <p v-if="dashboard.error" class="error" role="alert">{{ dashboard.error }}</p>

    <section v-if="!dashboard.data" class="welcome">
      <span class="welcome-icon"><img src="/icon-192.png" width="58" height="58" alt="" /></span>
      <h1>Твій щоденник<br />прогресу</h1>
      <p>Харчування, вода та вага з твоєї таблиці Google Sheets.</p>
      <div class="flex flex-wrap gap-3">
        <button v-if="configured" class="action primary" type="button" :disabled="!dashboard.googleReady || dashboard.loading" @click="dashboard.refresh">
          {{ dashboard.loading ? 'Підключення…' : 'Увійти через Google' }}
        </button>
        <button class="action" :class="{ primary: !configured }" :disabled="dashboard.loading" type="button" @click="active = 'day'; dashboard.openDemo()">
          Переглянути демо
        </button>
      </div>
      <p v-if="!configured" class="setup-note">Підключення до Google Sheets ще налаштовується.</p>
    </section>

    <template v-else>
      <nav class="tabbar" aria-label="Розділи дашборда">
        <button v-for="tab in tabs" :key="tab.id" type="button" :aria-pressed="active === tab.id" @click="active = tab.id">
          {{ tab.label }}
        </button>
      </nav>
      <p v-if="dashboard.mode === 'demo'" class="demo-note">Демо · умовні дані</p>

      <section v-if="active === 'day'" class="screen">
        <div class="section-heading">
          <div><h1>Сьогодні</h1><p>{{ formatDate(dashboard.data.date) }}</p></div>
        </div>
        <div class="metric-grid">
          <MetricCard v-for="metric in metrics" :key="metric.key"
            :name="metric.name" :unit="metric.unit" :color="metric.color"
            :value="dashboard.data.actual[metric.key]" :goal="dashboard.data.goal[metric.key]"
            :large="metric.key === 'calories' || metric.key === 'water'" />
        </div>
      </section>

      <section v-else-if="active === 'week'" class="screen">
        <div class="section-heading">
          <div>
            <h1>Тиждень</h1>
            <p v-if="week[0] && week.at(-1)">{{ formatDate(week[0].date, true) }} – {{ formatDate(week.at(-1)!.date, true) }}</p>
          </div>
          <p>{{ loggedDays }} з {{ week.length }} днів<br />із харчуванням</p>
        </div>
        <div class="card table-scroll" tabindex="0" role="region" aria-label="Харчування й вода за днями">
          <table>
            <caption class="sr-only">Харчування й вода за днями</caption>
            <thead><tr><th scope="col">Дата</th><th scope="col">Ккал</th><th scope="col">Б, г</th><th scope="col">Ж, г</th><th scope="col">В, г</th><th scope="col">Вода, мл</th></tr></thead>
            <tbody>
              <tr v-for="day in week" :key="day.date" :class="{ current: day.date === dashboard.data.date }">
                <th scope="row">{{ formatDate(day.date, true) }}</th>
                <td v-for="metric in metrics" :key="metric.key">{{ formatNumber(day[metric.key]) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr><th scope="row">Разом</th><td v-for="metric in metrics" :key="metric.key">{{ formatNumber(weeklyTotal(week, metric.key)) }}</td></tr>
            </tfoot>
          </table>
        </div>
        <div class="card averages">
          <h2>Середнє за минулі дні</h2>
          <dl class="summary-list">
            <div v-for="metric in metrics" :key="metric.key"><dt>{{ metric.name }}</dt><dd>{{ formatNumber(dashboard.data.averages[metric.key], metric.unit) }}</dd></div>
          </dl>
        </div>
      </section>

      <section v-else class="screen">
        <div class="section-heading">
          <div><h1>Вага</h1><p>Середня за тиждень</p></div>
        </div>
        <div v-if="lastWeight" class="card weight-card">
          <div class="flex flex-wrap items-center gap-3">
            <strong class="weight">{{ formatNumber(lastWeight.kg, 'кг') }}</strong>
            <span v-if="previousWeight" class="delta">
              {{ lastWeight.kg > previousWeight.kg ? '+' : '' }}{{ formatNumber(lastWeight.kg - previousWeight.kg, 'кг') }}
            </span>
          </div>
          <WeightChart :weights="weights" />
        </div>
        <div v-else class="card empty">Поки немає зважувань. Додай перше на вкладці «Трекер» у Google Sheets.</div>
        <details v-if="lastWeight" class="card weigh-ins">
          <summary>Історія зважувань</summary>
          <dl class="summary-list">
            <div v-for="weighIn in [...weights].reverse()" :key="weighIn.date">
              <dt>Тиждень від {{ formatDate(weighIn.date, true) }}</dt><dd>{{ formatNumber(weighIn.kg, 'кг') }}</dd>
            </div>
          </dl>
        </details>
      </section>
    </template>
  </main>
</template>
