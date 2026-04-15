# Contributing to Scrap Machine

## Development Setup

```bash
git clone https://github.com/bigboy1122/scrap-machine.git
cd scrap-machine
npm install
npm run dev
```

## Branch Strategy

We use **GitHub Flow** (simple, fast, jam-friendly):

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready, always deployable |
| `feature/<name>` | New features: `feature/tile-grid`, `feature/combat-system` |
| `fix/<name>` | Bug fixes: `fix/border-conflict-edge-case` |
| `chore/<name>` | Non-functional: `chore/update-deps`, `chore/ci-pipeline` |

### Branch Rules
- Branch from `main`, merge back to `main`
- Keep branches short-lived (hours to 1-2 days max — it's a jam)
- Delete branches after merge

## Commit Messages

Use conventional-style commits:

```
feat: add tile claiming mechanic
fix: resolve border conflict calculation for diagonal tiles
chore: update Phaser to 3.87
docs: add multiplayer architecture decision
test: add ResourceManager unit tests
```

- **Imperative mood**: "add", "fix", "update" — not "added", "fixes"
- **One logical change per commit** — don't bundle unrelated changes
- **Reference issues**: `feat: add combat system (#12)`

## Pull Request Process

1. Create a feature branch from `main`
2. Write/update specs in `specs/` if adding a new feature
3. Write tests alongside implementation (80% coverage required)
4. Push and open a PR against `main`
5. PR title follows commit message convention
6. PR description must include:
   - **What** changed and **why**
   - **How to test** (steps to verify)
   - Link to related issue(s)
7. All CI checks must pass before merge
8. Squash merge to keep `main` history clean

## Code Review Standards

- Review for correctness, security, and readability — in that order
- AI-generated code gets the same review scrutiny as human code
- Flag any `console.log`, `any` types, or missing error handling
- Check that tests actually test behavior, not implementation details

## Coding Standards

All standards are enforced via `.cursor/rules/` and CI:

| Standard | Rule File |
|----------|-----------|
| Core conventions | `.cursor/rules/coding-standards.mdc` |
| Security & privacy | `.cursor/rules/security-compliance.mdc` |
| Testing | `.cursor/rules/testing-standards.mdc` |
| Logging | `.cursor/rules/logging-standards.mdc` |
| Phaser patterns | `.cursor/rules/phaser-patterns.mdc` |
| TypeScript | `.cursor/rules/typescript-standards.mdc` |

### Key Rules
- **DRY** — don't duplicate logic; extract into shared utilities
- **Functional correctness > performance** — make it work, then make it fast
- **80% test coverage** minimum (lines + branches)
- **No `console.log`** — use the project logger
- **No `any`** — use proper types or `unknown` with guards
- **OWASP/NIST compliant** — sanitize input, use WSS, never log PII
- **GDPR/CCPA compliant** — minimize data collection, support deletion rights

## Spec-Driven Development

Every feature starts as a spec before code:

1. Write a spec in `specs/<feature-name>.md`
2. Spec includes: objective, behavior, acceptance criteria, scope boundaries
3. Implement against the spec
4. Tests validate the acceptance criteria
5. Spec stays in repo as living documentation

## Testing

```bash
npm test              # Run unit tests
npm run test:coverage # Run with coverage report
npm run test:e2e      # Run Playwright browser tests
```

- Unit tests: colocated with source (`foo.test.ts` next to `foo.ts`)
- Browser tests: `tests/e2e/`
- New features must include tests; PRs that drop coverage below 80% are blocked

## Security

- Never commit secrets, tokens, or credentials
- Never log PII (emails, IPs, real names)
- Sanitize all player input before processing
- Use WSS (not WS) for WebSocket connections
- Run `npm audit` regularly; fix critical vulnerabilities before release

## Getting Help

- **Issues**: https://github.com/bigboy1122/scrap-machine/issues
- **Discord**: [Gamedev.js Discord](https://gamedevjs.com/discord)
- **Game Design**: See `game-design.md` in repo root
