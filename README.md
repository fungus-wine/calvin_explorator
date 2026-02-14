# Calvin Console

Electron desktop application for monitoring and controlling a self-balancing robot. Built with Vue 3, TypeScript, and shadcn-vue components.

## Overview

Calvin Console provides real-time monitoring and control for a balancing robot platform with:
- Video stream display with remote command interface
- I2C bus health monitoring for EMI diagnostics
- Battery monitoring via INA228 power sensor
- ToF distance sensors for obstacle detection
- IMU FFT analysis for vibration diagnostics
- PID controller tuning interface
- Service management with toggle controls
- Multi-theme support with light/dark modes

## Tech Stack

- **Electron** - Desktop app framework with electron-vite
- **Vue 3** - UI framework using **Options API** with TypeScript
- **TypeScript** - Type-safe JavaScript (`strict: false` for gradual adoption)
- **Vue Router** - Hash mode routing for Electron compatibility
- **Tailwind CSS 4.1** - Utility-first CSS with CSS-first configuration
- **shadcn-vue** - UI component library (CLI-installed)
- **Unovis** - Data visualization library for charts

## Project Structure

```
src/
├── main/                    # Electron main process (Node.js)
│   └── index.js
├── preload/                 # Electron preload scripts
│   └── index.js
└── renderer/                # Vue.js application
    ├── main.ts              # Vue app initialization
    ├── App.vue              # Root component
    ├── style.css            # Global styles + Tailwind + themes
    ├── router/              # Vue Router configuration
    ├── constants/           # Shared constants and config
    ├── views/               # Page components
    │   ├── Dashboard.vue    # Video stream + command input
    │   ├── Services.vue     # Service management
    │   ├── Diagnostics.vue  # I2C + FFT monitoring
    │   ├── Telemetry.vue    # Battery + ToF sensors
    │   ├── PIDTuning.vue    # PID controller tuning
    │   └── Settings.vue     # Theme and preferences
    └── components/
        ├── Layout.vue       # Main layout with sidebar
        └── ui/              # shadcn-vue components
```

## Features

### Dashboard
- 4:3 aspect ratio video placeholder for robot camera feed
- Multi-line command input with submit button
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)

### Diagnostics
- **I2C Bus Monitoring**: Real-time health monitoring for two I2C buses
  - Bus 0: Sensors
  - Bus 1: Motor Controllers
  - Error rate and motor current correlation charts
  - EMI detection via error spike correlation with motor current
- **IMU FFT Analysis**: Frequency spectrum visualization
  - Balancer IMU accelerometer data
  - OAK-D Pro W IMU accelerometer data
  - Vibration analysis with gradient area charts

### Telemetry
- **Battery Health**: 12V LiPo (3S) monitoring via Adafruit INA228
  - Voltage, current, power, temperature metrics
  - Current draw timeline chart
  - Battery icon in global header (sticky)
  - State of charge calculation
- **ToF Distance Sensors**: VL53L4CX-based obstacle detection
  - Front and rear sensors (Adafruit 5425)
  - Distance measurements with range status
  - Signal quality indicators
  - Distance history charts

### Services
- Toggle switches for enabling/disabling services
- Theme-aware card highlighting when enabled
- Accessible click-anywhere-on-card design

### PID Tuning
- Tilt and Velocity PID controllers (P, I, D parameters)
- Three tuning modes: Ultrafine (1%), Fine (10%), Coarse (25%)
- Visual feedback with border flash on value change
- Readonly inputs with increment/decrement controls

### Settings
- Theme selection (8 color themes: default, red, rose, orange, green, blue, yellow, violet)
- Dark/light mode toggle
- Persistent settings in localStorage

## Development

### Start Development Server

```bash
npm run dev
```

Launches Electron with Vite dev server and hot-reload enabled.

### Build for Production

```bash
npm run build
```

Creates optimized production build.

### Preview Production Build

```bash
npm run preview
```

## Adding shadcn-vue Components

```bash
npx shadcn-vue@latest add <component-name> -y
```

Components auto-install to `src/renderer/components/ui/` with dependencies and types.

## Theming

The app supports 8 themes defined in `src/renderer/style.css` using OKLCH color space. Each theme defines semantic colors (`--primary`, `--secondary`, `--destructive`, etc.) and chart colors (`--chart-1`, `--chart-2`) that work in both light and dark modes.

Charts automatically adapt to the active theme via unified gradient definitions in `src/renderer/constants/chart.ts`.

## Hardware Integration

Ready for integration with:
- **Arduino Giga R1** - Main controller with I2C buses
- **Adafruit INA228 (5832)** - Battery monitoring via I2C
- **Adafruit VL53L4CX (5425)** - Front/rear ToF sensors via I2C
- **Balancer IMU** - Accelerometer data for FFT analysis
- **OAK-D Pro W** - Camera with IMU

Currently uses dummy data generators for all sensors. Real-time data integration via serial/USB planned.

## Notes

- Uses hash-based routing (`createWebHashHistory`) for Electron compatibility
- All Vue components use **Options API** with `<script lang="ts">`
- TypeScript strict mode disabled for gradual adoption
- No git commits created by default - user handles version control
