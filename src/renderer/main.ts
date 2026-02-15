import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useThemeStore } from 'theminator'
import App from './App.vue'
import router from './router'
import 'theminator/styles'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize theme system
useThemeStore().initialize()

app.mount('#app')
