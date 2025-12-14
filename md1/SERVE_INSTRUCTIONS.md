# Serving the Built App (Node.js)

## Using `serve` Package (Recommended)

The `serve` package is now installed and configured. It's a Node.js package specifically designed for serving static sites with SPA routing support.

### To serve the built app:

```bash
cd PWA
npm run serve
```

This will:
- Serve the `dist` folder
- Handle SPA routing (all routes serve index.html)
- Listen on port 8000
- Be accessible from your network

### Access from phone:
```
http://192.168.99.64:8000
```

---

## Alternative: Using Vite Preview

You can also use Vite's built-in preview:

```bash
cd PWA
npm run preview -- --host 0.0.0.0 --port 8000
```

---

## Why `serve` is Better:

- ✅ Pure Node.js (matches your tech stack)
- ✅ Built-in SPA routing support
- ✅ Handles all routes correctly
- ✅ Lightweight and fast
- ✅ No Python dependency

---

## Quick Commands:

```bash
# Build the app
npm run build

# Serve the built app
npm run serve

# Stop server: Ctrl+C
```


