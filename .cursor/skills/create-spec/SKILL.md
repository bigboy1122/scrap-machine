---
name: create-spec
description: Generate a feature specification in specs/ following the project's spec-driven development workflow. Use when the user says "create spec", "write spec", "new feature spec", "spec for", or "feature spec".
---

# Create Feature Spec

Every feature starts as a written spec before any code is generated.

## Workflow

1. Ask the user for the feature name if not provided.
2. Create a new file at `specs/<feature-name>.md` using the template below.
3. Fill in as much as possible from context; leave `[TBD]` for unknowns.
4. Present the spec to the user for review before implementation begins.

## Template

```markdown
# Spec: <Feature Name>

## Objective
What this feature does and why it exists. One paragraph.

## Behavior
Describe how it works from the player's perspective:
- What the player sees
- What the player does
- What happens in response

## Technical Design
How it will be implemented:
- Which Phaser scenes/systems are involved
- Key data structures
- State management approach
- Network considerations (if multiplayer-relevant)

## Acceptance Criteria
Checklist of conditions that must be true for this feature to be complete:
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Scope Boundaries
What is explicitly NOT included in this feature:
- Out of scope item 1
- Out of scope item 2

## Dependencies
Other features or specs this depends on:
- None / list dependencies

## Test Plan
How this feature will be tested:
- Unit tests for: ...
- Browser tests for: ...
```

## Rules

- File name: `specs/<feature-name>.md` using kebab-case
- One spec per feature — don't combine unrelated features
- Specs are living docs — update them if requirements change during implementation
- Never delete a spec; mark it as `[SUPERSEDED]` if replaced
