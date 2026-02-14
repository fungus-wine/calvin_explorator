<script lang="ts">
import { defineComponent } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import { VisXYContainer, VisArea, VisLine, VisAxis } from '@unovis/vue'
import { CHART_CONFIG, CHART_GRADIENT_DEFS } from '@/constants/chart'

// Type definitions for battery monitoring
interface BatteryTimelinePoint {
  timestamp: number
  voltage: number
  current: number
  temperature: number
}

interface BatteryData {
  voltage: number
  current: number
  power: number
  stateOfCharge: number
  temperature: number
  status: 'good' | 'warning' | 'critical'
  timeline: BatteryTimelinePoint[]
}

export default defineComponent({
  name: 'Telemetry',
  components: {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Badge,
    ErrorBoundary,
    VisXYContainer,
    VisArea,
    VisLine,
    VisAxis
  },
  data() {
    return {
      CHART_HEIGHT: 200,
      AREA_OPACITY: CHART_CONFIG.AREA_OPACITY,
      LINE_WIDTH: CHART_CONFIG.LINE_WIDTH,
      svgDefs: CHART_GRADIENT_DEFS,
      battery: {} as BatteryData
    }
  },
  created() {
    // Initialize battery data
    this.battery = this.generateBatteryData()
  },
  methods: {
    // Generate realistic battery monitoring data
    generateBatteryData(): BatteryData {
      const TIMELINE_POINTS = 60 // 60 seconds
      const timeline: BatteryTimelinePoint[] = []

      // Starting conditions (12V LiPo at ~70% charge)
      let baseVoltage = 11.4 // 3.8V per cell
      let baseTemp = 25 // Celsius

      // Generate timeline data
      for (let i = 0; i < TIMELINE_POINTS; i++) {
        const timestamp = i

        // Voltage slowly declines over time with some noise
        const voltage = baseVoltage - (i * 0.001) + (Math.random() - 0.5) * 0.05

        // Current varies based on robot activity (simulate activity bursts)
        let current = 1.5 + Math.random() * 0.5 // Baseline 1.5-2.0A

        // Activity bursts at certain times
        if (i > 15 && i < 25) {
          current = 3.5 + Math.random() * 1.0 // High activity 3.5-4.5A
        }
        if (i > 45 && i < 55) {
          current = 4.0 + Math.random() * 1.5 // Very high activity 4.0-5.5A
        }

        // Temperature increases slightly with high current
        const tempIncrease = (current - 2.0) * 0.5
        const temperature = baseTemp + tempIncrease + (Math.random() - 0.5) * 1.0

        timeline.push({
          timestamp,
          voltage: Math.round(voltage * 100) / 100,
          current: Math.round(current * 100) / 100,
          temperature: Math.round(temperature * 10) / 10
        })
      }

      // Use most recent values
      const lastPoint = timeline[timeline.length - 1]
      const voltage = lastPoint.voltage
      const current = lastPoint.current
      const temperature = lastPoint.temperature

      // Calculate power (W = V * A)
      const power = Math.round(voltage * current * 10) / 10

      // Estimate state of charge based on voltage (12V LiPo: 3S)
      // 12.6V = 100%, 11.1V = 50%, 9.0V = 0%
      let stateOfCharge = 0
      if (voltage >= 12.6) {
        stateOfCharge = 100
      } else if (voltage >= 11.1) {
        // Linear interpolation between 50% and 100%
        stateOfCharge = 50 + ((voltage - 11.1) / (12.6 - 11.1)) * 50
      } else if (voltage >= 9.0) {
        // Linear interpolation between 0% and 50%
        stateOfCharge = ((voltage - 9.0) / (11.1 - 9.0)) * 50
      }
      stateOfCharge = Math.round(stateOfCharge)

      // Determine status
      let status: 'good' | 'warning' | 'critical'
      if (voltage < 9.5 || temperature > 45) {
        status = 'critical'
      } else if (voltage < 10.5 || temperature > 35) {
        status = 'warning'
      } else {
        status = 'good'
      }

      return {
        voltage,
        current,
        power,
        stateOfCharge,
        temperature,
        status,
        timeline
      }
    }
  }
})
</script>

