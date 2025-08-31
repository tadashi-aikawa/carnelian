# Repository Guidelines

## Project Structure & Module Organization
- `src/main.ts`: Obsidian plugin entry (bundled to `main.js`).
- `src/commands/`: Command implementations (kebab-case files, exported functions).
- `src/services/`: Background services (`Service` interface lifecycle).
- `src/lib/`: Utilities and helpers; tests live alongside as `*.spec.ts`.
- `docs/`: Command catalog and lint rules.
- Root assets: `manifest.json`, `styles.css`, `config.schema.json` (generated), `main.js` (build output).

## Build, Test, and Development Commands
- `bun dev`: Watch + build via esbuild and copy outputs into your vault’s `.obsidian/plugins/carnelian` (requires `carnelianrc.json`).
- `bun build`: Production build (single `main.js`).
- `bun test`: Run unit tests (Bun test runner).
- `ALLOW_LARGE_TEST=1 bun test` or `bun test:large`: Include large/slow tests.
- `bun lint`: Lint/format via Biome.
- `bun pre:push`: Full check (typecheck, lint, tests). Husky runs this on push.
- `bun schema`: Generate `config.schema.json` from `src/definitions/config.ts`.

## Coding Style & Naming Conventions
- Language: TypeScript (strict). Target ES2018, module ESNext.
- Formatting: Biome, 2-space indent; `organizeImports` enabled. `.editorconfig` enforces LF/newline.
- Filenames: kebab-case for commands/services; tests named `*.spec.ts` near sources.
- Prefer small, focused modules; keep Obsidian-specific code in `lib/obsutils`-style areas.

## Testing Guidelines
- Framework: Bun’s built-in test runner with JSDOM where needed.
- Location: Place tests next to implementation (`src/**/name.spec.ts`).
- Scope: Cover utilities and linters; add regression tests for command behaviors.
- Run fast suite locally with `bun test`; include large suite before PR using `bun test:large`.

## Commit & Pull Request Guidelines
- Commits: Conventional Commits (e.g., `feat(scope): ...`, `fix: ...`, `docs: ...`; use `feat!:` for breaking changes).
- PRs: Clear description, linked issues, reproduction steps; attach screenshots/logs if behavior changes.
- Quality gate: Ensure `bun pre:push` passes; update `docs/` and schema when relevant.

## Security & Configuration Tips
- Create `carnelianrc.json` with `{ "vaultPath": "/path/to/your/Vault" }`. Do not commit personal paths.
- Enable the Obsidian Hot Reload plugin for a smooth `bun dev` workflow.
