import { createRouter, createWebHashHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Services from '../views/Services.vue'
import Diagnostics from '../views/Diagnostics.vue'
import Telemetry from '../views/Telemetry.vue'
import PIDTuning from '../views/PIDTuning.vue'
import MotorControl from '../views/MotorControl.vue'
import Settings from '../views/Settings.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/services',
    name: 'Services',
    component: Services
  },
  {
    path: '/diagnostics',
    name: 'Diagnostics',
    component: Diagnostics
  },
  {
    path: '/telemetry',
    name: 'Telemetry',
    component: Telemetry
  },
  {
    path: '/pid-tuning',
    name: 'PIDTuning',
    component: PIDTuning
  },
  {
    path: '/motor-control',
    name: 'MotorControl',
    component: MotorControl
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
