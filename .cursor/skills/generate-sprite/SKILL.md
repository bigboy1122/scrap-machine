---
name: generate-sprite
description: Generate game sprites and visual assets with a consistent scrapyard/industrial art style for Scrap Machine. Use when the user says "generate sprite", "create sprite", "game art", "make asset", "draw tile", or "generate texture".
---

# Generate Game Sprite

## Art Style Reference

All generated sprites must follow the Scrap Machine visual language:

- **Palette**: Rust oranges, steel grays, dark browns, teal/cyan accents, spark yellows
- **Aesthetic**: Industrial scrapyard — welded metal, rivets, rust patches, magnetic fields
- **Texture**: Rough, weathered surfaces with visible wear and mechanical detail
- **Lighting**: Top-down or 3/4 view, subtle highlight on metal edges
- **Style**: Semi-stylized pixel art or clean vector — NOT photorealistic

## Workflow

1. Determine what asset is needed (tile, machine, UI element, particle, etc.)
2. Build a detailed prompt using the style reference above
3. Use the GenerateImage tool with the constructed prompt
4. Save the output to `public/assets/<category>/<name>.png`

## Asset Categories

| Category | Path | Examples |
|----------|------|----------|
| Tiles | `public/assets/tiles/` | neutral tile, owned tile, contested tile |
| Machines | `public/assets/machines/` | player machine, magnet arm, exhaust |
| UI | `public/assets/ui/` | buttons, panels, health bars |
| Effects | `public/assets/effects/` | sparks, smoke, magnetic field |

## Prompt Template

```
[Asset type] for a top-down 2D scrapyard game. [Specific description].
Style: industrial, weathered metal, rust and steel palette.
Colors: rust orange, steel gray, dark brown, teal accents, spark yellow.
Background: transparent.
Resolution: [size]x[size] pixels.
```

## Example Prompts

**Neutral scrap tile:**
```
A top-down scrap metal tile for a 2D game. Pile of rusted gears, bolts, and
sheet metal fragments. Style: industrial, weathered. Colors: rust orange,
steel gray, dark brown. Background: transparent. Resolution: 64x64 pixels.
```

**Player machine (core):**
```
A top-down factory core for a 2D scrapyard game. Compact industrial machine
with a central magnet, exhaust vents, and welded armor plating. Glowing teal
energy core visible through gaps. Style: semi-stylized, mechanical detail.
Background: transparent. Resolution: 128x128 pixels.
```

## Rules

- Always use transparent backgrounds for game sprites
- Keep tile sizes consistent (64x64 for grid tiles, 128x128 for machines)
- Save to the correct asset category directory
- Name files with kebab-case: `neutral-tile.png`, `player-machine-core.png`
