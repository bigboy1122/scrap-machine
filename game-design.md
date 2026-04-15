# Scrap Machine — Game Design Document

## Overview

Scrap Machine is a multiplayer clicker/strategy game built for the Gamedev.js Jam 2026 (theme: "Machines"). Players share a "petri dish" world with 10–20 participants, each controlling a small factory or machine in a scrapyard setting. The goal is to grow your machine by collecting scrap tiles, expanding territory, and absorbing opponents — not eliminating them.

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
- For multiplayer networking, **Colyseus** or a lightweight WebSocket server pairs well with Phaser.

## Technical Considerations

### Engine
- **Phaser** (v3) — HTML5 game framework, code-first, excellent docs, jam sponsor with dedicated challenge track.

### Multiplayer Stack
- TBD — options include Colyseus, custom WebSocket server, or Supabase Realtime for lighter-weight state sync.

### Target Platform
- Web browser (HTML5) — required for Gamedev.js Jam submission.

### Deployment Targets
- **Itch.io** — primary submission platform (required)
- **Wavedash** — secondary deployment for the Deploy to Wavedash challenge ($2,500 prize pool)
- **GitHub** — public repo for the Open Source challenge

## Decisions To Make

### DECIDE: AI IDE & Tooling Environment
Which AI-assisted IDE will the team standardize on? This choice determines what agents, rules, skills, and commands we build.

**Options:**
- **Cursor** — built-in Claude/GPT agents, MCP support, rules/skills system, good for TypeScript
- **Windsurf** — Codeium-backed, similar agent capabilities
- **Claude Code (CLI)** — terminal-based, CLAUDE.md rules, lightweight
- **VS Code + Copilot** — familiar, but weaker agent orchestration

**What we need to build for the chosen IDE:**
- **Agents** — specialized subagents for game logic, art generation, testing, deployment
- **Rules** — project conventions, coding standards, Phaser patterns, file structure
- **Skills** — reusable capabilities (deploy to Wavedash, deploy to Itch.io, run Phaser dev server, etc.)
- **Commands** — shortcuts for common workflows (build, test, deploy, create spec)

### DECIDE: Wavedash Integration Depth
Deploy to Wavedash for the challenge ($2,500 prize pool). How deep do we integrate?

**Options:**
- **Minimal** — just deploy the same HTML5 build, no SDK. Meets challenge requirements.
- **Light SDK** — add leaderboards and/or achievements via Wavedash SDK for polish.
- **Deep integration** — use Wavedash multiplayer (lobbies, P2P networking) as our multiplayer backend.

**Considerations:**
- Wavedash has built-in multiplayer (lobbies, chat, invites, P2P) which could replace Colyseus entirely
- Deep integration risks coupling us to their platform
- Minimal deployment is ~30 minutes of work and still qualifies for the challenge

### DECIDE: Multiplayer Architecture
- **Colyseus** — purpose-built game server, authoritative state, rooms, lobby system
- **Wavedash Multiplayer** — built-in P2P networking, lobbies, would count toward their challenge
- **Custom WebSocket server** — maximum control, more work
- **Supabase Realtime** — lighter weight, already have MCP access, but not designed for games

### DECIDE: Art Style
- **Procedural/generated** — AI agents can produce these without external assets
- **Simple sprite sheets** — faster to iterate, AI can generate via image tools
- **Minimal geometric** — colored tiles/shapes, no art dependency, ship fastest

## Open Questions

- Movement mechanics: defer entirely or attempt a basic version during the jam?
- How many simultaneous players can the design support before performance degrades?
- How do we handle player sessions/reconnection in a 10–20 player lobby?

## Next Steps

1. **Create GitHub repo** and set up project structure
2. **Decide on AI IDE** and build out agents/rules/skills/commands for the team
3. Lock in multiplayer stack
4. Write spec for the tile grid and click-to-grow mechanic
5. Prototype core loop: grid → claim tiles → resource income → upgrades
6. Write spec for border conflict and absorption
7. Implement border conflict and stalemate logic
8. Add visual polish (scrapyard theme, particle effects, UI)
9. Deploy to Itch.io, Wavedash, and push to public GitHub repo
10. Playtest and iterate on balance (growth vs. defense vs. aggression)
