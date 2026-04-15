# Scrap Machine

A multiplayer clicker/strategy game built for the [Gamedev.js Jam 2026](https://gamedevjs.com/jam/2026/) (theme: **Machines**).

Players share a scrapyard world, each controlling a small factory that grows by collecting scrap tiles, expanding territory, and absorbing opponents.

## Quick Start

```bash
npm install
npm run dev
```

## Tech Stack

- **Engine:** [Phaser 3](https://phaser.io/) (HTML5 game framework)
- **Language:** TypeScript
- **Multiplayer:** TBD (see [issue #3](https://github.com/bigboy1122/scrap-machine/issues/3))
- **Build:** Vite
- **Deploy:** Itch.io, Wavedash, GitHub Pages

## Project Structure

```
scrap-machine/
├── src/
│   ├── scenes/        # Phaser scenes (boot, menu, game, etc.)
│   ├── entities/      # Game objects (machine, tile, grid)
│   ├── systems/       # Game systems (resources, combat, growth)
│   ├── network/       # Multiplayer networking
│   ├── ui/            # HUD and UI components
│   └── main.ts        # Entry point
├── public/
│   └── assets/        # Sprites, audio, fonts
├── specs/             # Feature specs (spec-driven development)
├── dist/              # Build output (git-ignored)
├── game-design.md     # Game design document
└── jam-rules-and-prizes.md
```

## Jam Challenges

We're targeting these optional challenges:

| Challenge | Prize Pool | Requirement |
|-----------|-----------|-------------|
| [Open Source](https://github.com/bigboy1122/scrap-machine) | GitHub Copilot Pro | Public repo (this one) |
| [Build it with Phaser](https://phaser.io/) | ~$5,500 | Use Phaser framework |
| [Deploy to Wavedash](https://docs.wavedash.com/) | $2,500 | Publish on Wavedash |

## Development

This project uses **spec-driven development** with AI-assisted coding. Every feature starts as a written spec in `specs/` before implementation.

## License

MIT
