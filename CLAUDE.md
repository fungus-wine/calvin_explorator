# Calvin Explorator - Project Instructions

## System Overview

**Calvin Explorator** is the human monitoring and control interface for Calvin, a self-balancing robot. Built as an Electron desktop application with Vue 3 and TypeScript, it provides real-time telemetry visualization, command input, and system configuration.

**Calvin's Three-System Architecture:**
- **instinctus** - Low-level reflexes and motor control (Arduino) - `/Users/damoncali/code/arduino/calvin_instinctus/CLAUDE.md`
- **cogitator** - High-level AI and planning (Jetson Orin Nano) - `/Users/damoncali/code/calvin_cogitator/CLAUDE.md`
- **explorator** (THIS SYSTEM) - Human monitoring interface (Electron app)

**Integration:**
- Receives telemetry from cogitator via network (WebSocket/HTTP)
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

## Tech Stack

### Core Technologies
- **Electron** - Desktop app framework
- **electron-vite** - Build tooling for Electron + Vite
- **Vue 3** - UI framework using **Options API** except for 3rd party add ons such as shadcn-vue components.
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

## Project Structure

```
src/
├── main/                    # Electron main process (Node.js)
│   └── index.js             # Main process entry point
├── preload/                 # Electron preload scripts
│   └── index.js             # Context bridge API
└── renderer/                # Vue.js application
    ├── index.html           # HTML entry point
    ├── main.ts              # Vue app initialization + theminator setup (TypeScript)
    ├── App.vue              # Root component
    ├── style.css            # Global styles + Tailwind (themes from theminator)
    ├── router/              # Vue Router configuration
    │   └── index.ts
    ├── constants/           # Shared constants and configuration
    │   ├── chart.ts         # Chart config + unified gradient defs
    │   ├── theme.ts         # Re-exports from theminator
    │   └── navigation.ts    # Route definitions
    ├── stores/              # Pinia stores
    │   └── services.ts      # Services state management
    ├── views/               # Page components
    │   ├── Dashboard.vue    # Video stream + command input
    │   ├── Services.vue     # Service management with switches
    │   ├── Diagnostics.vue  # I2C monitoring + FFT charts for IMU data
    │   ├── Telemetry.vue    # Battery health + ToF distance sensors
    │   ├── PIDTuning.vue    # PID controller tuning interface
    │   └── Settings.vue     # Theme and dark mode controls (uses theminator)
    └── components/
        ├── Layout.vue       # Main layout with sticky header + sidebar
        └── ui/              # shadcn-vue components
            ├── card/
            ├── sidebar/     # FIXED: Tailwind CSS variable syntax + mobile trigger
            ├── badge/       # Status indicators
            ├── switch/
            ├── checkbox/
            ├── label/
            ├── select/
            ├── button/
            ├── textarea/
            ├── separator/
            └── chart/       # Unovis chart helpers
```

**Note:** Theme system (stores/theme.ts, services/themeService.ts, services/storageService.ts) removed - now provided by theminator package.

## Vue Component Guidelines

**Always use Options API with `<script lang="ts">`**

**Standard pattern:**
```vue
<script lang="ts">
import { defineComponent } from 'vue'

interface DataPoint {
  x: number
  y: number
}

export default defineComponent({
  data() {
    return {
      count: 0,
      items: [] as DataPoint[]
    }
  },
  methods: {
    increment() {
      this.count++
    }
  }
})
</script>

<template>
  <div>{{ count }}</div>
</template>
```

**Key Points:**
- Use `defineComponent()` for proper TypeScript inference
- Define interfaces for data structures
- Type arrays and objects in `data()`: `items: [] as Type[]`
- Avoid `any` types - use specific interfaces
- Use constants for magic numbers

## Theming System

### Using Theminator
The app uses **theminator** - a simple OKLCH theming library for Vue 3 Options API apps.

**Location:** `~/code/theminator` (local development package)

**Installation:**
```bash
npm install ~/code/theminator
```

**Setup in main.ts:**
```typescript
import { useThemeStore } from 'theminator'
import 'theminator/styles'

// After creating Pinia
useThemeStore().initialize()
```

### Migration from Local Theme System
**Completed:** App migrated from local theme implementation to theminator library.

**What was removed:**
- `src/renderer/stores/theme.ts` - Replaced by theminator's Pinia store
- `src/renderer/services/themeService.ts` - Replaced by theminator
- `src/renderer/services/storageService.ts` - No longer needed (theminator handles storage)
- ~500 lines of theme CSS from `style.css` - Now provided by theminator

**What changed:**
- `src/renderer/constants/theme.ts` - Now re-exports from theminator
- `src/renderer/views/Settings.vue` - Uses theminator store and `availableThemes` getter
- `src/renderer/stores/services.ts` - Uses localStorage directly (no StorageService dependency)

**Benefits:**
- Reduced code duplication
- 9 themes instead of 8 (added Indigo)
- 5 chart colors per theme instead of 2
- Better error handling (localStorage failures, invalid themes)
- Reusable across other projects

### Multi-Theme Support
Theminator provides 9 built-in color themes in rainbow order:
- Default (neutral)
- Red, Orange, Yellow (warm)
- Green, Blue, Indigo, Violet (cool)
- Rose (pink accent)

### Theme Structure
Each theme defines CSS variables:
- `--background`, `--foreground` - Base colors
- `--primary`, `--primary-foreground` - Primary accent
- `--secondary`, `--muted`, `--accent` - Supporting colors
- `--border`, `--input`, `--ring` - UI element colors
- `--card`, `--popover` - Surface colors
- `--chart-1` through `--chart-5` - Chart color palette (5 colors with varying brightness)

