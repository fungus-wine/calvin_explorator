<script lang="ts">
import { defineComponent } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import { VisXYContainer, VisArea, VisLine, VisAxis } from '@unovis/vue'
import { CHART_CONFIG, CHART_GRADIENT_DEFS, FFT_CONFIG } from '@/constants/chart'

// Type definition for FFT data points
interface FFTDataPoint {
  frequency: number
  magnitude: number
}

// Type definitions for I2C bus monitoring
interface I2CTimelinePoint {
  timestamp: number
  errorRate: number
  leftMotorCurrent: number
  rightMotorCurrent: number
}

interface I2CBusData {
  busId: number
  label: string
  status: 'healthy' | 'warning' | 'error'
  totalTransactions: number
  totalErrors: number
  errorRate: number
  currentErrorRate: number
  lastError: 'none' | 'nack' | 'timeout' | 'bus_error'
  motorCurrent: number
  timeline: I2CTimelinePoint[]
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
      i2cBus0: {} as I2CBusData,
      i2cBus1: {} as I2CBusData
    }
  },
  created() {
    // Initialize chart data after component is created
    this.balancerData = this.generateBalancerFFT()
    this.oakdData = this.generateOakDFFT()
    this.i2cBus0 = this.generateI2CData(0)
    this.i2cBus1 = this.generateI2CData(1)
  },
  methods: {
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
    },
    // Generate realistic I2C bus monitoring data
    generateI2CData(busId: number): I2CBusData {
      const TIMELINE_POINTS = 60 // 60 seconds
      const timeline: I2CTimelinePoint[] = []

      // Bus 0: Healthy scenario with low errors
      // Bus 1: Warning scenario with moderate errors and EMI correlation
      const isHealthy = busId === 0

      let totalTransactions = 0
      let totalErrors = 0

      // Generate timeline data (60 seconds, most recent is at index 59)
      for (let i = 0; i < TIMELINE_POINTS; i++) {
        const timestamp = i
        let errorRate = 0
        let leftMotorCurrent = 0
        let rightMotorCurrent = 0

        if (isHealthy) {
          // Bus 0: Low, stable error rate with occasional tiny spikes
          errorRate = 0.001 + Math.random() * 0.002 // ~0.1-0.3%
          if (Math.random() < 0.1) {
            errorRate += Math.random() * 0.003 // Occasional small spike
          }
          // Low motor current, stable, slightly different for each motor
          leftMotorCurrent = 0.3 + Math.random() * 0.2 // 0.3-0.5A
          rightMotorCurrent = 0.3 + Math.random() * 0.2 // 0.3-0.5A
        } else {
          // Bus 1: Higher baseline with spikes correlated to motor current
          errorRate = 0.003 + Math.random() * 0.002 // ~0.3-0.5% baseline

          // Motor currents vary - higher during certain periods
          leftMotorCurrent = 1.5 + Math.random() * 0.5 // Baseline 1.5-2.0A
          rightMotorCurrent = 1.4 + Math.random() * 0.5 // Baseline 1.4-1.9A

          // Add spikes at certain times (simulating high motor current periods)
          if (i > 20 && i < 30) {
            leftMotorCurrent = 2.5 + Math.random() * 0.5 // High current 2.5-3.0A
            rightMotorCurrent = 2.3 + Math.random() * 0.4 // Slightly lower 2.3-2.7A
            errorRate += 0.005 + Math.random() * 0.003 // Spike during high current
          }
          if (i > 45 && i < 52) {
            leftMotorCurrent = 2.7 + Math.random() * 0.5 // Very high current 2.7-3.2A
            rightMotorCurrent = 2.8 + Math.random() * 0.4 // Very high current 2.8-3.2A
            errorRate += 0.007 + Math.random() * 0.004 // Larger spike
          }
        }

        timeline.push({
          timestamp,
          errorRate,
          leftMotorCurrent: Math.round(leftMotorCurrent * 10) / 10, // Round to 1 decimal
          rightMotorCurrent: Math.round(rightMotorCurrent * 10) / 10 // Round to 1 decimal
        })

        // Accumulate totals (assuming ~100 transactions per second)
        const transactionsThisSecond = 95 + Math.floor(Math.random() * 10)
        const errorsThisSecond = Math.floor(transactionsThisSecond * errorRate)
        totalTransactions += transactionsThisSecond
        totalErrors += errorsThisSecond
      }

      // Calculate overall error rate
      const errorRate = totalTransactions > 0 ? (totalErrors / totalTransactions) * 100 : 0

      // Current error rate (last data point)
      const currentErrorRate = timeline[timeline.length - 1].errorRate * 100

      // Determine status based on error rate
      let status: 'healthy' | 'warning' | 'error'
      if (errorRate < 1) {
        status = 'healthy'
      } else if (errorRate < 5) {
        status = 'warning'
      } else {
        status = 'error'
      }

      // Motor current - use average of left and right from most recent timeline point
      const lastPoint = timeline[timeline.length - 1]
      const motorCurrent = Math.round((lastPoint.leftMotorCurrent + lastPoint.rightMotorCurrent) / 2 * 10) / 10

      // Last error type
      let lastError: 'none' | 'nack' | 'timeout' | 'bus_error'
      if (isHealthy) {
        lastError = 'none'
      } else {
        lastError = 'bus_error' // Typical EMI-induced error
      }

      return {
        busId,
        label: busId === 0 ? 'Sensors' : 'Motor Controllers',
        status,
        totalTransactions,
        totalErrors,
        errorRate: Math.round(errorRate * 1000) / 1000, // Round to 3 decimals
        currentErrorRate: Math.round(currentErrorRate * 1000) / 1000,
        lastError,
        motorCurrent: Math.round(motorCurrent * 10) / 10, // Round to 1 decimal
        timeline
      }
    }
  }
})
</script>

