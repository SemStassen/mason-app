# Mason Agent Guidelines

This repository is a monorepo built with Bun, Turbo, and Effect-TS. It uses Biome for linting and formatting.

## 🛠 Commands

| Task | Command |
| :--- | :--- |
| **Build** | `turbo build` |
| **Lint** | `turbo lint && manypkg check` |
| **Format** | `bun run format` (alias for `biome format --write .`) |
| **Typecheck** | `turbo typecheck` |
| **Test (All)** | `bun test` or `npx vitest` |
| **Test (Single)** | `npx vitest run <path-to-file>` |
| **Dev** | `turbo dev --parallel` |
| **Docker** | `npm run docker:up` |

## 🏗 Architectural Patterns (Effect-TS)

- **Generators**: Always prefer `Effect.gen` over long `.pipe` chains or `.andThen`.
- **Services**: Model dependencies as Services and provide them via `Layer`. Define an interface (Service Tag) and multiple implementations (Live, Test, Dev).
- **Validation**: Use `Schema` for all data parsing and validation (API, DB, Config). Define schemas once and derive types from them using `Schema.Type`.
- **Errors**: Use `Data.TaggedError` for type-safe, domain-specific errors. Always provide a tag and handle it using `Effect.catchTag`.
- **Clock**: Use the `Clock` service for time-based logic to ensure testability. Avoid `new Date()` or `Date.now()`.
- **Concurrency**: Use `Effect.all` for parallel execution and `Stream` for processing large datasets with constant memory.
- **Context**: Access configuration and dependencies only through the Effect context. Do not use global variables or singleton patterns.
- **Resource Management**: Use `Scope` and `acquireRelease` for safe resource management. Ensure resources are closed correctly even on failure.

## 🎨 Code Style & Consistency

- **Imports**: 
  - Use `import type` for type-only imports to improve build performance and avoid circular dependencies.
  - Avoid barrel files if possible (prefer direct imports).
  - Domain imports: Import from the domain's public `index.ts` (e.g., `~/domains/workspace`) instead of internal paths.
- **Types**: 
  - **NO `any` or `unknown`** as type constraints.
  - Use `as const` instead of literal type annotations for better inference.
  - Prefer `Array<T>` over `T[]` (generic syntax) for consistency.
  - No non-null assertions (`!`). Use `Option` or check for existence explicitly.
- **Formatting**: Adhere to Biome standards. Use `===` and `!==`. No trailing spaces.
- **Naming**: 
  - Use descriptive, camelCase names for variables and functions.
  - Use PascalCase for Classes, Interfaces, and Types.
  - Suffix Services with `Service` (e.g., `UserService`) and Repositories with `Repo` (e.g., `UserRepo`).
- **Error Handling**: 
  - NEVER swallow errors.
  - Use `Effect.catchTag` or `Effect.catchTags` to handle specific errors.
  - Accompany `tryPromise` or `try` with proper error mapping to your domain errors.

## 🖥 Frontend Guidelines (React & Base UI)

- **Components**: Use `@base-ui-components/react` for unstyled, accessible primitives.
- **Accessibility (MUST)**:
  - Full keyboard support per WAI-ARIA APG (trap focus, move focus, return focus).
  - Visible focus rings using `:focus-visible`.
  - Hit targets ≥24px (mobile ≥44px). Expand hit area if visual is smaller.
  - Semantic HTML elements (`button`, `a`, `label`, `table`) over ARIA roles where possible.
  - `alt` text for images (avoid "image", "picture", "photo" in the text).
- **Performance**:
  - Minimize re-renders; use `React Scan` or DevTools to verify.
  - Virtualize large lists using `virtua` or `@tanstack/react-virtual`.
  - Animate only `transform` and `opacity` for compositor efficiency.
- **Forms**:
  - Use `@tanstack/react-form` for form management.
  - Ensure inputs are hydration-safe (no lost focus or values).
  - Submit on Enter in text inputs; ⌘/Ctrl+Enter in textareas.
  - Loading buttons must show a spinner and keep the original label.
- **Navigation**: Use `@tanstack/react-router`. URL must reflect state (filters, tabs, panels, etc.).
- **Feedback**:
  - Use optimistic UI with reconciliation on response.
  - Confirm destructive actions or provide an Undo window.
  - Use `aria-live` for toasts and inline validation messages.
- **Layout**:
  - Respect safe areas using `env(safe-area-inset-*)`.
  - Skeletons should mirror final content to avoid Layout Shift (CLS).

## 🛠 Interaction Details (UI)

### Key MUSTs
- **Keyboard**: Full support per WAI-ARIA APG; visible focus rings; manage focus trap/return.
- **Targets**: Hit target ≥24px (mobile ≥44px).
- **Forms**: Hydration-safe; never block paste; Enter submits; loading spinners on buttons.
- **State**: URL must reflect state (filters, tabs, pagination).
- **Feedback**: Optimistic UI; confirm destructive actions or provide Undo window; use `aria-live` for toasts.

### Animation
- Honor `prefers-reduced-motion`.
- Animate compositor-friendly props (`transform`, `opacity`) only.
- Animations must be interruptible and input-driven.

### Content
- Redundant status cues (not color-only).
- Skeletons must mirror final content.
- Accurate names (`aria-label`) for icon-only buttons.
- Use native semantics (`button`, `a`, `label`, `table`) before ARIA.
- Use the ellipsis character `…` (not `...`).

## 🧪 Testing Best Practices


- **Vitest**: Use `vitest` with `@effect/vitest` for Effect-specific assertions.
- **Mocks**: Provide mock service implementations via test-specific `Layer`s.
- **Structure**: Avoid deep nesting of `describe` blocks. Assertions should be inside `it()` or `test()`.
- **Deterministic**: Use `TestClock` for time-based tests.

## 🛡 Security

- **Secrets**: NEVER hardcode API keys, tokens, or sensitive data. Use `@mason/config`.
- **Validation**: Sanitize and validate all user input via `Schema`.
- **Protocol**: Use `node:` protocol for Node.js built-ins (though disabled in some Biome configs, it is generally preferred).

## 📁 Project Structure

- `apps/`: Main applications (web, desktop, server).
- `packages/`: Shared libraries and modules.
  - `core/`: Core business logic and domain modules.
  - `db/`: Database schemas and migrations (Drizzle).
  - `ui/`: Shared UI components.
  - `config/`: Configuration management.
- `interface/`: Frontend application code and routes.

## 📝 General Rules

- **DRY vs AHA**: Avoid Hasty Abstractions. Prefer duplication over the wrong abstraction, but keep domain logic consolidated in `packages/core`.
- **Commit Messages**: Follow conventional commits.
- **Git Hooks**: Lefthook is used for pre-commit linting and formatting.
- **Documentation**: Keep `AGENTS.md` up to date with any major architectural changes.
