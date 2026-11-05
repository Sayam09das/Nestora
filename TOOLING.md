# Tooling

| Concern              | Tool           | Location                                        |
| -------------------- | -------------- | ----------------------------------------------- |
| Formatting & linting | Biome          | `biome.json`                                    |
| TypeScript base      | Shared preset  | `packages/config/typescript/tsconfig.base.json` |
| Tailwind preset      | Shared tokens  | `packages/config/tailwind/tailwind.preset.ts`   |
| CI                   | GitHub Actions | `.github/workflows/ci.yml`                      |
| Local data services  | Docker Compose | `docker/docker-compose.yml`                     |

`docs/09-monorepo-architecture.md` references ESLint, Prettier, and `.prettierrc`. The implementation standard for this repository is **Biome** unless a later milestone adds ESLint for specialized import-boundary enforcement.
