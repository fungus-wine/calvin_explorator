# Calvin Explorator - Project Instructions

## System Overview

**Calvin Explorator** is the human monitoring and control interface for Calvin, a self-balancing robot. Built as an Electron desktop application with Vue, it provides real-time telemetry visualization, command input, and system configuration.

**Calvin's Three-System Architecture:**
- **instinctus** - Low-level reflexes and motor control (Arduino) - `/Users/damoncali/code/arduino/calvin_instinctus/CLAUDE.md`
- **cogitator** - High-level AI and planning (Jetson Orin Nano) - `/Users/damoncali/code/calvin_cogitator/CLAUDE.md`
- **explorator** (THIS SYSTEM) - Human monitoring interface (Electron app)

**Integration:**
- Receives telemetry from cogitator via network
- Sends user commands to cogitator via network
- Displays real-time data: video stream, sensor data, battery status, motor feedback
- Allows configuration: PID tuning, service management, system settings

**Data Flow:**
```
Instinctus (sensors) → Cogitator (aggregation) → Explorator (visualization)
Explorator (commands) → Cogitator (planning) → Instinctus (execution)
```

## Application Overview

Calvin Explorator is an Electron desktop application built with Vue 3, TypeScript, and shadcn-vue components. Features include:
- Video stream display with command interface for remote control
- I2C bus health monitoring with EMI correlation diagnostics
- Real-time FFT charts for IMU accelerometer data visualization
- Battery health monitoring via INA228 power sensor
- ToF distance sensors for obstacle detection
- Service management with toggle controls
- PID controller tuning interface with multi-mode adjustment
- Multi-theme support with light/dark modes
- Sticky global header with battery status indicator

## General Guidance

- Don't improvise. Use conventional code when possible. Always ask for confirmation before writing code that breaks standard patterns
- Don't write code that fights against external libraries. Instead, suggest more conventional approahes.
- Check your work
- Favor maintainability, modularity, and simplicity over cleverness and complexity

## Tech Stack

### Core Technologies
- **Electron** - Desktop app framework
- **electron-vite** - Build tooling for Electron + Vite
- **Vue 3** - UI framework using **Options API** except for 3rd party add ons such as shadcn-vue components
- **TypeScript** - Type-safe JavaScript
- **Vue Router** - Client-side routing with hash mode
- **Vite** - Build tool and dev server
- **Tailwind CSS 4.1** - Utility-first CSS framework with CSS-first configuration
- **theminator** - OKLCH theme system with 9 color themes (local package at ~/code/theminator)
- **shadcn-vue** - UI component library (CLI-installed)
- **Unovis** - Chart library for data visualization

### Key Conventions
- **TypeScript** - All code uses TypeScript with `strict: false` for gradual adoption
- **Options API** - Use Options API with `<script lang="ts">` in all Vue components (not Composition API)
- **Hash mode routing** - Router uses `createWebHashHistory()` for Electron compatibility
- **shadcn-vue CLI** - Install components via `npx shadcn-vue@latest add <component>`

## Vue Component Guidelines

**Always use Options API with `<script lang="ts">`**

**Key Points:**
- Use `defineComponent()` for proper TypeScript inference
- Define interfaces for data structures
- Type arrays and objects in `data()`: `items: [] as Type[]`
- Avoid `any` types - use specific interfaces
- Use constants for magic numbers

### Chart Theming
Charts automatically adapt to active theme via `--chart-1` through `--chart-5` CSS variables.

**Unified Gradient System:**
- All area charts use `CHART_GRADIENT_DEFS` from `@/constants/chart`
- Provides `fillChart1` and `fillChart2` gradients
- Automatically theme-aware (uses CSS variables)
- Single definition shared across all charts

**Chart Color Usage:**
- `--chart-1` - Darkest/most saturated
- `--chart-2` - Medium-dark
- `--chart-3` - Medium (good default)
- `--chart-4` - Medium-light
- `--chart-5` - Lightest (good for backgrounds)

## Charts (Unovis)

