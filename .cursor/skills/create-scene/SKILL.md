---
name: create-scene
description: Scaffold a new Phaser 3 scene following project conventions. Use when the user says "create scene", "new scene", "add scene", or "scaffold scene".
---

# Create Phaser Scene

## Workflow

1. Ask for the scene name if not provided (e.g. "Game", "Menu", "HUD").
2. Create `src/scenes/<Name>Scene.ts` using the template below.
3. Register the scene in `src/main.ts` by adding it to the scene array.

## Template

```typescript
import { Scene } from "phaser";
import { logger } from "@/utils/logger";

export class <Name>Scene extends Scene {
  constructor() {
    super({ key: "<Name>Scene" });
  }

  init(data: Record<string, unknown>): void {
    logger.debug("<Name>Scene init", { data });
  }

  preload(): void {
    // Load assets here
  }

  create(): void {
    logger.info("<Name>Scene created");
  }

  update(_time: number, _delta: number): void {
    // Game loop logic here
  }

  shutdown(): void {
    this.input.off("pointerdown");
    this.events.off("update");
    logger.debug("<Name>Scene shutdown");
  }
}
```

## Registration

Add the scene to the `scene` array in `src/main.ts`:

```typescript
import { <Name>Scene } from "./scenes/<Name>Scene";

// In the config:
scene: [BootScene, <Name>Scene],
```

## Rules

- One scene per file
- File name matches class name: `GameScene.ts` contains `GameScene`
- Use named imports from Phaser: `import { Scene } from "phaser"`
- Always include `shutdown()` to clean up input listeners
- Log lifecycle events via the project logger
