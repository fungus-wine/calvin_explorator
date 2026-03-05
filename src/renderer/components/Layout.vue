<script lang="ts">
import { defineComponent } from 'vue'
import { TvMinimal, Settings, Activity, Radio, Blocks, OctagonX, Sliders, Cog, TriangleAlert, RotateCw } from 'lucide-vue-next'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { NAV_TITLES, NAV_ROUTES, type NavigationItem } from '@/constants/navigation'
import { useTelemetryStore } from '@/stores/telemetry'

export default defineComponent({
  name: 'Layout',
  components: {
    // Navigation icons don't need registration - used dynamically via <component :is>
    // OctagonX is used directly in template, so it needs registration
    OctagonX,
    TriangleAlert,
    RotateCw,
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarRail,
    SidebarTrigger,
    Button
  },
  data() {
    return {
      items: [
        {
          title: NAV_TITLES.DASHBOARD,
          url: NAV_ROUTES.DASHBOARD,
          icon: TvMinimal,
        },
        {
          title: NAV_TITLES.SERVICES,
          url: NAV_ROUTES.SERVICES,
          icon: Blocks,
        },
        {
          title: NAV_TITLES.TELEMETRY,
          url: NAV_ROUTES.TELEMETRY,
          icon: Radio,
        },
        {
          title: NAV_TITLES.PID_TUNING,
          url: NAV_ROUTES.PID_TUNING,
          icon: Sliders,
        },
        {
          title: NAV_TITLES.MOTOR_CONTROL,
          url: NAV_ROUTES.MOTOR_CONTROL,
          icon: Cog,
        },
        {
          title: NAV_TITLES.DIAGNOSTICS,
          url: NAV_ROUTES.DIAGNOSTICS,
          icon: Activity,
        },
        {
          title: NAV_TITLES.SETTINGS,
          url: NAV_ROUTES.SETTINGS,
          icon: Settings,
        },
      ] satisfies NavigationItem[],
      batteryLevel: 70, // State of charge percentage
      telemetryStore: useTelemetryStore(),
      retryCountdown: 0,
      countdownTimer: null as ReturnType<typeof setInterval> | null,
    }
  },
  computed: {
    connectionStatus() {
      return this.telemetryStore.connectionStatus
    },
    reconnectAttempt() {
      return this.telemetryStore.reconnectAttempt
    },
    connectionDotClass() {
      switch (this.connectionStatus) {
        case 'connected': return 'bg-green-500'
        case 'connecting':
        case 'reconnecting': return 'bg-yellow-500 animate-pulse'
        case 'offline': return 'bg-muted-foreground'
        default: return 'bg-red-500'
      }
    },
    connectionLabel(): string {
      switch (this.connectionStatus) {
        case 'connected': return 'Connected'
        case 'connecting': return 'Connecting...'
        case 'reconnecting': {
          const countdown = this.retryCountdown > 0 ? `, retry in ${this.retryCountdown}s` : ''
          return `Reconnecting (attempt ${this.reconnectAttempt}${countdown})`
        }
        case 'offline': return 'Offline'
        default: return 'Disconnected'
      }
    },
    frontTofWarning() {
      return this.telemetryStore.frontTofWarning
    },
    rearTofWarning() {
      return this.telemetryStore.rearTofWarning
    }
  },
  watch: {
    'telemetryStore.nextRetryAt'(nextRetryAt: number | null) {
      this.clearCountdownTimer()
      if (nextRetryAt === null) {
        this.retryCountdown = 0
        return
      }
      this.updateCountdown(nextRetryAt)
      this.countdownTimer = setInterval(() => this.updateCountdown(nextRetryAt), 1000)
    },
    'telemetryStore.connectionStatus'(status: string) {
      if (status !== 'reconnecting') {
        this.clearCountdownTimer()
        this.retryCountdown = 0
      }
    },
  },
  created() {
    // Initialize battery level with dummy data
    this.batteryLevel = this.generateBatteryLevel()
    // Connect to cogitator
    if (this.telemetryStore.connectionStatus === 'disconnected') {
      this.telemetryStore.connect()
    }
  },
  beforeUnmount() {
    this.clearCountdownTimer()
  },
  methods: {
    generateBatteryLevel(): number {
      return 65 + Math.floor(Math.random() * 10)
    },
    updateCountdown(nextRetryAt: number) {
      this.retryCountdown = Math.max(0, Math.ceil((nextRetryAt - Date.now()) / 1000))
    },
    clearCountdownTimer() {
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer)
        this.countdownTimer = null
      }
    },
    retryConnection() {
      this.telemetryStore.retry()
    },
  }
})
</script>

