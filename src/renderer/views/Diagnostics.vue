<script lang="ts">
import { defineComponent } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import { VisXYContainer, VisArea, VisLine, VisAxis } from '@unovis/vue'
import { CHART_CONFIG, FFT_GRADIENT_DEFS, FFT_CONFIG } from '@/constants/chart'

// Type definition for FFT data points
interface FFTDataPoint {
  frequency: number
  magnitude: number
}

export default defineComponent({
  name: 'Diagnostics',
  components: {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    ErrorBoundary,
    VisXYContainer,
    VisArea,
    VisLine,
    VisAxis
  },
  data() {
    return {
      CHART_HEIGHT: CHART_CONFIG.HEIGHT,
      AREA_OPACITY: CHART_CONFIG.AREA_OPACITY,
      LINE_WIDTH: CHART_CONFIG.LINE_WIDTH,
      X_AXIS_TICKS: CHART_CONFIG.X_AXIS_TICKS,
      Y_AXIS_TICKS: CHART_CONFIG.Y_AXIS_TICKS,
      svgDefs: FFT_GRADIENT_DEFS,
      balancerData: [] as FFTDataPoint[],
      oakdData: [] as FFTDataPoint[]
    }
  },
  created() {
    // Initialize chart data after component is created
    this.balancerData = this.generateBalancerFFT()
    this.oakdData = this.generateOakDFFT()
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
    }
  }
})
</script>

<template>
  <div>
    <h2 class="text-3xl font-bold mb-6">Diagnostics</h2>

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
                color="url(#fillFFT)"
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
                color="url(#fillFFT)"
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
