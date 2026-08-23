# Deployment

Both `PWA` and `Web` are static Vite builds, and both deploy to **Firebase Hosting** on the same Firebase project — the one already backing Firestore/Auth. Since there are two separate apps, they're deployed as two separate **hosting targets/sites** under that one project rather than overwriting each other.

## Why Firebase Hosting

- HTTPS by default — required for GPS, service workers, and PWA install prompts to work at all.
- Global CDN, generous free tier, one-command deploys.
- Already the same platform used for Auth/Firestore, so no extra account/setup.
- Handles SPA routing (all paths → `index.html`) so React Router works after a hard refresh or a shared deep link.

## One-time setup

```bash
# Install the CLI if you don't have it
npm install -g firebase-tools

# Authenticate
firebase login

# From the repo root, point the project at your Firebase project
firebase use --add
# select YOUR_PROJECT_ID
```

### Configure two hosting targets

Create two Firebase Hosting sites (in addition to the project's default site, or instead of it) — one for the field-responder PWA, one for the HQ dashboard:

```bash
firebase hosting:sites:create your-project-pwa
firebase hosting:sites:create your-project-web
```

Bind each site to a short target name so the CLI can tell them apart:

```bash
firebase target:apply hosting pwa your-project-pwa
firebase target:apply hosting web your-project-web
```

Then in `firebase.json`, declare both as separate hosting entries, each pointing at its own build output and its own target:

```json
{
  "hosting": [
    {
      "target": "pwa",
      "public": "PWA/dist",
      "rewrites": [{ "source": "**", "destination": "/index.html" }]
    },
    {
      "target": "web",
      "public": "Web/dist",
      "rewrites": [{ "source": "**", "destination": "/index.html" }]
    }
  ]
}
```

## Build and deploy

```bash
# Build the PWA
cd PWA
npm run build
cd ..

# Build the Web dashboard
cd Web
npm run build
cd ..

# Deploy both hosting targets at once
firebase deploy --only hosting

# ...or deploy just one, by target name
firebase deploy --only hosting:pwa
firebase deploy --only hosting:web
```

The PWA also has a convenience script that builds and deploys it in one step: `cd PWA && npm run deploy` (runs `npm run build && firebase deploy --only hosting`) — adjust it to `--only hosting:pwa` once targets are configured, so it doesn't also redeploy the dashboard.

After deploying, Firebase prints a URL per site, of the form:

```
https://your-project-pwa.web.app
https://your-project-web.web.app
```

These URLs are stable — share them once (with judges, testers, teammates) and they keep working across redeploys, unlike a LAN IP.

## Verifying a deploy

- Open each URL and confirm the app loads and can reach Firestore (log in, submit/view a test incident).
- For the PWA specifically: confirm the install prompt appears (it requires HTTPS, which Hosting provides) and that offline mode still works after a fresh install from the deployed URL.
- `firebase hosting:channel:list` shows current channels/sites if you want to sanity-check what's live.

## Preview channels (optional)

For testing a change before it goes to the "real" URL, deploy to a temporary preview channel instead of production:

```bash
firebase hosting:channel:deploy preview-name --only hosting:pwa
```

This publishes to a throwaway URL without touching the live site, and the channel can be deleted afterward with `firebase hosting:channel:delete preview-name`.

## Troubleshooting

- **"Project not found"** — run `firebase use YOUR_PROJECT_ID` to select it explicitly, or `firebase projects:list` to see what you're authenticated for.
- **Deploy pushes the wrong app / overwrites the other site** — check that `firebase.json` has both hosting entries with distinct `target` values, and that both targets have been bound with `firebase target:apply hosting <target> <site-id>`.
- **Build folder missing** — deploy reads from `PWA/dist` / `Web/dist`; run `npm run build` in that app's folder first.
- **Old version still showing** — service workers aggressively cache the app shell; a hard refresh or clearing site data on the client is sometimes needed after a redeploy.
