<script lang="ts">
import { defineComponent } from 'vue'
import { TvMinimal, Settings, Activity, Radio, Blocks, OctagonX, Sliders } from 'lucide-vue-next'
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

export default defineComponent({
  name: 'Layout',
  components: {
    // Navigation icons don't need registration - used dynamically via <component :is>
    // OctagonX is used directly in template, so it needs registration
    OctagonX,
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
          title: NAV_TITLES.DIAGNOSTICS,
          url: NAV_ROUTES.DIAGNOSTICS,
          icon: Activity,
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
          title: NAV_TITLES.SETTINGS,
          url: NAV_ROUTES.SETTINGS,
          icon: Settings,
        },
      ] as NavigationItem[]
    }
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
      <header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger />
        <Button class="ml-auto bg-red-600 hover:bg-red-700 text-white font-semibold">
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
