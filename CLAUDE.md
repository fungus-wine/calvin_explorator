# Calvin Console - Project Instructions

## Project Overview

Calvin Console is an Electron desktop application for monitoring and diagnostics, built with Vue 3, TypeScript, and shadcn-vue components. Features real-time FFT charts for IMU accelerometer data visualization.

## Tech Stack

### Core Technologies
- **Electron** - Desktop app framework
- **electron-vite** - Build tooling for Electron + Vite
- **Vue 3** - UI framework using **Composition API** (`<script setup>`)
- **TypeScript** - Type-safe JavaScript
- **Vue Router** - Client-side routing with hash mode
- **Vite** - Build tool and dev server
- **Tailwind CSS 4.1** - Utility-first CSS framework with CSS-first configuration
- **shadcn-vue** - UI component library (CLI-installed)
- **Unovis** - Chart library for data visualization

### Key Conventions
- **TypeScript** - All code uses TypeScript with `strict: false` for gradual adoption
- **Composition API** - Use `<script setup lang="ts">` in all Vue components
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
    ├── main.ts              # Vue app initialization (TypeScript)
    ├── App.vue              # Root component
    ├── style.css            # Global styles + Tailwind + theme system
    ├── router/              # Vue Router configuration
    │   └── index.ts
    ├── views/               # Page components
    │   ├── Dashboard.vue
    │   ├── Services.vue     # Service management with switches
    │   ├── Diagnostics.vue  # FFT charts for IMU data
    │   ├── Telemetry.vue
    │   └── Settings.vue     # Theme and dark mode controls
    └── components/
        ├── Layout.vue       # Main layout with sidebar
        └── ui/              # shadcn-vue components
            ├── card/
            ├── sidebar/     # FIXED: Tailwind CSS variable syntax
            ├── switch/
            ├── checkbox/
            ├── label/
            ├── select/
            ├── button/
            ├── separator/
            └── chart/       # Unovis chart helpers
```

## Vue Component Guidelines

### Use Composition API with `<script setup>`

**Standard pattern:**
```vue
<script setup lang="ts">
import { ref } from 'vue'

interface DataPoint {
  x: number
  y: number
}

const count = ref(0)
const data = ref<DataPoint[]>([])

function increment() {
  count.value++
}
</script>

<template>
  <div>{{ count }}</div>
</template>
```

### TypeScript Usage
- Define interfaces for data structures
- Use proper types for props and refs
- Avoid `any` types - use specific interfaces
- Constants for magic numbers

## Theming System

### Multi-Theme Support
The app supports 8 color themes defined in `style.css`:
- Default (neutral)
- Red, Rose, Orange
- Green, Blue
- Yellow, Violet

### Theme Structure
Each theme defines:
- `--background`, `--foreground` - Base colors
- `--primary`, `--primary-foreground` - Primary accent
- `--secondary`, `--muted`, `--accent` - Supporting colors
- `--border`, `--input`, `--ring` - UI element colors
- `--card`, `--popover` - Surface colors
- `--chart-1`, `--chart-2` - Chart color palette

Themes use OKLCH color space for consistent lightness perception.

### Dark Mode
- Stored in localStorage
- Applied via `.dark` class on `<html>`
- Each theme has light and dark variants
- Configured in `src/renderer/views/Settings.vue`

### Chart Theming
Charts automatically adapt to active theme via `--chart-1` and `--chart-2` CSS variables.

## Charts (Unovis)

### FFT Diagnostics Charts
Location: `src/renderer/views/Diagnostics.vue`

**Features:**
- Two FFT charts: Balancer IMU and OAK-D Pro W IMU
- Gradient area fills with bright line overlay
- Theme-aware colors using `var(--chart-1)`
- Clean axis styling with custom grid lines

**Chart Pattern:**
```vue
<script setup lang="ts">
import { VisXYContainer, VisArea, VisLine, VisAxis } from '@unovis/vue'

interface FFTDataPoint {
  frequency: number
  magnitude: number
}

const svgDefs = `
  <linearGradient id="fillFFT" x1="0" y1="0" x2="0" y2="1">
    <stop offset="5%" stop-color="var(--chart-1)" stop-opacity="0.8"/>
    <stop offset="95%" stop-color="var(--chart-1)" stop-opacity="0.1"/>
  </linearGradient>
`
</script>

<template>
  <VisXYContainer :data="chartData" :height="300" :svg-defs="svgDefs">
    <VisArea color="url(#fillFFT)" :opacity="0.6" />
    <VisLine color="var(--chart-1)" :line-width="2" />
    <VisAxis type="x" :tick-line="false" :domain-line="false" />
  </VisXYContainer>
