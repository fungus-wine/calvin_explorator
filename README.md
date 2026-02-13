# Calvin Console

Electron app built with Vue.js (Options API) and Tailwind CSS 4.1

## Tech Stack

- **Electron** with electron-builder
- **Vue 3** (Options API, no TypeScript)
- **Vue Router** (hash mode)
- **Vite** via electron-vite
- **Tailwind CSS 4.1**
- **shadcn/vue** theming

## Project Structure

```
calvin_console/
├── src/
│   ├── main/           # Electron main process
│   ├── preload/        # Electron preload scripts
│   └── renderer/       # Vue.js app
│       ├── views/      # Page components (Dashboard, Settings)
│       ├── components/ # Reusable components
│       └── router/     # Vue Router configuration
├── index.html          # Entry HTML
└── electron.vite.config.js
```

## Getting Started

### Development

```bash
npm run dev
```

This starts the Vite dev server and launches Electron with hot-reload enabled.

### Build

```bash
npm run build
```

Builds the app for production.

### Preview

```bash
npm run preview
```

Preview the production build.

## Pages

- **Dashboard** - Main dashboard view at `/#/dashboard`
- **Settings** - Settings page at `/#/settings`

## Adding shadcn/vue Components

The project is set up with shadcn/vue theming (CSS variables in `src/renderer/style.css`). To add shadcn/vue components, you can:

1. Install shadcn-vue CLI (when ready to add components)
2. Manually copy component code from shadcn/vue documentation
3. Components will automatically use the theme variables

## Notes

- Uses hash-based routing (`createWebHashHistory`) for Electron compatibility
- All Vue components use Options API
- No TypeScript - pure JavaScript
