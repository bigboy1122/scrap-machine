---
name: run-coverage
description: Run test coverage analysis, report files below the 80% threshold, and suggest which tests to add. Use when the user says "check coverage", "test coverage", "coverage report", "coverage gaps", or "are we at 80%".
---

# Run Coverage Report

## Workflow

1. Run the coverage command:

```bash
npm run test:coverage
```

2. Parse the terminal output. Look for:
   - Overall line and branch coverage percentages
   - Individual files below the 80% threshold
   - Uncovered line ranges

3. Report findings to the user:
   - Overall coverage vs 80% target
   - List of files below threshold with their percentages
   - Specific uncovered line ranges for each failing file

4. For each file below 80%, suggest what tests to add:
   - Read the source file
   - Identify untested functions/branches
   - Suggest specific test cases

## Reading the Coverage Table

Vitest outputs a table like:

```
----------|---------|----------|---------|---------|
File      | % Stmts | % Branch | % Funcs | % Lines |
----------|---------|----------|---------|---------|
All files |   85.71 |    75.00 |  100.00 |   85.71 |
 logger.ts|   85.71 |    75.00 |  100.00 |   85.71 |
----------|---------|----------|---------|---------|
```

Focus on **% Lines** and **% Branch** — both must be >= 80%.

## Output Format

```markdown
## Coverage Report

**Overall:** 85.7% lines, 75.0% branches

### Files Below 80% Threshold

| File | Lines | Branches | Action Needed |
|------|-------|----------|---------------|
| src/utils/logger.ts | 85.7% | 75.0% | Add tests for branch at lines 42-45 |

### Suggested Tests
- `logger.ts`: Test the `trace` level output path (lines 42-45)
```

## Rules

- Never lower the 80% threshold — if coverage is too hard to reach, the code may need refactoring
- Exclude test files and `main.ts` from coverage (already configured in `vitest.config.ts`)
- If coverage passes, just report the numbers — no action needed
