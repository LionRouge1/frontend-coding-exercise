# Frontend Coding Exercise

A React application with two main workspaces:

- `PDF Workspace`: upload, preview, manage, and persist PDF files locally.
- `Canvas Tools`: a `tldraw` canvas with custom tools (Pin + Camera Crop/Export) and persistent canvas state.

## Tech Stack

- React 19
- Vite 7
- React Router DOM 7
- tldraw 4
- Browser Local Storage (PDF persistence)
- tldraw `persistenceKey` storage (canvas persistence)
- ESLint 9

## Prerequisites

- Node.js 18+ (recommended: latest LTS)
- npm (or compatible package manager)

## Run the Application

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Open the app in your browser (Vite default):

```text
http://localhost:5173
```

## Available Scripts

- `npm run dev`: start Vite dev server
- `npm run build`: production build
- `npm run preview`: preview production build locally
- `npm run lint`: run ESLint

## Routes

- `/`: PDF Workspace (home page)
- `/canvas`: tldraw canvas tools page
- `/canva`: redirect to `/canvas`

## Notes on Persistence

- PDF documents are persisted in browser local storage.
- Canvas drawings are persisted by tldraw using `persistenceKey`, so refresh keeps the design.