</template>
```

### Chart Styling
Grid lines, axis labels, and colors are customized via scoped styles with `:deep()` selectors.

## Services Page

### Service Management UI
Location: `src/renderer/views/Services.vue`

**Features:**
- Toggle switches for enabling/disabling services
- Theme-aware highlighting when service is enabled
- Clean card-based layout without visible switches
- Designed for future remote service control

**Pattern:**
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface Service {
  id: string
  title: string
  description: string
  enabled: boolean
}

const services = ref<Service[]>([...])
</script>

<template>
  <Label
    :for="service.id"
    class="flex items-start rounded-lg border p-4 cursor-pointer transition-colors
           has-data-[state=checked]:bg-primary/5
           has-data-[state=checked]:border-primary
           dark:has-data-[state=checked]:bg-primary/10"
  >
    <Switch
      :id="service.id"
      v-model:checked="service.enabled"
      class="sr-only"
    />
    <div class="grid gap-1.5 font-normal">
      <p class="text-sm leading-none font-medium">{{ service.title }}</p>
      <p class="text-muted-foreground text-sm">{{ service.description }}</p>
    </div>
  </Label>
</template>
```

**Key Implementation Details:**
- **Switch vs Checkbox**: Uses `Switch` component (not `Checkbox`) as it's semantically correct for on/off service states
- **Hidden Controls**: Switch is hidden with `sr-only` class - entire card is clickable
- **Theme Integration**: Enabled state uses `primary` color variables, automatically adapts to active theme
- **State Selectors**: Uses `has-data-[state=checked]` to style parent based on switch state
- **Accessibility**: `sr-only` keeps controls accessible to screen readers while hiding them visually

**Styling States:**
- Default: Standard border
- Enabled (light): `bg-primary/5` + `border-primary`
- Enabled (dark): `bg-primary/10` + `border-primary`

## shadcn-vue Components

### Installation
```bash
npx shadcn-vue@latest add <component-name>
```

Components are installed to `src/renderer/components/ui/`.

### Known Issues & Fixes

**Sidebar collapsible bug:**
The CLI-installed Sidebar component has incorrect Tailwind CSS syntax. Fixed in our version:
```vue
<!-- Incorrect (from CLI): -->
<div class="w-[--sidebar-width]" />

<!-- Correct (our fix): -->
<div class="w-[var(--sidebar-width)]" />
```

See comment in `src/renderer/components/ui/sidebar/Sidebar.vue` for details.

## Electron Configuration

### Window Setup (Main Process)
Prevents white flash on startup:
```javascript
const mainWindow = new BrowserWindow({
  width: 1200,
  height: 800,
  backgroundColor: '#1a1a1a',  // Dark background
  show: false,                  // Don't show until ready
  webPreferences: {
    preload: path.join(__dirname, '../preload/index.cjs'),
    contextIsolation: true,
    nodeIntegration: false
  }
})

mainWindow.once('ready-to-show', () => {
  mainWindow.show()
})
```

### HTML Setup
Inline styles in `index.html` ensure dark background during load:
```html
<style>
  html, body {
    margin: 0;
    padding: 0;
    background-color: #1a1a1a;
    color: #fafafa;
  }
</style>
```

## Development Commands

```bash
npm run dev      # Start dev server + launch Electron with hot-reload
npm run build    # Build for production
npm start        # Preview production build (alias for preview)
npm run preview  # Preview production build
```

## Routing

Router uses hash mode for Electron compatibility:
```typescript
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [...]
})
```

URLs: `/#/dashboard`, `/#/diagnostics`, etc.

## Common Tasks

### Adding a New Page
1. Create `src/renderer/views/PageName.vue` with `<script setup lang="ts">`
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

## File Editing Rules

- **Use TypeScript** - `.ts` extension for scripts, `lang="ts"` in Vue files
- **Use Composition API** - `<script setup lang="ts">` in all Vue components
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
- Extract reusable logic into composables
- Use proper TypeScript interfaces for props
- Prefer `const` over `let` where possible

### Styling
- Use Tailwind classes for layout and spacing
- Use theme CSS variables for colors
- Use scoped styles for component-specific styling
- Avoid inline styles except for dynamic values

### Charts
- Extract chart configuration to constants
- Define proper interfaces for data points
- Use theme variables for colors
- Keep chart styling in scoped styles with `:deep()`

## Notes

- **No git commits** - User handles all git operations
- **Production optimization** - Production builds are optimized and fast (~300-700ms load time)
- **Dark mode first** - App defaults to dark mode, configurable in Settings
- **Theme persistence** - Settings stored in localStorage
- **Type safety** - `strict: false` allows gradual TypeScript adoption

## Troubleshooting

### White Flash on Startup
Fixed via:
1. `backgroundColor: '#1a1a1a'` in BrowserWindow
2. `show: false` + `ready-to-show` event
3. Inline background styles in HTML

### shadcn-vue Compatibility
- Some CLI-installed components may have Tailwind v4 syntax issues
- Check and fix CSS variable syntax: `var(--variable)` not `--variable`
- Components tested: Sidebar, Card, Button, Switch, Select

### Chart Styling
- Use `:deep()` for styling Unovis chart internals
- Set CSS variables on container for theme integration
- Grid lines require `!important` to override defaults
