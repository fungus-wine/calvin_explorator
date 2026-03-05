<script lang="ts">
import { defineComponent } from 'vue'
import { ChevronUp, ChevronDown } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { adjustWithTuningMode } from '@/utils/pid'
import { usePidStore } from '@/stores/pid'
import { useTelemetryStore } from '@/stores/telemetry'
import { toast } from 'vue-sonner'

type TuningMode = 'ultrafine' | 'fine' | 'coarse'

export default defineComponent({
  name: 'PIDTuning',
  components: {
    ChevronUp,
    ChevronDown,
    Button,
    Label
  },
  data() {
    return {
      tuningMode: 'fine' as TuningMode,
      pendingParam: null as string | null,
    }
  },
  computed: {
    pidStore() {
      return usePidStore()
    },
    telemetryStore() {
      return useTelemetryStore()
    },
    controllers() {
      return this.pidStore.controllers
    },
    disabled(): boolean {
      return !this.pidStore.isAvailable
    },
  },
  watch: {
    'telemetryStore.isConnected'(connected: boolean) {
      if (connected) {
        this.loadPidValues()
      }
    },
  },
  created() {
    this.pidStore.init()
    if (this.telemetryStore.isConnected) {
      this.loadPidValues()
    }
  },
  unmounted() {
    this.pidStore.dispose()
  },
  methods: {
    async loadPidValues() {
      try {
        await this.pidStore.fetchCurrentValues()
      } catch (err) {
        toast.error('Failed to load PID values', {
          description: String(err),
        })
      }
    },

    async adjustValue(controllerId: string, param: 'kp' | 'ki' | 'kd', direction: 'up' | 'down') {
      if (this.disabled || this.pendingParam) return

      const controller = this.controllers.find(c => c.id === controllerId)
      if (!controller) return

      const newValue = adjustWithTuningMode(controller.values[param], this.tuningMode, direction)
      const key = `${controllerId}-${param}`
      this.pendingParam = key

      try {
        await this.pidStore.adjustValue(controllerId, param, newValue)
        this.pidStore.flashParam(key)
      } catch (err) {
        toast.error('PID update failed', {
          description: String(err),
        })
      } finally {
        this.pendingParam = null
      }
    },
  }
})
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-3xl font-bold">PID Tuning</h2>

      <div class="flex gap-2">
        <Button
          :variant="tuningMode === 'ultrafine' ? 'default' : 'outline'"
          :disabled="disabled"
          @click="tuningMode = 'ultrafine'"
        >
          Ultrafine (1%)
        </Button>
        <Button
          :variant="tuningMode === 'fine' ? 'default' : 'outline'"
          :disabled="disabled"
          @click="tuningMode = 'fine'"
        >
          Fine (10%)
        </Button>
        <Button
          :variant="tuningMode === 'coarse' ? 'default' : 'outline'"
          :disabled="disabled"
          @click="tuningMode = 'coarse'"
        >
          Coarse (25%)
        </Button>
      </div>
    </div>

    <div v-if="!telemetryStore.isConnected" class="mb-4 text-sm text-muted-foreground">
      Not connected to cogitator. PID controls are disabled.
    </div>
    <div v-else-if="!pidStore.loaded" class="mb-4 text-sm text-muted-foreground">
      Loading PID values from cogitator...
    </div>

    <div class="grid grid-cols-1 gap-6">
      <div
        v-for="controller in controllers"
        :key="controller.id"
        class="border rounded-lg p-6"
        :class="{ 'opacity-50': disabled }"
      >
        <h3 class="text-lg font-semibold mb-1">{{ controller.name }}</h3>
        <p class="text-muted-foreground text-sm mb-4">{{ controller.description }}</p>

        <div class="grid grid-cols-3 gap-6">
          <div v-for="p in (['kp', 'ki', 'kd'] as const)" :key="p">
            <label class="text-sm font-medium mb-2 block">
              {{ p === 'kp' ? 'P (Proportional)' : p === 'ki' ? 'I (Integral)' : 'D (Derivative)' }}
            </label>
            <div class="flex items-center gap-2">
              <input
                :value="controller.values[p]"
                readonly
                class="flex-1 px-3 py-2 border rounded-md bg-muted text-center font-mono transition-colors focus:outline-none"
                :class="{
                  'border-primary': pidStore.flashingParam === `${controller.id}-${p}`,
                  'animate-pulse': pendingParam === `${controller.id}-${p}`,
                }"
              />
              <div class="flex flex-col gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  class="h-6 w-6"
                  :disabled="disabled || pendingParam !== null"
                  @click="adjustValue(controller.id, p, 'up')"
                >
                  <ChevronUp class="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  class="h-6 w-6"
                  :disabled="disabled || pendingParam !== null"
                  @click="adjustValue(controller.id, p, 'down')"
                >
                  <ChevronDown class="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