Themes use OKLCH color space for consistent lightness perception.

### Dark Mode
- Stored in localStorage via theminator (`theminator:darkMode`)
- Applied via `.dark` class on `<html>`
- Each theme has light and dark variants
- Configured in `src/renderer/views/Settings.vue`

### Using Themes in Components
```vue
<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'pinia'
import { useThemeStore } from 'theminator'

export default defineComponent({
  computed: {
    ...mapState(useThemeStore, ['darkMode', 'selectedTheme', 'availableThemes'])
  },
  methods: {
    ...mapActions(useThemeStore, ['setDarkMode', 'setTheme', 'toggleDarkMode'])
  }
})
</script>
```

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

### Theminator Features
- ✅ Automatic localStorage persistence
- ✅ Theme validation (falls back to 'default' if saved theme doesn't exist)
- ✅ Error handling for private browsing mode
- ✅ Simple Pinia store integration
- ✅ Support for custom themes
- ✅ Rainbow-ordered themes (ROYGBIV + rose)

### Adding Custom Themes
To add a custom theme:

1. **Define CSS in `style.css`:**
```css
:root[data-theme="custom"] {
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  --primary: oklch(0.55 0.25 200);
  /* ... all other CSS variables ... */
  --chart-1: oklch(0.45 0.24 200);
  --chart-2: oklch(0.55 0.25 200);
  --chart-3: oklch(0.65 0.23 200);
  --chart-4: oklch(0.75 0.20 200);
  --chart-5: oklch(0.85 0.16 200);
}

:root[data-theme="custom"].dark {
  /* Dark mode variant */
}
```

2. **Register in `main.ts`:**
```typescript
import { registerTheme } from 'theminator'

registerTheme('custom', 'My Custom Theme')
```

The theme now appears in the Settings dropdown!

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
- Use `Switch` component (not Checkbox) for on/off states
- Hide switch visually but keep accessible: `class="sr-only"`
- Style parent Label with `has-data-[state=checked]:bg-primary/5` and `has-data-[state=checked]:border-primary`
- Dark mode uses `dark:has-data-[state=checked]:bg-primary/10` for stronger contrast

## Dashboard Page

Location: `src/renderer/views/Dashboard.vue`

**Features:**
- 4:3 aspect ratio video placeholder (`aspect-[4/3]`)
- Multi-line command input (Textarea) with embedded submit button
- Button positioned absolutely inside textarea (`absolute bottom-3 right-3`)
- Keyboard: Enter sends, Shift+Enter for new line
- Centered with `max-w-5xl mx-auto` constraint

**Key Points:**
- Remove `disabled:opacity-50` from buttons to keep theme colors bright when disabled
- Use `:stroke-width="3"` on icons for bolder appearance
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
- Flash animation: Reactive state + setTimeout(200ms) + `transition-colors` class
- Mode toggle buttons use `:variant="mode === 'active' ? 'default' : 'outline'"`

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
- I2C cards appear above FFT charts
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
  - Temperature warning indicator (>35°C)
  - Battery icon displayed in global header (not on page)
- **ToF Distance Sensors** - VL53L4CX obstacle detection (Adafruit 5425)
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
- Sticky global header with battery status indicator
- Collapsible sidebar navigation
- Main content area with router view
- STOP button (destructive variant) in top-right

**Sticky Header:**
- Classes: `sticky top-0 z-10 bg-background`
- Stays visible when scrolling
- Contains: SidebarTrigger, Battery Icon, STOP button

**Battery Icon:**
- Visual battery shape with fill level
- Color-coded: Green (>50%), Yellow (20-50%), Red (≤20%)
- Percentage display
- Compact size for header: 12px × 6px
- Data generated in Layout component (dummy data for now)

**Key Points:**
- Battery level state managed in Layout component
- Header background uses theme variable to match page background
- `z-10` ensures header stays above scrolling content
- Battery icon width calculated: `Math.max(2, (batteryLevel / 100) * 43) + 'px'`

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
- Always `event.preventDefault()` on plain Enter to avoid unwanted newlines
- Let Shift+Enter use default behavior (creates newline)

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
- **Button brightness**: Remove `disabled:opacity-50` to keep theme colors bright when button is disabled - use `disabled:pointer-events-none` instead to prevent clicks

### Charts
- Extract chart configuration to constants
- Define proper interfaces for data points
- Use theme variables for colors
- Keep chart styling in scoped styles with `:deep()`

## Integration with Other Systems

### With Cogitator (Jetson)
**Documentation:** `/Users/damoncali/code/calvin_cogitator/CLAUDE.md`

**Interface:** Network communication (WebSocket/HTTP) - ❌ NOT IMPLEMENTED

**Explorator Receives:**
- Video stream from OAK-D camera
- Telemetry data forwarded from instinctus:
  - Balance status (tilt angle, velocity)
  - Motor feedback (position, velocity, current)
  - Battery health (voltage, current, power, temperature)
  - ToF distance measurements
  - I2C bus health metrics
  - IMU FFT data for vibration analysis

**Explorator Sends:**
- User commands from Dashboard (move, stop, turn)
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
- **Production optimization** - Production builds are optimized and fast (~300-700ms load time)
- **Dark mode first** - App defaults to dark mode, configurable in Settings
- **Theme persistence** - Settings stored in localStorage via theminator (`theminator:darkMode`, `theminator:theme`)
- **Type safety** - `strict: false` allows gradual TypeScript adoption
- **Dummy data** - Currently uses data generators; real integration pending cogitator network interface
- **Theminator** - Theme system extracted to reusable library at `~/code/theminator`

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
