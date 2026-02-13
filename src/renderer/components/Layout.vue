<template>
  <div class="flex h-screen overflow-hidden">
    <Sidebar>
      <SidebarNav :items="navItems" />
    </Sidebar>

    <main class="flex-1 overflow-auto">
      <div class="container mx-auto p-6">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script>
import Sidebar from './ui/Sidebar.vue'
import SidebarNav from './ui/SidebarNav.vue'
import { LayoutDashboard, Settings, Blocks, Activity, Radio } from 'lucide-vue-next'

export default {
  name: 'Layout',
  components: {
    Sidebar,
    SidebarNav
  },
  data() {
    return {
      navItems: [
        {
          label: 'Dashboard',
          to: '/dashboard',
          icon: LayoutDashboard
        },
        {
          label: 'Services',
          to: '/services',
          icon: Blocks
        },
        {
          label: 'Diagnostics',
          to: '/diagnostics',
          icon: Activity
        },
        {
          label: 'Telemetry',
          to: '/telemetry',
          icon: Radio
        },
        {
          label: 'Settings',
          to: '/settings',
          icon: Settings
        }
      ]
    }
  }
}
</script>
