# Calvin Console - Project Instructions

## Project Overview

Calvin Console is an Electron desktop application for monitoring and controlling a balancing robot, built with Vue 3, TypeScript, and shadcn-vue components. Features include:
- Video stream display with command interface for remote control
- Real-time FFT charts for IMU accelerometer data visualization
- Service management with toggle controls
- PID controller tuning interface with multi-mode adjustment
- Multi-theme support with light/dark modes

## Tech Stack

### Core Technologies
- **Electron** - Desktop app framework
- **electron-vite** - Build tooling for Electron + Vite
- **Vue 3** - UI framework using **Options API** except for 3rd party add ons such as shadcn-vue components.
- **TypeScript** - Type-safe JavaScript
- **Vue Router** - Client-side routing with hash mode
- **Vite** - Build tool and dev server
- **Tailwind CSS 4.1** - Utility-first CSS framework with CSS-first configuration
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
    ├── main.ts              # Vue app initialization (TypeScript)
    ├── App.vue              # Root component
    ├── style.css            # Global styles + Tailwind + theme system
    ├── router/              # Vue Router configuration
    │   └── index.ts
    ├── views/               # Page components
    │   ├── Dashboard.vue    # Video stream + command input
    │   ├── Services.vue     # Service management with switches
    │   ├── Diagnostics.vue  # FFT charts for IMU data
    │   ├── Telemetry.vue
    │   ├── PIDTuning.vue    # PID controller tuning interface
    │   └── Settings.vue     # Theme and dark mode controls
    └── components/
        ├── Layout.vue       # Main layout with sidebar
        └── ui/              # shadcn-vue components
            ├── card/
            ├── sidebar/     # FIXED: Tailwind CSS variable syntax + mobile trigger
            ├── switch/
            ├── checkbox/
            ├── label/
            ├── select/
            ├── button/
            ├── textarea/
            ├── separator/
            └── chart/       # Unovis chart helpers
```

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

Location: `src/renderer/views/Diagnostics.vue`

**Features:**
- FFT charts for IMU data (Balancer and OAK-D Pro W)
- Gradient area fills using SVG linearGradient in `:svg-defs` prop
- Theme-aware colors: `var(--chart-1)` and `var(--chart-2)`
- Custom axis styling via scoped styles with `:deep()` selectors

**Key Points:**
- Import from `@unovis/vue`: `VisXYContainer`, `VisArea`, `VisLine`, `VisAxis`
- Define gradients in `svgDefs` const, pass to `:svg-defs` prop
- Reference gradients: `color="url(#gradientId)"`
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

## Notes

- **No git commits** - User handles all git operations
- **Production optimization** - Production builds are optimized and fast (~300-700ms load time)
- **Dark mode first** - App defaults to dark mode, configurable in Settings
- **Theme persistence** - Settings stored in localStorage
- **Type safety** - `strict: false` allows gradual TypeScript adoption

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
