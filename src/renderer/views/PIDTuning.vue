<script lang="ts">
import { defineComponent } from 'vue'
import { ChevronUp, ChevronDown } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { adjustWithTuningMode } from '@/utils/pid'

interface PIDController {
  id: string
  name: string
  description: string
  p: number
  i: number
  d: number
}

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
      flashingParam: null as string | null,
      controllers: [
        {
          id: 'tilt',
          name: 'Tilt Controller',
          description: 'Main balancing PID for pitch control',
          p: 25.0,
          i: 0.5,
          d: 2.0
        },
        {
          id: 'velocity',
          name: 'Velocity Controller',
          description: 'Forward/backward movement control',
          p: 15.0,
          i: 0.3,
          d: 1.5
        }
      ] as PIDController[]
    }
  },
  methods: {
    adjustValue(controllerId: string, param: 'p' | 'i' | 'd', direction: 'up' | 'down'): void {
      const controller = this.controllers.find(c => c.id === controllerId)
      if (!controller) return

      // Calculate new value using utility
      controller[param] = adjustWithTuningMode(controller[param], this.tuningMode, direction)

      // Flash the border
      const key = `${controllerId}-${param}`
      this.flashingParam = key
      setTimeout(() => {
        if (this.flashingParam === key) {
          this.flashingParam = null
        }
      }, 200)
    }
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
          @click="tuningMode = 'ultrafine'"
        >
          Ultrafine (1%)
        </Button>
        <Button
          :variant="tuningMode === 'fine' ? 'default' : 'outline'"
          @click="tuningMode = 'fine'"
        >
          Fine (10%)
        </Button>
        <Button
          :variant="tuningMode === 'coarse' ? 'default' : 'outline'"
          @click="tuningMode = 'coarse'"
        >
          Coarse (25%)
        </Button>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6">
      <div
        v-for="controller in controllers"
        :key="controller.id"
        class="border rounded-lg p-6"
      >
        <h3 class="text-lg font-semibold mb-1">{{ controller.name }}</h3>
        <p class="text-muted-foreground text-sm mb-4">{{ controller.description }}</p>

        <div class="grid grid-cols-3 gap-6">
          <!-- P Parameter -->
          <div>
            <label class="text-sm font-medium mb-2 block">P (Proportional)</label>
            <div class="flex items-center gap-2">
              <input
                :value="controller.p"
                readonly
                class="flex-1 px-3 py-2 border rounded-md bg-muted text-center font-mono transition-colors focus:outline-none"
                :class="flashingParam === `${controller.id}-p` ? 'border-primary' : ''"
              />
              <div class="flex flex-col gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  class="h-6 w-6"
                  @click="adjustValue(controller.id, 'p', 'up')"
                >
                  <ChevronUp class="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  class="h-6 w-6"
                  @click="adjustValue(controller.id, 'p', 'down')"
                >
                  <ChevronDown class="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          <!-- I Parameter -->
          <div>
            <label class="text-sm font-medium mb-2 block">I (Integral)</label>
            <div class="flex items-center gap-2">
              <input
                :value="controller.i"
                readonly
                class="flex-1 px-3 py-2 border rounded-md bg-muted text-center font-mono transition-colors focus:outline-none"
                :class="flashingParam === `${controller.id}-i` ? 'border-primary' : ''"
              />
              <div class="flex flex-col gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  class="h-6 w-6"
                  @click="adjustValue(controller.id, 'i', 'up')"
                >
                  <ChevronUp class="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  class="h-6 w-6"
                  @click="adjustValue(controller.id, 'i', 'down')"
                >
                  <ChevronDown class="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          <!-- D Parameter -->
          <div>
            <label class="text-sm font-medium mb-2 block">D (Derivative)</label>
            <div class="flex items-center gap-2">
              <input
                :value="controller.d"
                readonly
                class="flex-1 px-3 py-2 border rounded-md bg-muted text-center font-mono transition-colors focus:outline-none"
                :class="flashingParam === `${controller.id}-d` ? 'border-primary' : ''"
              />
              <div class="flex flex-col gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  class="h-6 w-6"
                  @click="adjustValue(controller.id, 'd', 'up')"
                >
                  <ChevronUp class="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  class="h-6 w-6"
                  @click="adjustValue(controller.id, 'd', 'down')"
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
