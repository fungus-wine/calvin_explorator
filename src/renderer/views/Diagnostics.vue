<script lang="ts">
import { defineComponent } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import { VisXYContainer, VisArea, VisLine, VisAxis } from '@unovis/vue'
import { CHART_CONFIG, CHART_GRADIENT_DEFS, FFT_CONFIG } from '@/constants/chart'
import { useTelemetryStore } from '@/stores/telemetry'

// Type definition for FFT data points
interface FFTDataPoint {
  frequency: number
  magnitude: number
}

// Type for I2C timeline chart accessors
interface I2CTimelinePoint {
  timestamp: number
  nacks: number
  timeouts: number
  resets: number
}

export default defineComponent({
  name: 'Diagnostics',
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
      CHART_HEIGHT: CHART_CONFIG.HEIGHT,
      I2C_CHART_HEIGHT: 200,
      AREA_OPACITY: CHART_CONFIG.AREA_OPACITY,
      LINE_WIDTH: CHART_CONFIG.LINE_WIDTH,
      X_AXIS_TICKS: CHART_CONFIG.X_AXIS_TICKS,
      Y_AXIS_TICKS: CHART_CONFIG.Y_AXIS_TICKS,
      svgDefs: CHART_GRADIENT_DEFS,
      balancerData: [] as FFTDataPoint[],
      oakdData: [] as FFTDataPoint[],
      telemetryStore: useTelemetryStore()
    }
  },
  computed: {
    i2cHealth() {
      return this.telemetryStore.i2cHealth
    },
    hasI2CData() {
      return this.i2cHealth.status !== 'no_data'
    },
    i2cTickValues(): number[] {
      return this.timelineTickValues(this.i2cHealth.timeline)
    }
  },
  created() {
    // Initialize FFT chart data (dummy — cogitator sends raw IMU, not FFT)
    this.balancerData = this.generateBalancerFFT()
    this.oakdData = this.generateOakDFFT()
  },
  methods: {
    timelineTickValues(timeline: { timestamp: number }[]): number[] {
      const len = timeline.length
      if (len < 2) return []
      const NUM_TICKS = 6
      const last = len - 1
      const step = last / (NUM_TICKS - 1)
      const values: number[] = []
      for (let i = 0; i < NUM_TICKS - 1; i++) {
        values.push(Math.round(i * step))
      }
      values.push(last)
      return values
    },
    i2cXTickFormat(index: number): string {
      const timeline = this.i2cHealth.timeline
      if (timeline.length === 0) return ''
      const latest = timeline[timeline.length - 1].timestamp
      const point = timeline[Math.round(index)]
      if (!point) return ''
      const secondsAgo = Math.round((point.timestamp - latest) / 1000)
      return `${secondsAgo}`
    },
    // Generate realistic FFT data (frequency spectrum)
    generateBalancerFFT(): FFTDataPoint[] {
      const data: FFTDataPoint[] = []

      for (let i = 0; i <= FFT_CONFIG.DATA_POINTS; i++) {
        const freq = i * FFT_CONFIG.FREQ_STEP

        // Base noise that decays with frequency
        let magnitude = Math.exp(-freq / 30) * (0.05 + Math.random() * 0.03)

        // Fundamental vibration at ~8 Hz (balancer motor)
        magnitude += 0.6 * Math.exp(-Math.pow(freq - 8, 2) / 2)

        // Second harmonic at ~16 Hz
        magnitude += 0.3 * Math.exp(-Math.pow(freq - 16, 2) / 3)

        // Third harmonic at ~24 Hz
        magnitude += 0.15 * Math.exp(-Math.pow(freq - 24, 2) / 4)

        // Structural resonance at ~35 Hz
        magnitude += 0.2 * Math.exp(-Math.pow(freq - 35, 2) / 2.5)

        data.push({ frequency: freq, magnitude })
      }

      return data
    },
    generateOakDFFT(): FFTDataPoint[] {
      const data: FFTDataPoint[] = []

      for (let i = 0; i <= FFT_CONFIG.DATA_POINTS; i++) {
        const freq = i * FFT_CONFIG.FREQ_STEP

        // Base noise that decays with frequency
        let magnitude = Math.exp(-freq / 25) * (0.04 + Math.random() * 0.02)

        // Main vibration at ~6 Hz (slightly different from balancer)
        magnitude += 0.5 * Math.exp(-Math.pow(freq - 6, 2) / 2.5)

        // Second harmonic at ~12 Hz
        magnitude += 0.25 * Math.exp(-Math.pow(freq - 12, 2) / 3)

        // Camera-specific vibration at ~28 Hz
        magnitude += 0.18 * Math.exp(-Math.pow(freq - 28, 2) / 2)

        // High frequency noise peak at ~42 Hz
        magnitude += 0.12 * Math.exp(-Math.pow(freq - 42, 2) / 3)

        data.push({ frequency: freq, magnitude })
      }

      return data
    }
  }
})
</script>

