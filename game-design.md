# Scrap Machine — Game Design Document

## Overview

Scrap Machine is a multiplayer clicker/strategy game built for the Gamedev.js Jam 2026 (theme: "Machines"). Players share a "petri dish" world with 6–8 participants, each controlling a small factory or machine in a scrapyard setting. The goal is to grow your machine by collecting scrap tiles, expanding territory, and absorbing opponents — not eliminating them.

## Core Concept

Each player starts with a small organism-like factory and a few buttons: grow, attack, and defend. Players compete on a shared tile grid, expanding territory through strategic clicking. When you overcome an opponent, they aren't eliminated — instead, the defeated player's territory is absorbed and assists the victor in further expansion.

## Game Mechanics

### Territory Expansion
- The map is a shared grid of tiles. Each player starts with a small cluster.
- Players click to grow, claiming neutral tiles adjacent to their territory.
- Claiming tiles increases territory size and resource income, fueling further expansion and upgrades.

### Border Conflict & Stalemates
- When two players share a border, conflict is resolved by comparing attack strength and tile control along the shared edge.
- Players with similar attack and defense values may reach a stalemate, sharing a border until one gains an advantage.
- Tile takeover is gradual, influenced by border length and relative attack strength.
- Absorbed tiles become part of the attacker's territory.

### Steering Growth
- Players can steer their growth direction, choosing to expand toward specific opponents or neutral territory.
- This adds a layer of strategy beyond raw stat upgrades — positioning and timing matter.

### Growth Strategy
- Players balance three priorities:
  - **Growth speed** — how fast you claim neutral tiles
  - **Defense** — how resistant your borders are to absorption
  - **Aggression** — how effectively you push into opponent territory
- Upgrade costs increase as your machine grows, forcing strategic choices about when to expand vs. fortify.

### Resource Management
- Resource income is proportional to the number of tiles controlled.
- Growth increases income, which fuels further expansion and upgrades.
- Resources are spent on:
  - Claiming new tiles
  - Upgrading attack strength
  - Upgrading defense
- The initial version uses a single resource type. Multiple resource types may be added later.

### Static / Stationary Model (V1)
- The first version features stationary players — machines expand outward from their position without movement.
- This keeps the initial build simple and playable.
- Movement mechanics may be added in a later iteration to enrich gameplay.

### Future Features (Post-V1)
- **Attack types** — Different attack types with rock-paper-scissors style strengths and weaknesses.
- **Multiple resources** — Additional resource types to add economic depth.
- **Movement** — Allowing machines to physically move across the grid.
- These are explicitly deferred to keep V1 scoped for the jam timeline.

## Theme Integration

The game is set in a scrapyard. Players control tank-like machines with magnets that collect scrap to grow. Tiles represent scrap that machines integrate into their body. Absorbing an opponent means salvaging their parts. The visual language should lean into industrial/mechanical aesthetics — rust, magnets, welded metal, sparks.

## Team & Development Approach

### Team Composition
- **Multiple developers + AI-assisted coding** — humans drive design decisions, review output, and steer direction. AI agents (Cursor + Claude) accelerate implementation, research, and iteration.
- **GitHub + GitHub Actions** for version control, collaboration, and CI/CD.

### Development Method
- **Spec-driven development** — every feature starts as a written spec before any code is generated. Specs define behavior, acceptance criteria, and scope boundaries.
- **MCP (Model Context Protocol) tooling** — AI agents have direct access to the browser, GitHub, Supabase, Vercel, and other services for integrated development and deployment.
- **Iterative prototyping** — build, test in browser, refine. Tight feedback loops enabled by AI speed.

### Implications for Engine Choice
- AI agents work best with **well-documented, code-first frameworks** with large training footprints.
- Visual editors (Godot, Cocos Creator) lose their advantage without a human sitting in the GUI.
- **Phaser** is the strongest fit: pure JavaScript/TypeScript, extensive docs, massive community, and it unlocks the Build it with Phaser challenge (~$5,500 in prizes).

## Technical Decisions (Resolved)

### Engine: Phaser 3
HTML5 game framework, code-first, excellent docs, jam sponsor with dedicated challenge track.

### IDE: Cursor
Built-in Claude/GPT agents, MCP support, rules/skills system. All project tooling built for Cursor (7 rules, 9 skills, 4 hooks).

### Multiplayer: Wavedash P2P (Host-Authoritative)
- **Wavedash WebRTC P2P** networking — one peer acts as authoritative host
- Lobby host runs game state logic client-side, validates actions, broadcasts state
- Other clients send actions to host via P2P channels
- **Player cap: 6–8** (WebRTC mesh degrades past ~10 peers)
- Zero server infrastructure — no hosting cost, no deploy complexity
- Built-in lobbies (public/private/invite link), chat, invites, NAT traversal

**P2P Channel Plan:**

| Channel | Use | Reliable |
|---------|-----|----------|
| 0 | Game state broadcasts (host → all) | Yes |
| 1 | Player actions (client → host) | Yes |
| 2 | Chat messages | Yes |
| 3 | Position/animation hints | No |

### Wavedash Integration: Deep
Full integration with Wavedash SDK — lobbies, P2P networking, chat, player identity. Primary multiplayer backend. Qualifies for Deploy to Wavedash challenge ($2,500 prize pool). Judges are Wavedash founders — deep integration should score well.

### Art Style: Hybrid
- **Tiles:** Procedural geometric with noise textures (rust/metal tints), Phaser graphics API
- **Machines & UI:** AI-generated sprites via `generate-sprite` skill (64x64 tiles, 128x128 machines)
- **Effects:** Particle emitters for sparks, smoke, magnetic fields
- **Palette:** Rust oranges, steel grays, dark browns, teal/cyan accents, spark yellows

### Target Platform
- Web browser (HTML5) — required for Gamedev.js Jam submission.

### Deployment Targets
- **Wavedash** — primary deployment (multiplayer backend + challenge entry)
- **Itch.io** — jam submission platform (required)
- **GitHub** — public repo for the Open Source challenge

## Open Questions

- Movement mechanics: defer entirely or attempt a basic version during the jam?
- Host migration: what happens when the host disconnects mid-game?
- How to handle reconnection for dropped peers?

## Next Steps

1. ~~Create GitHub repo and set up project structure~~ ✅
2. ~~Decide on AI IDE and build out agents/rules/skills/commands~~ ✅
3. ~~Lock in multiplayer stack~~ ✅
4. Write spec for the tile grid and click-to-grow mechanic
5. Prototype core loop: grid → claim tiles → resource income → upgrades
6. Integrate Wavedash SDK — lobbies, P2P networking
7. Write spec for border conflict and absorption
8. Implement border conflict and stalemate logic
9. Add visual polish (procedural tiles, AI sprites, particle effects)
10. Deploy to Wavedash and Itch.io
11. Playtest and iterate on balance (growth vs. defense vs. aggression)
