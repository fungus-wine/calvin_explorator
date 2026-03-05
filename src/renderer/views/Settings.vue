<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'pinia'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useThemeStore } from 'theminator'
import { useTelemetryStore } from '@/stores/telemetry'
import { COGITATOR_CONNECTION } from '@/constants/connection'
import { STORAGE_KEYS } from '@/constants/storage'

interface ConnectionSettings {
  host: string
  port: number
}

function loadConnectionSettings(): ConnectionSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COGITATOR_CONNECTION)
    if (raw) return JSON.parse(raw) as ConnectionSettings
  } catch { /* ignore */ }
  return { host: COGITATOR_CONNECTION.DEFAULT_HOST, port: COGITATOR_CONNECTION.DEFAULT_PORT }
}

export default defineComponent({
  name: 'Settings',
  components: {
    Switch,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Input,
  },
  data() {
    const saved = loadConnectionSettings()
    return {
      connectionHost: saved.host,
      connectionPort: String(saved.port),
    }
  },
  computed: {
    ...mapState(useThemeStore, ['darkMode', 'selectedTheme', 'availableThemes']),

    darkModeModel: {
      get(): boolean {
        return this.darkMode
      },
      set(value: boolean): void {
        this.setDarkMode(value)
      }
    },
    selectedThemeModel: {
      get(): string {
        return this.selectedTheme
      },
      set(value: string): void {
        this.setTheme(value)
      }
    }
  },
  methods: {
    ...mapActions(useThemeStore, ['setDarkMode', 'setTheme']),

    saveConnection(): void {
      const port = parseInt(this.connectionPort, 10)
      if (!this.connectionHost.trim() || isNaN(port) || port < 1 || port > 65535) return

      const settings: ConnectionSettings = { host: this.connectionHost.trim(), port }
      localStorage.setItem(STORAGE_KEYS.COGITATOR_CONNECTION, JSON.stringify(settings))

      const telemetry = useTelemetryStore()
      telemetry.connect(settings.host, settings.port)
    }
  }
})
</script>

<template>
  <div>
    <h2 class="text-3xl font-bold mb-6">Settings</h2>

    <div class="max-w-2xl space-y-6">

      <div class="border rounded-lg p-6">
        <h3 class="text-lg font-semibold mb-4">Connection</h3>

        <div class="space-y-4">
          <div class="flex items-center justify-between gap-4">
            <div class="space-y-0.5 shrink-0">
              <label class="text-sm font-medium">Cogitator Host</label>
              <p class="text-sm text-muted-foreground">Hostname or IP address</p>
            </div>
            <Input
              v-model="connectionHost"
              class="w-48 font-mono text-sm"
              placeholder="localhost"
              @keyup.enter="saveConnection"
            />
          </div>

          <div class="flex items-center justify-between gap-4">
            <div class="space-y-0.5 shrink-0">
              <label class="text-sm font-medium">Cogitator Port</label>
              <p class="text-sm text-muted-foreground">WebSocket port (1–65535)</p>
            </div>
            <Input
              v-model="connectionPort"
              class="w-48 font-mono text-sm"
              placeholder="5560"
              type="number"
              min="1"
              max="65535"
              @keyup.enter="saveConnection"
            />
          </div>

          <div class="flex justify-end">
            <button
              class="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              @click="saveConnection"
            >
              Connect
            </button>
          </div>
        </div>
      </div>

      <div class="border rounded-lg p-6">
        <h3 class="text-lg font-semibold mb-4">Appearance</h3>

        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div class="space-y-0.5">
              <label class="text-sm font-medium">Theme</label>
              <p class="text-sm text-muted-foreground">
                Select your color theme
              </p>
            </div>
            <div class="w-48">
              <Select v-model="selectedThemeModel">
                <SelectTrigger>
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="theme in availableThemes" :key="theme.name" :value="theme.name">
                    {{ theme.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="space-y-0.5">
              <label class="text-sm font-medium">Dark Mode</label>
              <p class="text-sm text-muted-foreground">
                Toggle between light and dark theme
              </p>
            </div>
            <Switch v-model="darkModeModel" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
