# Calvin Console - Project Instructions

## Project Overview

Calvin Console is an Electron desktop application built with Vue.js 3 (Options API) and styled with Tailwind CSS 4.1.

## Tech Stack & Conventions

### Core Technologies
- **Electron** - Desktop app framework
- **electron-vite** - Build tooling for Electron + Vite
- **electron-builder** - Package and distribute the app
- **Vue 3** - UI framework using **Options API only** (NOT Composition API)
- **Vue Router** - Client-side routing with **hash mode** (`createWebHashHistory`)
- **Vite** - Build tool and dev server
- **Tailwind CSS 4.1** - Utility-first CSS framework
- **shadcn/vue** - Design system (theme variables configured)

### Important Constraints
- **NO TypeScript** - This project uses plain JavaScript only
- **Options API only** - All Vue components must use Options API, not Composition API
- **Hash mode routing** - Router uses `createWebHashHistory()` for Electron compatibility

## Project Structure

```
src/
├── main/           # Electron main process (Node.js)
│   └── index.js    # Main process entry point
├── preload/        # Electron preload scripts
│   └── index.js    # Context bridge API
└── renderer/       # Vue.js application
    ├── index.html  # HTML entry point
    ├── main.js     # Vue app initialization
    ├── App.vue     # Root component
    ├── style.css   # Global styles + Tailwind + theme variables
    ├── router/     # Vue Router configuration
    │   └── index.js
    ├── views/      # Page components
    │   ├── Dashboard.vue
    │   └── Settings.vue
    └── components/ # Reusable components
```

## Vue Component Guidelines

### Always Use Options API

**Correct:**
```vue
<script>
export default {
  name: 'MyComponent',
  data() {
    return {
      count: 0
    }
  },
  methods: {
    increment() {
      this.count++
    }
  }
}
</script>
```

**Incorrect (DO NOT USE):**
```vue
<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>
```

### Component Structure
- Place page components in `src/renderer/views/`
- Place reusable components in `src/renderer/components/`
- Use PascalCase for component file names (e.g., `UserProfile.vue`)

## Styling

### Tailwind 4.1 Setup
- Main CSS file: `src/renderer/style.css`
- PostCSS plugin: `@tailwindcss/postcss` (required for Tailwind v4)
- Config file: `tailwind.config.js`

### shadcn/vue Theme Variables
CSS variables are defined in `src/renderer/style.css`:
- `--background`, `--foreground`
- `--primary`, `--secondary`, `--muted`, `--accent`
- `--border`, `--input`, `--ring`
- `--destructive`, `--card`, `--popover`

Use these via Tailwind classes:
- `bg-background`, `text-foreground`
- `bg-primary`, `text-primary-foreground`
- `border`, `rounded-lg`, `rounded-md`

### Dark Mode
Dark mode variables are configured. To enable dark mode, add the `dark` class to the root element.

## Routing

### Hash Mode
Router uses hash-based routing for Electron:
```javascript
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [...]
})
```

URLs will be: `/#/dashboard`, `/#/settings`, etc.

### Adding New Routes
1. Create component in `src/renderer/views/`
2. Add route to `src/renderer/router/index.js`
3. Update navigation in `App.vue` if needed

## Electron Process Communication

### Main Process
- Entry: `src/main/index.js`
- Handles window creation, app lifecycle
- Dev mode: loads `http://localhost:5173`
- Production: loads built HTML files

### Preload Script
- Entry: `src/preload/index.js`
- Uses `contextBridge` to expose APIs to renderer
- Add IPC methods here when needed

### Security
- `contextIsolation: true`
- `nodeIntegration: false`
- Use preload script for all Node.js/Electron API access

## Development Commands

```bash
npm run dev      # Start dev server + launch Electron with hot-reload
npm run build    # Build for production
npm run preview  # Preview production build
```

## Adding Dependencies

- **UI dependencies**: `npm install <package>`
- **Dev dependencies**: `npm install -D <package>`
- Restart dev server after installing new packages

## File Editing Rules

- **Use TypeScript
- **Use Options API** in all Vue components
- **Use ES modules** - package.json has `"type": "module"`
- **Follow existing code style** - match the formatting in existing files

## Common Tasks

### Adding a New Page
1. Create `src/renderer/views/PageName.vue` with Options API
2. Add route in `src/renderer/router/index.js`
3. Add navigation link in `src/renderer/App.vue`

### Adding shadcn/vue Components
The project has shadcn/vue theming configured. To add components:
- Manually copy component code from shadcn/vue docs
- Adjust to use Options API instead of Composition API
- Components will automatically use the theme variables

### Electron IPC
To communicate between main and renderer:
1. Add method in `src/preload/index.js` using `contextBridge`
2. Use IPC in `src/main/index.js`
3. Access via `window.electron.methodName()` in renderer

## Notes

- Vite dev server runs on port 5173
- Electron window opens automatically in dev mode
- DevTools are enabled in development
- Hash routing is required for file:// protocol in production

## Additional Notes
- Don't commit to git. user will do all git operations
- Be aware that shadcn/vue may not be totally compatible with Tailwind 4.1 yet. Please do recent research when impelementing related features.
- Always use shadcn/vue components when possible. If not possible, stop to ask for direction.
- Always use unmodified shadcn/vue compoents via the official tool chain. If that is not possible, ask for direction