<template>
  <div>
    <h2 class="text-3xl font-bold mb-6">Diagnostics</h2>

    <!-- I2C Bus Health Monitoring -->
    <div class="mb-6">
      <ErrorBoundary>
        <Card>
          <CardHeader>
            <CardTitle>I2C Bus Health</CardTitle>
            <CardDescription>Aggregate health from instinctus via cogitator</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <!-- Status Badge -->
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium">Status:</span>
              <Badge
                v-if="hasI2CData"
                :variant="i2cHealth.status === 'healthy' ? 'default' : i2cHealth.status === 'warning' ? 'secondary' : 'destructive'"
                class="capitalize"
              >
                <span v-if="i2cHealth.status === 'healthy'" class="mr-1">✓</span>
                <span v-if="i2cHealth.status === 'warning'" class="mr-1">⚠</span>
                <span v-if="i2cHealth.status === 'error'" class="mr-1">✗</span>
                {{ i2cHealth.status }}
              </Badge>
              <Badge v-else variant="secondary">No Data</Badge>
            </div>

            <!-- Metrics Grid -->
            <div class="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div class="text-muted-foreground">NACKs</div>
                <div class="font-mono font-semibold text-2xl">
                  <template v-if="hasI2CData">{{ i2cHealth.nacks }}</template>
                  <template v-else>--</template>
                </div>
              </div>
              <div>
                <div class="text-muted-foreground">Timeouts</div>
                <div class="font-mono font-semibold text-2xl">
                  <template v-if="hasI2CData">{{ i2cHealth.timeouts }}</template>
                  <template v-else>--</template>
                </div>
              </div>
              <div>
                <div class="text-muted-foreground">Resets</div>
                <div class="font-mono font-semibold text-2xl">
                  <template v-if="hasI2CData">{{ i2cHealth.resets }}</template>
                  <template v-else>--</template>
                </div>
              </div>
            </div>

            <!-- Error Timeline Chart -->
            <div v-if="i2cHealth.timeline.length > 1">
              <div class="text-sm font-medium mb-2">Error Timeline (NACKs + Timeouts)</div>
              <VisXYContainer
                :data="i2cHealth.timeline"
                :height="I2C_CHART_HEIGHT"
                :duration="0"
                :svg-defs="svgDefs"
                class="chart-container"
              >
                <VisArea
                  :x="(_d: I2CTimelinePoint, i: number) => i"
                  :y="(d: I2CTimelinePoint) => d.nacks + d.timeouts"
                  color="url(#fillChart1)"
                  :opacity="AREA_OPACITY"
                />
                <VisLine
                  :x="(_d: I2CTimelinePoint, i: number) => i"
                  :y="(d: I2CTimelinePoint) => d.nacks + d.timeouts"
                  color="var(--chart-1)"
                  :line-width="LINE_WIDTH"
                />
                <VisAxis
                  type="x"
                  :x="(_d: I2CTimelinePoint, i: number) => i"
                  label="Seconds Ago"
                  :tick-line="false"
                  :domain-line="false"
                  :grid-line="false"
                  :tick-values="i2cTickValues"
                  :tick-format="i2cXTickFormat"
                />
                <VisAxis
                  type="y"
                  label="Errors"
                  :num-ticks="5"
                  :tick-line="false"
                  :domain-line="false"
                />
              </VisXYContainer>
            </div>
            <div v-else class="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
              Waiting for I2C health data...
            </div>
          </CardContent>
        </Card>
      </ErrorBoundary>
    </div>

    <!-- FFT Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Balancer IMU FFT -->
      <ErrorBoundary>
        <Card>
          <CardHeader>
            <CardTitle>Balancer IMU</CardTitle>
            <CardDescription>FFT - Accelerometer Data</CardDescription>
          </CardHeader>
          <CardContent>
            <VisXYContainer
              :data="balancerData"
              :height="CHART_HEIGHT"
              :svg-defs="svgDefs"
              class="chart-container"
            >
              <VisArea
                :x="(d: FFTDataPoint) => d.frequency"
                :y="(d: FFTDataPoint) => d.magnitude"
                color="url(#fillChart1)"
                :opacity="AREA_OPACITY"
              />
              <VisLine
                :x="(d: FFTDataPoint) => d.frequency"
                :y="(d: FFTDataPoint) => d.magnitude"
                color="var(--chart-1)"
                :line-width="LINE_WIDTH"
              />
              <VisAxis
                type="x"
                :x="(d: FFTDataPoint) => d.frequency"
                label="Frequency (Hz)"
                :tick-line="false"
                :domain-line="false"
                :grid-line="false"
                :num-ticks="X_AXIS_TICKS"
              />
              <VisAxis
                type="y"
                label="Magnitude"
                :num-ticks="Y_AXIS_TICKS"
                :tick-line="false"
                :domain-line="false"
              />
            </VisXYContainer>
          </CardContent>
        </Card>
      </ErrorBoundary>

      <!-- OAK-D Pro W IMU FFT -->
      <ErrorBoundary>
        <Card>
          <CardHeader>
            <CardTitle>OAK-D Pro W IMU</CardTitle>
            <CardDescription>FFT - Accelerometer Data</CardDescription>
          </CardHeader>
          <CardContent>
            <VisXYContainer
              :data="oakdData"
              :height="CHART_HEIGHT"
              :svg-defs="svgDefs"
              class="chart-container"
            >
              <VisArea
                :x="(d: FFTDataPoint) => d.frequency"
                :y="(d: FFTDataPoint) => d.magnitude"
                color="url(#fillChart1)"
                :opacity="AREA_OPACITY"
              />
              <VisLine
                :x="(d: FFTDataPoint) => d.frequency"
                :y="(d: FFTDataPoint) => d.magnitude"
                color="var(--chart-1)"
                :line-width="LINE_WIDTH"
              />
              <VisAxis
                type="x"
                :x="(d: FFTDataPoint) => d.frequency"
                label="Frequency (Hz)"
                :tick-line="false"
                :domain-line="false"
                :grid-line="false"
                :num-ticks="X_AXIS_TICKS"
              />
              <VisAxis
                type="y"
                label="Magnitude"
                :num-ticks="Y_AXIS_TICKS"
                :tick-line="false"
                :domain-line="false"
              />
            </VisXYContainer>
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

/* Axis titles (Frequency, Magnitude) */
:deep(.chart-container svg text:not(.tick text)) {
  fill: var(--muted-foreground) !important;
}
</style>