Used in: `Diagnostics.vue`, `Telemetry.vue`

**Features:**
- FFT charts for IMU accelerometer data (Balancer and OAK-D Pro W)
- I2C bus error rate and motor current timelines
- Battery current draw timeline
- ToF distance sensor history
- Gradient area fills using SVG linearGradient in `:svg-defs` prop
- Theme-aware colors: `var(--chart-1)` and `var(--chart-2)`
- Custom axis styling via scoped styles with `:deep()` selectors

**Key Points:**
- Import from `@unovis/vue`: `VisXYContainer`, `VisArea`, `VisLine`, `VisAxis`
- Import `CHART_GRADIENT_DEFS` from `@/constants/chart`
- Pass to all containers: `:svg-defs="svgDefs"` where `svgDefs: CHART_GRADIENT_DEFS`
- Reference gradients: `color="url(#fillChart1)"` or `color="url(#fillChart2)"`
- Style internals with `:deep(.unovis-selector)` in scoped styles
- Grid lines may need `!important` to override defaults

## Services Page

Location: `src/renderer/views/Services.vue`

**Features:**
- Toggle switches for enabling/disabling services
- Theme-aware card highlighting when enabled
- Switch hidden with `sr-only` - entire card is clickable Label

**Key Points:**
- Use `Switch` component (not Checkbox) for on/off states for stubs. When actually implemented, use whatever componet is cleanest
- Hide switch visually but keep accessible: `class="sr-only"`
- Style parent Label with `has-data-[state=checked]:bg-primary/5` and `has-data-[state=checked]:border-primary`
- Dark mode uses `dark:has-data-[state=checked]:bg-primary/10` for stronger contrast

## Dashboard Page

Location: `src/renderer/views/Dashboard.vue`

**Features:**
- 4:3 aspect ratio video placeholder (`aspect-[4/3]`)
- Multi-line command input (Textarea) with embedded submit button
- Keyboard: Enter sends, Shift+Enter for new line

**Key Points:**
- Remove `disabled:opacity-50` from buttons to keep theme colors bright when disabled
- Always call `preventDefault()` on Enter key to avoid unwanted newlines before submit

## PID Tuning Page

Location: `src/renderer/views/PIDTuning.vue`

**Features:**
- Tilt and Velocity PID controllers (P, I, D parameters)
- Three tuning modes: Ultrafine (1%), Fine (10%), Coarse (25%)
- Readonly inputs with ChevronUp/Down button controls
- Border flashes `border-primary` on value change (200ms timeout)

