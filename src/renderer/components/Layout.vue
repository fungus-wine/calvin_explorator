<script setup lang="ts">
import { Home, Settings, Activity, Radio, Package, OctagonX } from 'lucide-vue-next'
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
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'

const items = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
  },
  {
    title: 'Services',
    url: '/services',
    icon: Package,
  },
  {
    title: 'Diagnostics',
    url: '/diagnostics',
    icon: Activity,
  },
  {
    title: 'Telemetry',
    url: '/telemetry',
    icon: Radio,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
]
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
