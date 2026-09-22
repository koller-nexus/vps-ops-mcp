# Filing an issue

Use this guide before you open an issue. Follow [CONTRIBUTING.md](./CONTRIBUTING.md) when you later send a change. Do not paste private keys, passphrases, or `.env` values.

## Summary

One sentence that names the defect or the request.

## Type

Pick one: `bug`, `feature`, or question.

## Expected versus actual

- **Expected**: what should happen, or the desired outcome
- **Actual**: what happens now (for a bug), or why the current product is insufficient (for a feature)

## Reproduction or acceptance

- **Bug**: numbered steps another operator can follow without a production host if possible
- **Feature**: how a reviewer will know the work is done

## Environment

- Client (Cursor, Codex, other)
- OS of the machine that launches the MCP process
- Whether mutations are allowed (`VPS_ALLOW_MUTATIONS`)
- Tool name if the report is about one operator action

Do not include the SSH private key path contents or any secret.
