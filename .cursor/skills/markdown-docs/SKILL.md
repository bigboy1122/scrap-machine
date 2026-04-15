---
name: markdown-docs
description: Write and format project documentation for Scrap Machine using markdown best practices. Use when the user says "write docs", "document", "README", "update docs", "architecture doc", "ADR", "decision record", "meeting notes", or "changelog".
---

# Scrap Machine Documentation

Write project documentation in standard CommonMark markdown. This project is hosted on GitHub, so GitHub Flavored Markdown (GFM) extensions are available.

## Document Types and Locations

| Type | Location | When |
|------|----------|------|
| Feature specs | `specs/<feature-name>.md` | Before implementing a feature (use `create-spec` skill) |
| Architecture Decision Records | `docs/adr/ADR-NNN-<title>.md` | When a significant technical decision is made |
| Game design updates | `game-design.md` | When mechanics, theme, or scope changes |
| API/system docs | `docs/<system-name>.md` | When a system is built (networking, combat, etc.) |
| Changelogs | `CHANGELOG.md` | Before each deployment/submission |

## Formatting Rules

- One `#` heading per document -- the document title
- Never skip heading levels (don't jump from `##` to `####`)
- Use `-` for unordered lists, not `*` or `+`
- Use `**bold**` for emphasis, `` `backticks` `` for code/paths/values
- Tables: max 5 columns -- use nested lists for wider data
- Alt text on every image
- One sentence per line in source (cleaner diffs)
- Blank lines before and after headings, lists, code blocks, tables

## GitHub-Specific Features Available

Since we're on GitHub, these extensions work in issues, PRs, and repo markdown:

```markdown
- [x] Task list checkbox (checked)
- [ ] Task list checkbox (unchecked)

> [!NOTE]
> GitHub alert/callout

> [!WARNING]
> Warning callout

> [!CAUTION]
> Danger callout

| Feature | Status |
|---------|--------|
| Tile grid | :white_check_mark: Done |
| Combat | :construction: In progress |
| Audio | :x: Not started |
```

## Mermaid Diagrams

For diagrams, use the `mermaid-diagrams` skill which has theming rules for light/dark mode compatibility. Always embed diagrams in fenced code blocks:

````markdown
```mermaid
flowchart LR
    A --> B
```
````

## ADR Template

```markdown
# ADR-NNN: Title

**Status:** Proposed | Accepted | Deprecated | Superseded
**Date:** YYYY-MM-DD
**Issue:** #NN (link to GitHub issue)

## Context
What problem are we solving? What constraints exist?

## Decision
What did we decide?

## Consequences
**Positive:**
- Benefit

**Negative:**
- Trade-off

## Alternatives Considered
- Alternative 1: Why we didn't choose it
```

## Rules

- All docs use `.md` extension
- File names in kebab-case: `tile-grid-system.md`
- Link to GitHub issues where relevant: `(#12)`
- Keep docs up to date -- stale docs are worse than no docs
- Include last-updated date in long-lived documents
