# Debugging the Frontend in VS Code

## Prerequisites

- **Debugger for Chrome** — built into VS Code via the built-in JavaScript Debugger. No extension install needed.

## Steps

1. **Start the Vite dev server** in a terminal:
   ```
   cd logos-frontend
   npm run dev
   ```
   The server starts on `http://localhost:9000`.

2. **Start the debug session** — open the Run & Debug panel (`Ctrl+Shift+D`) and select **Debug Frontend (Chrome)**, then press `F5` (or the green play button).

   VS Code will launch a new Chrome window connected to the debugger.

3. **Set breakpoints** — click the gutter next to any line in a `.tsx` or `.ts` file under `logos-frontend/src/`. The breakpoint will be hit when that code path runs in the browser.

## How it works

The configuration in [.vscode/launch.json](.vscode/launch.json) launches Chrome pointed at `http://localhost:9000` and maps the browser's source map paths (`/src/*`) back to the files on disk under `logos-frontend/src/`. Vite generates source maps automatically in development mode — no extra config is needed.

## Tips

- Keep the Vite dev server running while the debug session is active. Stopping the server will disconnect the debugger.
- Hot module replacement (HMR) works normally during a debug session — edits to source files are reflected in the browser without restarting the debugger.
- Use the **Debug Console** in VS Code to evaluate expressions in the current breakpoint scope.
