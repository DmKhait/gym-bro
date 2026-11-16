import { defineStore } from 'pinia'
import { onScopeDispose, ref, shallowRef } from 'vue'
import type { Dashboard } from './dashboard'
import { demo } from './demo'

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()
const deploymentId = import.meta.env.VITE_APPS_SCRIPT_DEPLOYMENT_ID?.trim()
// scripts.run requires an accepted execution scope alongside Sheets read access.
const scopes = [
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
] as const
export const configured = Boolean(clientId && deploymentId)

export const useDashboard = defineStore('dashboard', () => {
  const data = shallowRef<Dashboard | null>(null)
  const mode = ref<'demo' | 'live' | null>(null)
  const loading = ref(false)
  const error = ref('')
  const googleReady = ref(false)
  let token: { value: string; expires: number } | null = null
  let request: AbortController | null = null
  let oauth: google.accounts.oauth2.TokenClient | null = null

  function connect() {
    if (!configured || oauth) return
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => {
      oauth = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: scopes.join(' '),
        include_granted_scopes: false,
        callback(response) {
          if (!loading.value) return
          if (response.error || !google.accounts.oauth2.hasGrantedAllScopes(response, ...scopes)) {
            loading.value = false
            error.value = 'Google не надав доступ для читання. Спробуй увійти ще раз.'
            return
          }
          token = {
            value: response.access_token,
            expires: Date.now() + Number(response.expires_in) * 1000,
          }
          void load()
        },
        error_callback() {
          if (!loading.value) return
          loading.value = false
          error.value = 'Вхід не завершився. Відкрий Google-вхід ще раз.'
        },
      })
      googleReady.value = true
    }
    script.onerror = () => {
      error.value = 'Не вдалося завантажити Google-вхід. Перевір мережу й онови сторінку.'
    }
    document.head.appendChild(script)
  }

  function refresh() {
    if (loading.value) return
    error.value = ''
    if (token && token.expires > Date.now() + 30_000) {
      void load()
      return
    }
    if (!oauth) return
    loading.value = true
    try {
      oauth.requestAccessToken()
    } catch {
      loading.value = false
      error.value = 'Не вдалося відкрити Google-вхід.'
    }
  }

  async function load() {
    if (!token) return
    const controller = new AbortController()
    request = controller
    loading.value = true
    error.value = ''
    try {
      const response = await fetch(
        'https://script.googleapis.com/v1/scripts/' + encodeURIComponent(deploymentId) + ':run',
        {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + token.value, 'Content-Type': 'application/json' },
          body: JSON.stringify({ function: 'getDashboard' }),
          cache: 'no-store',
          signal: controller.signal,
        },
      )
      if (response.status === 401) token = null
      if (response.status === 403) throw new Error('Цей акаунт не має доступу до Apps Script.')
      if (!response.ok) throw new Error('Не вдалося прочитати дані Google Sheets.')
      const operation = await response.json()
      const result = operation.response?.result as Dashboard | undefined
      if (operation.error || !result?.date || !Array.isArray(result.days) || !Array.isArray(result.weights)) {
        throw new Error('Apps Script не повернув дані дашборда. Перевір його налаштування.')
      }
      if (controller.signal.aborted) return
      data.value = result
      mode.value = 'live'
    } catch (failure) {
      if (!controller.signal.aborted) {
        error.value = failure instanceof Error ? failure.message : 'Не вдалося завантажити дані.'
      }
    } finally {
      if (request === controller) {
        request = null
        loading.value = false
      }
    }
  }

  function close() {
    request?.abort()
    request = null
    token = null
    data.value = null
    mode.value = null
    loading.value = false
    error.value = ''
  }

  function openDemo() {
    close()
    mode.value = 'demo'
    data.value = demo
  }

  onScopeDispose(close)
  return { data, mode, loading, error, googleReady, connect, refresh, close, openDemo }
})
