<script lang="ts">
import { defineComponent } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import { VisXYContainer, VisArea, VisLine, VisAxis } from '@unovis/vue'
import { CHART_CONFIG, CHART_GRADIENT_DEFS } from '@/constants/chart'
import { useTelemetryStore, type IMUTimelinePoint, type IMUDataMode } from '@/stores/telemetry'

const IMU_MODE_CONFIG: Record<IMUDataMode, { label: string; unit: string; xKey: string; yKey: string; zKey: string }> = {
  accel: { label: 'Accelerometer', unit: 'g', xKey: 'ax', yKey: 'ay', zKey: 'az' },
  gyro: { label: 'Gyroscope', unit: '°/s', xKey: 'gx', yKey: 'gy', zKey: 'gz' },
  mag: { label: 'Magnetometer', unit: 'µT', xKey: 'mx', yKey: 'my', zKey: 'mz' },
}

// Type for ToF timeline points (used in chart accessors)
interface ToFTimelinePoint {
  timestamp: number
  distance: number
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
    Button,
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
      telemetryStore: useTelemetryStore(),
      balancerMode: 'accel' as IMUDataMode,
      oakdMode: 'accel' as IMUDataMode,
      imuModes: ['accel', 'gyro', 'mag'] as IMUDataMode[],
      imuModeConfig: IMU_MODE_CONFIG
    }
  },
  computed: {
    tofFront() {
      return this.telemetryStore.tofFront
    },
    tofRear() {
      return this.telemetryStore.tofRear
    },
    imuBalancer() {
      return this.telemetryStore.imuBalancer
    },
    imuOakd() {
      return this.telemetryStore.imuOakd
    },
    isConnected() {
      return this.telemetryStore.isConnected
    },
    tofFrontTickValues(): number[] {
      return this.timelineTickValues(this.tofFront.timeline)
    },
    tofRearTickValues(): number[] {
      return this.timelineTickValues(this.tofRear.timeline)
    },
    imuBalancerTickValues(): number[] {
      return this.timelineTickValues(this.imuBalancer.timeline)
    },
    imuOakdTickValues(): number[] {
      return this.timelineTickValues(this.imuOakd.timeline)
    },
    balancerConfig() {
      return IMU_MODE_CONFIG[this.balancerMode]
    },
    oakdConfig() {
      return IMU_MODE_CONFIG[this.oakdMode]
    }
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
    timelineTickFormat(timeline: { timestamp: number }[], index: number): string {
      if (timeline.length === 0) return ''
      const latest = timeline[timeline.length - 1].timestamp
      const point = timeline[Math.round(index)]
      if (!point) return ''
      const secondsAgo = Math.round((point.timestamp - latest) / 1000)
      return `${secondsAgo}`
    },
    tofFrontXTickFormat(index: number): string {
      return this.timelineTickFormat(this.tofFront.timeline, index)
    },
    tofRearXTickFormat(index: number): string {
      return this.timelineTickFormat(this.tofRear.timeline, index)
    },
    imuBalancerXTickFormat(index: number): string {
      return this.timelineTickFormat(this.imuBalancer.timeline, index)
    },
    imuOakdXTickFormat(index: number): string {
      return this.timelineTickFormat(this.imuOakd.timeline, index)
    },
    imuValue(latest: Record<string, number> | null, key: string): string {
      if (!latest) return '--'
      return latest[key].toFixed(2)
    },
    imuYAccessor(key: string): (d: IMUTimelinePoint) => number {
      return (d: IMUTimelinePoint) => d[key as keyof IMUTimelinePoint] as number
    }
  }
})
</script>