<template>
  <div>
    <h2 class="text-3xl font-bold mb-6">Telemetry</h2>

    <!-- Battery Health Section -->
    <div class="mb-6">
      <ErrorBoundary>
        <Card>
          <CardHeader>
            <CardTitle>Battery Health</CardTitle>
            <CardDescription>12V LiPo (3S) - Adafruit INA228</CardDescription>
          </CardHeader>
          <CardContent class="space-y-6">
            <!-- Status and Key Metrics -->
            <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <!-- Status Badge -->
              <div>
                <div class="text-sm text-muted-foreground mb-2">Status</div>
                <Badge
                  :variant="battery.status === 'good' ? 'default' : battery.status === 'warning' ? 'secondary' : 'destructive'"
                  class="capitalize"
                >
                  <span v-if="battery.status === 'good'" class="mr-1">✓</span>
                  <span v-if="battery.status === 'warning'" class="mr-1">⚠</span>
                  <span v-if="battery.status === 'critical'" class="mr-1">✗</span>
                  {{ battery.status }}
                </Badge>
              </div>

              <!-- Voltage -->
              <div>
                <div class="text-sm text-muted-foreground mb-2">Voltage</div>
                <div class="text-2xl font-mono font-bold">{{ battery.voltage }}V</div>
              </div>

              <!-- Current -->
              <div>
                <div class="text-sm text-muted-foreground mb-2">Current</div>
                <div class="text-2xl font-mono font-bold">{{ battery.current }}A</div>
              </div>

              <!-- Power -->
              <div>
                <div class="text-sm text-muted-foreground mb-2">Power</div>
                <div class="text-2xl font-mono font-bold">{{ battery.power }}W</div>
              </div>

              <!-- Temperature -->
              <div>
                <div class="text-sm text-muted-foreground mb-2">Temperature</div>
                <div class="text-2xl font-mono font-bold">
                  {{ battery.temperature }}°C
                  <span v-if="battery.temperature > 35" class="text-base text-yellow-600 dark:text-yellow-400 ml-1">⚠</span>
                </div>
              </div>
            </div>

            <!-- Current History Chart -->
            <div>
              <div class="text-sm font-medium mb-2">Current Draw</div>
              <VisXYContainer
                :data="battery.timeline"
                :height="CHART_HEIGHT"
                :svg-defs="svgDefs"
                class="chart-container"
              >
                <VisArea
                  :x="(d: BatteryTimelinePoint) => d.timestamp"
                  :y="(d: BatteryTimelinePoint) => d.current"
                  color="url(#fillChart2)"
                  :opacity="AREA_OPACITY"
                />
                <VisLine
                  :x="(d: BatteryTimelinePoint) => d.timestamp"
                  :y="(d: BatteryTimelinePoint) => d.current"
                  color="var(--chart-2)"
                  :line-width="LINE_WIDTH"
                />
                <VisAxis
                  type="x"
                  :x="(d: BatteryTimelinePoint) => d.timestamp"
                  label="Time (seconds ago)"
                  :tick-line="false"
                  :domain-line="false"
                  :grid-line="false"
                  :num-ticks="6"
                />
                <VisAxis
                  type="y"
                  label="Current (A)"
                  :num-ticks="5"
                  :tick-line="false"
                  :domain-line="false"
                />
              </VisXYContainer>
            </div>
          </CardContent>
        </Card>
      </ErrorBoundary>
    </div>
  </div>
</template>

<style scoped>
.chart-container {
  --vis-axis-grid-color: var(--muted);
  --vis-axis-tick-color: var(--muted-foreground);
  --vis-axis-tick-label-color: var(--muted-foreground);
}

/* Grid lines - thin and crisp */
:deep(.chart-container svg .grid line) {
  stroke: var(--muted) !important;
  stroke-width: 1px !important;
  shape-rendering: crispEdges !important;
}

/* Axis tick labels (numbers) */
:deep(.chart-container svg .tick text) {
  fill: var(--muted-foreground) !important;
}

/* Axis titles */
:deep(.chart-container svg text:not(.tick text)) {
  fill: var(--muted-foreground) !important;
}
</style>
