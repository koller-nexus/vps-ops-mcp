# Contributing

Thank you for contributing to vps-ops-mcp. Work lands on `main` only through a pull request. Do not push or commit directly to `main`.

## Branch names

Create one short-lived branch with exactly one of these prefixes and one path segment after the slash:

- `feature/` for new behavior
- `fix/` for a defect
- `refactor/` for structure-only change

Examples: `feature/compose-timeout`, `fix/ssh-truncation`, `refactor/tool-catalog`.

Do not use `agent/` or any other prefix. Host rules reject those names. Map agent work onto `feature/`, `fix/`, or `refactor/` by change type.

## Pull requests

Open a pull request against `main`. Use English [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`). Name the exact target of any destructive change. Do not commit secrets, private keys, or live host facts.

## Verification

Every pull request must run and pass:

- `bun test`
- `bun run build`

Do not use a live VPS as an automated test bed. Merge stays blocked while those checks fail.

## Issues

File issues by following [ISSUE.md](./ISSUE.md). Incomplete reports may be closed with a pointer back to that guide.
