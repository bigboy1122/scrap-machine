---
name: deploy-wavedash
description: Build and deploy the game to Wavedash using their CLI. Use when the user says "deploy to wavedash", "push to wavedash", "wavedash deploy", or "publish to wavedash".
---

# Deploy to Wavedash

## Prerequisites

Verify the Wavedash CLI is installed:

```bash
wavedash --version
```

If not installed:

```bash
brew install wvdsh/tap/wavedash
```

Verify authentication:

```bash
wavedash auth status
```

If not authenticated, run `wavedash auth login` (opens browser).

## Configuration

Ensure `wavedash.toml` exists in the project root with the game ID:

```toml
game_id = "YOUR_GAME_ID"
upload_dir = "dist"
```

The game ID comes from the [Wavedash Developer Portal](https://wavedash.com/developers) game settings page.

## Deploy Workflow

1. Build the production bundle:

```bash
npm run build
```

2. Test locally with the Wavedash sandbox:

```bash
wavedash dev
```

This serves the build over HTTPS with the SDK injected. Verify the game works before pushing.

3. Push the build:

```bash
wavedash build push
```

Each push creates an immutable, numbered build. Pushing does NOT make it live.

4. Publish in the [Developer Portal](https://wavedash.com/developers):
   - Open the game
   - Go to builds list
   - Select the new build
   - Confirm publish

The CLI cannot publish yet — this step is manual.

## Troubleshooting

- If `dist/` is missing, run `npm run build` first.
- If upload is slow, compress textures and strip debug symbols.
- For SDK integration issues, see [Wavedash SDK docs](https://docs.wavedash.com/sdk/setup).
