---
name: deploy-itch
description: Build and deploy the game to Itch.io using butler CLI. Use when the user says "deploy to itch", "submit to jam", "upload to itch", "push to itch", or "publish game".
---

# Deploy to Itch.io

## Prerequisites

Verify butler is installed:

```bash
butler --version
```

If not installed:

```bash
# macOS
brew install itchio/tools/butler

# Or download from https://itch.io/docs/butler/installing.html
```

Verify authentication:

```bash
butler status
```

If not authenticated, run `butler login` and follow the browser prompt.

## Deploy Workflow

1. Build the production bundle:

```bash
npm run build
```

2. Verify the `dist/` folder contains `index.html` and assets.

3. Push to Itch.io:

```bash
butler push dist/ bigboy1122/scrap-machine:html5
```

The channel name `html5` tells Itch.io this is a web game. Butler handles versioning automatically — each push increments the build number.

4. Verify the game loads at https://bigboy1122.itch.io/scrap-machine

## Troubleshooting

- If `dist/` is empty, the build failed — check `npm run build` output for errors.
- If butler reports auth errors, run `butler login` again.
- If the game doesn't load on Itch.io, check the browser console for asset path issues — Vite's `base` option in `vite.config.ts` may need to be set to `"./"` for relative paths.