<template>
  <div>
    <h2 class="text-3xl font-bold mb-6">Telemetry</h2>

    <!-- IMU Accelerometer Data -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Balancer IMU -->
      <ErrorBoundary>
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <div>
                <CardTitle>Balancer IMU</CardTitle>
                <CardDescription>{{ balancerConfig.label }} - X, Y, Z axes</CardDescription>
              </div>
              <div class="flex gap-1">
                <Button
                  v-for="mode in imuModes"
                  :key="mode"
                  :variant="balancerMode === mode ? 'default' : 'outline'"
                  size="sm"
                  @click="balancerMode = mode"
                >
                  {{ imuModeConfig[mode].label }}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-4" v-if="imuBalancer.timeline.length > 1">
            <!-- Latest Values -->
            <div class="grid grid-cols-3 gap-4">
              <div>
                <div class="text-sm text-muted-foreground mb-1">X</div>
                <div class="text-xl font-mono font-bold">
                  {{ imuValue(imuBalancer.latest, balancerConfig.xKey) }}
                </div>
              </div>
              <div>
                <div class="text-sm text-muted-foreground mb-1">Y</div>
                <div class="text-xl font-mono font-bold">
                  {{ imuValue(imuBalancer.latest, balancerConfig.yKey) }}
                </div>
              </div>
              <div>
                <div class="text-sm text-muted-foreground mb-1">Z</div>
                <div class="text-xl font-mono font-bold">
                  {{ imuValue(imuBalancer.latest, balancerConfig.zKey) }}
                </div>
              </div>
            </div>

            <!-- Timeline Chart -->
            <div>
              <div class="text-sm font-medium mb-2">{{ balancerConfig.label }} ({{ balancerConfig.unit }})</div>
              <VisXYContainer
                :data="imuBalancer.timeline"
                :height="CHART_HEIGHT"
                :duration="0"
                :svg-defs="svgDefs"
                class="chart-container"
              >
                <VisLine
                  :x="(_d: IMUTimelinePoint, i: number) => i"
                  :y="imuYAccessor(balancerConfig.xKey)"
                  color="var(--chart-1)"
                  :line-width="LINE_WIDTH"
                />
                <VisLine
                  :x="(_d: IMUTimelinePoint, i: number) => i"
                  :y="imuYAccessor(balancerConfig.yKey)"
                  color="var(--chart-2)"
                  :line-width="LINE_WIDTH"
                />
                <VisLine
                  :x="(_d: IMUTimelinePoint, i: number) => i"
                  :y="imuYAccessor(balancerConfig.zKey)"
                  color="var(--chart-3)"
                  :line-width="LINE_WIDTH"
                />
                <VisAxis
                  type="x"
                  :x="(_d: IMUTimelinePoint, i: number) => i"
                  label="Seconds Ago"
                  :tick-line="false"
                  :domain-line="false"
                  :grid-line="false"
                  :tick-values="imuBalancerTickValues"
                  :tick-format="imuBalancerXTickFormat"
                />
                <VisAxis
                  type="y"
                  :label="`${balancerConfig.label} (${balancerConfig.unit})`"
                  :num-ticks="5"
                  :tick-line="false"
                  :domain-line="false"
                />
              </VisXYContainer>
              <div class="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span class="flex items-center gap-1"><span class="inline-block w-3 h-0.5 rounded" style="background: var(--chart-1)"></span> X</span>
                <span class="flex items-center gap-1"><span class="inline-block w-3 h-0.5 rounded" style="background: var(--chart-2)"></span> Y</span>
                <span class="flex items-center gap-1"><span class="inline-block w-3 h-0.5 rounded" style="background: var(--chart-3)"></span> Z</span>
              </div>
            </div>
          </CardContent>
          <CardContent v-else>
            <div class="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
              Waiting for data...
            </div>
          </CardContent>
        </Card>
      </ErrorBoundary>

      <!-- OAK-D Pro W IMU -->
      <ErrorBoundary>
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <div>
                <CardTitle>OAK-D Pro W IMU</CardTitle>
                <CardDescription>{{ oakdConfig.label }} - X, Y, Z axes</CardDescription>
              </div>
              <div class="flex gap-1">
                <Button
                  v-for="mode in imuModes"
                  :key="mode"
                  :variant="oakdMode === mode ? 'default' : 'outline'"
                  size="sm"
                  @click="oakdMode = mode"
                >
                  {{ imuModeConfig[mode].label }}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-4" v-if="imuOakd.timeline.length > 1">
            <!-- Latest Values -->
            <div class="grid grid-cols-3 gap-4">
              <div>
                <div class="text-sm text-muted-foreground mb-1">X</div>
                <div class="text-xl font-mono font-bold">
                  {{ imuValue(imuOakd.latest, oakdConfig.xKey) }}
                </div>
              </div>
              <div>
                <div class="text-sm text-muted-foreground mb-1">Y</div>
                <div class="text-xl font-mono font-bold">
                  {{ imuValue(imuOakd.latest, oakdConfig.yKey) }}
                </div>
              </div>
              <div>
                <div class="text-sm text-muted-foreground mb-1">Z</div>
                <div class="text-xl font-mono font-bold">
                  {{ imuValue(imuOakd.latest, oakdConfig.zKey) }}
                </div>
              </div>
            </div>

            <!-- Timeline Chart -->
            <div>
              <div class="text-sm font-medium mb-2">{{ oakdConfig.label }} ({{ oakdConfig.unit }})</div>
              <VisXYContainer
                :data="imuOakd.timeline"
                :height="CHART_HEIGHT"
                :duration="0"
                :svg-defs="svgDefs"
                class="chart-container"
              >
                <VisLine
                  :x="(_d: IMUTimelinePoint, i: number) => i"
                  :y="imuYAccessor(oakdConfig.xKey)"
                  color="var(--chart-1)"
                  :line-width="LINE_WIDTH"
                />
                <VisLine
                  :x="(_d: IMUTimelinePoint, i: number) => i"
                  :y="imuYAccessor(oakdConfig.yKey)"
                  color="var(--chart-2)"
                  :line-width="LINE_WIDTH"
                />
                <VisLine
                  :x="(_d: IMUTimelinePoint, i: number) => i"
                  :y="imuYAccessor(oakdConfig.zKey)"
                  color="var(--chart-3)"
                  :line-width="LINE_WIDTH"
                />
                <VisAxis
                  type="x"
                  :x="(_d: IMUTimelinePoint, i: number) => i"
                  label="Seconds Ago"
                  :tick-line="false"
                  :domain-line="false"
                  :grid-line="false"
                  :tick-values="imuOakdTickValues"
                  :tick-format="imuOakdXTickFormat"
                />
                <VisAxis
                  type="y"
                  :label="`${oakdConfig.label} (${oakdConfig.unit})`"
                  :num-ticks="5"
                  :tick-line="false"
                  :domain-line="false"
                />
              </VisXYContainer>
              <div class="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span class="flex items-center gap-1"><span class="inline-block w-3 h-0.5 rounded" style="background: var(--chart-1)"></span> X</span>
                <span class="flex items-center gap-1"><span class="inline-block w-3 h-0.5 rounded" style="background: var(--chart-2)"></span> Y</span>
                <span class="flex items-center gap-1"><span class="inline-block w-3 h-0.5 rounded" style="background: var(--chart-3)"></span> Z</span>
              </div>
            </div>
          </CardContent>
          <CardContent v-else>
            <div class="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
              Waiting for data...
            </div>
          </CardContent>
        </Card>
      </ErrorBoundary>
    </div>

    <!-- ToF Distance Sensors Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Front ToF Sensor -->
      <ErrorBoundary>
        <Card>
          <CardHeader>
            <CardTitle>Front Distance Sensor</CardTitle>
            <CardDescription>VL53L4CX ToF - Adafruit 5425</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <!-- Key Metrics -->
            <div class="grid grid-cols-3 gap-4">
              <!-- Distance -->
              <div>
                <div class="text-sm text-muted-foreground mb-2">Distance</div>
                <div class="text-2xl font-mono font-bold">
                  <template v-if="tofFront.rangeStatus === 'no_data'">--</template>
                  <template v-else>{{ tofFront.distance }}mm</template>
                </div>
              </div>

              <!-- Range Status -->
              <div>
                <div class="text-sm text-muted-foreground mb-2">Status</div>
                <Badge
                  v-if="tofFront.rangeStatus !== 'no_data'"
                  :variant="tofFront.rangeStatus === 'valid' ? 'default' : tofFront.rangeStatus === 'out_of_range' ? 'secondary' : 'destructive'"
                  class="capitalize"
                >
                  {{ tofFront.rangeStatus.replace('_', ' ') }}
                </Badge>
                <Badge v-else variant="secondary">No Data</Badge>
              </div>

              <!-- Signal Quality -->
              <div>
                <div class="text-sm text-muted-foreground mb-2">Signal</div>
                <div class="text-2xl font-mono font-bold">
                  <template v-if="tofFront.rangeStatus === 'no_data'">--</template>
                  <template v-else>{{ tofFront.signalQuality }}%</template>
                </div>
              </div>
            </div>

            <!-- Distance History Chart -->
            <div v-if="tofFront.timeline.length > 1">
              <div class="text-sm font-medium mb-2">Distance History</div>
              <VisXYContainer
                :data="tofFront.timeline"
                :height="CHART_HEIGHT"
                :duration="0"
                :svg-defs="svgDefs"
                class="chart-container"
              >
                <VisArea
                  :x="(_d: ToFTimelinePoint, i: number) => i"
                  :y="(d: ToFTimelinePoint) => d.distance"
                  color="url(#fillChart1)"
                  :opacity="AREA_OPACITY"
                />
                <VisLine
                  :x="(_d: ToFTimelinePoint, i: number) => i"
                  :y="(d: ToFTimelinePoint) => d.distance"
                  color="var(--chart-1)"
                  :line-width="LINE_WIDTH"
                />
                <VisAxis
                  type="x"
                  :x="(_d: ToFTimelinePoint, i: number) => i"
                  label="Seconds Ago"
                  :tick-line="false"
                  :domain-line="false"
                  :grid-line="false"
                  :tick-values="tofFrontTickValues"
                  :tick-format="tofFrontXTickFormat"
                />
                <VisAxis
                  type="y"
                  label="Distance (mm)"
                  :num-ticks="5"
                  :tick-line="false"
                  :domain-line="false"
                />
              </VisXYContainer>
            </div>
            <div v-else class="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
              Waiting for data...
            </div>
          </CardContent>
        </Card>
      </ErrorBoundary>

      <!-- Rear ToF Sensor -->
      <ErrorBoundary>
        <Card>
          <CardHeader>
            <CardTitle>Rear Distance Sensor</CardTitle>
            <CardDescription>VL53L4CX ToF - Adafruit 5425</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <!-- Key Metrics -->
            <div class="grid grid-cols-3 gap-4">
              <!-- Distance -->
              <div>
                <div class="text-sm text-muted-foreground mb-2">Distance</div>
                <div class="text-2xl font-mono font-bold">
                  <template v-if="tofRear.rangeStatus === 'no_data'">--</template>
                  <template v-else>{{ tofRear.distance }}mm</template>
                </div>
              </div>

              <!-- Range Status -->
              <div>
                <div class="text-sm text-muted-foreground mb-2">Status</div>
                <Badge
                  v-if="tofRear.rangeStatus !== 'no_data'"
                  :variant="tofRear.rangeStatus === 'valid' ? 'default' : tofRear.rangeStatus === 'out_of_range' ? 'secondary' : 'destructive'"
                  class="capitalize"
                >
                  {{ tofRear.rangeStatus.replace('_', ' ') }}
                </Badge>
                <Badge v-else variant="secondary">No Data</Badge>
              </div>

              <!-- Signal Quality -->
              <div>
                <div class="text-sm text-muted-foreground mb-2">Signal</div>
                <div class="text-2xl font-mono font-bold">
                  <template v-if="tofRear.rangeStatus === 'no_data'">--</template>
                  <template v-else>{{ tofRear.signalQuality }}%</template>
                </div>
              </div>
            </div>

            <!-- Distance History Chart -->
            <div v-if="tofRear.timeline.length > 1">
              <div class="text-sm font-medium mb-2">Distance History</div>
              <VisXYContainer
                :data="tofRear.timeline"
                :height="CHART_HEIGHT"
                :duration="0"
                :svg-defs="svgDefs"
                class="chart-container"
              >
                <VisArea
                  :x="(_d: ToFTimelinePoint, i: number) => i"
                  :y="(d: ToFTimelinePoint) => d.distance"
                  color="url(#fillChart2)"
                  :opacity="AREA_OPACITY"
                />
                <VisLine
                  :x="(_d: ToFTimelinePoint, i: number) => i"
                  :y="(d: ToFTimelinePoint) => d.distance"
                  color="var(--chart-2)"
                  :line-width="LINE_WIDTH"
                />
                <VisAxis
                  type="x"
                  :x="(_d: ToFTimelinePoint, i: number) => i"
                  label="Seconds Ago"
                  :tick-line="false"
                  :domain-line="false"
                  :grid-line="false"
                  :tick-values="tofRearTickValues"
                  :tick-format="tofRearXTickFormat"
                />
                <VisAxis
                  type="y"
                  label="Distance (mm)"
                  :num-ticks="5"
                  :tick-line="false"
                  :domain-line="false"
                />
              </VisXYContainer>
            </div>
            <div v-else class="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
              Waiting for data...
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