**Key Points:**
- Readonly inputs styled with `bg-muted text-center font-mono focus:outline-none`
- Percentage adjustments: `value * (1 ± percentage)`, rounded to 3 decimals
- Flash animation: Reactive state + setTimeout(200ms) + `transition-colors` class. When actual connectivity is complete, flash on confirmation from cogitator, not on click
- Mode toggle buttons use `:variant="mode === 'active' ? 'default' : 'outline'"

## Diagnostics Page

Location: `src/renderer/views/Diagnostics.vue`

**Features:**
- **I2C Bus Monitoring** - Real-time health monitoring for two I2C buses
  - Bus 0: Sensors
  - Bus 1: Motor Controllers (shows EMI correlation with motor current)
  - Two stacked charts per bus: Error Rate (top), Motor Current (bottom)
  - Left/Right motor current displayed separately
  - Status badges, error metrics, diagnostic info
  - Aligned time axes for visual correlation
- **IMU FFT Charts** - Frequency spectrum analysis
  - Balancer IMU accelerometer data
  - OAK-D Pro W IMU accelerometer data
  - Gradient area charts showing vibration patterns

**Key Points:**
- Error rate shows I2C transaction failures over time
- Motor current charts show left/right motors with different colors (`--chart-1`, `--chart-2`)
- EMI correlation visible when motor current spikes coincide with error rate increases
- All charts use unified `CHART_GRADIENT_DEFS` for consistent styling
- 200px chart height for I2C (more compact), 300px for FFT

## Telemetry Page

Location: `src/renderer/views/Telemetry.vue`

**Features:**
- **Battery Health Monitoring** - 12V LiPo (3S) via Adafruit INA228
  - Voltage, current, power, temperature metrics
  - Current draw timeline chart
  - Status badge (Good/Warning/Critical based on voltage thresholds)
  - Temperature warning indicator (>35°C) in layout header
  - Battery icon displayed in layout header (not on page)
- **ToF Distance Sensors** - VL53L4CX obstacle detection (Adafruit 5425)
  - Front and Rear object collision warning indicators in layout header when ToF < 20cm
  - Front and rear sensors in side-by-side cards
  - Distance measurement in millimeters
  - Range status badge (Valid/Out of Range/Error)
  - Signal quality percentage
  - Distance history charts

**Key Points:**
- Battery voltage thresholds: <9.5V critical, <10.5V warning
- State of charge calculated from voltage curve (12.6V = 100%, 9.0V = 0%)
- ToF valid range: 50mm - 4000mm
- Signal quality degrades at very close (<200mm) or far (>3000mm) distances
- Front sensor uses `--chart-1`, rear uses `--chart-2`

## Layout Component

Location: `src/renderer/components/Layout.vue`

**Features:**
- Sticky global header with status indicators
- Collapsible sidebar navigation
- Main content area with router view
- STOP button (destructive variant) in top-right

**Sticky Header:**
- Classes: `sticky top-0 z-10 bg-background`
- Stays visible when scrolling
- Contains: SidebarTrigger, Battery Icon, Tof Icons,  STOP button

**Battery Icon:**
- Visual, color coded battery shape with fill level and percentage

**ToF Icons (Front and Rear):**
- Visual, color coded (grey for ok, red for warning)

## shadcn-vue Components

### Installation
```bash
npx shadcn-vue@latest add <component-name>
```

Components are installed to `src/renderer/components/ui/`.

### Known Issues & Fixes

**Sidebar collapsible bug:**
- CLI-installed Sidebar has incorrect syntax: `w-[--sidebar-width]`
- Fix: Use `w-[var(--sidebar-width)]` (proper Tailwind v4 CSS variable syntax)
- See comment in `Sidebar.vue` for details

**SidebarTrigger mobile visibility:**
- Trigger should only show when sidebar becomes Sheet drawer on mobile (< 768px)
- Fix: Add `md:hidden` class directly in `SidebarTrigger.vue` component
- Cleaner than adding per-use in Layout.vue

## Electron Configuration

**Window Setup** (prevents white flash on startup):
- `backgroundColor: '#1a1a1a'` - dark background while loading
- `show: false` + `mainWindow.once('ready-to-show', () => mainWindow.show())` - wait for render

**HTML Setup**:
- Keep `index.html` minimal with no inline styles
- All styling goes in `style.css` using theme CSS variables
- **Critical**: Inline styles override theme system and break light/dark mode switching

## Development Commands

```bash
npm run dev      # Start dev server + launch Electron with hot-reload
npm run build    # Build for production
npm start        # Preview production build (alias for preview)
npm run preview  # Preview production build
```

## Routing

- Uses `createWebHashHistory()` for Electron compatibility
- URLs: `/#/dashboard`, `/#/diagnostics`, etc.
- Routes defined in `src/renderer/router/index.ts`

## Common Tasks

### Adding a New Page
1. Create `src/renderer/views/PageName.vue` with `<script lang="ts">` using Options API
2. Add route in `src/renderer/router/index.ts`
3. Add navigation item in `src/renderer/components/Layout.vue`

### Adding shadcn-vue Components
```bash
npx shadcn-vue@latest add <component-name> -y
```

Components auto-install with dependencies and types.

### Adding Charts
1. Import Unovis components: `import { VisXYContainer, VisLine, VisAxis } from '@unovis/vue'`
2. Define data interface
3. Use constants for configuration values
4. Reference theme colors with `var(--chart-1)`

### Keyboard Shortcuts in Inputs
- Enter = send/submit, Shift+Enter = new line

