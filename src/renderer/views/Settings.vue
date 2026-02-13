<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const darkMode = ref(true)
const selectedTheme = ref('default')

const themes = [
  { value: 'default', label: 'Default' },
  { value: 'red', label: 'Red' },
  { value: 'rose', label: 'Rose' },
  { value: 'orange', label: 'Orange' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'violet', label: 'Violet' },
]

const applyDarkMode = () => {
  if (darkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const applyTheme = () => {
  document.documentElement.dataset.theme = selectedTheme.value
}

onMounted(() => {
  const savedDarkMode = localStorage.getItem('darkMode')
  darkMode.value = savedDarkMode !== null ? savedDarkMode === 'true' : true

  const savedTheme = localStorage.getItem('theme') || 'default'
  selectedTheme.value = savedTheme

  applyDarkMode()
  applyTheme()
})

watch(darkMode, (newValue) => {
  localStorage.setItem('darkMode', String(newValue))
  applyDarkMode()
})

watch(selectedTheme, (newValue) => {
  localStorage.setItem('theme', newValue)
  applyTheme()
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
