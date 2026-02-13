<template>
  <Layout />
</template>

<script>
import Layout from './components/Layout.vue'

export default {
  name: 'App',
  components: {
    Layout
  },
  mounted() {
    // Apply dark mode on app load, default to dark
    const savedDarkMode = localStorage.getItem('darkMode')
    const darkMode = savedDarkMode !== null ? savedDarkMode === 'true' : true

    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Apply saved theme, default to 'default'
    const savedTheme = localStorage.getItem('theme') || 'default'
    document.documentElement.dataset.theme = savedTheme
  }
}
</script>
