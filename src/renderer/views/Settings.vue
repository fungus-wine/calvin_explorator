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
                <option value="default">Default</option>
                <option value="red">Red</option>
                <option value="rose">Rose</option>
                <option value="orange">Orange</option>
                <option value="green">Green</option>
                <option value="blue">Blue</option>
                <option value="yellow">Yellow</option>
                <option value="violet">Violet</option>
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

<script>
import Switch from '../components/ui/Switch.vue'
import Select from '../components/ui/Select.vue'

export default {
  name: 'Settings',
  components: {
    Switch,
    Select
  },
  data() {
    return {
      darkMode: true,
      selectedTheme: 'default'
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
      localStorage.setItem('darkMode', newValue)
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
}
</script>
