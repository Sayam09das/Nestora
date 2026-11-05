# Security Policy

Nestora is an **academic software engineering project** (BCA). It is not deployed as production university infrastructure.

## Supported versions

| Version                            | Supported                                     |
| ---------------------------------- | --------------------------------------------- |
| `main` branch (active development) | Best-effort review for academic collaborators |

## Reporting a vulnerability

If you discover a security issue in this repository:

1. **Do not** open a public GitHub issue for sensitive exploit details.
2. Contact the maintainer via GitHub private security advisories for this repository, or reach out to the repository owner directly.
3. Include reproduction steps, affected paths (e.g. `apps/api`), and impact assessment.

## Secrets

Never commit `.env` files, database passwords, `COOKIE_SECRET`, or session tokens. Use the provided `.env.example` templates only.