<template>
  <div>
    <h2 class="text-3xl font-bold mb-6">Diagnostics</h2>

    <!-- I2C Bus Monitoring -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- I2C Bus 0 Card -->
      <ErrorBoundary>
        <Card>
          <CardHeader>
            <CardTitle>I2C Bus {{ i2cBus0.busId }}</CardTitle>
            <CardDescription>{{ i2cBus0.label }}</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <!-- Error Rate Chart -->
            <div>
              <div class="text-sm font-medium mb-2">Error Rate</div>
              <VisXYContainer
                :data="i2cBus0.timeline"
                :height="I2C_CHART_HEIGHT"
                :svg-defs="svgDefs"
                class="chart-container"
              >
                <VisArea
                  :x="(d: I2CTimelinePoint) => d.timestamp"
                  :y="(d: I2CTimelinePoint) => d.errorRate * 100"
                  color="url(#fillChart1)"
                  :opacity="AREA_OPACITY"
                />
                <VisLine
                  :x="(d: I2CTimelinePoint) => d.timestamp"
                  :y="(d: I2CTimelinePoint) => d.errorRate * 100"
                  color="var(--chart-1)"
                  :line-width="LINE_WIDTH"
                />
                <VisAxis
                  type="x"
                  :x="(d: I2CTimelinePoint) => d.timestamp"
                  :tick-line="false"
                  :domain-line="false"
                  :grid-line="false"
                  :num-ticks="6"
                />
                <VisAxis
                  type="y"
                  label="Error Rate (%)"
                  :num-ticks="5"
                  :tick-line="false"
                  :domain-line="false"
                />
              </VisXYContainer>
            </div>

            <!-- Motor Current Chart -->
            <div>
              <div class="text-sm font-medium mb-2">Motor Current</div>
              <VisXYContainer
                :data="i2cBus0.timeline"
                :height="I2C_CHART_HEIGHT"
                :svg-defs="svgDefs"
                class="chart-container"
              >
                <VisArea
                  :x="(d: I2CTimelinePoint) => d.timestamp"
                  :y="(d: I2CTimelinePoint) => d.leftMotorCurrent"
                  color="url(#fillChart1)"
                  :opacity="AREA_OPACITY"
                />
                <VisArea
                  :x="(d: I2CTimelinePoint) => d.timestamp"
                  :y="(d: I2CTimelinePoint) => d.rightMotorCurrent"
                  color="url(#fillChart2)"
                  :opacity="AREA_OPACITY"
                />
                <VisLine
                  :x="(d: I2CTimelinePoint) => d.timestamp"
                  :y="(d: I2CTimelinePoint) => d.leftMotorCurrent"
                  color="var(--chart-1)"
                  :line-width="LINE_WIDTH"
                />
                <VisLine
                  :x="(d: I2CTimelinePoint) => d.timestamp"
                  :y="(d: I2CTimelinePoint) => d.rightMotorCurrent"
                  color="var(--chart-2)"
                  :line-width="LINE_WIDTH"
                />
                <VisAxis
                  type="x"
                  :x="(d: I2CTimelinePoint) => d.timestamp"
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

            <!-- Status Badge -->
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium">Status:</span>
              <Badge
                :variant="i2cBus0.status === 'healthy' ? 'default' : i2cBus0.status === 'warning' ? 'secondary' : 'destructive'"
                class="capitalize"
              >
                <span v-if="i2cBus0.status === 'healthy'" class="mr-1">✓</span>
                <span v-if="i2cBus0.status === 'warning'" class="mr-1">⚠</span>
                <span v-if="i2cBus0.status === 'error'" class="mr-1">✗</span>
                {{ i2cBus0.status }}
              </Badge>
            </div>

            <!-- Metrics Grid -->
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div class="text-muted-foreground">Total Transactions</div>
                <div class="font-mono font-semibold">{{ i2cBus0.totalTransactions.toLocaleString() }}</div>
              </div>
              <div>
                <div class="text-muted-foreground">Total Errors</div>
                <div class="font-mono font-semibold">{{ i2cBus0.totalErrors.toLocaleString() }}</div>
              </div>
              <div>
                <div class="text-muted-foreground">Error Rate</div>
                <div class="font-mono font-semibold">{{ i2cBus0.errorRate }}%</div>
              </div>
              <div>
                <div class="text-muted-foreground">Current</div>
                <div class="font-mono font-semibold">{{ i2cBus0.currentErrorRate }}%</div>
              </div>
            </div>

            <!-- Diagnostic Info -->
            <div class="space-y-1 text-sm text-muted-foreground">
              <div>Last Error: <span class="font-mono">{{ i2cBus0.lastError }}</span></div>
              <div class="flex items-center gap-1">
                Motor Current: <span class="font-mono">{{ i2cBus0.motorCurrent }}A</span>
                <span v-if="i2cBus0.motorCurrent > 2.5" class="text-yellow-600 dark:text-yellow-400">⚠</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </ErrorBoundary>

      <!-- I2C Bus 1 Card -->
      <ErrorBoundary>
        <Card>
          <CardHeader>
            <CardTitle>I2C Bus {{ i2cBus1.busId }}</CardTitle>
            <CardDescription>{{ i2cBus1.label }}</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <!-- Error Rate Chart -->
            <div>
              <div class="text-sm font-medium mb-2">Error Rate</div>
              <VisXYContainer
                :data="i2cBus1.timeline"
                :height="I2C_CHART_HEIGHT"
                :svg-defs="svgDefs"
                class="chart-container"
              >
                <VisArea
                  :x="(d: I2CTimelinePoint) => d.timestamp"
                  :y="(d: I2CTimelinePoint) => d.errorRate * 100"
                  color="url(#fillChart1)"
                  :opacity="AREA_OPACITY"
                />
                <VisLine
                  :x="(d: I2CTimelinePoint) => d.timestamp"
                  :y="(d: I2CTimelinePoint) => d.errorRate * 100"
                  color="var(--chart-1)"
                  :line-width="LINE_WIDTH"
                />
                <VisAxis
                  type="x"
                  :x="(d: I2CTimelinePoint) => d.timestamp"
                  :tick-line="false"
                  :domain-line="false"
                  :grid-line="false"
                  :num-ticks="6"
                />
                <VisAxis
                  type="y"
                  label="Error Rate (%)"
                  :num-ticks="5"
                  :tick-line="false"
                  :domain-line="false"
                />
              </VisXYContainer>
            </div>

            <!-- Motor Current Chart -->
            <div>
              <div class="text-sm font-medium mb-2">Motor Current</div>
              <VisXYContainer
                :data="i2cBus1.timeline"
                :height="I2C_CHART_HEIGHT"
                :svg-defs="svgDefs"
                class="chart-container"
              >
                <VisArea
                  :x="(d: I2CTimelinePoint) => d.timestamp"
                  :y="(d: I2CTimelinePoint) => d.leftMotorCurrent"
                  color="url(#fillChart1)"
                  :opacity="AREA_OPACITY"
                />
                <VisArea
                  :x="(d: I2CTimelinePoint) => d.timestamp"
                  :y="(d: I2CTimelinePoint) => d.rightMotorCurrent"
                  color="url(#fillChart2)"
                  :opacity="AREA_OPACITY"
                />
                <VisLine
                  :x="(d: I2CTimelinePoint) => d.timestamp"
                  :y="(d: I2CTimelinePoint) => d.leftMotorCurrent"
                  color="var(--chart-1)"
                  :line-width="LINE_WIDTH"
                />
                <VisLine
                  :x="(d: I2CTimelinePoint) => d.timestamp"
                  :y="(d: I2CTimelinePoint) => d.rightMotorCurrent"
                  color="var(--chart-2)"
                  :line-width="LINE_WIDTH"
                />
                <VisAxis
                  type="x"
                  :x="(d: I2CTimelinePoint) => d.timestamp"
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

            <!-- Status Badge -->
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium">Status:</span>
              <Badge
                :variant="i2cBus1.status === 'healthy' ? 'default' : i2cBus1.status === 'warning' ? 'secondary' : 'destructive'"
                class="capitalize"
              >
                <span v-if="i2cBus1.status === 'healthy'" class="mr-1">✓</span>
                <span v-if="i2cBus1.status === 'warning'" class="mr-1">⚠</span>
                <span v-if="i2cBus1.status === 'error'" class="mr-1">✗</span>
                {{ i2cBus1.status }}
              </Badge>
            </div>

            <!-- Metrics Grid -->
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div class="text-muted-foreground">Total Transactions</div>
                <div class="font-mono font-semibold">{{ i2cBus1.totalTransactions.toLocaleString() }}</div>
              </div>
              <div>
                <div class="text-muted-foreground">Total Errors</div>
                <div class="font-mono font-semibold">{{ i2cBus1.totalErrors.toLocaleString() }}</div>
              </div>
              <div>
                <div class="text-muted-foreground">Error Rate</div>
                <div class="font-mono font-semibold">{{ i2cBus1.errorRate }}%</div>
              </div>
              <div>
                <div class="text-muted-foreground">Current</div>
                <div class="font-mono font-semibold">{{ i2cBus1.currentErrorRate }}%</div>
              </div>
            </div>

            <!-- Diagnostic Info -->
            <div class="space-y-1 text-sm text-muted-foreground">
              <div>Last Error: <span class="font-mono">{{ i2cBus1.lastError }}</span></div>
              <div class="flex items-center gap-1">
                Motor Current: <span class="font-mono">{{ i2cBus1.motorCurrent }}A</span>
                <span v-if="i2cBus1.motorCurrent > 2.5" class="text-yellow-600 dark:text-yellow-400">⚠</span>
              </div>
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
