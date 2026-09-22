const NAME_RE = /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/;
const ABS_PATH_RE = /^\/[a-zA-Z0-9/_.-]+$/;

const JOURNAL_ALLOWLIST = new Set([
  "docker",
  "docker.service",
  "ssh",
  "sshd",
  "sshd.service",
  "fail2ban",
  "fail2ban.service",
  "ufw",
  "cron",
  "cron.service",
]);

export function assertContainerOrServiceName(name: string, label = "name"): string {
  if (!NAME_RE.test(name)) {
    throw new Error(
      `Invalid ${label} "${name}". Must match /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/`
    );
  }
  return name;
}

export function assertComposeDir(path: string): string {
  if (!ABS_PATH_RE.test(path)) {
    throw new Error(
      `Invalid compose dir "${path}". Must be absolute and match /^\\/[a-zA-Z0-9/_.-]+$/`
    );
  }
  return path;
}

export function assertJournalUnit(unit: string): string {
  if (JOURNAL_ALLOWLIST.has(unit)) return unit;
  if (NAME_RE.test(unit) && unit.endsWith(".service")) return unit;
  throw new Error(
    `Unit "${unit}" not allowed. Use allowlist (docker, sshd, fail2ban, ufw, cron, …) or a safe name ending in .service`
  );
}

export function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

export { NAME_RE, ABS_PATH_RE };