<template>
  <SidebarProvider>
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <span class="text-xl font-bold">C</span>
              </div>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">Calvin Console</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="item in items" :key="item.title">
                <SidebarMenuButton as-child>
                  <router-link :to="item.url">
                    <component :is="item.icon" />
                    <span>{{ item.title }}</span>
                  </router-link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
    <SidebarInset>
      <header class="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
        <SidebarTrigger />

        <!-- Battery Status -->
        <div class="flex items-center gap-2 ml-2">
          <!-- Battery Icon -->
          <div class="relative flex items-center">
            <!-- Battery body -->
            <div class="relative w-12 h-6 border-2 rounded flex items-center"
                 :class="{
                   'border-green-600 dark:border-green-400': batteryLevel > 50,
                   'border-yellow-600 dark:border-yellow-400': batteryLevel > 20 && batteryLevel <= 50,
                   'border-red-600 dark:border-red-400': batteryLevel <= 20
                 }">
              <!-- Fill level -->
              <div class="h-3.5 ml-0.5 rounded-sm transition-all duration-300"
                   :class="{
                     'bg-green-600 dark:bg-green-400': batteryLevel > 50,
                     'bg-yellow-600 dark:bg-yellow-400': batteryLevel > 20 && batteryLevel <= 50,
                     'bg-red-600 dark:bg-red-400': batteryLevel <= 20
                   }"
                   :style="{ width: Math.max(2, (batteryLevel / 100) * 43) + 'px' }">
              </div>
            </div>
            <!-- Battery terminal (nub) -->
            <div class="w-1 h-3 rounded-r"
                 :class="{
                   'bg-green-600 dark:bg-green-400': batteryLevel > 50,
                   'bg-yellow-600 dark:bg-yellow-400': batteryLevel > 20 && batteryLevel <= 50,
                   'bg-red-600 dark:bg-red-400': batteryLevel <= 20
                 }">
            </div>
          </div>
          <!-- Percentage -->
          <div class="text-sm font-mono font-semibold">{{ batteryLevel }}%</div>
        </div>

        <!-- Connection Status -->
        <div class="flex items-center gap-1.5 ml-2" :title="connectionLabel">
          <div class="size-2.5 rounded-full" :class="connectionDotClass"></div>
          <span class="text-xs text-muted-foreground hidden sm:inline">{{ connectionLabel }}</span>
          <Button v-if="connectionStatus === 'offline'" variant="ghost" size="sm" class="h-6 px-2 text-xs" @click="retryConnection">
            <RotateCw class="mr-1 h-3 w-3" />
            Retry
          </Button>
        </div>

        <!-- ToF Warning Icons -->
        <div v-if="frontTofWarning" class="flex items-center gap-1 ml-2 text-red-600 dark:text-red-400" title="Front obstacle warning">
          <TriangleAlert class="h-4 w-4" />
          <span class="text-xs font-medium">Front</span>
        </div>
        <div v-if="rearTofWarning" class="flex items-center gap-1 ml-1 text-red-600 dark:text-red-400" title="Rear obstacle warning">
          <TriangleAlert class="h-4 w-4" />
          <span class="text-xs font-medium">Rear</span>
        </div>

        <Button variant="destructive" class="ml-auto font-semibold">
          <OctagonX class="mr-2 h-5 w-5" />
          STOP
        </Button>
      </header>
      <div class="flex flex-1 flex-col gap-4 p-4">
        <router-view />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
