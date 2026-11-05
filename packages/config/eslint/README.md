# ESLint configuration (reserved)

The monorepo uses **Biome** at the repository root (`biome.json`) for formatting and linting.

This directory is reserved for optional shared ESLint flat configs if a future milestone requires ESLint-specific plugins (for example `no-restricted-imports` enforcement for `@nestora/database` in `apps/web`, as described in `docs/09-monorepo-architecture.md` §5.1).

Do not duplicate Biome rules here unless ESLint becomes a required toolchain component.
