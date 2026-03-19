# Mason Agent Playbook

This guide is for agentic coding tools operating in this monorepo.
Stack: Bun workspaces + Turbo + TypeScript + Effect + Oxlint/Oxfmt (Ultracite preset).

## Scope and precedence

1. Follow this file for repository-wide defaults.
2. If editing inside `interface/` or `packages/ui/`, also follow that directory's `AGENTS.md`.
3. Apply repository Cursor/Copilot instruction files when present.
4. Prefer minimal, focused edits that match existing architecture and naming.

## Environment and setup

Run commands from repository root unless a section says otherwise.

| Task                    | Command             | Notes                              |
| ----------------------- | ------------------- | ---------------------------------- |
| Install dependencies    | `bun install`       | Uses Bun workspaces + lockfile     |
| Start dev graph         | `bun run dev`       | Runs `turbo dev --parallel`        |
| Build all workspaces    | `bun run build`     | Runs `turbo build`                 |
| Lint                    | `bun run lint`      | Runs `turbo lint && manypkg check` |
| Format                  | `bun run format`    | Runs `oxfmt --write .`             |
| Typecheck               | `bun run typecheck` | Runs `turbo typecheck`             |
| Clean outputs           | `bun run clean`     | Also removes `.turbo/cache`        |
| Start local Docker deps | `bun run docker:up` | Uses root `docker-compose.yml`     |

## Build/lint/test commands

There is no root `test` script in `package.json`; use Vitest directly.
Also note: root `turbo.json` has no global `test` task by default.

### Vitest commands (preferred)

| Task                      | Command                                               |
| ------------------------- | ----------------------------------------------------- |
| Run all tests once        | `bunx vitest run`                                     |
| Watch mode                | `bunx vitest`                                         |
| Run a single test file    | `bunx vitest run path/to/file.test.ts`                |
| Run a single test by name | `bunx vitest run -t "test name"`                      |
| Run one file + one test   | `bunx vitest run path/to/file.test.ts -t "test name"` |
| Run tests in one folder   | `bunx vitest run packages/core/foo`                   |

### Workspace-scoped turbo examples

Use these when a workspace defines the corresponding task:

- `bunx turbo run build --filter=<workspace>`
- `bunx turbo run lint --filter=<workspace>`
- `bunx turbo run typecheck --filter=<workspace>`
- `bunx turbo run test --filter=<workspace>`

## Recommended local verification flow

For broad changes, run: `bun run format`, `bun run lint`, `bun run typecheck`, then `bunx vitest run`.
For small focused edits, run the narrowest relevant checks first (single file/test), then expand if needed.

## Code style baseline

The root `.oxlintrc.json` extends Ultracite's Oxlint presets and `.oxfmtrc.jsonc` stores formatter options plus project overrides.
Treat lints and formatting as source-of-truth over personal preference.

### Imports and exports

- Use `import type` for type-only imports.
- Prefer `export type` for type re-exports.
- Avoid namespace imports.
- Respect domain boundaries: import from public domain entrypoints only.
  - Enforced restriction: do not import `~/domains/*/**`; use `~/domains/<domain>`.
- Avoid redundant aliasing (`{ foo as foo }`).

### Formatting and syntax

- Let Oxfmt format code; do not hand-tune formatting.
- Use strict equality (`===` / `!==`).
- Prefer template literals when interpolation is involved.
- Prefer object spread over `Object.assign` for object creation.
- Prefer `const`; use `let` only when reassignment is required.
- Keep control flow simple; reduce nested conditionals where possible.

### TypeScript rules

- Do not use `any`.
- Do not use `unknown` as a type constraint.
- Prefer inference for obvious local literals.
- Use `as const` to preserve literal precision when appropriate.
- Keep array type style consistent: `Array<T>`.
- Avoid non-null assertions (`!`); narrow with guards.
- Avoid enums/namespaces unless unavoidable for interop.

### Naming and structure

- `camelCase`: variables, functions, helpers.
- `PascalCase`: components, classes, types/interfaces.
- Prefer descriptive names over abbreviations.
- Barrel files are allowed, but explicit imports are preferred unless defining a public API.

### Error handling and reliability

- Never swallow errors silently.
- Throw `Error` (or typed domain errors), never strings/primitives.
- Add actionable context to error messages.
- Translate low-level/infrastructure errors at boundaries.
- Preserve failure information needed for debugging and observability.

## Effect-specific conventions

Apply especially in `packages/core/*` and service/infrastructure layers:

- Prefer `Effect.gen` for multi-step workflows over long chaining.
- Model dependencies as services and wire with `Layer`.
- Access time via `Clock` (not direct `Date`) for testability.
- Use `Schema` for parsing/validation of external input.
- Prefer `Option` over nullable primitives for optional values.
- Use `Effect.all`/concurrency operators for independent work.
- Use tagged errors and targeted recovery (`catchTag`, `catchTags`).
- Manage resource lifecycles with `Scope` and scoped layers.

## UI and accessibility conventions

When editing `interface/` or `packages/ui/`, local AGENTS rules are mandatory:

- Prioritize accessibility: semantic HTML, keyboard nav, valid ARIA, visible focus.
- Preserve strong form UX: stable focus/value, paste support, inline validation clarity.
- Maintain interaction quality: generous hit areas, consistent feedback, no dead zones.
- Protect performance: avoid unnecessary rerenders, prevent CLS, virtualize large lists.
- Respect reduced motion preferences; animate `transform`/`opacity` where possible.
- Use `@base-ui-components/react` primitives and composition guidance.

## Cursor and Copilot instructions detected

Detected Cursor rules in this repository:

- `.cursor/rules/ultracite.mdc` (`alwaysApply: true`)
  - Default JS/TS quality, type-safety, React, and accessibility guidance.
- `.cursor/rules/effect.mdc` (`alwaysApply: false`)
  - Effect architecture and implementation patterns.
- `.cursor/rules/base-ui.mdc`
  - Base UI docs/reference guidance.
- `packages/ui/.cursor/rules/base-ui.mdc` (`alwaysApply: true` in that package)
  - Mandatory Base UI guidance for `packages/ui` edits.

Also detected: no root `.cursorrules` and no `.github/copilot-instructions.md`.

## Practical agent workflow

1. Identify target package and check for nested `AGENTS.md` before editing.
2. Follow existing patterns first; avoid broad refactors unless requested.
3. Make the smallest change that fully solves the task.
4. Run focused verification early (single file/test), then broaden.
5. Before handing off large changes, run format + lint + typecheck + relevant tests.
6. Document trade-offs, assumptions, and skipped checks in PR notes or handoff summary.

Keep this playbook up to date when scripts, tooling, or architectural conventions change.
