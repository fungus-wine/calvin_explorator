<script setup lang="ts">
import { ref } from 'vue'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface Service {
  id: string
  title: string
  description: string
  enabled: boolean
}

const services = ref<Service[]>([
  {
    id: 'telemetry',
    title: 'Telemetry Service',
    description: 'Real-time monitoring and data collection from connected devices',
    enabled: true
  },
  {
    id: 'diagnostics',
    title: 'Diagnostics Service',
    description: 'Automated system health checks and performance analysis',
    enabled: true
  },
  {
    id: 'logging',
    title: 'Logging Service',
    description: 'Centralized logging and event tracking across all services',
    enabled: false
  },
  {
    id: 'notifications',
    title: 'Notification Service',
    description: 'Alert system for critical events and system status changes',
    enabled: false
  },
  {
    id: 'analytics',
    title: 'Analytics Service',
    description: 'Data processing and statistical analysis of collected metrics',
    enabled: true
  },
  {
    id: 'backup',
    title: 'Backup Service',
    description: 'Automated backup and recovery of configuration and data',
    enabled: false
  }
])
</script>

<template>
  <div>
    <h2 class="text-3xl font-bold mb-6">Services</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Label
        v-for="service in services"
        :key="service.id"
        :for="service.id"
        class="flex items-start rounded-lg border p-4 cursor-pointer transition-colors has-data-[state=checked]:bg-primary/5 has-data-[state=checked]:border-primary dark:has-data-[state=checked]:bg-primary/10"
      >
        <Switch
          :id="service.id"
          v-model:checked="service.enabled"
          class="sr-only"
        />
        <div class="grid gap-1.5 font-normal">
          <p class="text-sm leading-none font-medium">
            {{ service.title }}
          </p>
          <p class="text-muted-foreground text-sm">
            {{ service.description }}
          </p>
        </div>
      </Label>
    </div>
  </div>
</template>