## File Editing Rules

- **Use TypeScript** - `.ts` extension for scripts, `lang="ts"` in Vue files
- **Use Options API** - `<script lang="ts">` with `defineComponent()` in all Vue components
- **Define interfaces** - Type all data structures
- **Extract constants** - No magic numbers
- **Use theme variables** - Reference CSS variables for colors

## Best Practices

### TypeScript
- Define interfaces for all data structures
- Avoid `any` types
- Use proper function signatures with return types
- Type refs: `ref<Type>(initialValue)`

### Vue Components
- Keep components focused and single-purpose
- Use `defineComponent()` for proper TypeScript inference
- Use proper TypeScript interfaces for props
- Type data properties: `items: [] as Type[]`

### Styling
- Use Tailwind classes for layout and spacing
- Use theme CSS variables for colors (always `var(--variable)` syntax)
- Use scoped styles for component-specific styling
- Avoid inline styles except for dynamic values


### Charts
- Extract chart configuration to constants
- Define proper interfaces for data points
- Use theme variables for colors
- Keep chart styling in scoped styles with `:deep()`

## Integration with Other Systems - Mostly undefined, use stubs only for now

### With Cogitator (Jetson)
**Documentation:** `/Users/damoncali/code/calvin_cogitator/CLAUDE.md`

**Interface:**
- not defined yet

**Explorator Receives:**
- Telemetry data forwarded from instinctus (partially defined):
  - Video stream from OAK-D camera
  - battery data
  - service status confirmations
  - pid status confirmations
  - tof data stream
  - audo data stream (possibly with video - undedfined)
  - acelerometer data streams
  - oak-d supplemental data streams

**Explorator Sends:**
- User commands from Dashboard - commands will be interpreted by cogitator's local LLM
- PID tuning parameters from PID Tuning page
- Service enable/disable from Services page
- Configuration changes from Settings
- Emergency stop (redundant safety)

**Current Status:**
- UI fully implemented with dummy data generators
- Real network integration pending cogitator implementation

### With Instinctus (Arduino)
**Documentation:** `/Users/damoncali/code/arduino/calvin_instinctus/CLAUDE.md`

**Interface:** Indirect via Cogitator (no direct connection)

**Data Flow:**
```
Instinctus M4 → M7 (EventQueue) → Cogitator (Serial) → Explorator (Network)
Explorator → Cogitator → Instinctus M7 → M4 (EventQueue)
```

**Note:** Explorator does not communicate directly with instinctus. All telemetry and commands flow through cogitator as the communication hub.

## Notes

- **No git commits** - User handles all git operations
- **Dark mode first** - App defaults to dark mode, configurable in Settings
- **Theme persistence** - Settings stored in localStorage via theminator (`theminator:darkMode`, `theminator:theme`)
- **Type safety** - `strict: false` allows gradual TypeScript adoption
- **Dummy data** - Currently uses data generators; real integration pending cogitator network interface

## Troubleshooting

### White Flash on Startup
Fixed via Electron configuration only:
1. `backgroundColor: '#1a1a1a'` in BrowserWindow
2. `show: false` + `ready-to-show` event

**Do not use inline styles** - they override theme variables and break light/dark mode.

### Light Mode Issues
**Problem**: Inline styles in `index.html` with hardcoded colors (e.g., `color: #fafafa`) will override theme CSS variables and break light mode (white text on white background).

**Solution**: Remove all inline styles from HTML. Let theme system handle all colors via CSS variables in `style.css`. The `@layer base` section in `style.css` sets `background-color: var(--background)` and `color: var(--foreground)` which automatically adapt to light/dark mode and selected theme.

### shadcn-vue Compatibility
- Some CLI-installed components may have Tailwind v4 syntax issues
- Check and fix CSS variable syntax: `var(--variable)` not `--variable`
- Components tested: Sidebar, Card, Button, Switch, Select, Textarea

### Chart Styling
- Use `:deep()` for styling Unovis chart internals
- Set CSS variables on container for theme integration
- Grid lines require `!important` to override defaults
