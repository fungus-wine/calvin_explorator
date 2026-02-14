<script lang="ts">
import { defineComponent } from 'vue'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default defineComponent({
  components: {
    Switch,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
  },
  data() {
    return {
      darkMode: true,
      selectedTheme: 'default',
      themes: [
        { value: 'default', label: 'Default' },
        { value: 'red', label: 'Red' },
        { value: 'rose', label: 'Rose' },
        { value: 'orange', label: 'Orange' },
        { value: 'green', label: 'Green' },
        { value: 'blue', label: 'Blue' },
        { value: 'yellow', label: 'Yellow' },
        { value: 'violet', label: 'Violet' },
      ]
    }
  },
  mounted() {
    const savedDarkMode = localStorage.getItem('darkMode')
    this.darkMode = savedDarkMode !== null ? savedDarkMode === 'true' : true

    const savedTheme = localStorage.getItem('theme') || 'default'
    this.selectedTheme = savedTheme

    this.applyDarkMode()
    this.applyTheme()
  },
  watch: {
    darkMode(newValue) {
      localStorage.setItem('darkMode', String(newValue))
      this.applyDarkMode()
    },
    selectedTheme(newValue) {
      localStorage.setItem('theme', newValue)
      this.applyTheme()
    }
  },
  methods: {
    applyDarkMode() {
      if (this.darkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    applyTheme() {
      document.documentElement.dataset.theme = this.selectedTheme
    }
  }
})
</script>

<template>
  <div>
    <h2 class="text-3xl font-bold mb-6">Settings</h2>

    <div class="max-w-2xl">
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
              <Select v-model="selectedTheme">
                <SelectTrigger>
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="theme in themes" :key="theme.value" :value="theme.value">
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
            <Switch v-model="darkMode" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
