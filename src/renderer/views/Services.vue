<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'pinia'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useServicesStore } from '@/stores/services'

export default defineComponent({
  name: 'Services',
  components: {
    Switch,
    Label
  },
  computed: {
    ...mapState(useServicesStore, {
      services: 'allServices'
    })
  },
  mounted() {
    const servicesStore = useServicesStore()
    servicesStore.initialize()
  },
  methods: {
    ...mapActions(useServicesStore, ['setServiceEnabled']),

    handleServiceToggle(serviceId: string, enabled: boolean): void {
      this.setServiceEnabled(serviceId, enabled)
    }
  }
})
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
          :checked="service.enabled"
          @update:checked="(checked) => handleServiceToggle(service.id, checked)"
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
